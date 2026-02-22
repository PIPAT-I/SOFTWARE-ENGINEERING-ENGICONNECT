package main

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/sut68/team21/config"
	"github.com/sut68/team21/middleware"
	"github.com/sut68/team21/routes"
	"github.com/sut68/team21/services"
)

func main() {

	config.LoadEnv()
	config.ConnectDatabase()
	config.SeedAllData()

	chatHub := services.NewChatHub()
	go chatHub.Run()

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	api := r.Group("/api")
	{
		api.Static("/upload", "./upload")
		routes.AuthRoutes(api)
		routes.UserRoutes(api)
		routes.MetadataRoutes(api)
		routes.PortfolioRoutes(api)
		routes.PostRoutes(api)
		routes.CertificateRoutes(api)
		routes.ChatRoutes(api, config.DB, chatHub)
		routes.PointRoutes(api)
		routes.ResultsRoutes(api, config.DB)
		routes.RegistrationRoutes(api)
		routes.EvaluationRoutes(api)
	}

	fmt.Println(" Server running on port:", config.Env.BackendPort)
	r.Run(":" + config.Env.BackendPort)
}
