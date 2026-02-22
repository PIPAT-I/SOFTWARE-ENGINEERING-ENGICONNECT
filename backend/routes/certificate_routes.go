package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/services"
)

func CertificateRoutes(rg *gin.RouterGroup) {
	certificateService := services.NewCertificateService(config.DB)
	certificateController := controller.NewCertificateController(certificateService)

	cert := rg.Group("/certificate")
	cert.Use(middleware.AuthMiddleware())
	{
		cert.POST("", certificateController.CreateCertificate)
		cert.GET("", certificateController.GetAllCertificate)
		cert.GET("/my", certificateController.GetMyCertificates)
		cert.GET("/:id", certificateController.GetCertificateByID)
		cert.PUT("/:id", certificateController.UpdateCertificate)
		cert.GET("/post/:id", certificateController.GetCertificateByPostID)
		cert.DELETE("/:id", certificateController.DeleteCertificate)
	}

}

