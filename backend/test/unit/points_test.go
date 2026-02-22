package unit

import (
	"testing"

	."github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
	"github.com/asaskevich/govalidator"
)

func TestRewardName(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.Reward{
		RewardName:    "Test Reward",
		PointRequired: 100,
		Stock:         10,
		Description:   "This is a test reward",
		RewardImage:   "test_image.png",
	}

	t.Run("Success case: valid reward name", func(t *testing.T) {
		reward := fixture

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run("RewardName is required", func(t *testing.T) {
		reward := fixture
		reward.RewardName = ""

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RewardName is required"))
	})
}

func TestRewardImage(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.Reward{
		RewardName:    "Test Reward",
		PointRequired: 100,
		Stock:         10,
		Description:   "This is a test reward",
		RewardImage:   "test_image.png",
	}

	t.Run("Success case: valid reward image", func(t *testing.T) {
		reward := fixture

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
	t.Run("RewardImage is required", func(t *testing.T) {
		reward := fixture
		reward.RewardImage = ""

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RewardImage is required"))
	})
}

func TestPointRequired(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.Reward{
		RewardName:    "Test Reward",
		PointRequired: 100,
		Stock:         10,
		Description:   "This is a test reward",
		RewardImage:   "test_image.png",
	}

	t.Run("Success case: valid point required", func(t *testing.T) {
		reward := fixture	

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("PointRequired must be greater than or equal to 100", func(t *testing.T) {
		reward := fixture
		reward.PointRequired = 99

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PointRequired must be greater than or equal to 100"))
	})
}

func TestStock(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.Reward{
		RewardName:    "Test Reward",
		PointRequired: 100,
		Stock:         10,
		Description:   "This is a test reward",
		RewardImage:   "test_image.png",
	}

	t.Run("Success case: valid stock", func(t *testing.T) {
		reward := fixture

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Stock must be greater than or equal to 1", func(t *testing.T) {
		reward := fixture
		reward.Stock = -1

		ok, err := govalidator.ValidateStruct(reward)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Stock must be greater than or equal to 1"))
	})
}