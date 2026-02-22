package entity

import "gorm.io/gorm"

type MessagesType struct {
	gorm.Model
	TypeName       string     `gorm:"unique" json:"type_name"`
	Messages       []*Messages `gorm:"foreignKey:MessagesTypeID" json:"messages"`
}
