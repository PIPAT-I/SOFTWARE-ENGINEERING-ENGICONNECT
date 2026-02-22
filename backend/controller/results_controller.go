package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

type ResultsController struct {
	ResultsService *services.ResultsService
}

func NewResultsController(resultsService *services.ResultsService) *ResultsController {
	return &ResultsController{ResultsService: resultsService}
}

// POST /results
func (rc *ResultsController) CreateResult(c *gin.Context) {
	var req struct {
		AwardID        uint   `json:"award_id"`
		RegistrationID uint   `json:"registration_id"`
		AwardName      string `json:"award_name"`
		Detail         string `json:"detail"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// ตรวจสอบและสร้าง Award ถ้ายังไม่มี
	awardID, err := rc.ResultsService.EnsureAwardExists(req.AwardID, req.AwardName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to ensure award exists"})
		return
	}

	result := entity.Result{
		AwardID:        awardID,
		RegistrationID: req.RegistrationID,
		Detail:         req.Detail,
	}

	if err := rc.ResultsService.CreateResult(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save result"})
		return
	}
	c.JSON(http.StatusCreated, result)
}

// PUT /results/:id
func (rc *ResultsController) UpdateResult(c *gin.Context) {
	var req struct {
		AwardID        uint   `json:"award_id"`
		RegistrationID uint   `json:"registration_id"`
		AwardName      string `json:"award_name"`
		Detail         string `json:"detail"`
		EditReason     string `json:"edit_reason"`
	}
	id := c.Param("id")
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	result, err := rc.ResultsService.GetResultByIDString(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
		return
	}

	// ตรวจสอบและสร้าง Award ถ้ายังไม่มี (เหมือน CreateResult)
	awardID, err := rc.ResultsService.EnsureAwardExists(req.AwardID, req.AwardName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to ensure award exists"})
		return
	}

	result.AwardID = awardID
	result.RegistrationID = req.RegistrationID
	result.Detail = req.Detail

	// บันทึกเหตุผลในการแก้ไข
	if req.EditReason != "" {
		result.EditReason = &req.EditReason
	}

	if err := rc.ResultsService.UpdateResult(result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update result"})
		return
	}

	// Preload Award before returning
	if err := rc.ResultsService.DB.Preload("Award").First(result, result.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reload result with relations"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// GET /results - ดึงข้อมูล results ทั้งหมด
func (rc *ResultsController) GetAllResults(c *gin.Context) {
	results, err := rc.ResultsService.GetAllResultsWithDetails()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch results"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": results})
}

// GET /results/post/:postId - ดึงข้อมูล results ตาม post ID
func (rc *ResultsController) GetResultsByPostID(c *gin.Context) {
	postID := c.Param("postId")
	results, err := rc.ResultsService.GetResultsByPostID(postID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch results for post"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": results})
}
