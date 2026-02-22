package entity

import (
	"gorm.io/gorm"
)

type Faculty struct {
	gorm.Model
	Name  string `json:"name"`
	Users []User `gorm:"foreignKey:FacultyID;"`
}
