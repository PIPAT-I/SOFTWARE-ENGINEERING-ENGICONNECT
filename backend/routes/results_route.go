package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/services"
	"gorm.io/gorm"
)

func ResultsRoutes(r *gin.RouterGroup, db *gorm.DB) {
	resultsService := services.NewResultsService(db)
	resultsController := controller.NewResultsController(resultsService)

	route := r.Group("/results")
	{
		route.GET("", resultsController.GetAllResults)                   // GET /results
		route.GET("/post/:postId", resultsController.GetResultsByPostID) // GET /results/post/:postId
		route.POST("", resultsController.CreateResult)
		route.PUT(":id", resultsController.UpdateResult)
	}
}
