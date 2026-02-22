package config

import (
	"log"
	"time"
	"os"
	"encoding/base64"
	"github.com/sut68/team21/entity"
)

func SeedLocations() {
	var count int64
	DB.Model(&entity.Location{}).Count(&count)
	if count > 0 {
		return
	}

	floatPtr := func(f float64) *float64 {
		return &f
	}

	locations := []entity.Location{
		// อาคารเรียนรวม
		{
			Building:  "อาคารเรียนรวม 1",
			Latitude:  floatPtr(14.881087192391043),
			Longitude: floatPtr(102.0172599921507),
			Picture:   "https://tse2.mm.bing.net/th/id/OIP.S2Ww_7P_H-Cqm5utHaZGzAHaDA?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
		},
		{
			Building:  "อาคารเรียนรวม 2",
			Latitude:  floatPtr(14.881907263606916),
			Longitude: floatPtr(102.01506750918828),
			Picture:   "https://th.bing.com/th/id/R.16a090b2cc11652caf149d63a39f3087?rik=Y%2f1ZS6v5Kv9CYw&riu=http%3a%2f%2fsutgateway.sut.ac.th%2fadmissions2021%2fwp-content%2fuploads%2f2021%2f08%2fDSCF8747.jpg&ehk=dW%2fYCYZvhewm5dYHTCspF2jhXIE7jdQeEmCOh8VUuvQ%3d&risl=&pid=ImgRaw&r=0",
		},
		{
			Building:  "สถานกีฬาและสุขภาพ มทส",
			Latitude:  floatPtr(14.886652301535612),
			Longitude: floatPtr(102.01785322009583),
			Picture:   "https://tse1.mm.bing.net/th/id/OIP.TArJrSiegwFAfqRAR4oiVAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3",
		},
		{
			Building:  "ศูนย์บรรณสารและสื่อการศึกษา",
			Latitude:  floatPtr(14.878758985788245),
			Longitude: floatPtr(102.01642584165081),
			Picture:   "https://www.sut.ac.th/2012/images/upload/editor/images/202110/03/DSC_0094.jpg",
		},
		{
			Building:  "อาคารรัฐสีมาคุณากร",
			Latitude:  floatPtr(14.878499757824068),
			Longitude: floatPtr(102.01596986612662),
			Picture:   "https://www.sut.ac.th/2012/images/upload/editor/images/202110/03/DSC_0094.jpg",
		},
		{
			Building:  "อาคารบริหาร มหาวิทยาลัยเทคโนโลยีสุรนารี",
			Latitude:  floatPtr(14.880870523089591),
			Longitude: floatPtr(102.02123022031995),
			Picture:   "https://th.bing.com/th/id/R.158b1fb6ad4b39ae356c1a21f118495a?rik=bLmY657VsDuovQ&riu=http%3a%2f%2fweb.sut.ac.th%2fdpn%2fimages%2faBuilding.jpg&ehk=0qvrTjfcU5VkRy6fKUswS0R62EUFzuZ%2fwlPEO%2bkjtVY%3d&risl=&pid=ImgRaw&r=0",
		},
		{
			Building:  "อาคารวิชาการ 1",
			Latitude:  floatPtr(14.879130722132205),
			Longitude: floatPtr(102.01918343842112),
			Picture:   "https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxjJGno8LYBgAuItOF5O4sfdOYW_P8Sp2NktnBWQyd5RxjWDmp38Pzk_IGSEM4kFmGGzDAFa7Y7TZEF-RE7goM2mb-qRWd33onNsW0tvb5h73HfiCXEa7Ajxyse24FFo9foaLPI=w408-h724-k-no",
		},
		{
			Building:  "อาคารวิชาการ 2",
			Latitude:  floatPtr(14.881907263606916),
			Longitude: floatPtr(102.01506750918828),
		},
		{
			Building:  "ลานหมอลำ",
			Latitude:  floatPtr(14.89471926063984),
			Longitude: floatPtr(102.01345508934604),
			Picture:   "https://tse4.mm.bing.net/th/id/OIP.vjOBSqjkhp5QidPPse_7FQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3",
		},
		{
			Building:  "อาคารเครื่องมือ F1",
			Latitude:  floatPtr(14.878343429974993),
			Longitude: floatPtr(102.01725733393744),
		},
		{
			Building:  "อาคารเครื่องมือ F2",
			Latitude:  floatPtr(14.87725466832223),
			Longitude: floatPtr(102.01819074269234),
		},
		{
			Building:  "อาคารเครื่องมือ F3",
			Latitude:  floatPtr(14.876425131941879),
			Longitude: floatPtr(102.01871109127404),
		},
		{
			Building:  "อาคารเครื่องมือ F4",
			Latitude:  floatPtr(14.877259852899622),
			Longitude: floatPtr(102.01671552773419),
		},
		{
			Building:  "อาคารเครื่องมือ F5",
			Latitude:  floatPtr(14.876388839649218),
			Longitude: floatPtr(102.01724124071575),
		},
		{
			Building:  "อาคารเครื่องมือ F6",
			Latitude:  floatPtr(14.87583108055029),
			Longitude: floatPtr(102.017863750849),
		},
		{
			Building:  "อาคารเครื่องมือ F7",
			Latitude:  floatPtr(14.874875594123942),
			Longitude: floatPtr(102.02186773488627),
		},
		{
			Building:  "อาคารเครื่องมือ F9",
			Latitude:  floatPtr(14.874834249353931),
			Longitude: floatPtr(102.01665595179773),
		},
		{
			Building:  "อาคารเครื่องมือ F10",
			Latitude:  floatPtr(14.87669034627258),
			Longitude: floatPtr(102.01538726690757),
		},
		{
			Building:  "อาคารเครื่องมือ F11",
			Latitude:  floatPtr(14.875668976478325),
			Longitude: floatPtr(102.01621875172967),
		},
		{
			Building:  "อาคารเครื่องมือ F12",
			Latitude:  floatPtr(14.874085424182892),
			Longitude: floatPtr(102.01536949383471),
		},
		{
			Building:  "อุทยานวิทยาศาสตร์",
			Latitude:  floatPtr(14.874085424182892),
			Longitude: floatPtr(102.01536949383471),
			Picture:   "https://mhesi.go.th/images/2566/Pornnapa/04/240466/4/8.jpg",
		},
		{
			Building:  "อาคารสุรสัมมนาคาร",
			Latitude:  floatPtr(14.876255155571009),
			Longitude: floatPtr(102.02435930913411),
			Picture:   "https://sut-website.sut.weon.website/wp-content/uploads/2025/07/492012827_1165715105566196_7708485564088355235_n-e1753247722147.jpg",
		},
		{
			Building:  "อาคารสุรพัฒน์ 2",
			Latitude:  floatPtr(14.875190340131816),
			Longitude: floatPtr(102.02403121300033),
		},
		{
			Building:  "อาคารสุรพัฒน์ 3",
			Latitude:  floatPtr(14.87397187674162),
			Longitude: floatPtr(102.0223516288291),
		},
		{
			Building:  "อุทยานวิทยาศาสตร์",
			Latitude:  floatPtr(14.874014796106955),
			Longitude: floatPtr(102.02788740824454),
			Picture:   "https://tse1.mm.bing.net/th/id/OIP.phurzhQ2EGm-DfzepXMn6gHaEK?rs=1&pid=ImgDetMain&o=7&rm=3",
		},
		{
			Building:  "โรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี",
			Latitude:  floatPtr(14.86409784669206),
			Longitude: floatPtr(102.0353990383789),
			Picture:   "https://sut-website.sut.weon.website/wp-content/uploads/2025/01/IMG_5264-2048x1365.jpg",
		},
	}

	for _, location := range locations {
		DB.FirstOrCreate(&location, entity.Location{
			Building: location.Building,
		})
	}
}

func SeedPosts() {
	var count int64
	DB.Model(&entity.Post{}).Count(&count)
	if count > 0 {
		return
	}

	posts := []entity.Post{
		{
			Title:      "แข่งขันตอบปัญหาวิศวกรรม",
			Detail:     "แข่งขันตอบปัญหาวิศวกรรม 2024 ที่มหาวิทยาลัยเทคโนโลยีสุรนารี",
			Picture:    loadImageBase64("post1.jpg"),
			Type:       "challenge",
			Organizer:  "สโมสรนักศึกษาวิศวกรรมศาสตร์",
			StartDate:  parsePostTime("2024-12-27 09:00:00"),
			StopDate:   parsePostTime("2024-12-31 17:30:00"),
			Start:      parsePostTime("2024-12-28 10:00:00"),
			Stop:       parsePostTime("2024-12-29 16:00:00"),
			UserID:     postUintPtr(1),
			StatusID:   postUintPtr(6),
			LocationID: postUintPtr(1),
			PostPoint:  0,
		},
		{
			Title:      "Engi Hackthon",
			Detail:     "Engi Hackthon 2024 ที่มหาวิทยาลัยเทคโนโลยีสุรนารี",
			Picture:    loadImageBase64("post2.png"),
			Type:       "hackathon",
			Organizer:  "สโมสรนักศึกษาวิศวกรรมศาสตร์",
			StartDate:  parsePostTime("2024-12-10 09:00:00"),
			StopDate:   parsePostTime("2024-12-18 17:30:00"),
			Start:      parsePostTime("2024-12-10 10:00:00"),
			Stop:       parsePostTime("2024-12-12 16:00:00"),
			UserID:     postUintPtr(1),
			StatusID:   postUintPtr(6),
			LocationID: postUintPtr(1),
			PostPoint:  0,
		},
	}

	for _, post := range posts {
		DB.Create(&post)
	}
	log.Println(" Seed Posts completed")
}

func SeedPostStatuses() {
	var count int64
	DB.Model(&entity.PostStatus{}).Count(&count)
	if count > 0 {
		return
	}
	statuses := []entity.PostStatus{
		{StatusName: "Pending"},
		{StatusName: "Approved"},
		{StatusName: "Rejected"},
		{StatusName: "Upcoming"},
		{StatusName: "Active"},
		{StatusName: "Ended"},
	}
	for _, status := range statuses {

		DB.FirstOrCreate(&status, entity.PostStatus{StatusName: status.StatusName})
	}

	log.Println(" Seed PostStatuses completed successfully")
}

func parsePostTime(dateStr string) time.Time {
	t, err := time.Parse("2006-01-02 15:04:05", dateStr)
	if err != nil {
		t, _ = time.Parse("2006-01-02", dateStr)
	}
	return t
}

func postUintPtr(u uint) *uint {
	return &u
}


func loadImageBase64(filename string) string {
	data , err := os.ReadFile("assets/images/" + filename)
	
	if err != nil {
		return ""
	}
	return base64.StdEncoding.EncodeToString(data)
}