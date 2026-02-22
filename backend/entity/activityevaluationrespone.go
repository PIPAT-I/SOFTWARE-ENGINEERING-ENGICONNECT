package entity

import (
	"gorm.io/gorm"
)

type ActivityEvaluationRespone struct {
	gorm.Model
	Suggestion               string                     `json:"suggestion"`
	RegistrationID           uint                       `gorm:"not null" json:"registration_id" valid:"required~RegistrationID is required"`
	UserID                   uint                       `gorm:"not null" json:"user_id" valid:"required~UserID is required"`
	ActivityEvaluationScores []*ActivityEvaluationScore `gorm:"foreignKey:ActivityEvaluationResponeID" json:"activity_evaluation_scores"`
}
