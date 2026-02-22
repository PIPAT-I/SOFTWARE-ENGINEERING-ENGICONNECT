package config

import (
	"log"
	"time"
	"github.com/sut68/team21/entity"
)

func SeedRegistrations() {
	var count int64
	DB.Model(&entity.Registration{}).Count(&count)
	if count > 0 {
		return
	}

	registrations := []entity.Registration{
		{
			TeamName:         "DoDEEDEE",
			Description:      "เก่งที่สุดในโลก",
			Status:           "approved",
			RegistrationDate: parseRegistrationTime("2024-11-20"),
			PostID:           registrationUintPtr(1),
		},

		{
			TeamName:         "Mairu",
			Description:      "มาเพื่อชนะ hackathon 2024",
			Status:           "approved",
			RegistrationDate: parseRegistrationTime("2024-11-20"),
			PostID:           registrationUintPtr(2),
		},
	}

	for i := range registrations {
		DB.Create(&registrations[i])
	}

	var users []entity.User
	DB.Where("id IN ?", []uint{2, 3, 4, 5,6}).Find(&users)// ดึง User ID 2,3,4,5,6
	DB.Model(&registrations[0]).Association("Users").Append(&users) // กิจกรรมที่ 1 ผู้ที่เข้าร่วมกิจกรรม

	var users2 []entity.User
	DB.Where("id IN ?", []uint{2,3,6}).Find(&users2)// ดึง User ID 2,3,6
	DB.Model(&registrations[1]).Association("Users").Append(&users2) // กิจกรรมที่ 2 ผู้ที่เข้าร่วมกิจกรรม

	log.Println("Seed Evaluation Registrations completed")
}

func parseRegistrationTime(dateStr string) time.Time {
	t, _ := time.Parse("2006-01-02", dateStr)
	return t
}

func registrationUintPtr(u uint) *uint {
	return &u
}
