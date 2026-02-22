package entity

import (
	"github.com/asaskevich/govalidator"
	"gorm.io/gorm"
)

type Certificate struct {
	gorm.Model
	TitleTH       string `gorm:"not null" valid:"required~TitleTH is required,maxstringlength(200)~TitleTH is too long" json:"title_th"`
	TitleEN       string `json:"title_en"`
	Detail        string `json:"detail"`
	Organizer     string `json:"organizer"`
	PictureParticipation string `json:"picture_participation"`
	PictureWinner        string `json:"picture_winner"`
	Type          string `gorm:"not null" valid:"required~Type is required" json:"type"`

	UserID         *uint  `gorm:"not null" valid:"required~User ID is required" json:"user_id"`
	User           *User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ResultID       *uint   `gorm:"" json:"result_id"`
	RegistrationID *uint   `gorm:"" json:"registration_id"`
	PostID         uint   `gorm:"not null" valid:"required~Post ID is required" json:"post_id"`
}

func ValidateCertificate(c Certificate) (bool, error) {
	return govalidator.ValidateStruct(c)
} 