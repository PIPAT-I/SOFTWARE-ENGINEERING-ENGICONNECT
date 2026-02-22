package services

import (
	"errors"
	"time"

	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PointService struct {
	DB *gorm.DB
}

func NewPointService(db *gorm.DB) *PointService {
	return &PointService{DB: db}
}

func (s *PointService) GetTotalPointByUserID(userID uint) (int, error) {
	var userPoint entity.UserPoint
	err := s.DB.Where("user_id = ?", userID).First(&userPoint).Error
	if err != nil {
		return 0, err
	}
	return userPoint.TotalPoints, nil
}

func (s *PointService) AddPointsToUser(userID uint, points int) error {
	var userPoint entity.UserPoint
	err := s.DB.Where("user_id = ?", userID).First(&userPoint).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			userPoint = entity.UserPoint{
				UserID:      userID,
				TotalPoints: points,
			}
			// membership เงื่อนไข
			userPoint.MembershipLevel = CalculateMembership(points)
			return s.DB.Create(&userPoint).Error
		}
		return err
	}
	userPoint.TotalPoints += points
	userPoint.MembershipLevel = CalculateMembership(userPoint.TotalPoints)
	return s.DB.Save(&userPoint).Error
}

func CalculateMembership(points int) string {
	switch {
	case points >= 5001:
		return "แพลทินัม"
	case points >= 1001:
		return "ทอง"
	case points >= 201:
		return "เงิน"
	default:
		return "เริ่มต้น"
	}
}

func (s *PointService) GetMembershipLevelByUserID(userID uint) (string, error) {
	var userPoint entity.UserPoint
	err := s.DB.Where("user_id = ?", userID).First(&userPoint).Error
	if err != nil {
		return "", err
	}
	return userPoint.MembershipLevel, nil
}

func (s *PointService) GetPointRecordsByUserID(userID uint) ([]map[string]interface{}, error) {
	var records []entity.PointRecord
	err := s.DB.Where("user_id = ?", userID).Find(&records).Error
	if err != nil {
		return nil, err
	}

	// แปลงเป็น map และเพิ่มชื่อกิจกรรม
	result := make([]map[string]interface{}, 0, len(records))
	for _, r := range records {
		item := map[string]interface{}{
			"ID":              r.ID,
			"CreatedAt":       r.CreatedAt,
			"user_id":         r.UserID,
			"points":          r.Points,
			"type":            r.Type,
			"registration_id": r.RegistrationID,
		}

		// ถ้ามี RegistrationID ให้ดึงชื่อกิจกรรม
		if r.RegistrationID != nil {
			var registration entity.Registration
			if err := s.DB.Preload("Post").First(&registration, *r.RegistrationID).Error; err == nil {
				if registration.Post != nil {
					item["activity_name"] = registration.Post.Title
				}
			}
		}

		result = append(result, item)
	}

	return result, nil
}

func (s *PointService) CreateReward(reward *entity.Reward) error {
	if reward.PointRequired < 100 {
		return errors.New("กรุณาตั้งคะแนนที่ต้องใช้ในการแลกรางวัลไม่น้อยกว่า 100")
	}
	if reward.Stock < 1 {
		return errors.New("กรุณากำหนดจำนวนสินค้าคงคลังไม่น้อยกว่า 1")
	}
	if reward.RewardName == "" {
		return errors.New("กรุณาใส่ชื่อรางวัล")
	}
	if reward.RewardImage == "" {
		return errors.New("กรุณาใส่รูปภาพรางวัล")
	}
	return s.DB.Create(reward).Error
}

func (s *PointService) GetAllRewardNames() ([]string, error) {
	var rewards []entity.Reward
	if err := s.DB.Find(&rewards).Error; err != nil {
		return nil, err
	}
	names := make([]string, 0, len(rewards))
	for _, r := range rewards {
		names = append(names, r.RewardName)
	}
	return names, nil
}

func (s *PointService) CreatePointRecord(record *entity.PointRecord) error {
	return s.DB.Create(record).Error
}

// DailyCheckin performs daily check-in for a user, prevents duplicate, creates record, and adds points
func (s *PointService) DailyCheckin(userId uint) (*entity.PointRecord, error) {
	// ดึง records โดยตรงจาก DB เพื่อเช็ค daily_checkin
	var records []entity.PointRecord
	s.DB.Where("user_id = ?", userId).Find(&records)

	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, today.Location())
	for _, r := range records {
		recordDate := r.CreatedAt
		recordDate = time.Date(recordDate.Year(), recordDate.Month(), recordDate.Day(), 0, 0, 0, 0, recordDate.Location())
		if recordDate.Equal(today) && r.Type == "daily_checkin" {
			return nil, gorm.ErrRegistered
		}
	}

	record := &entity.PointRecord{
		UserID: userId,
		Points: 20,
		Type:   "daily_checkin",
	}
	if err := s.CreatePointRecord(record); err != nil {
		return nil, err
	}
	if err := s.AddPointsToUser(userId, 20); err != nil {
		return nil, err
	}
	return record, nil
}

func (s *PointService) GetAllRewards() ([]entity.Reward, error) {
	var rewards []entity.Reward
	err := s.DB.Find(&rewards).Error
	if err != nil {
		return nil, err
	}
	return rewards, nil
}

// ดึงโพสต์ที่ยังไม่ได้ตั้งค่าคะแนน (PostPoint == 0)
func (s *PointService) GetPendingPosts() ([]entity.Post, error) {
	var posts []entity.Post
	err := s.DB.Preload("Registrations.Users").
		Where("post_point = 0").
		Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

// ดึงโพสต์ที่มีคะแนนแล้ว (PostPoint > 0)
func (s *PointService) GetPostsWithPoints() ([]entity.Post, error) {
	var posts []entity.Post
	err := s.DB.Preload("Registrations.Users").
		Preload("Registrations.PointRecords").
		Where("post_point > 0").
		Find(&posts).Error
	if err != nil {
		return nil, err
	}
	return posts, nil
}

// อัปเดตคะแนนกิจกรรม (PostPoint)
func (s *PointService) UpdatePostPoint(postId uint, point uint) error {
	var post entity.Post
	if err := s.DB.First(&post, postId).Error; err != nil {
		return err
	}
	post.PostPoint = point
	return s.DB.Save(&post).Error
}

// RedeemRewardService สำหรับแลกรางวัล
func (s *PointService) RedeemReward(userID, rewardID uint) error {
	return s.DB.Transaction(func(tx *gorm.DB) error {

		var reward entity.Reward
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).
			First(&reward, rewardID).Error; err != nil {
			return errors.New("reward not found")
		}

		if reward.Stock <= 0 {
			return errors.New("reward out of stock")
		}

		var userPoint entity.UserPoint
		if err := tx.Where("user_id = ?", userID).
			First(&userPoint).Error; err != nil {
			return errors.New("user point not found")
		}

		if userPoint.TotalPoints < reward.PointRequired {
			return errors.New("not enough points")
		}

		// create redeem record
		redeem := entity.RewardRedeem{
			UserID:   userID,
			RewardID: rewardID,
		}
		if err := tx.Create(&redeem).Error; err != nil {
			return err
		}

		// update points
		userPoint.TotalPoints -= reward.PointRequired
		userPoint.MembershipLevel = CalculateMembership(userPoint.TotalPoints)
		if err := tx.Save(&userPoint).Error; err != nil {
			return err
		}

		// update stock
		reward.Stock -= 1
		if err := tx.Save(&reward).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *PointService) GetRedeemedRewardsByUserID(userID uint) ([]entity.RewardRedeem, error) {
	var redeems []entity.RewardRedeem
	err := s.DB.Where("user_id = ?", userID).Find(&redeems).Error
	if err != nil {
		return nil, err
	}
	return redeems, nil
}

func (s *PointService) GetRedeemedRewardIDsByUserID(userID uint) ([]uint, error) {
	var redeems []entity.RewardRedeem
	if err := s.DB.Where("user_id = ?", userID).Find(&redeems).Error; err != nil {
		return nil, err
	}
	ids := make([]uint, 0, len(redeems))
	for _, r := range redeems {
		ids = append(ids, r.RewardID)
	}
	return ids, nil
}

// DeleteReward deletes a reward by ID (soft delete)
func (s *PointService) DeleteReward(rewardID uint) error {
	return s.DB.Delete(&entity.Reward{}, rewardID).Error
}

// DistributePointsToParticipants แจกคะแนนให้ผู้เข้าร่วมกิจกรรม
func (s *PointService) DistributePointsToParticipants(postID uint) error {
	// 1. Get activity with registrations and users
	var post entity.Post
	err := s.DB.Preload("Registrations.Users").
		Preload("Registrations.PointRecords").
		First(&post, postID).Error
	if err != nil {
		return err
	}

	// 2. Check if activity has points configured
	if post.PostPoint == 0 {
		return errors.New("activity has no points configured")
	}

	// 3. Loop through registrations
	for _, reg := range post.Registrations {
		// Check if already distributed to this registration
		alreadyDistributed := false
		for _, record := range reg.PointRecords {
			if record.Type == "activity_completion" {
				alreadyDistributed = true
				break
			}
		}

		if alreadyDistributed {
			continue // Skip this registration
		}

		// Distribute to all users in registration
		for _, user := range reg.Users {
			// Create point record
			record := &entity.PointRecord{
				UserID:         user.ID,
				Points:         int(post.PostPoint),
				Type:           "activity_completion",
				RegistrationID: &reg.ID,
			}
			if err := s.CreatePointRecord(record); err != nil {
				return err
			}

			// Add points to user
			if err := s.AddPointsToUser(user.ID, int(post.PostPoint)); err != nil {
				return err
			}
		}
	}

	return nil
}

// HasPointsBeenDistributed checks if points have been distributed for a post
func (s *PointService) HasPointsBeenDistributed(postID uint) (bool, error) {
	var count int64
	err := s.DB.Model(&entity.PointRecord{}).
		Joins("JOIN registrations ON registrations.id = point_records.registration_id").
		Where("registrations.post_id = ? AND point_records.type = ?", postID, "activity_completion").
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
