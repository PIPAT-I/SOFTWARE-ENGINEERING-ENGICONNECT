package entity

import (

	"gorm.io/gorm"
)

type PointRecord struct {
	gorm.Model
	UserID    uint           `gorm:"not null" json:"user_id"`
	Points    int            `gorm:"not null" json:"points"`
	Type      string         `gorm:"not null" json:"type"`
	RegistrationID *uint `gorm:"foreignKey" json:"registration_id"`
}
