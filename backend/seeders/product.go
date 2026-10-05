package seeders

import (
	"gorm.io/gorm"

	"github.com/mrez09/AJS/models"
)

func SeedProducts(db *gorm.DB) error {
	products := []models.Product{
		{
			Name:               "Cakalang / Skipjack Tuna",
			Origin:             "Muara Baru",
			Grade:              "Grade A",
			Condition:          "Frozen",
			AvailableQuantity:  850,
			MOQ:                100,
			Description:        "Frozen skipjack tuna supplied for B2B procurement.",
			Image:              "",
			Status:             "Available",
		},
		{
			Name:               "Deho",
			Origin:             "Muara Baru",
			Grade:              "Grade A",
			Condition:          "Frozen",
			AvailableQuantity:  1200,
			MOQ:                100,
			Description:        "Frozen Deho supplied for B2B procurement.",
			Image:              "",
			Status:             "Available",
		},
		{
			Name:               "Tuna Fillet",
			Origin:             "Partner Supply",
			Grade:              "Premium",
			Condition:          "Frozen",
			AvailableQuantity:  350,
			MOQ:                50,
			Description:        "Premium frozen tuna fillet from partner supply.",
			Image:              "",
			Status:             "Available",
		},
		{
			Name:               "Kerapu / Grouper",
			Origin:             "Muara Baru",
			Grade:              "Grade A",
			Condition:          "Frozen",
			AvailableQuantity:  180,
			MOQ:                25,
			Description:        "Frozen grouper supplied for B2B procurement.",
			Image:              "",
			Status:             "Available",
		},
	}

	for _, product := range products {
		var existing models.Product

		result := db.Where("name = ?", product.Name).First(&existing)

		if result.Error == nil {
			continue
		}

		if result.Error != gorm.ErrRecordNotFound {
			return result.Error
		}

		if err := db.Create(&product).Error; err != nil {
			return err
		}
	}

	return nil
}