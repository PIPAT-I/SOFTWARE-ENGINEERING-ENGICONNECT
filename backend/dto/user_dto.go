package dto

import (
	"github.com/sut68/team21/entity"
)

type UpdateProfileRequest struct {
	FirstName string           `json:"first_name" binding:"required"`
	LastName  string           `json:"last_name" binding:"required"`
	Email     string           `json:"email"`
	Phone     string           `json:"phone" binding:"required"`
	FacultyID uint             `json:"faculty_id" binding:"required"`
	MajorID   uint             `json:"major_id" binding:"required"`
	Year      uint             `json:"year" binding:"required"`
	Bio       string           `json:"bio"`
	Skills    []string         `json:"skills"`
	Tools     []string         `json:"tools"`
	Interests []string         `json:"interests"`
	Socials   []SocialMediaDTO `json:"socials"`
}

type SocialMediaDTO struct {
	Platform string `json:"platform"`
	Link     string `json:"link"`
}

type ProfileResponse struct {
	ID        uint             `json:"id"`
	SutID     string           `json:"sut_id"`
	Email     string           `json:"email"`
	FirstName string           `json:"first_name"`
	LastName  string           `json:"last_name"`
	Phone     string           `json:"phone"`
	FacultyID uint             `json:"faculty_id"`
	Faculty   *entity.Faculty  `json:"faculty"`
	MajorID   uint             `json:"major_id"`
	Major     *entity.Major    `json:"major"`
	Year      uint             `json:"year"`
	RoleID    uint             `json:"role_id"`
	Role      *entity.Role     `json:"role"`
	Bio       string           `json:"bio"`
	AvatarURL string           `json:"avatar_url"`
	Skills    []string         `json:"skills"`
	Interests []string         `json:"interests"`
	Tools     []string         `json:"tools"`
	Socials   []SocialMediaDTO `json:"socials"`
	Portfolios   []entity.Portfolio `json:"portfolios"`
	Certificates []CertificateDTO   `json:"certificates"`
}

type CertificateDTO struct {
	ID                   uint   `json:"id"`
	TitleTH              string `json:"title_th"`
	TitleEN              string `json:"title_en"`
	Type                 string `json:"type"` 
	PublicationType      string `json:"publication_type"`
	PictureParticipation string `json:"picture_participation"`
	PictureWinner        string `json:"picture_winner"`
	ActivityPicture      string `json:"activity_picture"` 
	ActivityTitle        string `json:"activity_title"`   
	Organizer            string `json:"organizer"`
	Date                 string `json:"date"`
}

func ToProfileResponse(user *entity.User) *ProfileResponse {
	if user == nil {
		return nil
	}

	skills := make([]string, 0, len(user.Skills))
	for _, skill := range user.Skills {
		skills = append(skills, skill.Name)
	}

	interests := make([]string, 0, len(user.Interests))
	for _, interest := range user.Interests {
		interests = append(interests, interest.Name)
	}

	tools := make([]string, 0, len(user.Tools))
	for _, tool := range user.Tools {
		tools = append(tools, tool.Name)
	}

	socials := make([]SocialMediaDTO, 0, len(user.Socials))
	for _, social := range user.Socials {
		socials = append(socials, SocialMediaDTO{
			Platform: social.Platform,
			Link:     social.Link,
		})
	}

	return &ProfileResponse{
		ID:           user.ID,
		SutID:        user.SutId,
		Email:        user.Email,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		Phone:        user.Phone,
		FacultyID:    user.FacultyID,
		Faculty:      user.Faculty,
		MajorID:      user.MajorID,
		Major:        user.Major,
		Year:         user.Year,
		RoleID:       user.RoleID,
		Role:         user.Role,
		Bio:          user.Bio,
		AvatarURL:    user.AvatarURL,
		Skills:       skills,
		Interests:    interests,
		Tools:        tools,
		Socials:      socials,
		Portfolios:   []entity.Portfolio{}, 
		Certificates: []CertificateDTO{},   
	}
}
