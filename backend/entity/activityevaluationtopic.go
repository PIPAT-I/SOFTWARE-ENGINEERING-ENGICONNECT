package entity

import (
	"gorm.io/gorm"
)

type ActivityEvaluationTopic struct {
	gorm.Model
	Description              string                     `json:"description"`
	Name                     string                     `json:"name" valid:"required~Name is required"`
	PostID                   uint                       `gorm:"not null" json:"post_id" valid:"required~PostID is required"`
	ActivityEvaluationScores []*ActivityEvaluationScore `gorm:"foreignKey:ActivityEvaluationTopicID" json:"activity_evaluation_scores"`
}
