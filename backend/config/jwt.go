package config

import (
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

var jwtSecretKey = []byte(Env.JWTSecretKey)

type Claims struct {
	UserID uint   `json:"user_id"`
	SutId  string `json:"sut_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateJWT(userId uint, sutId string, role string) (string, error) {
	claims := &Claims{
		UserID: userId,
		SutId:  sutId,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecretKey)
}

func ValidateJWT(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return jwtSecretKey, nil
	})

	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrSignatureInvalid
}
