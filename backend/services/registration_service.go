package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type RegistrationService struct {
	db *gorm.DB
}

func NewRegistrationService(db *gorm.DB) *RegistrationService {
	return &RegistrationService{db: db}
}

func (s *RegistrationService) GetDB() *gorm.DB {
	return s.db
}

func (s *RegistrationService) CreateRegistrationWithUserIDs(registration *entity.Registration, userIDs []uint) (*entity.Registration, error) {

	if registration.RegistrationDate.IsZero() {
		registration.RegistrationDate = time.Now()
	}

	if registration.Status == "" {
		registration.Status = "pending"
	}

	if _, err := registration.Validate(); err != nil {
		return nil, err
	}

	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	registration.Users = nil

	if err := tx.Create(registration).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if len(userIDs) > 0 {
		fmt.Printf(" Associating Users: %v to Registration ID: %d\n", userIDs, registration.ID)

		var users []*entity.User
		if err := tx.Where("id IN ?", userIDs).Find(&users).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		if len(users) != len(userIDs) {
			tx.Rollback()
			return nil, errors.New("one or more users not found")
		}

		if err := tx.Model(registration).Association("Users").Append(users); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to associate users: %v", err)
		}
		fmt.Println(" Users Associated Successfully")
	} else {
		fmt.Println(" No UserIDs provided for association")
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	var result entity.Registration
	if err := s.db.Preload("Post").Preload("Users").Preload("Results.Award").First(&result, registration.ID).Error; err != nil {
		return nil, err
	}

	return &result, nil
}

func (s *RegistrationService) UpdateRegistration(id string, updatedData *entity.Registration) (*entity.Registration, error) {
	var registration entity.Registration
	if err := s.db.First(&registration, id).Error; err != nil {
		return nil, errors.New("registration not found")
	}

	if updatedData.Status != "" {
		registration.Status = updatedData.Status
	}

	if updatedData.TeamName != "" {
		registration.TeamName = updatedData.TeamName
	}

	if updatedData.Description != "" {
		registration.Description = updatedData.Description
	}

	if updatedData.RejectionReason != "" {
		registration.RejectionReason = updatedData.RejectionReason
	}

	if updatedData.Status == "approved" || updatedData.Status == "pending" {
		registration.RejectionReason = ""
	}

	if err := s.db.Save(&registration).Error; err != nil {
		return nil, err
	}

	return &registration, nil
}

func (s *RegistrationService) DeleteRegistration(id string) error {
	fmt.Printf(" Attempting to delete Registration ID: %s\n", id)

	tx := s.db.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var registration entity.Registration
	if err := tx.First(&registration, id).Error; err != nil {
		tx.Rollback()
		fmt.Printf(" Registration not found: %v\n", err)
		return errors.New("registration not found")
	}

	fmt.Printf(" Found Registration: ID=%d, TeamName=%s, Status=%s\n",
		registration.ID, registration.TeamName, registration.Status)

	if err := tx.Model(&registration).Association("Users").Clear(); err != nil {
		tx.Rollback()
		fmt.Printf(" Failed to clear user associations: %v\n", err)
		return fmt.Errorf("failed to clear user associations: %v", err)
	}
	fmt.Println(" User associations cleared")

	if err := tx.Unscoped().Delete(&registration).Error; err != nil {
		tx.Rollback()
		fmt.Printf(" Failed to delete registration: %v\n", err)
		return err
	}
	fmt.Printf(" Registration ID %s deleted successfully\n", id)

	if err := tx.Commit().Error; err != nil {
		fmt.Printf(" Transaction commit failed: %v\n", err)
		return err
	}

	return nil
}

func (s *RegistrationService) GetRegistrationByID(id string) (*entity.Registration, error) {
	var registration entity.Registration
	if err := s.db.Preload("Post").Preload("Users").Preload("Results.Award").First(&registration, id).Error; err != nil {
		return nil, errors.New("registration not found")
	}
	return &registration, nil
}

func (s *RegistrationService) GetRegistrationsByPostID(postID string) ([]entity.Registration, error) {
	var registrations []entity.Registration
	if err := s.db.Preload("Post").Preload("Users").Preload("Users.Major").Preload("Results.Award").Where("post_id = ?", postID).Find(&registrations).Error; err != nil {
		return nil, errors.New("registrations not found")
	}
	return registrations, nil
}

func (s *RegistrationService) AddUserToRegistration(registrationID string, userID uint) error {
	var registration entity.Registration
	if err := s.db.First(&registration, registrationID).Error; err != nil {
		return errors.New("registration not found")
	}

	var user entity.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return errors.New("user not found")
	}

	var existingUsers []*entity.User
	s.db.Model(&registration).Association("Users").Find(&existingUsers)

	for _, u := range existingUsers {
		if u.ID == userID {
			return errors.New("")
		}
	}

	if err := s.db.Model(&registration).Association("Users").Append(&user); err != nil {
		return err
	}

	return nil
}

func (s *RegistrationService) RemoveUserFromRegistration(registrationID string, userID uint) error {
	var registration entity.Registration
	if err := s.db.First(&registration, registrationID).Error; err != nil {
		return errors.New("registration not found")
	}

	var user entity.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return errors.New("user not found")
	}

	if err := s.db.Model(&registration).Association("Users").Delete(&user); err != nil {
		return err
	}

	return nil
}

func (s *RegistrationService) GetUserRegistrations(userID uint) ([]entity.Registration, error) {
	var registrations []entity.Registration

	err := s.db.Debug().
		Preload("Post").
		Preload("Post.Status").
		Preload("Users").
		Preload("Results.Award"). // Also load results and awards
		Joins("JOIN user_registrations ON user_registrations.registration_id = registrations.id").
		Where("user_registrations.user_id = ?", userID).
		Find(&registrations).Error

	if err != nil {
		return nil, err
	}

	return registrations, nil
}
