package models

import "time"

type Cart struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;uniqueIndex"`
	CreatedAt time.Time
	UpdatedAt time.Time

	User  User       `gorm:"foreignKey:UserID"`
	Items []CartItem `gorm:"foreignKey:CartID"`
}