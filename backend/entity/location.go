package entity

import (
	"github.com/asaskevich/govalidator"
	"gorm.io/gorm"
)

type Location struct {
	gorm.Model
	Building string `json:"building" valid:"required~Building is required"`
    Latitude  *float64 `json:"latitude" valid:"float~Latitude must be a valid float number"`
    Longitude *float64 `json:"longitude" valid:"float~Longitude must be a valid float number"`
	Picture string `json:"picture"`
}

func (l *Location) Validate() (bool, error) {
	return govalidator.ValidateStruct(l)
}
