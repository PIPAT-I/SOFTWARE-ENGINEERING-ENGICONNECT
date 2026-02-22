package middleware


import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"time"
)

func CORSMiddleware() gin.HandlerFunc {
	corsAllowOrigins := config.Env.CORSAllowOrigins
	return cors.New(cors.Config{
		AllowOrigins:     []string{corsAllowOrigins, "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}


