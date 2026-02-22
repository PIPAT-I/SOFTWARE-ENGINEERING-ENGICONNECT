package entity

import (
	"gorm.io/gorm"
)

type Messages struct {
	gorm.Model
	Body string `valid:"required~Body is required,maxstringlength(1000)~Body must not exceed 1000 characters" json:"body"`
	UserID uint `gorm:"not null" valid:"required~UserID is required" json:"user_id"`
	User   *User `gorm:"foreignKey:UserID" json:"user"`
	MessagesTypeID uint          `gorm:"not null" valid:"required~MessagesTypeID is required" json:"messages_type_id"`
	MessagesType   *MessagesType `gorm:"foreignKey:MessagesTypeID" json:"messages_type"`
	ChatRoomID uint `gorm:"not null" valid:"required~ChatRoomID is required" json:"chat_room_id"`
}