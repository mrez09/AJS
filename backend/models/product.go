package models

import "time"

type Product struct {
	ID                 uint      `gorm:"primaryKey"`
	Name               string
	Origin             string
	Grade              string
	Condition          string
	AvailableQuantity  float64
	MOQ                float64
	Description        string
	Image              string
	Status             string
	CreatedAt          time.Time
	UpdatedAt          time.Time
}