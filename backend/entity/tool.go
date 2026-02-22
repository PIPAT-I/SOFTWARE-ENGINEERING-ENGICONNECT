package entity

import (
	"gorm.io/gorm"
)

type Tool struct {
	gorm.Model
	Name   string `json:"name"`
	UserID uint
}
