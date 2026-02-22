package config

import (
	"log"

	"github.com/sut68/team21/entity"
)

func SeedAllData() {
	SeedRoles()
	SeedFaculties()
	SeedMajors()
	SeedUsers()
	SeedLocations()
	SeedPortfolioStatuses()
	SeedMessagesTypes()
	SeedPostStatuses()
	SeedPosts()
	SeedRegistrations()
	SeedAwards()
	SeedResults()
	SeedCertificates()
}

func SeedRoles() {

	var count int64
	DB.Model(&entity.Role{}).Count(&count)
	if count > 0 {
		return
	}
	roles := []entity.Role{
		{Name: "admin"},
		{Name: "student"},
	}
	for _, role := range roles {
		DB.FirstOrCreate(&role, entity.Role{Name: role.Name})
	}
}

func SeedUsers() {

	var count int64
	DB.Model(&entity.User{}).Count(&count)
	if count > 0 {
		return
	}
	adminPasswordHash, err := HashPassword("adminpass123")
	if err != nil {
		log.Printf("Error hashing admin password: %v", err)
		return
	}

	studentPasswordHash, err := HashPassword("student123")
	if err != nil {
		log.Printf("Error hashing student password: %v", err)
		return
	}

	users := []entity.User{
		{
			SutId:     "A0000000",
			Email:     "admin@sut.ac.th",
			Password:  adminPasswordHash,
			FirstName: "แอดมิน",
			LastName:  "แอดมิน",
			Phone:     "0812345678",
			FacultyID: 1,
			MajorID:   3,
			Year:      4,
			RoleID:    1,
			AvatarURL: "",
		},
		// Student Users
		{
			SutId:     "B6614690",
			Email:     "b6614690@g.sut.ac.th",
			Password:  studentPasswordHash,
			FirstName: "พิพัฒน์",
			LastName:  "อินสวรรค์",
			Phone:     "0823456789",
			FacultyID: 1,
			MajorID:   3,
			Year:      3,
			RoleID:    2,
			AvatarURL: "",
			Bio:       "ชอบ se ที่สุดในโลก ",
			Skills:    []*entity.Skill{{Name: "Go"}, {Name: "React"}, {Name: "Node.js"}},
			Interests: []*entity.Interest{{Name: "Coding"}, {Name: "Gaming"}, {Name: "Reading"}},
			Tools:     []*entity.Tool{{Name: "VSCode"}, {Name: "Git"}, {Name: "Docker"}},
			Socials: []*entity.Social{
				{Platform: "GitHub", Link: "https://github.com/PIPAT-I"},
				{Platform: "Facebook", Link: "https://www.facebook.com/pipat.insawan?locale=th_TH"},
				{Platform: "Instagram", Link: "https://www.instagram.com/j_insawan"},
			},
		},
		
		{
			SutId:     "B6600001",
			Email:     "b6600001@g.sut.ac.th",
			Password:  studentPasswordHash,
			FirstName: "สมชาย",
			LastName:  "ใจดี",
			Phone:     "0891111111",
			FacultyID: 1,
			MajorID:   3,
			Year:      2,
			RoleID:    2,
			AvatarURL: "",
			Bio:       "นักศึกษาวิศวกรรมคอมพิวเตอร์ ชอบเขียนโปรแกรม",
			Skills:    []*entity.Skill{{Name: "Python"}, {Name: "Machine Learning"}},
			Interests: []*entity.Interest{{Name: "AI"}, {Name: "Data Science"}},
			Tools:     []*entity.Tool{{Name: "Jupyter"}, {Name: "PyCharm"}},
		},
		{
			SutId:     "B6600002",
			Email:     "b6600002@g.sut.ac.th",
			Password:  studentPasswordHash,
			FirstName: "สมหญิง",
			LastName:  "รักเรียน",
			Phone:     "0892222222",
			FacultyID: 1,
			MajorID:   5,
			Year:      3,
			RoleID:    2,
			AvatarURL: "",
			Bio:       "ชอบออกแบบ UI/UX และทำ Frontend",
			Skills:    []*entity.Skill{{Name: "Figma"}, {Name: "React"}, {Name: "CSS"}},
			Interests: []*entity.Interest{{Name: "UI Design"}, {Name: "UX Research"}},
			Tools:     []*entity.Tool{{Name: "Figma"}, {Name: "Adobe XD"}},
		},
		{
			SutId:     "B6600003",
			Email:     "b6600003@g.sut.ac.th",
			Password:  studentPasswordHash,
			FirstName: "วีระ",
			LastName:  "สู้งาน",
			Phone:     "0893333333",
			FacultyID: 1,
			MajorID:   7,
			Year:      4,
			RoleID:    2,
			AvatarURL: "",
			Bio:       "Backend Developer ชอบ Golang และ Database",
			Skills:    []*entity.Skill{{Name: "Go"}, {Name: "PostgreSQL"}, {Name: "Docker"}},
			Interests: []*entity.Interest{{Name: "Backend"}, {Name: "DevOps"}},
			Tools:     []*entity.Tool{{Name: "GoLand"}, {Name: "DBeaver"}},
		},
		{
			SutId:     "B6600004",
			Email:     "b6600004@g.sut.ac.th",
			Password:  studentPasswordHash,
			FirstName: "มากมี",
			LastName:  "มีชัย",
			Phone:     "0891111111",
			FacultyID: 1,
			MajorID:   3,
			Year:      2,
			RoleID:    2,
			AvatarURL: "",
			Bio:       "นักศึกษาวิศวกรรมคอมพิวเตอร์ ชอบเขียนโปรแกรม",
			Skills:    []*entity.Skill{{Name: "Python"}, {Name: "Machine Learning"}},
			Interests: []*entity.Interest{{Name: "AI"}, {Name: "Data Science"}},
			Tools:     []*entity.Tool{{Name: "Jupyter"}, {Name: "PyCharm"}},
		},
	}

	for _, user := range users {
		DB.FirstOrCreate(&user, entity.User{SutId: user.SutId})
	}
}

func SeedFaculties() {
	var count int64
	DB.Model(&entity.Faculty{}).Count(&count)
	if count > 0 {
		return
	}
	faculties := []entity.Faculty{
		{Name: "คณะวิศวกรรมศาสตร์"},
	}
	for _, faculty := range faculties {
		DB.FirstOrCreate(&faculty, entity.Faculty{Name: faculty.Name})
	}
}

func SeedMajors() {
	var count int64
	DB.Model(&entity.Major{}).Count(&count)
	if count > 0 {
		return
	}
	majors := []entity.Major{{Name: "วิศวกรรมการผลิตอัตโนมัติและหุ่นยนต์"},
		{Name: "วิศวกรรมเกษตรและอาหาร"},
		{Name: "วิศวกรรมคอมพิวเตอร์"},
		{Name: "วิศวกรรมเคมี"},
		{Name: "วิศวกรรมเครื่องกล"},
		{Name: "วิศวกรรมปิโตรเลียมและเทคโนโลยีธรณี"},
		{Name: "วิศวกรรมไฟฟ้า"},
		{Name: "วิศวกรรมโทรคมนาคม"},
		{Name: "วิศวกรรมยานยนต์"},
		{Name: "วิศวกรรมโยธา"},
		{Name: "วิศวกรรมสิ่งแวดล้อม"},
		{Name: "วิศวกรรมอุตสาหการ"},
		{Name: "วิศวกรรมโลหการ"},
		{Name: "วิศวกรรมอิเล็กทรอนิกส์"},
		{Name: "วิศวกรรมขนส่งและโลจิสติกส์"},
		{Name: "วิศวกรรมเซรามิก"},
		{Name: "วิศวกรรมพอลิเมอร์"},
		{Name: "ยังไม่สังกัดสาขา"},
	}

	for _, major := range majors {
		DB.FirstOrCreate(&major, entity.Major{Name: major.Name})
	}
}

func SeedPortfolioStatuses() {
	var count int64
	DB.Model(&entity.PortfolioStatus{}).Count(&count)
	if count > 0 {
		return
	}
	statuses := []entity.PortfolioStatus{
		{StatusName: "Pending"},
		{StatusName: "Approved"},
		{StatusName: "Rejected"},
	}
	for _, status := range statuses {

		DB.FirstOrCreate(&status, entity.PortfolioStatus{StatusName: status.StatusName})
	}

	log.Println(" Seed PortfolioStatuses completed successfully")
}

func SeedMessagesTypes() {
	var count int64
	DB.Model(&entity.MessagesType{}).Count(&count)
	if count > 0 {
		return
	}

	types := []entity.MessagesType{
		{TypeName: "Text"},
		{TypeName: "Image"},
		{TypeName: "File"},
	}

	for _, t := range types {
		DB.FirstOrCreate(&t, entity.MessagesType{TypeName: t.TypeName})
	}
	log.Println(" Seed messages types completed successfully")
}
