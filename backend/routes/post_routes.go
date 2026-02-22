package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/services"
)

func PostRoutes(rg *gin.RouterGroup) {
	postService := services.NewPostService(config.DB)
	postController := controller.NewPostController(postService)

	post := rg.Group("/post")
	post.Use(middleware.AuthMiddleware())
	{
		post.POST("", postController.CreatePost)
		post.GET("", postController.GetAllPost)
		post.GET("/my", postController.GetMyPosts)
		post.GET("/student", postController.GetStudentPosts)
		post.GET("/:id", postController.GetPostByID)
		post.PUT("/:id", postController.UpdatePost)
		post.DELETE("/:id", postController.DeletePost)
	}

}
