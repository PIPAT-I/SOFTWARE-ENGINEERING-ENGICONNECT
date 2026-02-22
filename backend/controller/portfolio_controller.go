package controller

import (
	"net/http"
	"strconv"

	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"

	"github.com/gin-gonic/gin"
)

type PortfolioController struct {
	portfolioService services.PortfolioService
}

func NewPortfolioController(service services.PortfolioService) *PortfolioController {
	return &PortfolioController{portfolioService: service}
}

func (c *PortfolioController) Create(ctx *gin.Context) {
	var portfolio entity.Portfolio

	if err := ctx.ShouldBindJSON(&portfolio); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if portfolio.File_urls == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเพิ่มรูปภาพ"})
		return
	}

	if err := c.portfolioService.CreatePortfolio(&portfolio); err != nil {
		if err.Error() == "duplicate_title" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "คุณมีผลงานชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create portfolio"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "Created successfully", "data": portfolio})
}

func (c *PortfolioController) GetAllPortfolios(ctx *gin.Context) {
	portfolios, err := c.portfolioService.GetAllPortfolios()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": portfolios})
}

func (c *PortfolioController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	portfolio, err := c.portfolioService.GetPortfolioByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Portfolio not found"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": portfolio})
}

func (c *PortfolioController) ListByUserID(ctx *gin.Context) {
	userID, err := strconv.ParseUint(ctx.Param("user_id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
		return
	}

	portfolios, err := c.portfolioService.GetPortfoliosByUserID(uint(userID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": portfolios})
}

func (c *PortfolioController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var input map[string]interface{}
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.portfolioService.UpdatePortfolio(uint(id), input); err != nil {
		if err.Error() == "duplicate_title" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "คุณมีผลงานชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Updated successfully", "data": input})
}

func (c *PortfolioController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := c.portfolioService.DeletePortfolio(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete portfolio"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}

func (c *PortfolioController) ListStatuses(ctx *gin.Context) {
	statuses, err := c.portfolioService.GetAllPortfolioStatuses()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": statuses})
}
