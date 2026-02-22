package dto

type SocketMessage struct {
	ID         uint   `json:"ID"`
	Body       string `json:"body"`
	UserID     uint   `json:"user_id"`
	UserName   string `json:"user_name"`
	UserAvatar string `json:"user_avatar"`
	ChatRoomID uint   `json:"chat_room_id"`
	CreatedAt  string `json:"created_at"`
	Type       string `json:"type"`
	SutId      string `json:"sut_id"`
}
