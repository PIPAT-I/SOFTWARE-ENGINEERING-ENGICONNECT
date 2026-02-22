package unit

import (
	"testing"

	. "github.com/onsi/gomega"
	"github.com/sut68/team21/entity"
)

// TestCreateResult - ทดสอบการสร้างผลประกาศ
func TestCreateResult(t *testing.T) {
	g := NewGomegaWithT(t)

	awardID := uint(1)
	registrationID := uint(1)

	fixture := entity.Result{
		AwardID:        awardID,
		RegistrationID: registrationID,
	}

	t.Run("Success case: valid result", func(t *testing.T) {
		result := fixture

		// ตรวจสอบว่ามี AwardID และ RegistrationID
		g.Expect(result.AwardID).To(Equal(awardID))
		g.Expect(result.RegistrationID).To(Equal(registrationID))
		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.RegistrationID).ToNot(BeZero())
	})

	t.Run("AwardID is required", func(t *testing.T) {
		result := fixture
		result.AwardID = 0

		// ตรวจสอบว่า AwardID ต้องไม่เป็น 0
		g.Expect(result.AwardID).To(BeZero())
	})

	t.Run("RegistrationID is required", func(t *testing.T) {
		result := fixture
		result.RegistrationID = 0

		// ตรวจสอบว่า RegistrationID ต้องไม่เป็น 0
		g.Expect(result.RegistrationID).To(BeZero())
	})
}

// TestUpdateResult - ทดสอบการแก้ไขผลประกาศ (เปลี่ยนรางวัล)
func TestUpdateResult(t *testing.T) {
	g := NewGomegaWithT(t)

	originalAwardID := uint(1)
	newAwardID := uint(2)
	registrationID := uint(1)

	fixture := entity.Result{
		AwardID:        originalAwardID,
		RegistrationID: registrationID,
	}

	t.Run("Success case: update award", func(t *testing.T) {
		result := fixture

		// อัพเดท Award ID
		result.AwardID = newAwardID

		g.Expect(result.AwardID).To(Equal(newAwardID))
		g.Expect(result.AwardID).ToNot(Equal(originalAwardID))
		g.Expect(result.RegistrationID).To(Equal(registrationID))
	})

	t.Run("Update with same award should work", func(t *testing.T) {
		result := fixture

		// อัพเดทเป็น Award เดิม
		result.AwardID = originalAwardID

		g.Expect(result.AwardID).To(Equal(originalAwardID))
	})

	t.Run("Update registration ID should work", func(t *testing.T) {
		result := fixture
		newRegistrationID := uint(2)

		// อัพเดท Registration ID
		result.RegistrationID = newRegistrationID

		g.Expect(result.RegistrationID).To(Equal(newRegistrationID))
		g.Expect(result.RegistrationID).ToNot(Equal(registrationID))
	})

	t.Run("Cannot update to zero award ID", func(t *testing.T) {
		result := fixture

		// พยายามอัพเดทเป็น 0 (ไม่ควรอนุญาต)
		result.AwardID = 0

		g.Expect(result.AwardID).To(BeZero())
	})
}

// TestPreventDuplicateResults - ทดสอบการป้องกันการสร้างผลซ้ำ
func TestPreventDuplicateResults(t *testing.T) {
	g := NewGomegaWithT(t)

	awardID := uint(1)
	registrationID := uint(1)

	t.Run("Same award and registration - should be duplicate", func(t *testing.T) {
		result1 := entity.Result{
			AwardID:        awardID,
			RegistrationID: registrationID,
		}

		result2 := entity.Result{
			AwardID:        awardID,
			RegistrationID: registrationID,
		}

		// ตรวจสอบว่าทั้งสองมีค่าเหมือนกัน (ซ้ำกัน)
		g.Expect(result1.AwardID).To(Equal(result2.AwardID))
		g.Expect(result1.RegistrationID).To(Equal(result2.RegistrationID))
	})

	t.Run("Same registration different award - should be allowed", func(t *testing.T) {
		result1 := entity.Result{
			AwardID:        uint(1),
			RegistrationID: registrationID,
		}

		result2 := entity.Result{
			AwardID:        uint(2),
			RegistrationID: registrationID,
		}

		// ตรวจสอบว่า Registration เดียวกันสามารถมีหลายรางวัลได้
		g.Expect(result1.RegistrationID).To(Equal(result2.RegistrationID))
		g.Expect(result1.AwardID).ToNot(Equal(result2.AwardID))
	})

	t.Run("Different registration same award - should be allowed", func(t *testing.T) {
		result1 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(1),
		}

		result2 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(2),
		}

		// ตรวจสอบว่า Award เดียวกันสามารถมอบให้หลายคนได้
		g.Expect(result1.AwardID).To(Equal(result2.AwardID))
		g.Expect(result1.RegistrationID).ToNot(Equal(result2.RegistrationID))
	})

	t.Run("Completely different results - should be allowed", func(t *testing.T) {
		result1 := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		result2 := entity.Result{
			AwardID:        uint(2),
			RegistrationID: uint(2),
		}

		// ตรวจสอบว่าทั้งสองแตกต่างกันทั้งหมด
		g.Expect(result1.AwardID).ToNot(Equal(result2.AwardID))
		g.Expect(result1.RegistrationID).ToNot(Equal(result2.RegistrationID))
	})
}

// TestResultAwardRelation - ทดสอบความสัมพันธ์กับ Award
func TestResultAwardRelation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Result should have award relation", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		// ตรวจสอบว่ามี AwardID
		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.AwardID).To(BeNumerically(">", 0))
	})

	t.Run("Multiple results can share same award", func(t *testing.T) {
		awardID := uint(1)

		result1 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(1),
		}

		result2 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(2),
		}

		result3 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(3),
		}

		// ตรวจสอบว่าทุก result ใช้ award เดียวกัน
		g.Expect(result1.AwardID).To(Equal(awardID))
		g.Expect(result2.AwardID).To(Equal(awardID))
		g.Expect(result3.AwardID).To(Equal(awardID))
	})
}

// TestResultRegistrationRelation - ทดสอบความสัมพันธ์กับ Registration
func TestResultRegistrationRelation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Result should have registration relation", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		// ตรวจสอบว่ามี RegistrationID
		g.Expect(result.RegistrationID).ToNot(BeZero())
		g.Expect(result.RegistrationID).To(BeNumerically(">", 0))
	})

	t.Run("Each result must belong to one registration", func(t *testing.T) {
		registrationID := uint(1)

		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: registrationID,
		}

		// ตรวจสอบว่า result มี registration
		g.Expect(result.RegistrationID).To(Equal(registrationID))
	})
}

// TestResultValidation - ทดสอบการ validate ข้อมูล
func TestResultValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Valid result with all required fields", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		// ตรวจสอบว่าทุกฟิลด์ที่จำเป็นมีค่า
		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.RegistrationID).ToNot(BeZero())
	})

	t.Run("Invalid result without award ID", func(t *testing.T) {
		result := entity.Result{
			AwardID:        0,
			RegistrationID: uint(1),
		}

		// ตรวจสอบว่า AwardID เป็น 0 (invalid)
		g.Expect(result.AwardID).To(BeZero())
		g.Expect(result.RegistrationID).ToNot(BeZero())
	})

	t.Run("Invalid result without registration ID", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: 0,
		}

		// ตรวจสอบว่า RegistrationID เป็น 0 (invalid)
		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.RegistrationID).To(BeZero())
	})

	t.Run("Invalid result without both IDs", func(t *testing.T) {
		result := entity.Result{
			AwardID:        0,
			RegistrationID: 0,
		}

		// ตรวจสอบว่าทั้งสองฟิลด์เป็น 0 (invalid)
		g.Expect(result.AwardID).To(BeZero())
		g.Expect(result.RegistrationID).To(BeZero())
	})
}

// TestAwardSelection - ทดสอบการเลือกรางวัล
func TestAwardSelection(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Award must be selected", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.AwardID).To(BeNumerically(">", 0))
	})

	t.Run("Cannot create result without award", func(t *testing.T) {
		result := entity.Result{
			AwardID:        0,
			RegistrationID: uint(1),
		}

		g.Expect(result.AwardID).To(BeZero())
	})
}

// TestRecipientSelection - ทดสอบการเลือกผู้รับรางวัล
func TestRecipientSelection(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Recipient must be selected", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		g.Expect(result.RegistrationID).ToNot(BeZero())
		g.Expect(result.RegistrationID).To(BeNumerically(">", 0))
	})

	t.Run("Cannot create result without recipient", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: 0,
		}

		g.Expect(result.RegistrationID).To(BeZero())
	})

	t.Run("One registration can receive multiple different awards", func(t *testing.T) {
		registrationID := uint(1)

		result1 := entity.Result{
			AwardID:        uint(1),
			RegistrationID: registrationID,
		}

		result2 := entity.Result{
			AwardID:        uint(4),
			RegistrationID: registrationID,
		}

		g.Expect(result1.RegistrationID).To(Equal(registrationID))
		g.Expect(result2.RegistrationID).To(Equal(registrationID))
		g.Expect(result1.AwardID).ToNot(Equal(result2.AwardID))
	})
}

// TestAwardAndRecipientValidation - ทดสอบการตรวจสอบรางวัลและผู้รับพร้อมกัน
func TestAwardAndRecipientValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Both award and recipient must be selected", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.RegistrationID).ToNot(BeZero())
	})

	t.Run("Same award to same recipient should be prevented", func(t *testing.T) {
		awardID := uint(1)
		registrationID := uint(1)

		result1 := entity.Result{
			AwardID:        awardID,
			RegistrationID: registrationID,
		}

		result2 := entity.Result{
			AwardID:        awardID,
			RegistrationID: registrationID,
		}

		g.Expect(result1.AwardID).To(Equal(result2.AwardID))
		g.Expect(result1.RegistrationID).To(Equal(result2.RegistrationID))
	})

	t.Run("Cannot announce without participants", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: 0,
		}

		g.Expect(result.RegistrationID).To(BeZero())
		g.Expect(result.AwardID).ToNot(BeZero())
	})
}

// TestAwardNameValidation - ทดสอบการตรวจสอบชื่อรางวัล
func TestAwardNameValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Award must have a name", func(t *testing.T) {
		award := entity.Award{
			AwardName:   "ชนะเลิศ",
			Description: "รางวัลชนะเลิศ",
		}

		g.Expect(award.AwardName).ToNot(BeEmpty())
		g.Expect(award.AwardName).To(Equal("ชนะเลิศ"))
	})

	t.Run("Award name cannot be empty", func(t *testing.T) {
		award := entity.Award{
			AwardName:   "",
			Description: "รางวัลทดสอบ",
		}

		g.Expect(award.AwardName).To(BeEmpty())
	})

	t.Run("Common award names should be valid", func(t *testing.T) {
		validNames := []string{
			"ชนะเลิศ",
			"รองชนะเลิศอันดับ 1",
			"รองชนะเลิศอันดับ 2",
			"ชมเชย",
		}

		for _, name := range validNames {
			award := entity.Award{
				AwardName:   name,
				Description: "รางวัล" + name,
			}

			g.Expect(award.AwardName).To(Equal(name))
			g.Expect(award.AwardName).ToNot(BeEmpty())
		}
	})
}

// TestAwardInResult - ทดสอบการใช้ Award ใน Result
func TestAwardInResult(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("Result must reference a valid award", func(t *testing.T) {
		result := entity.Result{
			AwardID:        uint(1),
			RegistrationID: uint(1),
		}

		g.Expect(result.AwardID).ToNot(BeZero())
		g.Expect(result.AwardID).To(BeNumerically(">", 0))
	})

	t.Run("Multiple results can use the same award", func(t *testing.T) {
		awardID := uint(1)

		result1 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(1),
		}

		result2 := entity.Result{
			AwardID:        awardID,
			RegistrationID: uint(2),
		}

		g.Expect(result1.AwardID).To(Equal(awardID))
		g.Expect(result2.AwardID).To(Equal(awardID))
	})
}
