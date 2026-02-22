package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/dto"
	"github.com/sut68/team21/services"
)

type AuthController struct {
	authService *services.AuthService
}

func NewAuthController(authService *services.AuthService) *AuthController {
	return &AuthController{authService: authService}
}

func (c *AuthController) Register(ctx *gin.Context) {
	var req dto.RegisterRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
		})
		return
	}
	err := c.authService.Register(req)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "ลงทะเบียนสำเร็จ",
	})
}
func (c *AuthController) Login(ctx *gin.Context) {
	var req dto.LoginRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
		})
		return
	}

	res, err := c.authService.Login(req)

	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":    "เข้าสู่ระบบสำเร็จ",
		"token_type": "Bearer",
		"token":      res.Token,
		"role":       res.Role,
		"id":         res.ID,
		"sut_id":     res.SutId,
		"email":      res.Email,
		"first_name": res.FirstName,
		"last_name":  res.LastName,
	})
}
