package config

import (
	"log"
	"github.com/sut68/team21/entity"
)

func SeedAwards() {
	var count int64
	DB.Model(&entity.Award{}).Count(&count)
	if count > 0 {
		return
	}

	awards := []entity.Award{
		{AwardName: "ชนะเลิศ", Description: "รางวัลชนะเลิศอันดับ 1"},
		{AwardName: "รองชนะเลิศอันดับ 1", Description: "รางวัลรองชนะเลิศอันดับ 1"},
		{AwardName: "รองชนะเลิศอันดับ 2", Description: "รางวัลรองชนะเลิศอันดับ 2"},
		{AwardName: "รางวัลชมเชย", Description: "รางวัลชมเชยสำหรับผู้เข้าร่วมที่มีผลงานโดดเด่น"},
	}

	for _, award := range awards {
		DB.Create(&award)
	}
	log.Println("Seed Awards completed")
}

func SeedResults() {
	var count int64
	DB.Model(&entity.Result{}).Count(&count)
	if count > 0 {
		return
	}

	// Mairu (Registration ID 2) ได้ที่ 2
	results := []entity.Result{
		{
			AwardID:        2, // รองชนะเลิศอันดับ 1
			RegistrationID: 2,
		},
	}

	for _, result := range results {
		DB.Create(&result)
	}
	log.Println("Seed Results completed")
}

func SeedCertificates() {
	// มอบเกียรติบัตรให้ "พิพัฒน์" (UserID 2) สำหรับทั้ง 2 กิจกรรม
	certificates := []entity.Certificate{
		{
			TitleTH:   "แข่งขันตอบปัญหาวิศวกรรม 2024",
			TitleEN:   "Engineering Quiz Challenge 2024",
			Detail:    "ได้เข้าร่วมและผ่านการประเมินผลตามเกณฑ์ที่โครงการกำหนด",
			Organizer: "สโมสรนักศึกษาวิศวกรรมศาสตร์ มทส.",
			Type:      "participation",
			UserID:    registrationUintPtr(1), // เปลี่ยนเป็นแอดมิน (เจ้าของเทมเพลต)
			PostID:    1,
			PictureParticipation: loadImageBase64("post3.jpg"),
			PictureWinner:        loadImageBase64("post4.jpg"),
		},
		{
			TitleTH:   "Engi Hackathon 2024",
			TitleEN:   "Engineering Hackathon 2024",
			Detail:    "ได้รับรางวัลรองชนะเลิศอันดับ 1 ในการสร้างสรรค์นวัตกรรม",
			Organizer: "สโมสรนักศึกษาวิศวกรรมศาสตร์ มทส.",
			Type:      "winner",
			UserID:    registrationUintPtr(1), // เปลี่ยนเป็นแอดมิน (เจ้าของเทมเพลต)
			PostID:    2,
			ResultID:  registrationUintPtr(1),
			PictureParticipation: loadImageBase64("post3.jpg"),
			PictureWinner:        loadImageBase64("post4.jpg"),
		},
	}

	for _, cert := range certificates {
		var existing entity.Certificate
		if err := DB.Where("post_id = ?", cert.PostID).First(&existing).Error; err == nil {
			// ถ้ามีอยู่แล้วให้ Update รูปภาพและข้อมูลที่จำเป็น
			DB.Model(&existing).Updates(map[string]interface{}{
				"picture_participation": cert.PictureParticipation,
				"picture_winner":        cert.PictureWinner,
				"detail":                cert.Detail,
				"organizer":             cert.Organizer,
			})
		} else {
			// ถ้ายังไม่มีให้สร้างใหม่
			DB.Create(&cert)
		}
	}

	log.Println("Seed Certificates (Templates with images) completed/updated")
}
