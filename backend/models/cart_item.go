package models

import "time"

type CartItem struct {
	ID        uint    `gorm:"primaryKey"`
	CartID    uint    `gorm:"not null"`
	ProductID uint    `gorm:"not null"`
	Quantity  float64 `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Cart    Cart    `gorm:"foreignKey:CartID"`
	Product Product `gorm:"foreignKey:ProductID"`
}
