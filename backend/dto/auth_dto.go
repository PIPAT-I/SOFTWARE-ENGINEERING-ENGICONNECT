package dto

type SocialMedia struct {
	Platform string `json:"platform"`
	Link     string `json:"link"`
}

type RegisterRequest struct {
	SutId     string        `json:"sut_id" binding:"required"`
	Email     string        `json:"email" binding:"required,email"`
	Password  string        `json:"password" binding:"required,min=8"`
	FirstName string        `json:"first_name" binding:"required"`
	LastName  string        `json:"last_name" binding:"required"`
	Phone     string        `json:"phone" binding:"required"`
	Year      uint          `json:"year" binding:"required"`
	FacultyID uint          `json:"faculty_id" binding:"required"`
	MajorID   uint          `json:"major_id" binding:"required"`
	Bio       string        `json:"bio"`
	Skills    []string      `json:"skills"`
	Tools     []string      `json:"tools"`
	Interests []string      `json:"interests"`
	Socials   []SocialMedia `json:"socials"`
}

type LoginRequest struct {
	SutId    string `json:"sut_id" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	ID        uint   `json:"id"`
	SutId     string `json:"sut_id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Token     string `json:"token"`
}
