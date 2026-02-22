package entity

import (
	"gorm.io/gorm"
	"time"
)

type Award struct {
	gorm.Model
	AwardName   string         `gorm:"not null" json:"award_name" valid:"required~Award name is required"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Results     []*Result      `gorm:"foreignKey:AwardID" json:"results"`
}
