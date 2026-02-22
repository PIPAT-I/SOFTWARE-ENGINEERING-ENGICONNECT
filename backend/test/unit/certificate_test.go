package unit

import (
	"testing"

	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

func TestCertificateValid(t *testing.T) {
	g := NewGomegaWithT(t) 

	t.Run(`certificate is valid`, func(t *testing.T) {
		userID := uint(1)
		postID := uint(1)
		
		cert := entity.Certificate{
			TitleTH:        "ใบรับรองการเข้าร่วม",
			TitleEN:        "Certificate of Participation",
			Detail:         "For attending the event",
			Organizer:      "SUT",
			Type:           "Participation",
			UserID:         &userID,
			PostID:         postID,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestCertificateTitleTH(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	postID := uint(1)

	t.Run(`TitleTH is required`, func(t *testing.T) {
		cert := entity.Certificate{
			TitleTH:        "",
			Type:           "Participation",
			UserID:         &userID,
			PostID:         postID,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TitleTH is required"))
	})

	t.Run(`TitleTH is too long`, func(t *testing.T) {
		longTitle := ""
		for i := 0; i < 201; i++ {
			longTitle += "A"
		}

		cert := entity.Certificate{
			TitleTH:        longTitle,
			Type:           "Participation",
			UserID:         &userID,
			PostID:         postID,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TitleTH is too long"))
	})
}

func TestCertificateType(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	postID := uint(1)

	t.Run(`Type is required`, func(t *testing.T) {
		cert := entity.Certificate{
			TitleTH:        "ใบรับรอง",
			Type:           "",
			UserID:         &userID,
			PostID:         postID,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Type is required"))
	})
}

func TestCertificateForeignKeys(t *testing.T) {
	g := NewGomegaWithT(t)
	userID := uint(1)
	postID := uint(1)

	t.Run(`User ID is required`, func(t *testing.T) {
		cert := entity.Certificate{
			TitleTH:        "ใบรับรอง",
			Type:           "Participation",
			UserID:         nil,
			PostID:         postID,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("User ID is required"))
	})

	t.Run(`Post ID is required`, func(t *testing.T) {
		cert := entity.Certificate{
			TitleTH:        "ใบรับรอง",
			Type:           "Participation",
			UserID:         &userID,
			PostID:         0,
		}

		ok, err := entity.ValidateCertificate(cert)

		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Post ID is required"))
	})
}