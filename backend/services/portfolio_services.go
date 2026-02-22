package services

import (
	"errors"
	"strings"

	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type PortfolioService interface {
	CreatePortfolio(portfolio *entity.Portfolio) error
	GetPortfolioByID(id uint) (*entity.Portfolio, error)
	GetPortfoliosByUserID(userID uint) ([]entity.Portfolio, error)
	UpdatePortfolio(id uint, data interface{}) error
	DeletePortfolio(id uint) error
	GetAllPortfolios() ([]entity.Portfolio, error)

	GetAllPortfolioStatuses() ([]entity.PortfolioStatus, error)
}

type portfolioService struct {
	db *gorm.DB
}

func NewPortfolioService(db *gorm.DB) PortfolioService {
	return &portfolioService{db: db}
}

func (s *portfolioService) CreatePortfolio(portfolio *entity.Portfolio) error {

	if portfolio.PortfolioStatusID == 0 {
		portfolio.PortfolioStatusID = 1
	}
	err := s.db.Create(portfolio).Error
	if err != nil {
		if strings.Contains(err.Error(), "idx_user_title") || strings.Contains(err.Error(), "UNIQUE constraint failed") || strings.Contains(err.Error(), "duplicate key") {
			return errors.New("duplicate_title")
		}
		return err
	}
	return nil
}

func (s *portfolioService) GetPortfolioByID(id uint) (*entity.Portfolio, error) {
	var portfolio entity.Portfolio

	err := s.db.Preload("PortfolioStatus").Preload("User").First(&portfolio, id).Error
	if err != nil {
		return nil, err
	}
	return &portfolio, nil
}

func (s *portfolioService) GetPortfoliosByUserID(userID uint) ([]entity.Portfolio, error) {
	var portfolios []entity.Portfolio
	err := s.db.Preload("PortfolioStatus").Where("user_id = ?", userID).Find(&portfolios).Error
	if err != nil {
		return nil, err
	}
	return portfolios, nil
}

func (s *portfolioService) UpdatePortfolio(id uint, data interface{}) error {
	err := s.db.Model(&entity.Portfolio{}).Where("id = ?", id).Updates(data).Error
	if err != nil {
		// Check if error is due to unique constraint violation on title
		if strings.Contains(err.Error(), "idx_user_title") || strings.Contains(err.Error(), "UNIQUE constraint failed") || strings.Contains(err.Error(), "duplicate key") {
			return errors.New("duplicate_title")
		}
		return err
	}
	return nil
}

func (s *portfolioService) DeletePortfolio(id uint) error {
	return s.db.Delete(&entity.Portfolio{}, id).Error
}

func (s *portfolioService) GetAllPortfolios() ([]entity.Portfolio, error) {
	var portfolios []entity.Portfolio
	err := s.db.Preload("PortfolioStatus").Preload("User").Find(&portfolios).Error
	return portfolios, err
}

func (s *portfolioService) GetAllPortfolioStatuses() ([]entity.PortfolioStatus, error) {
	var statuses []entity.PortfolioStatus
	err := s.db.Find(&statuses).Error
	return statuses, err
}
