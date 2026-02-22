package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"

	"github.com/sut68/team21/dto"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

type ChatController struct {
	DB  *gorm.DB
	Hub *services.ChatHub
}

func NewChatController(db *gorm.DB, hub *services.ChatHub) *ChatController {
	return &ChatController{DB: db, Hub: hub}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		allowedOriginsStr := os.Getenv("CORS_ALLOW_ORIGINS")
		if allowedOriginsStr == "" {
			fmt.Printf("CORS_ALLOW_ORIGINS not set in .env, rejecting origin: %s\n", origin)
			return false
		}
		allowedOrigins := strings.Split(allowedOriginsStr, ",")
		for _, allowed := range allowedOrigins {
			allowed = strings.TrimSpace(allowed)
			if origin == allowed {
				fmt.Printf("WebSocket connection allowed from: %s\n", origin)
				return true
			}
		}
		fmt.Printf("WebSocket connection blocked from unauthorized origin: %s (allowed: %s)\n", origin, allowedOriginsStr)
		return false
	},
}

func formatAvatarURL(url string) string {
	if url == "" {
		return ""
	}
	if strings.HasPrefix(url, "http") {
		return url
	}
	return url
}

func ensureUploadDir(dir string) error {
	if err := os.MkdirAll("upload", 0755); err != nil {
		return err
	}
	return os.MkdirAll(dir, 0755)
}

func (ctrl *ChatController) GetHistory(c *gin.Context) {
	postID := c.Param("post_id")

	var chatroom entity.Chatroom
	if err := ctrl.DB.Where("post_id = ?", postID).First(&chatroom).Error; err != nil {
		c.JSON(404, gin.H{"error": "Chatroom not found"})
		return
	}

	var messages []entity.Messages
	if err := ctrl.DB.Where("chat_room_id = ?", chatroom.ID).
		Preload("User").
		Order("created_at asc").
		Find(&messages).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch messages"})
		return
	}

	var response []gin.H
	for _, msg := range messages {
		currentName := "Unknown"
		currentAvatar := ""
		currentSutId := ""

		if msg.User.ID != 0 {
			currentName = fmt.Sprintf("%s %s", msg.User.FirstName, msg.User.LastName)
			currentAvatar = formatAvatarURL(msg.User.AvatarURL)
			currentSutId = msg.User.SutId
		}

		response = append(response, gin.H{
			"ID":           msg.ID,
			"body":         msg.Body,
			"user_id":      msg.UserID,
			"user_name":    currentName,
			"user_avatar":  currentAvatar,
			"sut_id":       currentSutId,
			"created_at":   msg.CreatedAt,
			"chat_room_id": msg.ChatRoomID,
			"type":         msg.MessagesTypeID,
		})
	}

	c.JSON(200, response)
}

func (ctrl *ChatController) UploadChatImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	uploadDir := filepath.Join("upload", "chat", "photo")
	if err := ensureUploadDir(uploadDir); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	fileURL := fmt.Sprintf("upload/chat/photo/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": fileURL})
}

func (ctrl *ChatController) JoinChatLobby(c *gin.Context) {
	postIDStr := c.Param("post_id")
	postID, _ := strconv.Atoi(postIDStr)

	val, exists := c.Get("user_id")
	if !exists {
		val, exists = c.Get("userID")
	}
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := val.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	default:
		c.JSON(400, gin.H{"error": "Invalid User ID type"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	var chatroom entity.Chatroom
	if err := ctrl.DB.Where("post_id = ?", postID).First(&chatroom).Error; err != nil {
		conn.Close()
		return
	}

	client := &services.Client{
		Hub:    ctrl.Hub,
		Conn:   conn,
		Send:   make(chan dto.SocketMessage, 256),
		RoomID: chatroom.ID,
		UserID: userID,
	}

	client.Hub.Register <- client

	go func() {
		defer client.Conn.Close()
		for msg := range client.Send {
			client.Conn.WriteJSON(msg)
		}
	}()

	go func() {
		defer func() {
			client.Hub.Unregister <- client
		}()

		for {
			var msgIn dto.SocketMessage
			err := client.Conn.ReadJSON(&msgIn)
			if err != nil {
				break
			}

			var currentUser entity.User
			if err := ctrl.DB.First(&currentUser, userID).Error; err == nil {
				msgIn.UserName = fmt.Sprintf("%s %s", currentUser.FirstName, currentUser.LastName)
				msgIn.UserAvatar = formatAvatarURL(currentUser.AvatarURL)
				msgIn.SutId = currentUser.SutId
			}

			msgIn.ChatRoomID = chatroom.ID
			msgIn.UserID = userID
			msgIn.CreatedAt = time.Now().Format(time.RFC3339)

			messageTypeID := uint(1)
			if msgIn.Type == "image" {
				messageTypeID = 2
			} else if msgIn.Type == "file" {
				messageTypeID = 3
			}

			newMessage := entity.Messages{
				Body:           msgIn.Body,
				UserID:         userID,
				ChatRoomID:     chatroom.ID,
				MessagesTypeID: messageTypeID,
			}
			ctrl.DB.Create(&newMessage)
			msgIn.ID = newMessage.ID
			client.Hub.Broadcast <- msgIn
		}
	}()
}

func (ctrl *ChatController) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	uploadDir := filepath.Join("upload", "chat", "file")
	if err := ensureUploadDir(uploadDir); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
	savePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}
	fileURL := fmt.Sprintf("upload/chat/file/%s", filename)
	c.JSON(http.StatusOK, gin.H{"url": fileURL})
}

func (ctrl *ChatController) DeleteMessage(c *gin.Context) {
	messageIDStr := c.Param("message_id")
	messageID, err := strconv.ParseUint(messageIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message ID"})
		return
	}
	val, exists := c.Get("user_id")
	if !exists {
		val, exists = c.Get("userID")
	}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var userID uint
	switch v := val.(type) {
	case uint:
		userID = v
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID type"})
		return
	}
	var message entity.Messages
	if err := ctrl.DB.Preload("User").First(&message, messageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Message not found"})
		return
	}
	if message.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own messages"})
		return
	}
	timeSinceCreation := time.Since(message.CreatedAt)
	if timeSinceCreation > 15*time.Minute {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete messages older than 15 minutes"})
		return
	}
	message.Body = "[DELETED]"
	if err := ctrl.DB.Save(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update message"})
		return
	}
	deleteEvent := dto.SocketMessage{
		ID:         message.ID,
		Body:       "[DELETED]",
		UserID:     message.UserID,
		UserName:   fmt.Sprintf("%s %s", message.User.FirstName, message.User.LastName),
		UserAvatar: formatAvatarURL(message.User.AvatarURL),
		ChatRoomID: message.ChatRoomID,
		CreatedAt:  message.CreatedAt.Format(time.RFC3339),
		Type:       "delete",
		SutId:      message.User.SutId,
	}

	ctrl.Hub.Broadcast <- deleteEvent

	c.JSON(http.StatusOK, gin.H{
		"message": "Message deleted successfully",
		"id":      messageID,
	})
}
