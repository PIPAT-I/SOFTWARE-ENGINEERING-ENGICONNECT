package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/services"
)

func MetadataRoutes(r *gin.RouterGroup) {
	metadataService := services.NewMetadataService(config.DB)
	metadataController := controller.NewMetadataController(metadataService)

	metadataRoutes := r.Group("/metadata")
	{
		metadataRoutes.GET("/faculties", metadataController.GetFaculties)
		metadataRoutes.GET("/majors", metadataController.GetMajors)
		metadataRoutes.GET("/locations", metadataController.GetLocations)
	}
}
