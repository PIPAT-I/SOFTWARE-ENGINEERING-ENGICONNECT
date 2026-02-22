package config

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"os"
)

type EnvConfig struct {
	BackendPort      string
	DatabaseURL      string
	DBUser           string
	DBPassword       string
	DBName           string
	DBHost           string
	DBPort           string
	JWTSecretKey     string
	CORSAllowOrigins string
}

var Env EnvConfig

func LoadEnv() {
	err := godotenv.Load("../.env")

	if err != nil {
		log.Println(".env not found")
	}

	corsAllowOrigins := GetEnv("CORS_ALLOW_ORIGINS")

	backendPort := GetEnv("BACKEND_PORT")
	host := GetEnv("POSTGRES_HOST")
	port := GetEnv("POSTGRES_PORT")
	user := GetEnv("POSTGRES_USER")
	password := GetEnv("POSTGRES_PASSWORD")
	dbname := GetEnv("POSTGRES_DB")
	sslmode := GetEnv("POSTGRES_SSLMODE")
	jwtSecretKey := GetEnv("JWT_SECRET_KEY")

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		user, password, host, port, dbname, sslmode,
	)

	Env = EnvConfig{
		BackendPort:      backendPort,
		DatabaseURL:      dsn,
		DBUser:           user,
		DBPassword:       password,
		DBName:           dbname,
		DBHost:           host,
		DBPort:           port,
		JWTSecretKey:     jwtSecretKey,
		CORSAllowOrigins: corsAllowOrigins,
	}
}

func GetEnv(key string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return ""
}
