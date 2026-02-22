package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/services"
)

func PortfolioRoutes(rg *gin.RouterGroup) {
	// 1. Init Layers (Service -> Controller)
	portfolioService := services.NewPortfolioService(config.DB)
	portfolioController := controller.NewPortfolioController(portfolioService)

	// 2. Define Routes

	// Group สำหรับจัดการตัว Portfolio หลัก
	portfolioRoutes := rg.Group("/portfolios")
	{
		portfolioRoutes.POST("", portfolioController.Create)          // POST /portfolios
		portfolioRoutes.GET("", portfolioController.GetAllPortfolios) // GET /portfolios
		portfolioRoutes.GET("/:id", portfolioController.GetByID)      // GET /portfolios/:id
		portfolioRoutes.PATCH("/:id", portfolioController.Update)     // PATCH /portfolios/:id
		portfolioRoutes.DELETE("/:id", portfolioController.Delete)    // DELETE /portfolios/:id

	}

	// Group สำหรับ User (เพื่อดึง Portfolio ตาม UserID)
	userRoutes := rg.Group("/users")
	{
		userRoutes.GET("/:user_id/portfolios", portfolioController.ListByUserID) // GET /users/:user_id/portfolios
	}

	// Group สำหรับดึง Status (Dropdown)
	statusRoutes := rg.Group("/portfolio-statuses")
	{
		statusRoutes.GET("", portfolioController.ListStatuses) // GET /portfolio-statuses
	}
}
