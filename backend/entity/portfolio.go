package entity

import (
	"gorm.io/gorm"
)

type Portfolio struct {
	gorm.Model
	Title             string           `gorm:"not null;uniqueIndex:idx_user_title" valid:"required~Title is required" json:"title"`
	Description       string           `json:"description"`
	PortType          string           `json:"porttype"`
	LinkPortfolio     string           `json:"link_portfolio"`
	File_urls         string           `json:"file_urls"`
	UserID            uint             `gorm:"not null;uniqueIndex:idx_user_title" valid:"required~UserID is required" json:"user_id"`
	User              User             `gorm:"foreignKey:UserID" valid:"-" json:"user"`
	AdminComment      *string          `json:"admin_comment"`
	PortfolioStatusID uint             `gorm:"not null" valid:"required~PortfolioStatusID is required" json:"portfolio_status_id"`
	PortfolioStatus   *PortfolioStatus `gorm:"foreignKey:PortfolioStatusID" valid:"-" json:"portfolio_status"`
}
