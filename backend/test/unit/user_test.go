package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

func TestSutId(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case SutID", func(t *testing.T) {
		user := fixture
		user.SutId = "B6614690"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("SutId is required", func(t *testing.T) {
		user := fixture
		user.SutId = ""

		ok, err := govalidator.ValidateStruct(user)

		// ผ่าน
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("SutId is required"))
	})

	t.Run("SutId is incorrect format", func(t *testing.T) {
		user := fixture
		user.SutId = "K6000000"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Incorrect sutid format"))
	})

}

func TestEmail(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case Email", func(t *testing.T) {
		user := fixture

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Email is required", func(t *testing.T) {
		user := fixture
		user.Email = ""

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Email is required"))
	})

	t.Run("Email is invalid", func(t *testing.T) {
		user := fixture
		user.Email = "test"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Inccorect email format"))
	})
}

func TestPhone(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case Phone", func(t *testing.T) {
		user := fixture
		user.Phone = "0629931709"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Phone is required", func(t *testing.T) {
		user := fixture
		user.Phone = ""

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone is required"))
	})

	t.Run("Phone must be 10 digits (too short)", func(t *testing.T) {
		user := fixture
		user.Phone = "065555"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone is invalid"))
	})

	t.Run("Phone must be 10 digits (too long)", func(t *testing.T) {
		user := fixture
		user.Phone = "06555555555"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone is invalid"))
	})

	t.Run("Phone must not contain latters", func(t *testing.T) {
		user := fixture
		user.Phone = "0629931709aaaa"

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Phone is invalid"))
	})

}

func TestFaculty(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case Faculty", func(t *testing.T) {
		user := fixture
		user.FacultyID = 1

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("FacultyID is required", func(t *testing.T) {
		user := fixture
		user.FacultyID = 0

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("FacultyID is required"))
	})
}

func TestMajor(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case Major", func(t *testing.T) {
		user := fixture
		user.MajorID = 1

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("MajorID is required", func(t *testing.T) {
		user := fixture
		user.MajorID = 0

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("MajorID is required"))
	})
}


func TestYear(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.User{
		SutId:     "B6614690",
		Email:     "test@gmail.com",
		Password:  "password123",
		FirstName: "test",
		LastName:  "test",
		Phone:     "0629931709",
		FacultyID: 1,
		MajorID:   1,
		Year:      1,
		RoleID:    1,
		Bio:       "test",
		AvatarURL: "test",
	}

	t.Run("Success case Year", func(t *testing.T) {
		user := fixture
		user.Year = 1

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Year is required", func(t *testing.T) {
		user := fixture
		user.Year = 0

		ok, err := govalidator.ValidateStruct(user)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Year is required"))
	})
}
