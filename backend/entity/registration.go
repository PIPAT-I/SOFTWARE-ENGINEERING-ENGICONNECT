package entity

import (
	"gorm.io/gorm"
	"time"
	"github.com/asaskevich/govalidator"
)

type Registration struct {
	gorm.Model
	TeamName      string  `json:"team_name" valid:"required~Team name is required,minstringlength(3)~Team name must be at least 3 characters,maxstringlength(100)~Team name must not exceed 100 characters"`
	Description   string  `json:"description" valid:"required~Description is required"`
	Status           string    `json:"status" valid:"required~Status is required"`
	RegistrationDate time.Time  `json:"registration_date" valid:"required~Registration date is required"`
	RejectionReason  string    `json:"rejection_reason"`
	PostID *uint `json:"post_id"`
	Post   *Post `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"post,omitempty"`
	Users	  []*User         `gorm:"many2many:user_registrations;" json:"users"`
	Results    []*Result       `gorm:"foreignKey:RegistrationID" json:"results"`
	PointRecords []*PointRecord `gorm:"foreignKey:RegistrationID" json:"point_records"`
	Certificates  []*Certificate `gorm:"foreignKey:RegistrationID" json:"certificates"`
	ActivityEvaluationRespones []*ActivityEvaluationRespone `gorm:"foreignKey:RegistrationID" json:"activity_evaluation_responses"`
} 
func (r *Registration) Validate() (bool, error) {
	return govalidator.ValidateStruct(r)
}