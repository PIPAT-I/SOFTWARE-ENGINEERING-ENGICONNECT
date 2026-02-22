package services

import (
	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type MetadataService struct {
	db *gorm.DB
}

func NewMetadataService(db *gorm.DB) *MetadataService {
	return &MetadataService{db: db}
}

func (s *MetadataService) GetAllFaculties() ([]entity.Faculty, error) {
	var faculties []entity.Faculty
	if err := s.db.Find(&faculties).Error; err != nil {
		return nil, err
	}
	return faculties, nil
}

func (s *MetadataService) GetAllMajors() ([]entity.Major, error) {
	var majors []entity.Major
	if err := s.db.Find(&majors).Error; err != nil {
		return nil, err
	}
	return majors, nil
}

func (s *MetadataService) GetAllLocations() ([]entity.Location, error) {
	var locations []entity.Location
	if err := s.db.Find(&locations).Error; err != nil {
		return nil, err
	}
	return locations, nil
}
