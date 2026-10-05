package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string
	Email     string    `gorm:"uniqueIndex"`
	Password  string `json:"-"`
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}