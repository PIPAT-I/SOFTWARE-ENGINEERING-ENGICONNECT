package entity

import (
	"gorm.io/gorm"
)

type Interest struct {
	gorm.Model
	Name   string `json:"name"`
	UserID uint
}
