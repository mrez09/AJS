package handlers

import (
	"encoding/json"
	"math"
	"net/http"
	"sort"
	"strconv"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/mrez09/AJS/middleware"
	"github.com/mrez09/AJS/models"
)

type CreateOrderItemRequest struct {
	ProductID uint    `json:"product_id"`
	Quantity  float64 `json:"quantity"`
}

type CreateOrderRequest struct {
	Items []CreateOrderItemRequest `json:"items"`
}

func CreateOrder(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}

		var request CreateOrderRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Aggregate duplicate product lines and reject invalid input before
		// touching the database. This payload is checked against, never used as,
		// the source of order items.
		requested, err := aggregateOrderItems(request.Items)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		var order models.Order
		err = db.Transaction(func(tx *gorm.DB) error {
			var cart models.Cart
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userID).First(&cart).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					return &ValidationError{"Cart not found"}
				}
				return err
			}

			var cartItems []models.CartItem
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("cart_id = ?", cart.ID).Order("product_id ASC").Find(&cartItems).Error; err != nil {
				return err
			}
			if len(cartItems) == 0 {
				return &ValidationError{"Cart is empty"}
			}

			cartTotals := make(map[uint]float64, len(cartItems))
			for _, item := range cartItems {
				if !positiveFinite(item.Quantity) {
					return &ValidationError{"Cart contains an invalid quantity"}
				}
				cartTotals[item.ProductID] += item.Quantity
				if !positiveFinite(cartTotals[item.ProductID]) {
					return &ValidationError{"Cart contains an invalid total quantity"}
				}
			}

			if !sameQuantities(requested, cartTotals) {
				return &ValidationError{"Order items do not match the cart"}
			}

			productIDs := make([]uint, 0, len(cartTotals))
			for productID := range cartTotals {
				productIDs = append(productIDs, productID)
			}
			sort.Slice(productIDs, func(i, j int) bool { return productIDs[i] < productIDs[j] })

			for _, productID := range productIDs {
				var product models.Product
				if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, productID).Error; err != nil {
					if err == gorm.ErrRecordNotFound {
						return &ValidationError{"Product not found"}
					}
					return err
				}
				quantity := cartTotals[productID]
				if err := validateProductQuantity(product, quantity); err != nil {
					return err
				}
			}

			order = models.Order{UserID: userID, Status: "Requested"}
			for _, productID := range productIDs {
				order.Items = append(order.Items, models.OrderItem{ProductID: productID, Quantity: cartTotals[productID]})
			}
			if err := tx.Create(&order).Error; err != nil {
				return err
			}

			// Only delete IDs from the locked snapshot. Add/remove operations
			// serialize on the parent cart row, so later additions are preserved.
			itemIDs := make([]uint, 0, len(cartItems))
			for _, item := range cartItems {
				itemIDs = append(itemIDs, item.ID)
			}
			return tx.Where("cart_id = ? AND id IN ?", cart.ID, itemIDs).Delete(&models.CartItem{}).Error
		})

		if err != nil {
			if validationErr, ok := err.(*ValidationError); ok {
				http.Error(w, validationErr.Message, http.StatusBadRequest)
				return
			}
			http.Error(w, "Failed to create order", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(order)
	}
}

func positiveFinite(value float64) bool {
	return value > 0 && !math.IsNaN(value) && !math.IsInf(value, 0)
}

func aggregateOrderItems(items []CreateOrderItemRequest) (map[uint]float64, error) {
	if len(items) == 0 {
		return nil, &ValidationError{"Order must contain at least one item"}
	}
	totals := make(map[uint]float64, len(items))
	for _, item := range items {
		if item.ProductID == 0 || !positiveFinite(item.Quantity) {
			return nil, &ValidationError{"Each item must have a product and a quantity greater than zero"}
		}
		totals[item.ProductID] += item.Quantity
		if !positiveFinite(totals[item.ProductID]) {
			return nil, &ValidationError{"Invalid total quantity"}
		}
	}
	return totals, nil
}

func sameQuantities(left, right map[uint]float64) bool {
	if len(left) != len(right) {
		return false
	}
	for productID, quantity := range left {
		if right[productID] != quantity {
			return false
		}
	}
	return true
}

func validateProductQuantity(product models.Product, quantity float64) error {
	if product.Status != "Available" {
		return &ValidationError{"Product is currently unavailable: " + product.Name}
	}
	if !positiveFinite(quantity) || quantity < product.MOQ {
		return &ValidationError{"Quantity is below MOQ for: " + product.Name}
	}
	if quantity > product.AvailableQuantity {
		return &ValidationError{"Quantity exceeds available stock for: " + product.Name}
	}
	return nil
}

func canTransitionOrder(status, nextStatus string) bool {
	return status == "Requested" && (nextStatus == "Confirmed" || nextStatus == "Rejected")
}

func GetOrders(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}

		var orders []models.Order
		result := db.Preload("User").Preload("Items.Product").Where("user_id = ?", userID).Order("created_at DESC").Find(&orders)
		if result.Error != nil {
			http.Error(w, "Failed to fetch orders", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(orders)
	}
}

type ValidationError struct{ Message string }

func (e *ValidationError) Error() string { return e.Message }

func GetAllOrders(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var orders []models.Order
		result := db.Preload("User").Preload("Items.Product").Order("created_at DESC").Find(&orders)
		if result.Error != nil {
			http.Error(w, "Failed to fetch orders", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(orders)
	}
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func UpdateOrderStatus(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
		if err != nil {
			http.Error(w, "Invalid order ID", http.StatusBadRequest)
			return
		}
		var request UpdateOrderStatusRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		if request.Status != "Confirmed" && request.Status != "Rejected" {
			http.Error(w, "Status must be Confirmed or Rejected", http.StatusBadRequest)
			return
		}

		var order models.Order
		err = db.Transaction(func(tx *gorm.DB) error {
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&order, uint(id)).Error; err != nil {
				return err
			}
			if !canTransitionOrder(order.Status, request.Status) {
				return &ValidationError{"Only Requested orders can be updated"}
			}

			if request.Status == "Confirmed" {
				var items []models.OrderItem
				if err := tx.Where("order_id = ?", order.ID).Order("product_id ASC").Find(&items).Error; err != nil {
					return err
				}
				totals := make(map[uint]float64, len(items))
				for _, item := range items {
					totals[item.ProductID] += item.Quantity
					if !positiveFinite(totals[item.ProductID]) {
						return &ValidationError{"Order contains an invalid quantity"}
					}
				}
				productIDs := make([]uint, 0, len(totals))
				for productID := range totals {
					productIDs = append(productIDs, productID)
				}
				sort.Slice(productIDs, func(i, j int) bool { return productIDs[i] < productIDs[j] })
				for _, productID := range productIDs {
					var product models.Product
					if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, productID).Error; err != nil {
						if err == gorm.ErrRecordNotFound {
							return &ValidationError{"Product not found"}
						}
						return err
					}
					quantity := totals[productID]
					if product.Status != "Available" || quantity > product.AvailableQuantity {
						return &ValidationError{"Insufficient available stock to confirm order"}
					}
					result := tx.Model(&models.Product{}).Where("id = ? AND status = ? AND available_quantity >= ?", productID, "Available", quantity).Update("available_quantity", gorm.Expr("available_quantity - ?", quantity))
					if result.Error != nil {
						return result.Error
					}
					if result.RowsAffected != 1 {
						return &ValidationError{"Insufficient available stock to confirm order"}
					}
				}
			}

			result := tx.Model(&models.Order{}).Where("id = ? AND status = ?", order.ID, "Requested").Update("status", request.Status)
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected != 1 {
				return &ValidationError{"Only Requested orders can be updated"}
			}
			order.Status = request.Status
			return nil
		})

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Order not found", http.StatusNotFound)
				return
			}
			if validationErr, ok := err.(*ValidationError); ok {
				http.Error(w, validationErr.Message, http.StatusConflict)
				return
			}
			http.Error(w, "Failed to update order", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(order)
	}
}
