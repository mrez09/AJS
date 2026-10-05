package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"gorm.io/gorm"

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

		if len(request.Items) == 0 {
			http.Error(w, "Order must contain at least one item", http.StatusBadRequest)
			return
		}

		order := models.Order{
			UserID: userID,
			Status: "Requested",
		}

		err := db.Transaction(func(tx *gorm.DB) error {
			for _, item := range request.Items {
				if item.Quantity <= 0 {
					return &ValidationError{"Quantity must be greater than zero"}
				}

				var product models.Product

				result := tx.First(&product, item.ProductID)
				if result.Error != nil {
					if result.Error == gorm.ErrRecordNotFound {
						return &ValidationError{"Product not found"}
					}

					return result.Error
				}

				if product.Status != "Available" {
					return &ValidationError{
						"Product is currently unavailable: " + product.Name,
					}
				}

				if item.Quantity < product.MOQ {
					return &ValidationError{
						"Quantity is below MOQ for: " + product.Name,
					}
				}

				if item.Quantity > product.AvailableQuantity {
					return &ValidationError{
						"Quantity exceeds available stock for: " + product.Name,
					}
				}

				order.Items = append(order.Items, models.OrderItem{
					ProductID: item.ProductID,
					Quantity:  item.Quantity,
				})
			}

			if err := tx.Create(&order).Error; err != nil {
				return err
			}

			return nil
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

func GetOrders(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}

		var orders []models.Order

		result := db.
			Preload("User").
			Preload("Items.Product").
			Where("user_id = ?", userID).
			Order("created_at DESC").
			Find(&orders)

		if result.Error != nil {
			http.Error(w, "Failed to fetch orders", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(orders)
	}
}

type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

//**Admin*//
func GetAllOrders(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var orders []models.Order

		result := db.
			Preload("User").
			Preload("Items.Product").
			Order("created_at DESC").
			Find(&orders)

		if result.Error != nil {
			http.Error(w, "Failed to fetch orders", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(orders)
	}
}

/*Up*/
type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func UpdateOrderStatus(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idString := r.PathValue("id")

		id, err := strconv.ParseUint(idString, 10, 32)
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
			http.Error(
				w,
				"Status must be Confirmed or Rejected",
				http.StatusBadRequest,
			)
			return
		}

		var order models.Order

		result := db.First(&order, uint(id))
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Order not found", http.StatusNotFound)
				return
			}

			http.Error(w, "Failed to fetch order", http.StatusInternalServerError)
			return
		}

		order.Status = request.Status

		if err := db.Save(&order).Error; err != nil {
			http.Error(w, "Failed to update order", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(order)
	}
}

