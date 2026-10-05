package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"gorm.io/gorm"

	"github.com/mrez09/AJS/models"
)

type UpdateProductRequest struct {
	AvailableQuantity float64 `json:"available_quantity"`
	Status            string  `json:"status"`
}

func UpdateProduct(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idString := r.PathValue("id")

		id, err := strconv.ParseUint(idString, 10, 32)
		if err != nil {
			http.Error(w, "Invalid product ID", http.StatusBadRequest)
			return
		}

		var request UpdateProductRequest

		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if request.AvailableQuantity < 0 {
			http.Error(w, "Available quantity cannot be negative", http.StatusBadRequest)
			return
		}

		if request.Status != "Available" && request.Status != "Unavailable" {
			http.Error(
				w,
				"Status must be Available or Unavailable",
				http.StatusBadRequest,
			)
			return
		}

		var product models.Product

		result := db.First(&product, uint(id))
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				http.Error(w, "Product not found", http.StatusNotFound)
				return
			}

			http.Error(w, "Failed to fetch product", http.StatusInternalServerError)
			return
		}

		product.AvailableQuantity = request.AvailableQuantity
		product.Status = request.Status

		if err := db.Save(&product).Error; err != nil {
			http.Error(w, "Failed to update product", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(product)
	}
}