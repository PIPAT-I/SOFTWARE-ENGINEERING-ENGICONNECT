package entity

import (
	"gorm.io/gorm"
)

type Skill struct {
	gorm.Model
	Name   string `json:"name"`
	UserID uint
}
