package entity

import (
	"gorm.io/gorm"
)

type Social struct {
	gorm.Model
	Platform string `json:"platform"`
	Link     string `json:"link"`
	UserID   uint
}
