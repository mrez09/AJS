package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"github.com/mrez09/AJS/middleware"
	"github.com/mrez09/AJS/models"
)

func ensureCart(db *gorm.DB, userID uint) (models.Cart, error) {
	cart := models.Cart{UserID: userID}
	if err := db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "user_id"}}, DoNothing: true}).Create(&cart).Error; err != nil {
		return models.Cart{}, err
	}
	if err := db.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		return models.Cart{}, err
	}
	return cart, nil
}

func GetCart(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}
		cart, err := ensureCart(db, userID)
		if err != nil {
			http.Error(w, "Failed to fetch cart", http.StatusInternalServerError)
			return
		}
		if err := db.Preload("Items.Product").First(&cart, cart.ID).Error; err != nil {
			http.Error(w, "Failed to fetch cart", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cart)
	}
}

type AddCartItemRequest struct {
	ProductID uint    `json:"product_id"`
	Quantity  float64 `json:"quantity"`
}

func AddCartItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}
		var request AddCartItemRequest
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.ProductID == 0 || !positiveFinite(request.Quantity) {
			http.Error(w, "A product and quantity greater than zero are required", http.StatusBadRequest)
			return
		}

		var cartItem models.CartItem
		err := db.Transaction(func(tx *gorm.DB) error {
			cart, err := ensureCart(tx, userID)
			if err != nil {
				return err
			}
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&cart, cart.ID).Error; err != nil {
				return err
			}

			var product models.Product
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&product, request.ProductID).Error; err != nil {
				return err
			}
			var existingItems []models.CartItem
			if err := tx.Where("cart_id = ? AND product_id = ?", cart.ID, product.ID).Order("id ASC").Find(&existingItems).Error; err != nil {
				return err
			}
			if len(existingItems) == 0 {
				cartItem = models.CartItem{CartID: cart.ID, ProductID: product.ID, Quantity: request.Quantity}
			} else {
				cartItem = existingItems[0]
				cartItem.Quantity += request.Quantity
				for _, duplicate := range existingItems[1:] {
					cartItem.Quantity += duplicate.Quantity
				}
			}
			if err := validateProductQuantity(product, cartItem.Quantity); err != nil {
				return err
			}
			if cartItem.ID == 0 {
				return tx.Create(&cartItem).Error
			}
			if err := tx.Save(&cartItem).Error; err != nil {
				return err
			}
			if len(existingItems) > 1 {
				duplicateIDs := make([]uint, 0, len(existingItems)-1)
				for _, duplicate := range existingItems[1:] {
					duplicateIDs = append(duplicateIDs, duplicate.ID)
				}
				return tx.Where("id IN ? AND cart_id = ?", duplicateIDs, cart.ID).Delete(&models.CartItem{}).Error
			}
			return nil
		})
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Product not found", http.StatusNotFound)
			} else if validationErr, ok := err.(*ValidationError); ok {
				http.Error(w, validationErr.Message, http.StatusBadRequest)
			} else {
				http.Error(w, "Failed to add item to cart", http.StatusInternalServerError)
			}
			return
		}
		if err := db.Preload("Product").First(&cartItem, cartItem.ID).Error; err != nil {
			http.Error(w, "Failed to fetch cart item", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(cartItem)
	}
}

func RemoveCartItem(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(middleware.UserIDKey).(uint)
		if !ok {
			http.Error(w, "User not found in token", http.StatusUnauthorized)
			return
		}
		id, err := strconv.ParseUint(r.PathValue("id"), 10, 32)
		if err != nil {
			http.Error(w, "Invalid cart item ID", http.StatusBadRequest)
			return
		}
		err = db.Transaction(func(tx *gorm.DB) error {
			var cart models.Cart
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("user_id = ?", userID).First(&cart).Error; err != nil {
				return err
			}
			result := tx.Where("id = ? AND cart_id = ?", uint(id), cart.ID).Delete(&models.CartItem{})
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return gorm.ErrRecordNotFound
			}
			return nil
		})
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				http.Error(w, "Cart item not found", http.StatusNotFound)
			} else {
				http.Error(w, "Failed to remove cart item", http.StatusInternalServerError)
			}
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}
}
