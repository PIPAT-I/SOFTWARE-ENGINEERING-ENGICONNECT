package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/services"
)

func AuthRoutes(rg *gin.RouterGroup) {
	authService := services.NewAuthService(config.DB)
	authController := controller.NewAuthController(authService)

	authRoutes := rg.Group("/auth")
	{
		authRoutes.POST("/register", authController.Register)
		authRoutes.POST("/login", authController.Login)
	}
}
