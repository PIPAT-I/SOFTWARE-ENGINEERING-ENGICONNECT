package services

import (
	"errors"

	"github.com/sut68/team21/entity"
	"gorm.io/gorm"
)

const (
	MinEvaluationScore float64 = 0.0
	MaxEvaluationScore float64 = 5.0
	PostStatusEnded uint = 6
)

type EvaluationService struct {
	db *gorm.DB
}

func NewEvaluationService(db *gorm.DB) *EvaluationService {
	return &EvaluationService{db: db}
}

type TopicInput struct {
	Name        string `json:"name" valid:"required~Topic name is required"`
	Description string `json:"description"`
}

type CreateTopicsRequest struct {
	PostID uint         `json:"post_id" binding:"required" valid:"required~PostID is required"`
	Topics []TopicInput `json:"topics" binding:"required"`
}

func (s *EvaluationService) CreateTopics(req CreateTopicsRequest) ([]entity.ActivityEvaluationTopic, error) {
	var post entity.Post
	if err := s.db.First(&post, req.PostID).Error; err != nil {
		return nil, errors.New("ไม่พบกิจกรรมที่ระบุ")
	}

	if len(req.Topics) == 0 {
		return nil, errors.New("ต้องมีหัวข้อประเมินอย่างน้อย 1 หัวข้อ")
	}

	var topics []entity.ActivityEvaluationTopic
	for _, t := range req.Topics {
		if t.Name == "" {
			continue
		}
		topics = append(topics, entity.ActivityEvaluationTopic{
			Name:        t.Name,
			Description: t.Description,
			PostID:      req.PostID,
		})
	}

	if len(topics) == 0 {
		return nil, errors.New("ต้องมีหัวข้อประเมินอย่างน้อย 1 หัวข้อที่มีชื่อ")
	}

	if err := s.db.Create(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

func (s *EvaluationService) GetTopicsByPost(postID uint) ([]entity.ActivityEvaluationTopic, error) {
	var topics []entity.ActivityEvaluationTopic
	if err := s.db.Where("post_id = ?", postID).Find(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

type UpdateTopicRequest struct {
	Name        string `json:"name" valid:"required~Name is required"`
	Description string `json:"description"`
}

func (s *EvaluationService) UpdateTopic(topicID uint, req UpdateTopicRequest) (*entity.ActivityEvaluationTopic, error) {
	if req.Name == "" {
		return nil, errors.New("กรุณาระบุชื่อหัวข้อประเมิน")
	}

	var topic entity.ActivityEvaluationTopic
	if err := s.db.First(&topic, topicID).Error; err != nil {
		return nil, errors.New("ไม่พบหัวข้อประเมินที่ระบุ")
	}

	topic.Name = req.Name
	topic.Description = req.Description
	if err := s.db.Save(&topic).Error; err != nil {
		return nil, err
	}

	return &topic, nil
}

func (s *EvaluationService) DeleteTopic(topicID uint) error {

	var count int64
	s.db.Model(&entity.ActivityEvaluationScore{}).Where("activity_evaluation_topic_id = ?", topicID).Count(&count)
	if count > 0 {
		return errors.New("ไม่สามารถลบหัวข้อนี้ได้ เนื่องจากมีผู้ประเมินแล้ว")
	}
	result := s.db.Delete(&entity.ActivityEvaluationTopic{}, topicID)
	if result.RowsAffected == 0 {
		return errors.New("ไม่พบหัวข้อประเมินที่ระบุ")
	}
	return result.Error
}

type ScoreInput struct {
	TopicID uint    `json:"topic_id" binding:"required" valid:"required~TopicID is required"`
	Score   float64 `json:"score" binding:"required" valid:"range(0|5)~Score must be between 0 and 5"`
}


func validateScoreRange(scores []ScoreInput) error {
	for _, scoreInput := range scores {
		if scoreInput.Score < MinEvaluationScore || scoreInput.Score > MaxEvaluationScore {
			return errors.New("คะแนนต้องอยู่ระหว่าง 0 ถึง 5")
		}
	}
	return nil
}


func extractTopicIDs(scores []ScoreInput) []uint {
	topicIDs := make([]uint, len(scores))
	for i, scoreInput := range scores {
		topicIDs[i] = scoreInput.TopicID
	}
	return topicIDs
}


func buildTopicScoreResults(
	evaluationScores []*entity.ActivityEvaluationScore,
	topicNameMap map[uint]string,
) ([]TopicScoreResult, float64) {
	if len(evaluationScores) == 0 {
		return []TopicScoreResult{}, 0.0
	}

	topicScoreResults := make([]TopicScoreResult, 0, len(evaluationScores))
	var totalScoreSum float64

	for _, evalScore := range evaluationScores {
		topicName := topicNameMap[evalScore.ActivityEvaluationTopicID]
		topicScoreResults = append(topicScoreResults, TopicScoreResult{
			TopicID:   evalScore.ActivityEvaluationTopicID,
			TopicName: topicName,
			Score:     evalScore.Score,
			MaxScore:  MaxEvaluationScore,
		})
		totalScoreSum += evalScore.Score
	}

	averageScore := totalScoreSum / float64(len(topicScoreResults))
	return topicScoreResults, averageScore
}

type SubmitEvaluationRequest struct {
	RegistrationID uint         `json:"registration_id" binding:"required" valid:"required~RegistrationID is required"`
	Suggestion     string       `json:"suggestion"`
	Scores         []ScoreInput `json:"scores" binding:"required"`
}

func (s *EvaluationService) SubmitEvaluation(req SubmitEvaluationRequest, userID uint) (*entity.ActivityEvaluationRespone, error) {

	var reg entity.Registration
	if err := s.db.First(&reg, req.RegistrationID).Error; err != nil {
		return nil, errors.New("ไม่พบข้อมูลการลงทะเบียน")
	}

	var count int64
	s.db.Table("user_registrations").
		Where("registration_id = ? AND user_id = ?", req.RegistrationID, userID).
		Count(&count)
	if count == 0 {
		return nil, errors.New("คุณไม่ได้เป็นสมาชิกของทีมนี้")
	}

	// Validate all scores are within allowed range
	if err := validateScoreRange(req.Scores); err != nil {
		return nil, err
	}

	
	topicIDs := extractTopicIDs(req.Scores)

	var validatedTopics []entity.ActivityEvaluationTopic
	if err := s.db.Where("id IN ?", topicIDs).Find(&validatedTopics).Error; err != nil {
		return nil, err
	}

	if len(validatedTopics) != len(req.Scores) {
		return nil, errors.New("ไม่พบหัวข้อประเมินบางรายการ")
	}

	for _, topic := range validatedTopics {
		if topic.PostID != *reg.PostID {
			return nil, errors.New("หัวข้อประเมินไม่ตรงกับกิจกรรมนี้")
		}
	}

	respone := entity.ActivityEvaluationRespone{
		RegistrationID: req.RegistrationID,
		UserID:         userID,
		Suggestion:     req.Suggestion,
	}

	if err := s.db.Create(&respone).Error; err != nil {
		return nil, err
	}

	for _, sc := range req.Scores {
		score := entity.ActivityEvaluationScore{
			ActivityEvaluationTopicID:   sc.TopicID,
			ActivityEvaluationResponeID: respone.ID,
			Score:                       sc.Score,
		}
		if err := s.db.Create(&score).Error; err != nil {
			return nil, err
		}
	}

	return &respone, nil
}

func (s *EvaluationService) GetMyRegisteredPosts(userID uint) ([]entity.Registration, error) {
	var registrations []entity.Registration

	err := s.db.
		Joins("JOIN user_registrations ur ON ur.registration_id = registrations.id").
		Joins("JOIN posts ON posts.id = registrations.post_id").
		Where("ur.user_id = ? AND posts.status_id = ?", userID, PostStatusEnded).
		Where("posts.stop_date < NOW()").
		Where("registrations.id NOT IN (SELECT registration_id FROM activity_evaluation_respones WHERE user_id = ? AND deleted_at IS NULL)", userID).
		Where("posts.id IN (SELECT post_id FROM activity_evaluation_topics WHERE deleted_at IS NULL)").
		Preload("Post").
		Find(&registrations).Error
	return registrations, err
}

func (s *EvaluationService) GetPostsWithEvaluations() ([]entity.Post, error) {
	var posts []entity.Post

	err := s.db.
		Where("id IN (SELECT DISTINCT aet.post_id FROM activity_evaluation_topics aet JOIN activity_evaluation_scores aes ON aes.activity_evaluation_topic_id = aet.id WHERE aet.deleted_at IS NULL AND aes.deleted_at IS NULL)").
		Find(&posts).Error

	return posts, err
}

type TopicScoreResult struct {
	TopicID   uint    `json:"topic_id"`
	TopicName string  `json:"topic_name"`
	Score     float64 `json:"score"`
	MaxScore  float64 `json:"max_score"`
}

type EvaluationResultItem struct {
	ResponseID uint               `json:"response_id"`
	UserID     uint               `json:"user_id"`
	UserName   string             `json:"user_name"`
	StudentID  string             `json:"student_id"`
	TeamName   string             `json:"team_name"`
	Avatar     string             `json:"avatar"`
	AvgScore   float64            `json:"avg_score"`
	Suggestion string             `json:"suggestion"`
	Scores     []TopicScoreResult `json:"scores"`
}


func (s *EvaluationService) GetEvaluationResults(postID uint) ([]EvaluationResultItem, error) {
	var responses []entity.ActivityEvaluationRespone
	err := s.db.
		Joins("JOIN registrations ON registrations.id = activity_evaluation_respones.registration_id").
		Where("registrations.post_id = ?", postID).
		Preload("ActivityEvaluationScores").
		Find(&responses).Error

	if err != nil {
		return nil, err
	}

	if len(responses) == 0 {
		return []EvaluationResultItem{}, nil
	}

	
	var topics []entity.ActivityEvaluationTopic
	s.db.Where("post_id = ?", postID).Find(&topics)

	topicMap := make(map[uint]string, len(topics))
	for _, t := range topics {
		topicMap[t.ID] = t.Name
	}

	userIDSet := make(map[uint]struct{})
	regIDSet := make(map[uint]struct{})
	for _, resp := range responses {
		userIDSet[resp.UserID] = struct{}{}
		regIDSet[resp.RegistrationID] = struct{}{}
	}

	userIDs := make([]uint, 0, len(userIDSet))
	for id := range userIDSet {
		userIDs = append(userIDs, id)
	}

	regIDs := make([]uint, 0, len(regIDSet))
	for id := range regIDSet {
		regIDs = append(regIDs, id)
	}

	
	var users []entity.User
	s.db.Where("id IN ?", userIDs).Find(&users)
	userMap := make(map[uint]entity.User, len(users))
	for _, u := range users {
		userMap[u.ID] = u
	}

	var registrations []entity.Registration
	s.db.Where("id IN ?", regIDs).Find(&registrations)
	regMap := make(map[uint]entity.Registration, len(registrations))
	for _, r := range registrations {
		regMap[r.ID] = r
	}


	results := make([]EvaluationResultItem, 0, len(responses))

	for _, evaluationResponse := range responses {
		user := userMap[evaluationResponse.UserID]
		registration := regMap[evaluationResponse.RegistrationID]
		topicScoreResults, averageScore := buildTopicScoreResults(
			evaluationResponse.ActivityEvaluationScores,
			topicMap,
		)

		results = append(results, EvaluationResultItem{
			ResponseID: evaluationResponse.ID,
			UserID:     evaluationResponse.UserID,
			UserName:   user.FirstName + " " + user.LastName,
			StudentID:  user.SutId,
			TeamName:   registration.TeamName,
			Avatar:     user.AvatarURL,
			AvgScore:   averageScore,
			Suggestion: evaluationResponse.Suggestion,
			Scores:     topicScoreResults,
		})
	}

	return results, nil
}
