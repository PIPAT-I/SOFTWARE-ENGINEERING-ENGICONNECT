package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/services"
)

func RegistrationRoutes(r *gin.RouterGroup) {
	db := config.DB
	registrationService := services.NewRegistrationService(db)
	registrationController := controller.NewRegistrationController(registrationService)

	registrations := r.Group("/registration")
	{

		registrations.POST("", middleware.AuthMiddleware(), registrationController.CreateRegistration)

		registrations.GET("/my", middleware.AuthMiddleware(), registrationController.GetMyRegistrations)

		registrations.GET("/post/:id", registrationController.GetRegistrationsByPostID)

		registrations.GET("/:id", registrationController.GetRegistrationByID)

		registrations.PATCH("/:id", registrationController.UpdateRegistration)

		registrations.PUT("/:id/status", registrationController.UpdateRegistrationStatus)

		registrations.DELETE("/:id", registrationController.DeleteRegistration)

		registrations.POST("/:id/users", registrationController.AddUserToRegistration)
		registrations.DELETE("/:id/users", registrationController.RemoveUserFromRegistration)
	}

	r.GET("/posts/:id/registrations", registrationController.GetRegistrationsByPostID)
}
