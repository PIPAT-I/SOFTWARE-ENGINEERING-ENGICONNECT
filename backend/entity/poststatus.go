package entity	

import "gorm.io/gorm"

type PostStatus struct {
	gorm.Model
	StatusName string `gorm:"unique" json:"status_name"`
	Posts []Post `gorm:"foreignKey:StatusID" json:"posts"`
} 