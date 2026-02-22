package unit

import (
	"testing"
	"time"
	"github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

func TestAllFieldValid(t *testing.T) {
	g := gomega.NewGomegaWithT(t)

	postID := uint(1)

	registration := entity.Registration{
		TeamName:         "Team Alpha",
		Description:      "A strong team ready to win.",
		Status:           "pending",
		RegistrationDate: time.Now(),
		PostID:           &postID,
	}

	ok, err := registration.Validate()

	g.Expect(ok).To(gomega.BeTrue())
	g.Expect(err).To(gomega.BeNil())
}

func TestRegistration(t *testing.T) {
	g := gomega.NewGomegaWithT(t)

	postID := uint(1)

	fixture := entity.Registration{
		TeamName:         "Team Alpha",
		Description:      "A strong team ready to win.",
		Status:           "pending",
		RegistrationDate: time.Now(),
		PostID:           &postID,
	}

	t.Run("TeamName is required", func(t *testing.T) {
		r := fixture
		r.TeamName = ""
		ok, err := r.Validate()
		g.Expect(ok).NotTo(gomega.BeTrue())
		g.Expect(err).NotTo(gomega.BeNil())
		g.Expect(err.Error()).To(gomega.ContainSubstring("Team name is required"))
	})

	t.Run("TeamName min length 3", func(t *testing.T) {
		r := fixture
		r.TeamName = "AB"
		ok, err := r.Validate()
		g.Expect(ok).NotTo(gomega.BeTrue())
		g.Expect(err).NotTo(gomega.BeNil())
		g.Expect(err.Error()).To(gomega.ContainSubstring("Team name must be at least 3 characters"))
	})

	t.Run("TeamName max length 100", func(t *testing.T) {
		r := fixture

		r.TeamName = ""
		for i := 0; i < 101; i++ {
			r.TeamName += "A"
		}
		ok, err := r.Validate()
		g.Expect(ok).NotTo(gomega.BeTrue())
		g.Expect(err).NotTo(gomega.BeNil())
		g.Expect(err.Error()).To(gomega.ContainSubstring("Team name must not exceed 100 characters"))
	})

	t.Run("Description is required", func(t *testing.T) {
		r := fixture
		r.Description = ""
		ok, err := r.Validate()
		g.Expect(ok).NotTo(gomega.BeTrue())
		g.Expect(err).NotTo(gomega.BeNil())
		g.Expect(err.Error()).To(gomega.ContainSubstring("Description is required"))
	})

	t.Run("Status is required", func(t *testing.T) {
		r := fixture
		r.Status = ""
		ok, err := r.Validate()
		g.Expect(ok).NotTo(gomega.BeTrue())
		g.Expect(err).NotTo(gomega.BeNil())
		g.Expect(err.Error()).To(gomega.ContainSubstring("Status is required"))
	})

	t.Run("Status valid enums", func(t *testing.T) {
		validStatuses := []string{"pending", "approved", "rejected", "completed"}
		for _, s := range validStatuses {
			r := fixture
			r.Status = s
			ok, err := r.Validate()
			g.Expect(ok).To(gomega.BeTrue(), "Status '%s' should be valid", s)
			g.Expect(err).To(gomega.BeNil())
		}
	})
}
