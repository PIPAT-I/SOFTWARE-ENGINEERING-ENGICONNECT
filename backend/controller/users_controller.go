package controller

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sut68/team21/dto"
	"github.com/sut68/team21/services"
)

type UserController struct {
	userService *services.UserService
}

func NewUserController(userService *services.UserService) *UserController {
	return &UserController{
		userService: userService,
	}
}

func (c *UserController) GetAllUsers(ctx *gin.Context) {
	users, err := c.userService.GetAllUsers()
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้ใช้ได้"})
		return
	}

	ctx.JSON(http.StatusOK, users)
}

func (c *UserController) GetMyProfile(ctx *gin.Context) {
	sutId, exists := ctx.Get("sut_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบ"})
		return
	}

	response, err := c.userService.GetUserProfileData(sutId.(string))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

func (c *UserController) UploadAvatar(ctx *gin.Context) {
	sutId := ctx.PostForm("sut_id")

	if sutId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุรหัสนักศึกษา"})
		return
	}
	sutId = strings.ToUpper(sutId)

	file, err := ctx.FormFile("avatar")
	if err != nil {
		log.Printf("ERROR: No file found - %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกไฟล์รูปภาพ"})
		return
	}
	log.Printf("File received: %s, Size: %d bytes", file.Filename, file.Size)

	ext := strings.ToLower(filepath.Ext(file.Filename))

	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowedExts[ext] {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะ: jpg, jpeg, png, gif, webp"})
		return
	}

	if file.Size > 5*1024*1024 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ขนาดไฟล์ต้องไม่เกิน 5MB"})
		return
	}

	newFileName := uuid.New().String() + ext
	savePath := filepath.Join("upload", "profile", newFileName)

	if err := ctx.SaveUploadedFile(file, savePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกรูปภาพได้"})
		return
	}

	avatarURL := "upload/profile/" + newFileName
	if err := c.userService.UpdateAvatarBySutId(sutId, avatarURL); err != nil {
		os.Remove(savePath)
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message":    "อัปโหลดรูปโปรไฟล์สำเร็จ",
		"avatar_url": avatarURL,
	})
}

func (c *UserController) UpdateMyProfile(ctx *gin.Context) {

	sutId, exists := ctx.Get("sut_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "กรุณาเข้าสู่ระบบ"})
		return
	}

	var req dto.UpdateProfileRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง"})
		return
	}

	if err := c.userService.UpdateProfileBySutId(sutId.(string), &req); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตโปรไฟล์ได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตโปรไฟล์สำเร็จ",
	})
}

func (c *UserController) GetUserProfile(ctx *gin.Context) {
	sutId := ctx.Param("sutId")
	if sutId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุรหัสผู้ใช้"})
		return
	}
	sutId = strings.ToUpper(sutId)

	response, err := c.userService.GetUserProfileData(sutId)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลผู้ใช้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

func (c *UserController) GetUserBySutId(ctx *gin.Context) {
	sutId := ctx.Param("sutId")

	user, err := c.userService.GetUserBySutId(sutId)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": user,
	})
}

func (c *UserController) SearchUsers(ctx *gin.Context) {
	query := ctx.Query("q")

	if query == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	users, err := c.userService.SearchUsers(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search users"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":  users,
		"count": len(users),
	})
}

func (c *UserController) GetUsersBySutIds(ctx *gin.Context) {
	var req struct {
		SutIds []string `json:"sut_ids" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	users, notFound, err := c.userService.GetUsersBySutIds(req.SutIds)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}

	response := gin.H{
		"data":  users,
		"count": len(users),
	}

	if len(notFound) > 0 {
		response["not_found"] = notFound
		response["message"] = "Some student IDs were not found"
	}

	ctx.JSON(http.StatusOK, response)
}
