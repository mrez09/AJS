package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"time"

	"github.com/mrez09/AJS/middleware"
	"github.com/mrez09/AJS/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func TestAggregateOrderItemsSumsDuplicateProductIDs(t *testing.T) {
	totals, err := aggregateOrderItems([]CreateOrderItemRequest{
		{ProductID: 7, Quantity: 40},
		{ProductID: 7, Quantity: 65},
		{ProductID: 9, Quantity: 25},
	})
	if err != nil {
		t.Fatalf("aggregateOrderItems() error = %v", err)
	}
	if totals[7] != 105 || totals[9] != 25 {
		t.Fatalf("unexpected totals: %#v", totals)
	}
}

func TestAggregateOrderItemsRejectsNonPositiveQuantities(t *testing.T) {
	for _, quantity := range []float64{0, -1} {
		if _, err := aggregateOrderItems([]CreateOrderItemRequest{{ProductID: 1, Quantity: quantity}}); err == nil {
			t.Errorf("aggregateOrderItems() accepted quantity %v", quantity)
		}
	}
}

func TestValidateProductQuantity(t *testing.T) {
	available := models.Product{Name: "Tuna", Status: "Available", MOQ: 50, AvailableQuantity: 100}
	tests := []struct {
		name     string
		product  models.Product
		quantity float64
		wantErr  bool
	}{
		{name: "valid MOQ and stock", product: available, quantity: 50},
		{name: "quantity exceeds stock", product: available, quantity: 101, wantErr: true},
		{name: "quantity below MOQ", product: available, quantity: 49, wantErr: true},
		{name: "unavailable product", product: models.Product{Name: "Tuna", Status: "Unavailable", MOQ: 50, AvailableQuantity: 100}, quantity: 50, wantErr: true},
		{name: "zero quantity", product: available, quantity: 0, wantErr: true},
		{name: "negative quantity", product: available, quantity: -1, wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateProductQuantity(test.product, test.quantity)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateProductQuantity() error = %v, wantErr %v", err, test.wantErr)
			}
		})
	}
}

func TestSameQuantitiesRequiresCartAndRequestToMatch(t *testing.T) {
	if !sameQuantities(map[uint]float64{1: 100, 2: 50}, map[uint]float64{1: 100, 2: 50}) {
		t.Fatal("equal cart and request totals did not match")
	}
	for _, request := range []map[uint]float64{
		{1: 100},
		{1: 90, 2: 50},
		{1: 100, 2: 50, 3: 1},
	} {
		if sameQuantities(map[uint]float64{1: 100, 2: 50}, request) {
			t.Errorf("mismatched cart and request were accepted: %#v", request)
		}
	}
}

func TestOrderStatusOnlyTransitionsFromRequested(t *testing.T) {
	if !canTransitionOrder("Requested", "Confirmed") || !canTransitionOrder("Requested", "Rejected") {
		t.Fatal("Requested order should allow Confirmed or Rejected")
	}
	for _, status := range []string{"Confirmed", "Rejected"} {
		if canTransitionOrder(status, "Confirmed") || canTransitionOrder(status, "Rejected") {
			t.Errorf("terminal order status %q allowed another transition", status)
		}
	}
}

func openOrderTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := os.Getenv("AJS_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set AJS_TEST_DATABASE_URL to run PostgreSQL handler integration tests")
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{TablePrefix: fmt.Sprintf("ajt_%d_", time.Now().UnixNano())},
	})
	if err != nil {
		t.Fatalf("connect to test PostgreSQL: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Product{}, &models.Cart{}, &models.CartItem{}, &models.Order{}, &models.OrderItem{}); err != nil {
		t.Fatalf("migrate isolated test tables: %v", err)
	}
	t.Cleanup(func() {
		if err := db.Migrator().DropTable(&models.OrderItem{}, &models.Order{}, &models.CartItem{}, &models.Cart{}, &models.Product{}, &models.User{}); err != nil {
			t.Errorf("drop isolated test tables: %v", err)
		}
	})
	return db
}

func performCreateOrder(db *gorm.DB, userID uint, items []CreateOrderItemRequest) *httptest.ResponseRecorder {
	body, _ := json.Marshal(CreateOrderRequest{Items: items})
	req := httptest.NewRequest(http.MethodPost, "/api/orders", bytes.NewReader(body))
	req = req.WithContext(context.WithValue(req.Context(), middleware.UserIDKey, userID))
	response := httptest.NewRecorder()
	CreateOrder(db).ServeHTTP(response, req)
	return response
}

func TestCreateOrderUsesAuthenticatedBuyersCartAndValidatesTotals(t *testing.T) {
	db := openOrderTestDB(t)
	buyer := models.User{Name: "Buyer", Email: "buyer@example.test", Role: "buyer"}
	otherBuyer := models.User{Name: "Other", Email: "other@example.test", Role: "buyer"}
	if err := db.Create(&buyer).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&otherBuyer).Error; err != nil {
		t.Fatal(err)
	}
	product := models.Product{Name: "Tuna", Status: "Available", MOQ: 20, AvailableQuantity: 100}
	if err := db.Create(&product).Error; err != nil {
		t.Fatal(err)
	}
	buyerCart := models.Cart{UserID: buyer.ID}
	otherCart := models.Cart{UserID: otherBuyer.ID}
	if err := db.Create(&buyerCart).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&otherCart).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&models.CartItem{CartID: buyerCart.ID, ProductID: product.ID, Quantity: 80}).Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Create(&models.CartItem{CartID: otherCart.ID, ProductID: product.ID, Quantity: 40}).Error; err != nil {
		t.Fatal(err)
	}

	response := performCreateOrder(db, buyer.ID, []CreateOrderItemRequest{{ProductID: product.ID, Quantity: 30}, {ProductID: product.ID, Quantity: 50}})
	if response.Code != http.StatusCreated {
		t.Fatalf("duplicate product lines: status = %d, body = %s", response.Code, response.Body.String())
	}
	var created models.Order
	if err := json.Unmarshal(response.Body.Bytes(), &created); err != nil {
		t.Fatal(err)
	}
	if created.UserID != buyer.ID || len(created.Items) != 1 || created.Items[0].Quantity != 80 {
		t.Fatalf("order did not use aggregated cart snapshot: %#v", created)
	}

	// Payload that describes another buyer's cart cannot create an order or
	// delete that other cart's items.
	response = performCreateOrder(db, buyer.ID, []CreateOrderItemRequest{{ProductID: product.ID, Quantity: 40}})
	if response.Code != http.StatusBadRequest {
		t.Fatalf("other buyer cart payload: status = %d, body = %s", response.Code, response.Body.String())
	}
	var otherItems int64
	db.Model(&models.CartItem{}).Where("cart_id = ?", otherCart.ID).Count(&otherItems)
	if otherItems != 1 {
		t.Fatalf("other buyer cart was changed; items = %d", otherItems)
	}

	// Cart and payload both exceed stock; aggregate validation must reject it.
	ownCartItem := models.CartItem{CartID: buyerCart.ID, ProductID: product.ID, Quantity: 110}
	if err := db.Create(&ownCartItem).Error; err != nil {
		t.Fatal(err)
	}
	response = performCreateOrder(db, buyer.ID, []CreateOrderItemRequest{{ProductID: product.ID, Quantity: 60}, {ProductID: product.ID, Quantity: 50}})
	if response.Code != http.StatusBadRequest {
		t.Fatalf("quantity exceeding stock: status = %d, body = %s", response.Code, response.Body.String())
	}

	if err := db.Model(&product).Update("status", "Unavailable").Error; err != nil {
		t.Fatal(err)
	}
	if err := db.Model(&ownCartItem).Update("quantity", 30).Error; err != nil {
		t.Fatal(err)
	}
	response = performCreateOrder(db, buyer.ID, []CreateOrderItemRequest{{ProductID: product.ID, Quantity: 30}})
	if response.Code != http.StatusBadRequest {
		t.Fatalf("unavailable product: status = %d, body = %s", response.Code, response.Body.String())
	}
}

func TestConfirmedOrderConsumesStockOnlyOnce(t *testing.T) {
	db := openOrderTestDB(t)
	buyer := models.User{Name: "Buyer", Email: "confirm@example.test", Role: "buyer"}
	if err := db.Create(&buyer).Error; err != nil {
		t.Fatal(err)
	}
	product := models.Product{Name: "Tuna", Status: "Available", MOQ: 20, AvailableQuantity: 100}
	if err := db.Create(&product).Error; err != nil {
		t.Fatal(err)
	}
	order := models.Order{UserID: buyer.ID, Status: "Requested", Items: []models.OrderItem{{ProductID: product.ID, Quantity: 70}}}
	if err := db.Create(&order).Error; err != nil {
		t.Fatal(err)
	}
	makeRequest := func(status string) *httptest.ResponseRecorder {
		body := bytes.NewBufferString(fmt.Sprintf(`{"status":%q}`, status))
		req := httptest.NewRequest(http.MethodPut, "/api/admin/orders/1/status", body)
		req.SetPathValue("id", fmt.Sprint(order.ID))
		response := httptest.NewRecorder()
		UpdateOrderStatus(db).ServeHTTP(response, req)
		return response
	}
	response := makeRequest("Confirmed")
	if response.Code != http.StatusOK {
		t.Fatalf("confirm order: status = %d, body = %s", response.Code, response.Body.String())
	}
	var updatedProduct models.Product
	if err := db.First(&updatedProduct, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if updatedProduct.AvailableQuantity != 30 {
		t.Fatalf("confirmed order left stock at %v, want 30", updatedProduct.AvailableQuantity)
	}
	response = makeRequest("Rejected")
	if response.Code != http.StatusConflict {
		t.Fatalf("repeat terminal transition: status = %d, body = %s", response.Code, response.Body.String())
	}
	if err := db.First(&updatedProduct, product.ID).Error; err != nil {
		t.Fatal(err)
	}
	if updatedProduct.AvailableQuantity != 30 {
		t.Fatalf("repeated transition changed stock to %v, want 30", updatedProduct.AvailableQuantity)
	}
}
