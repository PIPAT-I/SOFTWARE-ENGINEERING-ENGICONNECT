package entity

import (

	"gorm.io/gorm"
)

type Result struct {
	gorm.Model
	AwardID        uint           `gorm:"not null" json:"award_id" valid:"required~Award ID is required"`
	RegistrationID uint           `gorm:"not null" json:"registration_id" valid:"required~Registration ID is required"`
	Detail         string         `json:"detail"`
	EditReason     *string        `gorm:"type:text" json:"edit_reason"`
	Award          *Award         `gorm:"foreignKey:AwardID" json:"award"`
	Certificates   []*Certificate `gorm:"foreignKey:ResultID" json:"certificates"`
}
