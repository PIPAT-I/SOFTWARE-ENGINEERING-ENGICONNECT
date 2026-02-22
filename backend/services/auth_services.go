package services

import (
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/sut68/team21/config"
	"github.com/sut68/team21/dto"
	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

func (s *AuthService) Register(req dto.RegisterRequest) error {

	req.SutId = strings.ToUpper(req.SutId)
	req.Email = strings.ToLower(req.Email)

	sutIdPattern := regexp.MustCompile(`^[AaBbMmDd]\d{7}$`)
	if !sutIdPattern.MatchString(req.SutId) {
		return errors.New("รูปแบบรหัสนักศึกษาไม่ถูกต้อง (ต้องเป็น B หรือ M หรือ D ตามด้วยตัวเลข 7 หลัก)")
	}

	var count int64
	s.db.Model(&entity.User{}).
		Where("sut_id = ? OR email = ?", req.SutId, req.Email).
		Count(&count)

	if count > 0 {
		return errors.New("รหัสนักศึกษาหรืออีเมลถูกใช้งานแล้ว")
	}

	hashedPassWord, err := config.HashPassword(req.Password)

	if err != nil {
		return errors.New("สร้างรหัสผ่านไม่สำเร็จ")
	}

	var role *entity.Role
	if err := s.db.Where("name = ?", "student").First(&role).Error; err != nil {
		return errors.New("ไม่พบข้อมูลบทบาท student")
	}

	var skills []*entity.Skill
	for _, skillName := range req.Skills {
		if skillName != "" {
			skills = append(skills, &entity.Skill{Name: skillName})
		}
	}

	var tools []*entity.Tool
	for _, toolName := range req.Tools {
		if toolName != "" {
			tools = append(tools, &entity.Tool{Name: toolName})
		}
	}

	var interests []*entity.Interest
	for _, interestName := range req.Interests {
		if interestName != "" {
			interests = append(interests, &entity.Interest{Name: interestName})
		}
	}

	var socials []*entity.Social
	for _, socialMedia := range req.Socials {
		if socialMedia.Platform != "" && socialMedia.Link != "" {
			socials = append(socials, &entity.Social{
				Platform: socialMedia.Platform,
				Link:     socialMedia.Link,
			})
		}
	}

	avatarURL := ""

	user := entity.User{
		SutId:     req.SutId,
		Email:     req.Email,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Password:  hashedPassWord,
		RoleID:    role.ID,
		Year:      req.Year,
		FacultyID: req.FacultyID,
		MajorID:   req.MajorID,
		Phone:     req.Phone,
		Bio:       req.Bio,
		AvatarURL: avatarURL,
		Skills:    skills,
		Tools:     tools,
		Interests: interests,
		Socials:   socials,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return fmt.Errorf("ไม่สามารถลงทะเบียนได้: %w", err)
	}
	pointRecord := entity.PointRecord{
		UserID: user.ID,
		Points: 50,
		Type:   "สมัครสมาชิกใหม่",
	}
	s.db.Create(&pointRecord)
	userPoint := entity.UserPoint{
		UserID:      user.ID,
		TotalPoints: 50,
	}
	s.db.Create(&userPoint)

	return nil
}

func (s *AuthService) Login(req dto.LoginRequest) (dto.LoginResponse, error) {
	var user entity.User

	sutId := strings.ToUpper(req.SutId)
	errMsg := "รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง"
	if err := s.db.Preload("Role").
		Where("sut_id = ?", sutId).
		First(&user).Error; err != nil {
		return dto.LoginResponse{}, errors.New(errMsg)
	}

	if !config.CheckPasswordHash(req.Password, user.Password) {
		return dto.LoginResponse{}, errors.New(errMsg)
	}

	token, err := config.GenerateJWT(user.ID, user.SutId, user.Role.Name)
	if err != nil {
		return dto.LoginResponse{}, fmt.Errorf("ไม่สามารถสร้าง token ได้: %w", err)
	}

	res := dto.LoginResponse{
		ID:        user.ID,
		SutId:     user.SutId,
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Role:      user.Role.Name,
		Token:     token,
	}

	return res, nil
}
