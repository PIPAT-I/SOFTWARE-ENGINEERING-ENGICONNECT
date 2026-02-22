package entity

import (
	"gorm.io/gorm"
)

type Reward struct {
	gorm.Model		
	RewardName 		string 	`valid:"required~RewardName is required" gorm:"not null" json:"reward_name"`
	PointRequired 	int 	`valid:"range(100|10000)~PointRequired must be greater than or equal to 100" gorm:"not null" json:"point_required"`
	Stock 			int 	`valid:"range(1|10000)~Stock must be greater than or equal to 1" gorm:"not null" json:"stock"`
	Description 	string 	`json:"description"`
	RewardImage   	string 	`valid:"required~RewardImage is required" gorm:"not null" json:"reward_image"`
	RewardRedeem 	*RewardRedeem `gorm:"foreignKey:RewardID" json:"reward_redeem,omitempty"`
}
