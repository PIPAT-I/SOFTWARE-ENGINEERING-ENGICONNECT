package services

import (
	"os"
	"path/filepath"
	"strings"

	"fmt"
	"log"

	"github.com/sut68/team21/dto"
	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type UserService struct {
	db *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{
		db: db,
	}
}

func preloadUserRelations(db *gorm.DB) *gorm.DB {
	return db.
		Preload("Faculty").
		Preload("Major").
		Preload("Role").
		Preload("Skills").
		Preload("Interests").
		Preload("Tools").
		Preload("Socials")
}

func preloadUserRelationsWithPoints(db *gorm.DB) *gorm.DB {
	return preloadUserRelations(db).Preload("UserPoint")
}

func (s *UserService) GetAllUsers() ([]entity.User, error) {
	var users []entity.User
	if err := s.db.Preload("Role").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (s *UserService) GetUserProfileBySutId(sutId string) (*entity.User, error) {
	var user entity.User
	if err := preloadUserRelations(s.db).
		Where("sut_id = ?", sutId).
		First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) GetUserProfileData(sutId string) (*dto.ProfileResponse, error) {

	user, err := s.GetUserProfileBySutId(sutId)
	if err != nil {
		return nil, err
	}
	response := dto.ToProfileResponse(user)

	var portfolios []entity.Portfolio
	if err := s.db.Preload("PortfolioStatus").
		Joins("JOIN portfolio_statuses ON portfolios.portfolio_status_id = portfolio_statuses.id").
		Where("portfolios.user_id = ? AND portfolio_statuses.status_name = ?", user.ID, "Approved").
		Find(&portfolios).Error; err != nil {
		log.Println("Error fetching portfolios:", err)

		response.Portfolios = []entity.Portfolio{}
	} else {
		response.Portfolios = portfolios
	}
	var userWithRegs entity.User
	if err := s.db.Preload("Registrations", "status = ? OR status = ?", "Approved", "approved").
		Preload("Registrations.Post").
		First(&userWithRegs, user.ID).Error; err != nil {
		log.Println("Error fetching user registrations:", err)
	}

	registrations := userWithRegs.Registrations
	var postIDs []uint
	for _, reg := range registrations {
		if reg.Post != nil {
			postIDs = append(postIDs, reg.Post.ID)
		}
	}

	var certTemplates []entity.Certificate
	certMap := make(map[uint]entity.Certificate)

	if len(postIDs) > 0 {
		if err := s.db.Where("post_id IN ?", postIDs).Find(&certTemplates).Error; err == nil {
			for _, t := range certTemplates {
				certMap[t.PostID] = t
			}
		}
	}

	var certificates []dto.CertificateDTO
	for _, reg := range registrations {
		if reg.Post == nil {
			continue
		}
		if certTemplate, exists := certMap[reg.Post.ID]; exists {
			if certTemplate.PictureParticipation != "" {

				certType := certTemplate.Type
				if certType == "" {
					certType = "Participation"
				}

				certificates = append(certificates, dto.CertificateDTO{
					ID:                   certTemplate.ID,
					TitleTH:              certTemplate.TitleTH,
					TitleEN:              certTemplate.TitleEN,
					Type:                 certType,
					PictureParticipation: certTemplate.PictureParticipation,
					PictureWinner:        certTemplate.PictureWinner,
					ActivityPicture:      reg.Post.Picture, // Use Post picture
					ActivityTitle:        reg.Post.Title,
					Organizer:            certTemplate.Organizer,
					Date:                 reg.Post.StartDate.Format("2006-01-02"),
				})
			}
		}
	}
	response.Certificates = certificates

	return response, nil
}

func (s *UserService) UpdateAvatarBySutId(sutId string, avatarURL string) error {
	var user entity.User
	if err := s.db.Where("sut_id = ?", sutId).First(&user).Error; err != nil {
		return err
	}

	if user.AvatarURL != "" && !isExternalURL(user.AvatarURL) {
		oldFilePath := filepath.Join(user.AvatarURL)
		if _, err := os.Stat(oldFilePath); err == nil {
			_ = os.Remove(oldFilePath)
		}
	}

	result := s.db.Model(&entity.User{}).
		Where("sut_id = ?", sutId).
		Update("avatar_url", avatarURL)

	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (s *UserService) UpdateProfileBySutId(sutId string, req *dto.UpdateProfileRequest) error {
	var user entity.User
	if err := s.db.Where("sut_id = ?", sutId).First(&user).Error; err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&user).Updates(map[string]interface{}{
			"first_name": req.FirstName,
			"last_name":  req.LastName,
			"email":      req.Email,
			"phone":      req.Phone,
			"faculty_id": req.FacultyID,
			"major_id":   req.MajorID,
			"year":       req.Year,
			"bio":        req.Bio,
		}).Error; err != nil {
			return err
		}

		if err := tx.Where("user_id = ?", user.ID).Delete(&entity.Skill{}).Error; err != nil {
			return err
		}
		if len(req.Skills) > 0 {
			var skills []entity.Skill
			for _, name := range req.Skills {
				if name != "" {
					skills = append(skills, entity.Skill{Name: name, UserID: user.ID})
				}
			}
			if len(skills) > 0 {
				if err := tx.Create(&skills).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Where("user_id = ?", user.ID).Delete(&entity.Interest{}).Error; err != nil {
			return err
		}
		if len(req.Interests) > 0 {
			var interests []entity.Interest
			for _, name := range req.Interests {
				if name != "" {
					interests = append(interests, entity.Interest{Name: name, UserID: user.ID})
				}
			}
			if len(interests) > 0 {
				if err := tx.Create(&interests).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Where("user_id = ?", user.ID).Delete(&entity.Tool{}).Error; err != nil {
			return err
		}
		if len(req.Tools) > 0 {
			var tools []entity.Tool
			for _, name := range req.Tools {
				if name != "" {
					tools = append(tools, entity.Tool{Name: name, UserID: user.ID})
				}
			}
			if len(tools) > 0 {
				if err := tx.Create(&tools).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Where("user_id = ?", user.ID).Delete(&entity.Social{}).Error; err != nil {
			return err
		}
		if len(req.Socials) > 0 {
			var socials []entity.Social
			for _, item := range req.Socials {
				if item.Platform != "" && item.Link != "" {
					socials = append(socials, entity.Social{
						Platform: item.Platform,
						Link:     item.Link,
						UserID:   user.ID,
					})
				}
			}
			if len(socials) > 0 {
				if err := tx.Create(&socials).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func isExternalURL(url string) bool {
	return len(url) > 7 && (url[:7] == "http://" || url[:8] == "https://")
}

func (s *UserService) GetUserBySutId(sutId string) (*entity.User, error) {

	cleanSutId := strings.TrimSpace(sutId)

	var user entity.User

	err := preloadUserRelationsWithPoints(s.db).
		Where("sut_id = ?", cleanSutId).
		First(&user).Error

	if err == gorm.ErrRecordNotFound {
		err = preloadUserRelationsWithPoints(s.db).
			Where("LOWER(TRIM(sut_id)) = LOWER(?)", cleanSutId).
			First(&user).Error
	}

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("student not found with SutId: %s", sutId)
		}
		return nil, err
	}

	return &user, nil
}

func (s *UserService) GetUsersBySutIds(sutIds []string) ([]*entity.User, []string, error) {
	normalizedSutIds := make([]string, len(sutIds))
	for i, id := range sutIds {
		normalizedSutIds[i] = strings.ToLower(strings.TrimSpace(id))
	}

	var users []*entity.User
	err := s.db.
		Preload("Faculty").
		Preload("Major").
		Preload("Role").
		Where("LOWER(TRIM(sut_id)) IN ?", normalizedSutIds).
		Find(&users).Error

	if err != nil {
		return nil, nil, err
	}

	foundIds := make(map[string]bool)
	for _, user := range users {
		foundIds[strings.ToLower(strings.TrimSpace(user.SutId))] = true
	}

	var notFound []string
	for _, sutId := range normalizedSutIds {
		if !foundIds[sutId] {
			notFound = append(notFound, sutId)
		}
	}

	if len(notFound) > 0 {
		log.Printf("SutIds not found: %v", notFound)
	}

	return users, notFound, nil
}

func (s *UserService) SearchUsers(query string) ([]*entity.User, error) {
	var users []*entity.User
	err := s.db.
		Preload("Faculty").
		Preload("Major").
		Preload("Role").
		Where("first_name LIKE ? OR last_name LIKE ? OR sut_id LIKE ?",
			"%"+query+"%", "%"+query+"%", "%"+query+"%").
		Limit(20).
		Find(&users).Error

	if err != nil {
		return nil, err
	}

	return users, nil
}
