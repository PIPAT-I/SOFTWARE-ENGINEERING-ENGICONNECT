package config

import (
	"fmt"
	"log"
	// "os"
	// "time"

	"github.com/sut68/team21/entity"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	// "gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {

	if Env.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is not set in environment variables")
	}

	// ดูคำสั่ง sqlloger
	// newLogger := logger.New(
	// 	log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
	// 	logger.Config{
	// 		SlowThreshold: time.Second,
	// 		LogLevel:      logger.Info,
	// 		Colorful:      true,
	// 	},
	// )

	db, err := gorm.Open(postgres.Open(Env.DatabaseURL), &gorm.Config{
		// Logger:                                   newLogger,
		DisableForeignKeyConstraintWhenMigrating: false,
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	// ทำการ migrate โมเดล
	fmt.Println("Database connected successfully")
	DB = db

	MigrateModels()
}

func MigrateModels() {
	var AllEntities = []interface{}{
		&entity.Role{},
		&entity.Faculty{},
		&entity.Major{},
		&entity.Location{},
		&entity.Award{},
		&entity.User{},
		&entity.Skill{},
		&entity.Interest{},
		&entity.Tool{},
		&entity.Social{},
		&entity.ActivityEvaluationTopic{},
		&entity.ActivityEvaluationRespone{},
		&entity.ActivityEvaluationScore{},	
		&entity.Post{},
		&entity.Registration{},
		&entity.Chatroom{},
		&entity.MessagesType{},
		&entity.Messages{},
		&entity.Result{},
		&entity.Summary{},
		&entity.Reward{},
		&entity.PointRecord{},
		&entity.RewardRedeem{},
		&entity.UserPoint{},
		&entity.Portfolio{},
		&entity.PortfolioStatus{},
		&entity.Certificate{},
		&entity.PostStatus{},
	}

	err := DB.AutoMigrate(AllEntities...)
	if err != nil {
		log.Fatalf("Error migrating database: %v", err)
	}
	SeedAllData()
	fmt.Println("Database migrated successfully")
}
