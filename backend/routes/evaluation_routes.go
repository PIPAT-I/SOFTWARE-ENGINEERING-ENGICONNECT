package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/services"
)

func EvaluationRoutes(router *gin.RouterGroup) {
	evaluationService := services.NewEvaluationService(config.DB)
	evaluationController := controller.NewEvaluationController(evaluationService)
	evaluation := router.Group("/evaluation")
	evaluation.Use(middleware.AuthMiddleware())
	{
		evaluation.POST("/topics", evaluationController.CreateTopics)
		evaluation.GET("/topics/:postId", evaluationController.GetTopicsByPost)
		evaluation.PUT("/topics/:id", evaluationController.UpdateTopic)
		evaluation.DELETE("/topics/:id", evaluationController.DeleteTopic)
		evaluation.POST("/submit", evaluationController.SubmitEvaluation)
		evaluation.GET("/activity", evaluationController.GetMyRegisteredPosts)
		evaluation.GET("/summary", evaluationController.GetPostsWithEvaluations)
		evaluation.GET("/results/:postId", evaluationController.GetEvaluationResults)
	}
}
