package entity

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	SutId     string     `valid:"required~SutId is required,matches(^[BMD]\\d{7}$)~Incorrect sutid format" gorm:"unique" json:"sut_id"`
	Email     string     `valid:"required~Email is required,email~Inccorect email format" gorm:"unique" json:"email"`
	Password  string     `valid:"required~Password is required" gorm:"not null" json:"-"`
	FirstName string     `valid:"required~FirstName is required" json:"first_name"`
	LastName  string     `valid:"required~LastName is required" json:"last_name"`
	Phone     string     `valid:"required~Phone is required,numeric~Phone is invalid,stringlength(10|10)~Phone is invalid" json:"phone"`
	FacultyID uint       `valid:"required~FacultyID is required" json:"faculty_id"`
	Faculty   *Faculty   `gorm:"foreignKey:FacultyID;" json:"faculty"`
	MajorID   uint       `valid:"required~MajorID is required" json:"major_id"`
	Major     *Major     `gorm:"foreignKey:MajorID;" json:"major"`
	Year      uint       `valid:"required~Year is required" json:"year"`
	RoleID    uint       `json:"role_id"`
	Role      *Role      `gorm:"foreignKey:RoleID;" json:"role"`
	Bio       string     `json:"bio"`
	AvatarURL string     `json:"avatar_url"`
	UserPoint *UserPoint `gorm:"foreignKey:UserID" json:"user_point,omitempty"`

	RewardRedeems             []*RewardRedeem              `gorm:"foreignKey:UserID" json:"reward_redeems"`
	PointRecords              []*PointRecord               `gorm:"foreignKey:UserID" json:"point_records"`
	Certificates              []*Certificate               `gorm:"foreignKey:UserID" json:"certificates"`
	Portfolios                []*Portfolio                 `gorm:"foreignKey:UserID" json:"portfolios"`

	Messages      []*Messages     `gorm:"foreignKey:UserID" json:"messages"`
	Posts              []*Post              `gorm:"foreignKey:UserID" json:"posts"`
	Interests          []*Interest          `gorm:"foreignKey:UserID" json:"interests"`
	Skills             []*Skill             `gorm:"foreignKey:UserID" json:"skills"`
	Socials            []*Social            `gorm:"foreignKey:UserID" json:"socials"`
	Tools              []*Tool              `gorm:"foreignKey:UserID" json:"tools"`

	Registrations []*Registration `gorm:"many2many:user_registrations;" json:"registrations"`
}
