package entity

import (
	"gorm.io/gorm"
)

type ActivityEvaluationScore struct {
	gorm.Model
	Score                       float64 `json:"score" valid:"range(0|5)~Score must be between 0 and 5"`
	ActivityEvaluationTopicID   uint    `json:"activity_evaluation_topic_id" valid:"required~TopicID is required"`
	ActivityEvaluationResponeID uint    `json:"activity_evaluation_respone_id" valid:"required~ResponeID is required"`
}
