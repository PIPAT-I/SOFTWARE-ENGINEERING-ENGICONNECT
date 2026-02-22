package unit

import (
	"testing"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
	"github.com/sut68/team21/services"
)


func TestTopicName(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationTopic{
		Name:   "หัวข้อทดสอบ",
		PostID: 1,
	}

	t.Run("Success case Topic Name", func(t *testing.T) {
		topic := fixture
		topic.Name = "หัวข้อทดสอบ"

		ok, err := govalidator.ValidateStruct(topic)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Topic Name is required", func(t *testing.T) {
		topic := fixture
		topic.Name = ""

		ok, err := govalidator.ValidateStruct(topic)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})
}

func TestTopicPostID(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationTopic{
		Name:   "หัวข้อทดสอบ",
		PostID: 1,
	}

	t.Run("Success case Topic PostID", func(t *testing.T) {
		topic := fixture
		topic.PostID = 1

		ok, err := govalidator.ValidateStruct(topic)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Topic PostID is required", func(t *testing.T) {
		topic := fixture
		topic.PostID = 0

		ok, err := govalidator.ValidateStruct(topic)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PostID is required"))
	})
}



func TestScoreValue(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationScore{
		Score:                       3.0,
		ActivityEvaluationTopicID:   1,
		ActivityEvaluationResponeID: 1,
	}

	t.Run("Success case Score value 0", func(t *testing.T) {
		score := fixture
		score.Score = 0

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Success case Score value 5", func(t *testing.T) {
		score := fixture
		score.Score = 5

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Success case Score value 2.5", func(t *testing.T) {
		score := fixture
		score.Score = 2.5

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Score is out of range (negative)", func(t *testing.T) {
		score := fixture
		score.Score = -1

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Score must be between 0 and 5"))
	})

	t.Run("Score is out of range (greater than 5)", func(t *testing.T) {
		score := fixture
		score.Score = 6

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Score must be between 0 and 5"))
	})
}

func TestScoreTopicID(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationScore{
		Score:                       3.0,
		ActivityEvaluationTopicID:   1,
		ActivityEvaluationResponeID: 1,
	}

	t.Run("Success case Score TopicID", func(t *testing.T) {
		score := fixture
		score.ActivityEvaluationTopicID = 1

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Score TopicID is required", func(t *testing.T) {
		score := fixture
		score.ActivityEvaluationTopicID = 0

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TopicID is required"))
	})
}

func TestScoreResponeID(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationScore{
		Score:                       3.0,
		ActivityEvaluationTopicID:   1,
		ActivityEvaluationResponeID: 1,
	}

	t.Run("Success case Score ResponeID", func(t *testing.T) {
		score := fixture
		score.ActivityEvaluationResponeID = 1

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Score ResponeID is required", func(t *testing.T) {
		score := fixture
		score.ActivityEvaluationResponeID = 0

		ok, err := govalidator.ValidateStruct(score)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("ResponeID is required"))
	})
}



func TestResponeRegistrationID(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationRespone{
		Suggestion:     "ดีมาก",
		RegistrationID: 1,
		UserID:         1,
	}

	t.Run("Success case Respone RegistrationID", func(t *testing.T) {
		respone := fixture
		respone.RegistrationID = 1

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Respone RegistrationID is required", func(t *testing.T) {
		respone := fixture
		respone.RegistrationID = 0

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RegistrationID is required"))
	})
}

func TestResponeUserID(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationRespone{
		Suggestion:     "ดีมาก",
		RegistrationID: 1,
		UserID:         1,
	}

	t.Run("Success case Respone UserID", func(t *testing.T) {
		respone := fixture
		respone.UserID = 1

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Respone UserID is required", func(t *testing.T) {
		respone := fixture
		respone.UserID = 0

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("UserID is required"))
	})
}

func TestResponeSuggestion(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := entity.ActivityEvaluationRespone{
		Suggestion:     "ดีมาก",
		RegistrationID: 1,
		UserID:         1,
	}

	t.Run("Success case Respone with Suggestion", func(t *testing.T) {
		respone := fixture
		respone.Suggestion = "กิจกรรมสนุกมากครับ"

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("Success case Respone without Suggestion", func(t *testing.T) {
		respone := fixture
		respone.Suggestion = ""

		ok, err := govalidator.ValidateStruct(respone)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}


func TestTopicInput(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := services.TopicInput{
		Name:        "หัวข้อทดสอบ",
		Description: "รายละเอียด",
	}

	t.Run("Success case TopicInput", func(t *testing.T) {
		input := fixture

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("TopicInput Name is required", func(t *testing.T) {
		input := fixture
		input.Name = ""

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Topic name is required"))
	})
}

func TestCreateTopicsRequest(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := services.CreateTopicsRequest{
		PostID: 1,
		Topics: []services.TopicInput{
			{Name: "หัวข้อ 1", Description: "รายละเอียด"},
		},
	}

	t.Run("Success case CreateTopicsRequest", func(t *testing.T) {
		req := fixture

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("CreateTopicsRequest PostID is required", func(t *testing.T) {
		req := fixture
		req.PostID = 0

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("PostID is required"))
	})
}

func TestUpdateTopicRequest(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := services.UpdateTopicRequest{
		Name:        "หัวข้อแก้ไข",
		Description: "รายละเอียด",
	}

	t.Run("Success case UpdateTopicRequest", func(t *testing.T) {
		req := fixture

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("UpdateTopicRequest Name is required", func(t *testing.T) {
		req := fixture
		req.Name = ""

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Name is required"))
	})
}

func TestScoreInput(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := services.ScoreInput{
		TopicID: 1,
		Score:   3.5,
	}

	t.Run("Success case ScoreInput", func(t *testing.T) {
		input := fixture

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("ScoreInput TopicID is required", func(t *testing.T) {
		input := fixture
		input.TopicID = 0

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("TopicID is required"))
	})

	t.Run("ScoreInput Score out of range (negative)", func(t *testing.T) {
		input := fixture
		input.Score = -1

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Score must be between 0 and 5"))
	})

	t.Run("ScoreInput Score out of range (greater than 5)", func(t *testing.T) {
		input := fixture
		input.Score = 6

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("Score must be between 0 and 5"))
	})

	t.Run("ScoreInput Score boundary 0", func(t *testing.T) {
		input := fixture
		input.Score = 0

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("ScoreInput Score boundary 5", func(t *testing.T) {
		input := fixture
		input.Score = 5

		ok, err := govalidator.ValidateStruct(input)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}

func TestSubmitEvaluationRequest(t *testing.T) {
	g := NewGomegaWithT(t)

	fixture := services.SubmitEvaluationRequest{
		RegistrationID: 1,
		Suggestion:     "กิจกรรมดีมาก",
		Scores: []services.ScoreInput{
			{TopicID: 1, Score: 4},
		},
	}

	t.Run("Success case SubmitEvaluationRequest", func(t *testing.T) {
		req := fixture

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("SubmitEvaluationRequest RegistrationID is required", func(t *testing.T) {
		req := fixture
		req.RegistrationID = 0

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).NotTo(BeTrue())
		g.Expect(err).NotTo(BeNil())
		g.Expect(err.Error()).To(Equal("RegistrationID is required"))
	})

	t.Run("SubmitEvaluationRequest without Suggestion", func(t *testing.T) {
		req := fixture
		req.Suggestion = ""

		ok, err := govalidator.ValidateStruct(req)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})
}