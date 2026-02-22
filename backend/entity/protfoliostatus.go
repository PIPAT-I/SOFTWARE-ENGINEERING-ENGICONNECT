package entity

import (
	"gorm.io/gorm"
)

type PortfolioStatus struct {
	gorm.Model
	StatusName string      `gorm:"unique" json:"status_name"`
	Portfolios []Portfolio `gorm:"foreignKey:PortfolioStatusID" json:"portfolios"`
}
