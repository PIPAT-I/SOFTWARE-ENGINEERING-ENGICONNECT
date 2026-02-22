package unit

import (
	"testing"
	"time"
	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)

func TestPostValid(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run(`post is valid`, func(t *testing.T) {
		userID := uint(1)
		statusID := uint(1)
		locationID := uint(1)

		post := entity.Post{
			Title:     "Engineering Open House",
			Detail:    "Details about the event",
			Type:      "Activity",
			Organizer: "SUT Team",
			// แก้ไข: เปลี่ยนจาก string เป็น time.Time และเพิ่มฟิลด์ใหม่
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(), // ฟิลด์ใหม่
			Stop:       time.Now().Add(2 * time.Hour), // ฟิลด์ใหม่
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestPostTitle(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	t.Run(`Title is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "", // ผิด: เป็นค่าว่าง
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Title is required"))
	})
}

func TestPostDetail(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	t.Run(`Detail is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "", // ผิด: เป็นค่าว่าง
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Detail is required"))
	})
}

func TestPostAttributes(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	t.Run(`Type is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "", // ผิด: เป็นค่าว่าง
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Type is required"))
	})

	t.Run(`Organizer is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "", // ผิด: เป็นค่าว่าง
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Organizer is required"))
	})
}

func TestPostDates(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	// Test StartDate (Date)
	t.Run(`Start date is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			// StartDate เป็น Zero Value (time.Time{})
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Start date is required"))
	})

	// Test StopDate (Date)
	t.Run(`Stop date is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			// StopDate เป็น Zero Value
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Stop date is required"))
	})

	// -----------------------------------------------------
	// เพิ่ม Test สำหรับฟิลด์ใหม่ Start (Time) และ Stop (Time)
	// -----------------------------------------------------

	t.Run(`Start is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			// Start เป็น Zero Value
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Start is required"))
	})

	t.Run(`Stop is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			// Stop เป็น Zero Value
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Stop is required"))
	})
}

func TestPostForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	t.Run(`User ID is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     nil, // ผิด: เป็น nil
			StatusID:   &statusID,
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("User ID is required"))
	})

	t.Run(`Status ID is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   nil, // ผิด: เป็น nil
			LocationID: &locationID,
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Status ID is required"))
	})

	t.Run(`Location ID is required`, func(t *testing.T) {
		post := entity.Post{
			Title:     "Test Title",
			Detail:    "Details",
			Type:      "Activity",
			Organizer: "SUT Team",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(),
			Stop:       time.Now().Add(2 * time.Hour),
			UserID:     &userID,
			StatusID:   &statusID,
			LocationID: nil, // ผิด: เป็น nil
		}

		ok, err := services.ValidatePost(post)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Location ID is required"))
	})
}

func TestPostDateBusinessLogic(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	statusID := uint(1)
	locationID := uint(1)

	t.Run(`StopDate must be after StartDate`, func(t *testing.T) {
		post := entity.Post{
			Title:      "Test", Detail: "Test", Type: "Test", Organizer: "Test",
			StartDate:  time.Now().Add(24 * time.Hour),
			StopDate:   time.Now(), // ผิด: จิก่อนเริ่ม
			Start:      time.Now(),
			Stop:       time.Now().Add(1 * time.Hour),
			UserID:     &userID, StatusID: &statusID, LocationID: &locationID,
		}
		ok, err := services.ValidatePost(post)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err.Error()).To(ContainSubstring("activity end date must be after start date"))
	})

	t.Run(`Registration Stop must be after Registration Start`, func(t *testing.T) {
		post := entity.Post{
			Title:      "Test", Detail: "Test", Type: "Test", Organizer: "Test",
			StartDate:  time.Now(),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now().Add(10 * time.Hour),
			Stop:       time.Now(), // ผิด: ปิดลงทะเบียนก่อนเปิด
			UserID:     &userID, StatusID: &statusID, LocationID: &locationID,
		}
		ok, err := services.ValidatePost(post)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err.Error()).To(ContainSubstring("registration end date must be after registration start date"))
	})

	t.Run(`Registration Start must not be before Activity Start`, func(t *testing.T) {
		post := entity.Post{
			Title:      "Test", Detail: "Test", Type: "Test", Organizer: "Test",
			StartDate:  time.Now().Add(5 * time.Hour),
			StopDate:   time.Now().Add(24 * time.Hour),
			Start:      time.Now(), // ผิด: เปิดลงทะเบียนก่อนเริ่มกิจกรรม
			Stop:       time.Now().Add(10 * time.Hour),
			UserID:     &userID, StatusID: &statusID, LocationID: &locationID,
		}
		ok, err := services.ValidatePost(post)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err.Error()).To(ContainSubstring("registration start date must not be before activity start date"))
	})
}