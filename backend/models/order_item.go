package models

import "time"

type OrderItem struct {
	ID        uint      `gorm:"primaryKey"`
	OrderID   uint      `gorm:"not null"`
	ProductID uint      `gorm:"not null"`
	Quantity  float64   `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	Product Product `gorm:"foreignKey:ProductID"`
}