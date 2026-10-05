package seeders

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/mrez09/AJS/models"
)

func SeedUsers(db *gorm.DB) error {
	users := []models.User{
		{
			Name:     "AJS Buyer Demo",
			Email:    "buyer@ajs.test",
			Password: "buyer123",
			Role:     "buyer",
		},
		{
			Name:     "AJS Admin Demo",
			Email:    "admin@ajs.test",
			Password: "admin123",
			Role:     "admin",
		},
	}

	for _, user := range users {
		var existing models.User

		result := db.Where("email = ?", user.Email).First(&existing)

		if result.Error == nil {
			continue
		}

		if result.Error != gorm.ErrRecordNotFound {
			return result.Error
		}

		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(user.Password),
			bcrypt.DefaultCost,
		)
		if err != nil {
			return err
		}

		user.Password = string(hashedPassword)

		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}

	return nil
}