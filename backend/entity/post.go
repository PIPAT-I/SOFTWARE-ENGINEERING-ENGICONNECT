package entity

import (
	"time"
	
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	Title     string    `gorm:"not null" valid:"required~Title is required" json:"title"`
	Detail    string    `gorm:"not null" valid:"required~Detail is required" json:"detail"`
	Picture   string    `json:"picture"`
	Type      string    `gorm:"not null" valid:"required~Type is required" json:"type"`
	Organizer string    `gorm:"not null" valid:"required~Organizer is required" json:"organizer"`
	StartDate time.Time `json:"start_date" valid:"required~Start date is required"`
	StopDate  time.Time `json:"stop_date" valid:"required~Stop date is required"`
	Start     time.Time `json:"start" valid:"required~Start is required"`
	Stop      time.Time `json:"stop" valid:"required~Stop is required"`

	UserID *uint `gorm:"not null" valid:"required~User ID is required" json:"user_id"`
	User   *User `gorm:"foreignKey:UserID;constraint:-" json:"user"`

	Comment    string      `json:"comment"`
	StatusID   *uint       `gorm:"not null" valid:"required~Status ID is required" json:"status_id"`
	Status     *PostStatus `gorm:"foreignKey:StatusID" json:"status"`
	LocationID *uint       `gorm:"not null" valid:"required~Location ID is required" json:"location_id"`
	Location   *Location   `gorm:"foreignKey:LocationID" json:"location"`

	Chatroom                 *Chatroom                  `gorm:"foreignKey:PostID" json:"chatroom"`
	Registrations            []*Registration            `gorm:"foreignKey:PostID" json:"registrations"`
	ActivityEvaluationTopics []*ActivityEvaluationTopic `gorm:"foreignKey:PostID" json:"activity_evaluation_topics"`
	Certificates             []*Certificate             `gorm:"foreignKey:PostID" json:"certificates"`
	PostPoint                uint                       `gorm:"default:0" json:"post_point"`
} 
