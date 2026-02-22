package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/controller"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/services"
	"gorm.io/gorm"
)

func ChatRoutes(r *gin.RouterGroup, db *gorm.DB, hub *services.ChatHub) {
	chatController := controller.NewChatController(db, hub)

	chat := r.Group("/chat")
	{
		chat.GET("/history/:post_id", chatController.GetHistory)
		chat.GET("/ws/lobby/:post_id", middleware.AuthMiddleware(), chatController.JoinChatLobby)
		chat.POST("/upload", chatController.UploadChatImage)
		chat.POST("/upload/file", chatController.UploadFile)
		chat.DELETE("/message/:message_id", middleware.AuthMiddleware(), chatController.DeleteMessage)
	}
}
