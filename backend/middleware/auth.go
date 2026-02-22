package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		tokenString := ""

		// 1. ลองดึงจาก Header (สำหรับ REST API ปกติ)
		authHeader := ctx.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}

		// 2. ถ้าไม่มีใน Header ให้ลองหาใน Query Parameter (สำหรับ WebSocket)
		if tokenString == "" {
			tokenString = ctx.Query("token")
		}

		// 3. ถ้าหาไม่เจอทั้งคู่ -> Error
		if tokenString == "" {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token is missing"})
			ctx.Abort()
			return
		}

		// 4. Validate JWT
		claims, err := config.ValidateJWT(tokenString)
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่"})
			ctx.Abort()
			return
		}

		// 5. Set ค่าลง Context
		ctx.Set("user_id", claims.UserID)
		ctx.Set("sut_id", claims.SutId)
		ctx.Set("role", claims.Role)

		ctx.Next()
	}
}