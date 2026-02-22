package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

type CertificateController struct {
	certificateService *services.CertificateService
}

func NewCertificateController(certificateService *services.CertificateService) *CertificateController {
	return &CertificateController{
		certificateService: certificateService,
	}
}
 

func (c *CertificateController) CreateCertificate(ctx *gin.Context) {
	var certificate entity.Certificate

	if err := ctx.ShouldBindJSON(&certificate); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ดึง user_id จาก JWT
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	uid := userID.(uint)
	certificate.UserID = &uid

	result, err := c.certificateService.CreateCertificate(&certificate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Post created successfully",
		"data":    result,
	})
}


func (c *CertificateController) GetAllCertificate(ctx *gin.Context) {
	certificate, err := c.certificateService.GetAllCertificate()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Certificate retrieved successfully",
		"data":    certificate,
	})
}


func (c *CertificateController) GetCertificateByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	certificate, err := c.certificateService.GetCertificateByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Certificate retrieved successfully",
		"data":    certificate,
	})
}


func (c *CertificateController) GetCertificateByPostID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Post ID"})
		return
	}

	certificate, err := c.certificateService.GetCertificateByPostID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Certificate retrieved successfully",
		"data":    certificate,
	})
}


func (c *CertificateController) GetMyCertificates(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	certificates, err := c.certificateService.GetMyCertificates(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "My certificates retrieved successfully",
		"data":    certificates,
	})
}



func (c *CertificateController) UpdateCertificate(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var certificate entity.Certificate
	if err := ctx.ShouldBindJSON(&certificate); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = c.certificateService.UpdateCertificate(uint(id), &certificate)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Certificate updated successfully",
	})
}


func (c *CertificateController) DeleteCertificate(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	err = c.certificateService.DeleteCertificate(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Certificate deleted successfully",
	})
}
