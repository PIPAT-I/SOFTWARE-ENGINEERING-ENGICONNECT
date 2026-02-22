package entity

import (
	"time"

	"gorm.io/gorm"
)

type UserPoint struct {
	gorm.Model
	UserID           uint           `gorm:"not null" json:"user_id"`
	TotalPoints      int            `gorm:"not null" json:"total_points"`
	MembershipLevel  string         `json:"membership_level"`
	ActivityCount    int            `gorm:"not null;default:0" json:"activity_count"`
	LastActivityDate *time.Time     `json:"last_activity_date"`
}
