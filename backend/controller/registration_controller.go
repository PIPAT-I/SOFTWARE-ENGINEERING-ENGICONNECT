package controller

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

type RegistrationController struct {
	registrationService *services.RegistrationService
}

type UpdateRegistrationRequest struct {
	TeamName    string `json:"team_name" binding:"required,min=3"`
	Description string `json:"description"`
}

func NewRegistrationController(registrationService *services.RegistrationService) *RegistrationController {
	return &RegistrationController{
		registrationService: registrationService,
	}
}

type CreateRegistrationRequest struct {
	TeamName         string `json:"team_name" binding:"required"`
	Description      string `json:"description" binding:"required"`
	PostID           uint   `json:"post_id" binding:"required"`
	Status           string `json:"status"`
	RegistrationDate string `json:"registration_date"`
	UserIDs          []uint `json:"user_ids"` 
}

func (c *RegistrationController) CreateRegistration(ctx *gin.Context) {
	var req CreateRegistrationRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status == "" {
		req.Status = "pending"
	}

	userIDValue, exists := ctx.Get("user_id")
	if exists {
		var currentUserID uint

		switch v := userIDValue.(type) {
		case uint:
			currentUserID = v
		case float64:
			currentUserID = uint(v)
		case int:
			currentUserID = uint(v)
		case string:
			if id, err := strconv.ParseUint(v, 10, 32); err == nil {
				currentUserID = uint(id)
			}
		}

		if currentUserID != 0 {

			found := false
			for _, uid := range req.UserIDs {
				if uid == currentUserID {
					found = true
					break
				}
			}

			if !found {
				req.UserIDs = append(req.UserIDs, currentUserID)
			}
		}
	}

	registration := &entity.Registration{
		TeamName:    req.TeamName,
		Description: req.Description,
		Status:      req.Status,
		PostID:      &req.PostID,
	}

	result, err := c.registrationService.CreateRegistrationWithUserIDs(registration, req.UserIDs)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"data": result})
}

func (c *RegistrationController) UpdateRegistration(ctx *gin.Context) {
	id := ctx.Param("id")

	var req UpdateRegistrationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := &entity.Registration{
		TeamName:    req.TeamName,
		Description: req.Description,
	}

	result, err := c.registrationService.UpdateRegistration(id, payload)
	if err != nil {
		if err.Error() == "registration not found" {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *RegistrationController) UpdateRegistrationStatus(ctx *gin.Context) {
	id := ctx.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Status != "pending" && req.Status != "approved" && req.Status != "rejected" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid status value"})
		return
	}

	payload := &entity.Registration{
		Status: req.Status,
		RejectionReason: req.Reason,
	}

	result, err := c.registrationService.UpdateRegistration(id, payload)
	if err != nil {
		if err.Error() == "registration not found" {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result, "message": "status updated successfully"})
}

func (c *RegistrationController) DeleteRegistration(ctx *gin.Context) {
	id := ctx.Param("id")

	if err := c.registrationService.DeleteRegistration(id); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": "id " + id + " deleted"})
}

func (c *RegistrationController) GetRegistrationByID(ctx *gin.Context) {
	id := ctx.Param("id")

	result, err := c.registrationService.GetRegistrationByID(id)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *RegistrationController) GetRegistrationsByPostID(ctx *gin.Context) {
	postID := ctx.Param("id")

	result, err := c.registrationService.GetRegistrationsByPostID(postID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}

func (c *RegistrationController) AddUserToRegistration(ctx *gin.Context) {
	registrationID := ctx.Param("id")

	var req struct {
		UserID uint   `json:"user_id"`
		SutID  string `json:"sut_id"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userID uint

	if req.SutID != "" {
		var user entity.User
		if err := c.registrationService.GetDB().
			Where("sut_id = ?", req.SutID).
			First(&user).Error; err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้จาก SUT ID"})
			return
		}
		userID = user.ID
	} else if req.UserID != 0 {
		userID = req.UserID
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ต้องระบุ user_id หรือ sut_id"})
		return
	}

	if err := c.registrationService.AddUserToRegistration(registrationID, userID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "user added to registration successfully"})
}


func (c *RegistrationController) RemoveUserFromRegistration(ctx *gin.Context) {
	registrationID := ctx.Param("id")

	var req struct {
		UserID uint `json:"user_id" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.registrationService.RemoveUserFromRegistration(registrationID, req.UserID); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "user removed from registration successfully"})
}

func (c *RegistrationController) GetMyRegistrations(ctx *gin.Context) {
	userIDValue, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	var userID uint
	switch v := userIDValue.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	case string:
		id, err := strconv.ParseUint(v, 10, 32)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
			return
		}
		userID = uint(id)
	case int:
		userID = uint(v)
	default:
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID format"})
		return
	}

	fmt.Printf("GetMyRegistrations: UserID=%d\n", userID)

	var count int64
	c.registrationService.GetDB().Table("user_registrations").Where("user_id = ?", userID).Count(&count)
	fmt.Printf("Debug: Found %d rows in user_registrations for UserID %d\n", count, userID)

	result, err := c.registrationService.GetUserRegistrations(userID)
	if err != nil {
		fmt.Printf(" GetMyRegistrations Error: %v\n", err)
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	fmt.Printf("GetMyRegistrations Found: %d items\n", len(result))

	ctx.JSON(http.StatusOK, gin.H{"data": result})
}
