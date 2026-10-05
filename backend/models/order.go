package models

import "time"

type Order struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null"`
	Status    string    `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time

	User  User        `gorm:"foreignKey:UserID"`
	Items []OrderItem `gorm:"foreignKey:OrderID"`
}