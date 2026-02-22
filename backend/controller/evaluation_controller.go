package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/services"
)

type EvaluationController struct {
	service *services.EvaluationService
}

func NewEvaluationController(service *services.EvaluationService) *EvaluationController {
	return &EvaluationController{service: service}
}

func (c *EvaluationController) CreateTopics(ctx *gin.Context) {
	var req services.CreateTopicsRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	topics, err := c.service.CreateTopics(req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "สร้างหัวข้อการประเมินสำเร็จ",
		"data":    topics,
	})
}

func (c *EvaluationController) GetTopicsByPost(ctx *gin.Context) {
	postID, err := strconv.Atoi(ctx.Param("postId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสกิจกรรมไม่ถูกต้อง"})
		return
	}

	topics, err := c.service.GetTopicsByPost(uint(postID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "ดึงหัวข้อการประเมินสำเร็จ",
		"data":    topics,
	})
}

func (c *EvaluationController) DeleteTopic(ctx *gin.Context) {
	topicID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสหัวข้อไม่ถูกต้อง"})
		return
	}

	if err := c.service.DeleteTopic(uint(topicID)); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ลบหัวข้อการประเมินสำเร็จ"})
}

func (c *EvaluationController) UpdateTopic(ctx *gin.Context) {
	topicID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสหัวข้อไม่ถูกต้อง"})
		return
	}

	var req services.UpdateTopicRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	topic, err := c.service.UpdateTopic(uint(topicID), req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตหัวข้อการประเมินสำเร็จ",
		"data":    topic,
	})
}

func (c *EvaluationController) SubmitEvaluation(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่ได้เข้าสู่ระบบ"})
		return
	}

	var req services.SubmitEvaluationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	respone, err := c.service.SubmitEvaluation(req, userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "ประเมินสำเร็จ",
		"data":    respone,
	})
}

func (c *EvaluationController) GetMyRegisteredPosts(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "ไม่ได้เข้าสู่ระบบ"})
		return
	}

	posts, err := c.service.GetMyRegisteredPosts(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "ดึงกิจกรรมที่ลงทะเบียนสำเร็จ",
		"data":    posts,
	})
}



func (c *EvaluationController) GetPostsWithEvaluations(ctx *gin.Context) {
	posts, err := c.service.GetPostsWithEvaluations()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Posts with evaluations retrieved successfully",
		"data":    posts,
	})
}


func (c *EvaluationController) GetEvaluationResults(ctx *gin.Context) {
	postID, err := strconv.Atoi(ctx.Param("postId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสกิจกรรมไม่ถูกต้อง"})
		return
	}

	results, err := c.service.GetEvaluationResults(uint(postID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "ดึงผลการประเมินสำเร็จ",
		"data":    results,
	})
}
