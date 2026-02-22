package entity

import (
	"gorm.io/gorm"
)

type Chatroom struct {
	gorm.Model
	Messages []*Messages `gorm:"foreignKey:ChatRoomID" json:"chatroom_messages"`

	PostID uint  `gorm:"unique;not null" json:"post_id"`
	Post   *Post `gorm:"foreignKey:PostID" json:"post"`
}
