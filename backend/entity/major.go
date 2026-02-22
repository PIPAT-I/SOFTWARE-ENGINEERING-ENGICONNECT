package entity

import (
	"gorm.io/gorm"
)

type Major struct {
	gorm.Model
	Name  string `json:"name"`
	Users []User `gorm:"foreignKey:MajorID;references:ID" json:"users"`
}
