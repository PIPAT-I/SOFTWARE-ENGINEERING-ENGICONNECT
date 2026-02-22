package entity

import (
	"gorm.io/gorm"
	"time"
)

type Summary struct {
	gorm.Model
	TotalParticipants int            `gorm:"not null" json:"total_participants"`
	AverageRating     float64        `gorm:"not null" json:"average_rating"`
	TotalComments     int            `gorm:"not null" json:"total_comments"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
	ActivityID        uint           `gorm:"not null" json:"activity_id"`
}
