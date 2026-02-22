package services

import (
	"errors"

	"github.com/asaskevich/govalidator"
	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

func init() {
	govalidator.SetFieldsRequiredByDefault(false)
}

type PostService struct {
	db *gorm.DB
}

func NewPostService(db *gorm.DB) *PostService {
	return &PostService{db: db}
}

func (s *PostService) CreatePost(post *entity.Post) (*entity.Post, error) {
	if _, err := ValidatePost(*post); err != nil {
		return nil, err
	}

	if err := s.db.Create(post).Error; err != nil {
		return nil, err
	}

	return post, nil
}

func (s *PostService) GetAllPost() ([]entity.Post, error) {
	var posts []entity.Post

	err := s.db.
		Preload("User").
		Preload("User.Role").
		Preload("Status").
		Preload("Location").
		Preload("Chatroom").
		Preload("Registrations.Users").
		Preload("Registrations.Results").
		Preload("Registrations.Results.Award").
		Find(&posts).Error

	if err != nil {
		return nil, err
	}

	return posts, nil
}

func (s *PostService) GetPostByID(id uint) (*entity.Post, error) {
	var post entity.Post

	err := s.db.
		Preload("User").
		Preload("User.Role").
		Preload("Status").
		Preload("Location").
		Preload("Chatroom").
		Preload("Registrations").
		First(&post, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("post not found")
		}
		return nil, err
	}

	return &post, nil
}

func (s *PostService) GetMyPost(userID uint) ([]entity.Post, error) {
	var posts []entity.Post

	err := s.db.
		Where("user_id = ?", userID).
		Preload("Status").
		Preload("Location").
		Preload("Chatroom").
		Find(&posts).Error

	if err != nil {
		return nil, err
	}

	return posts, nil
}

func (s *PostService) UpdatePost(id uint, updatedData *entity.Post) error {
	var existingPost entity.Post
	if err := s.db.First(&existingPost, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("post not found")
		}
		return err
	}

	// Validate updated data before saving
	if _, err := ValidatePost(*updatedData); err != nil {
		return err
	}

	result := s.db.Model(&entity.Post{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"title":       updatedData.Title,
			"detail":      updatedData.Detail,
			"picture":     updatedData.Picture,
			"type":        updatedData.Type,
			"organizer":   updatedData.Organizer,
			"start_date":  updatedData.StartDate,
			"stop_date":   updatedData.StopDate,
			"comment":     updatedData.Comment,
			"start":       updatedData.Start,
			"stop":        updatedData.Stop,
			"status_id":   updatedData.StatusID,
			"location_id": updatedData.LocationID,
			"post_point":  updatedData.PostPoint,
		})

	if result.Error != nil {
		return result.Error
	}

	if updatedData.UserID != nil && *updatedData.UserID > 0 {
		if err := s.db.Model(&entity.Post{}).Where("id = ?", id).Update("user_id", *updatedData.UserID).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *PostService) DeletePost(id uint) error {
	var existingPost entity.Post
	if err := s.db.First(&existingPost, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("post not found")
		}
		return err
	}

	if err := s.db.Delete(&entity.Post{}, id).Error; err != nil {
		return err
	}

	return nil
}

// ValidatePost standalone function for business logic validation (can be used without PostService instance)
func ValidatePost(p entity.Post) (bool, error) {
	// First, validate required fields using govalidator
	if _, err := govalidator.ValidateStruct(p); err != nil {
		return false, err
	}

	// Business logic validation for dates

	// 1. Check if StopDate is after StartDate (activity end must be after activity start)
	if !p.StopDate.After(p.StartDate) {
		return false, govalidator.Error{
			Name: "StopDate",
			Err:  errors.New("activity end date must be after start date"),
		}
	}

	// 2. Check if Stop is after Start (registration end must be after registration start)
	if !p.Stop.After(p.Start) {
		return false, govalidator.Error{
			Name: "Stop",
			Err:  errors.New("registration end date must be after registration start date"),
		}
	}

	// 3. Check if registration period is within activity period
	// Start (registration start) must not be before StartDate (activity start)
	if p.Start.Before(p.StartDate) {
		return false, govalidator.Error{
			Name: "Start",
			Err:  errors.New("registration start date must not be before activity start date"),
		}
	}

	// Stop (registration end) must not be after StopDate (activity end)
	if p.Stop.After(p.StopDate) {
		return false, govalidator.Error{
			Name: "Stop",
			Err:  errors.New("registration end date must not be after activity end date"),
		}
	}

	return true, nil
}

// GetActivePostsForStudent returns posts visible to students
// Only shows Approved (2) and Active (5) posts
func (s *PostService) GetActivePostsForStudent() ([]entity.Post, error) {
	var posts []entity.Post

	// Filter posts where status_id IN (2, 5)
	// 2 = Approved, 4 = Upcoming, 5 = Active
	err := s.db.
		Where("status_id IN ?", []uint{2, 4, 5}).
		Preload("User").
		Preload("User.Role").
		Preload("Status").
		Preload("Location").
		Preload("Chatroom").
		Find(&posts).Error

	if err != nil {
		return nil, err
	}

	return posts, nil
}
