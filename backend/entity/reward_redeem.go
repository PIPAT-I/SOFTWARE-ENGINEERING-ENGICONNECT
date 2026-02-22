package entity

import (

	"gorm.io/gorm"
)

type RewardRedeem struct {
	gorm.Model
	UserID    uint           `gorm:"not null" json:"user_id"`
	RewardID  uint           `gorm:";not null" json:"reward_id"`
	
}
