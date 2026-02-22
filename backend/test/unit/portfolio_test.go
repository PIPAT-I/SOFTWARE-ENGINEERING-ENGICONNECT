package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

func TestPortfolioValidation(t *testing.T) {
	g := NewGomegaWithT(t)
	fixture := entity.Portfolio{
		Title:             "My First Portfolio",
		Description:       "This is a sample portfolio description",
		PortType:          "Project",
		LinkPortfolio:     "https://example.com/portfolio",
		File_urls:         "https://example.com/files/portfolio.pdf",
		UserID:            1,
		PortfolioStatusID: 1,
	}

	// --- Positive Case ---
	t.Run("1. Success case: all fields are valid", func(t *testing.T) {
		portfolio := fixture

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	// --- Negative Cases ---
	t.Run("2. Negative: Title is required", func(t *testing.T) {
		portfolio := fixture
		portfolio.Title = ""

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
	})

	t.Run("3. Negative: UserID is required", func(t *testing.T) {
		portfolio := fixture
		portfolio.UserID = 0

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
	})

	t.Run("4. Negative: PortfolioStatusID is required", func(t *testing.T) {
		portfolio := fixture
		portfolio.PortfolioStatusID = 0

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
	})

	t.Run("5. Positive: Optional fields can be empty", func(t *testing.T) {
		portfolio := fixture
		portfolio.Description = ""
		portfolio.PortType = ""
		portfolio.LinkPortfolio = ""
		portfolio.File_urls = ""
		portfolio.AdminComment = nil

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("6. Positive: AdminComment can be nil", func(t *testing.T) {
		portfolio := fixture
		portfolio.AdminComment = nil

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("7. Positive: AdminComment can have value", func(t *testing.T) {
		portfolio := fixture
		comment := "Great work! Approved."
		portfolio.AdminComment = &comment

		ok, err := govalidator.ValidateStruct(portfolio)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}
