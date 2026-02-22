package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

func TestMessagesValidation(t *testing.T) {
	g := NewGomegaWithT(t)
	fixture := entity.Messages{
		Body:           "สวัสดีครับ ยินดีที่ได้รู้จัก",
		UserID:         1,
		MessagesTypeID: 1,
		ChatRoomID:     1,
	}

	// --- Positive Case ---
	t.Run("1. Success case: all fields are valid", func(t *testing.T) {
		message := fixture

		ok, err := govalidator.ValidateStruct(message)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	// --- Negative Cases ---
	t.Run("2. Negative: Body is required", func(t *testing.T) {
		message := fixture
		message.Body = ""

		ok, err := govalidator.ValidateStruct(message)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Body is required"))
	})

	t.Run("3. Negative: Body max length exceeded", func(t *testing.T) {
		message := fixture
		longBody := ""
		for i := 0; i < 1001; i++ {
			longBody += "a"
		}
		message.Body = longBody

		ok, err := govalidator.ValidateStruct(message)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Body must not exceed 1000 characters"))
	})

	t.Run("4. Negative: ChatRoomID is required", func(t *testing.T) {
		message := fixture
		message.ChatRoomID = 0

		ok, err := govalidator.ValidateStruct(message)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ChatRoomID is required"))
	})
}
