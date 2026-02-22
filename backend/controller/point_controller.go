package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

type PointController struct {
	PointService *services.PointService
}

func NewPointController(pointService *services.PointService) *PointController {
	return &PointController{PointService: pointService}
}

// GET /points/total/:userId
func (pc *PointController) GetTotalPoint(c *gin.Context) {
	userIdStr := c.Param("userId")
	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}
	total, err := pc.PointService.GetTotalPointByUserID(uint(userId))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลคะแนนของผู้ใช้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": userId, "total_points": total})
}

// GET /points/membership/:userId
func (pc *PointController) GetMembershipLevel(c *gin.Context) {
	userIdStr := c.Param("userId")
	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}
	membership, err := pc.PointService.GetMembershipLevelByUserID(uint(userId))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลระดับสมาชิกของผู้ใช้"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user_id": userId, "membership_level": membership})
}

// GET /points/records/:userId
func (pc *PointController) GetPointRecords(c *gin.Context) {
	userIdStr := c.Param("userId")
	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}
	records, err := pc.PointService.GetPointRecordsByUserID(uint(userId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลประวัติการใช้คะแนนได้"})
		return
	}
	c.JSON(http.StatusOK, records)
}

// GET /points/rewards
func (pc *PointController) GetRewards(c *gin.Context) {
	rewards, err := pc.PointService.GetAllRewards()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get rewards"})
		return
	}
	c.JSON(http.StatusOK, rewards)
}

// POST /points/rewards (รองรับ multipart/form-data สำหรับอัปโหลดรูป)
func (pc *PointController) CreateReward(c *gin.Context) {
	// รับค่าจาก form-data
	rewardName := c.PostForm("reward_name")
	pointRequired, _ := strconv.Atoi(c.PostForm("point_required"))
	stock, _ := strconv.Atoi(c.PostForm("stock"))
	description := c.PostForm("description")

	// รับไฟล์รูป
	file, err := c.FormFile("reward_image")
	var imagePath string
	if err == nil && file != nil {
		// กำหนด path ที่จะบันทึกไฟล์
		imagePath = "upload/rewards/" + file.Filename
		// save file ลง disk (สร้างโฟลเดอร์ upload/rewards ล่วงหน้า)
		err = c.SaveUploadedFile(file, imagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
			return
		}
	}

	reward := entity.Reward{
		RewardName:    rewardName,
		PointRequired: pointRequired,
		Stock:         stock,
		Description:   description,
		RewardImage:   imagePath, // เก็บ path ไฟล์
	}
	if err := pc.PointService.CreateReward(&reward); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create reward"})
		return
	}
	c.JSON(http.StatusCreated, reward)
}

// PUT /points/rewards/:id
func (pc *PointController) UpdateReward(c *gin.Context) {
	rewardIdStr := c.Param("id")
	rewardId, err := strconv.ParseUint(rewardIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid reward id"})
		return
	}

	// ดึง reward เดิมจาก database
	var reward entity.Reward
	if err := pc.PointService.DB.First(&reward, rewardId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "reward not found"})
		return
	}

	// รับค่าจาก form-data
	rewardName := c.PostForm("reward_name")
	pointRequired, _ := strconv.Atoi(c.PostForm("point_required"))
	stock, _ := strconv.Atoi(c.PostForm("stock"))
	description := c.PostForm("description")

	// รับไฟล์รูป (ถ้ามี)
	file, err := c.FormFile("reward_image")
	if err == nil && file != nil {
		// กำหนด path ที่จะบันทึกไฟล์
		imagePath := "upload/rewards/" + file.Filename
		// save file ลง disk
		err = c.SaveUploadedFile(file, imagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save image"})
			return
		}
		reward.RewardImage = imagePath
	}

	// อัปเดตข้อมูล
	reward.RewardName = rewardName
	reward.PointRequired = pointRequired
	reward.Stock = stock
	reward.Description = description

	if err := pc.PointService.DB.Save(&reward).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update reward"})
		return
	}
	c.JSON(http.StatusOK, reward)
}

// DELETE /points/rewards/:id
func (pc *PointController) DeleteReward(c *gin.Context) {
	rewardIdStr := c.Param("id")
	rewardId, err := strconv.ParseUint(rewardIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid reward id"})
		return
	}
	if err := pc.PointService.DeleteReward(uint(rewardId)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete reward"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "reward deleted successfully"})
}

// POST /points/checkin/:userId
func (pc *PointController) DailyCheckin(c *gin.Context) {
	userIdStr := c.Param("userId")
	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	record, err := pc.PointService.DailyCheckin(uint(userId))
	if err != nil {
		if err.Error() == "record already registered" || err.Error() == "record already exists" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "already checked in today"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "daily check-in successful", "record": record})
}

// GET /points/pending-posts
func (pc *PointController) GetPendingPosts(c *gin.Context) {
	posts, err := pc.PointService.GetPendingPosts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get pending posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// GET /points/posts-with-points
func (pc *PointController) GetPostsWithPoints(c *gin.Context) {
	posts, err := pc.PointService.GetPostsWithPoints()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get posts with points"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

// PUT /points/post-point/:postId
func (pc *PointController) UpdatePostPoint(c *gin.Context) {
	postIdStr := c.Param("postId")
	postId, err := strconv.ParseUint(postIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}
	var req struct {
		Point uint `json:"point"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if err := pc.PointService.UpdatePostPoint(uint(postId), req.Point); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update post point"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "post point updated"})
}

// POST /points/redeem
func (pc *PointController) RedeemReward(c *gin.Context) {
	var req struct {
		UserID   uint `json:"user_id"`
		RewardID uint `json:"reward_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := pc.PointService.RedeemReward(req.UserID, req.RewardID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "reward redeemed successfully"})
}

// GET /points/redeemed/:userId
func (pc *PointController) GetRedeemedRewards(c *gin.Context) {
	userIdStr := c.Param("userId")
	userId, err := strconv.ParseUint(userIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	redeemedIds, err := pc.PointService.GetRedeemedRewardIDsByUserID(uint(userId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get redeemed rewards"})
		return
	}
	c.JSON(http.StatusOK, redeemedIds)
}

// POST /points/distribute/:postId
func (pc *PointController) DistributePoints(c *gin.Context) {
	postIdStr := c.Param("postId")
	postId, err := strconv.ParseUint(postIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	if err := pc.PointService.DistributePointsToParticipants(uint(postId)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "points distributed successfully"})
}

// GET /points/distributed/:postId
func (pc *PointController) CheckPointsDistributed(c *gin.Context) {
	postIdStr := c.Param("postId")
	postId, err := strconv.ParseUint(postIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid post id"})
		return
	}

	distributed, err := pc.PointService.HasPointsBeenDistributed(uint(postId))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"distributed": distributed})
}
