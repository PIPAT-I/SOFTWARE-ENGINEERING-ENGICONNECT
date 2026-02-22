package services

import (
	"strconv"

	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

type ResultsService struct {
	DB *gorm.DB
}

func NewResultsService(db *gorm.DB) *ResultsService {
	return &ResultsService{DB: db}
}

func (s *ResultsService) CreateResult(result *entity.Result) error {
	return s.DB.Create(result).Error
}

// EnsureAwardExists - ตรวจสอบและสร้าง Award ถ้ายังไม่มี
func (s *ResultsService) EnsureAwardExists(awardID uint, awardName string) (uint, error) {
	// กำหนดชื่อรางวัลตาม ID
	awardNames := map[uint]string{
		1: "ชนะเลิศ",
		2: "รองชนะเลิศอันดับ 1",
		3: "รองชนะเลิศอันดับ 2",
		4: "ชมเชย",
		5: "อื่นๆ",
	}

	// ถ้า awardID = 0 แสดงว่าเป็นรางวัลแบบกำหนดเอง
	if awardID == 0 {
		// ถ้าไม่มี awardName ให้ใช้ค่า default
		if awardName == "" {
			awardName = "รางวัลพิเศษ"
		}

		// ตรวจสอบว่ามี Award ชื่อนี้อยู่แล้วหรือไม่
		var existingAward entity.Award
		err := s.DB.Where("award_name = ?", awardName).First(&existingAward).Error
		if err == nil {
			// พบ Award ชื่อนี้แล้ว ใช้ ID นั้น
			return existingAward.ID, nil
		}

		// ยังไม่มี Award ชื่อนี้ สร้างใหม่ (ไม่ระบุ ID ให้ database auto-generate)
		newAward := entity.Award{
			AwardName:   awardName,
			Description: "สร้างอัตโนมัติจากการประกาศรางวัล",
		}

		if err := s.DB.Create(&newAward).Error; err != nil {
			return 0, err
		}

		return newAward.ID, nil
	}

	// ถ้าไม่มี awardName ให้ใช้ชื่อจาก map
	if awardName == "" {
		if name, ok := awardNames[awardID]; ok {
			awardName = name
		} else {
			awardName = "รางวัล"
		}
	}

	// ตรวจสอบว่า Award มีอยู่แล้วหรือไม่
	var existingAward entity.Award
	err := s.DB.First(&existingAward, awardID).Error

	if err == nil {
		// Award มีอยู่แล้ว
		return awardID, nil
	}

	// Award ยังไม่มี สร้างใหม่ด้วย ID ที่กำหนด
	newAward := entity.Award{
		Model: gorm.Model{
			ID: awardID,
		},
		AwardName:   awardName,
		Description: "สร้างอัตโนมัติจากการประกาศรางวัล",
	}

	if err := s.DB.Create(&newAward).Error; err != nil {
		return 0, err
	}

	return awardID, nil
}

func (s *ResultsService) GetResultByID(id uint) (*entity.Result, error) {
	var result entity.Result
	if err := s.DB.First(&result, id).Error; err != nil {
		return nil, err
	}
	return &result, nil
}

func (s *ResultsService) GetResultByIDString(idStr string) (*entity.Result, error) {
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return nil, err
	}
	return s.GetResultByID(uint(id))
}

func (s *ResultsService) ListResults() ([]entity.Result, error) {
	var results []entity.Result
	if err := s.DB.Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

func (s *ResultsService) UpdateResult(result *entity.Result) error {
	return s.DB.Save(result).Error
}

// GetAllResultsWithDetails - ดึง results ทั้งหมดพร้อม preload Award และ Registration
func (s *ResultsService) GetAllResultsWithDetails() ([]entity.Result, error) {
	var results []entity.Result
	if err := s.DB.Preload("Award").Preload("Registration.Users").Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}

// GetResultsByPostID - ดึง results ตาม post ID
func (s *ResultsService) GetResultsByPostID(postIDStr string) ([]entity.Result, error) {
	postID, err := strconv.ParseUint(postIDStr, 10, 64)
	if err != nil {
		return nil, err
	}

	var results []entity.Result
	// Join กับ registrations เพื่อหา results ที่เกี่ยวข้องกับ post
	if err := s.DB.
		Joins("JOIN registrations ON registrations.id = results.registration_id").
		Where("registrations.post_id = ?", uint(postID)).
		Preload("Award").
		Preload("Registration.Users").
		Find(&results).Error; err != nil {
		return nil, err
	}
	return results, nil
}
