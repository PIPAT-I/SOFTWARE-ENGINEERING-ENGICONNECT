package services

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/sut68/team21/dto" // อย่าลืมเปลี่ยน path ตาม module ของคุณ
)

// Client คือตัวแทนของผู้ใช้ 1 คนที่กำลังต่อ Socket
type Client struct {
	Hub    *ChatHub
	Conn   *websocket.Conn
	Send   chan dto.SocketMessage
	RoomID uint
	UserID uint
}

// ChatHub คือศูนย์กลางจัดการห้องแชททั้งหมด
type ChatHub struct {
	// Map เก็บ RoomID -> รายชื่อ Client ในห้องนั้น
	Rooms      map[uint]map[*Client]bool
	Broadcast  chan dto.SocketMessage
	Register   chan *Client
	Unregister chan *Client
	mu         sync.Mutex
}

func NewChatHub() *ChatHub {
	return &ChatHub{
		Rooms:      make(map[uint]map[*Client]bool),
		Broadcast:  make(chan dto.SocketMessage),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

// Run คือ Loop ที่จะทำงานตลอดเวลา (Goroutine)
func (h *ChatHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Rooms[client.RoomID] == nil {
				h.Rooms[client.RoomID] = make(map[*Client]bool)
			}
			h.Rooms[client.RoomID][client] = true
			h.mu.Unlock()
			log.Printf("Client joined room %d", client.RoomID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.Rooms[client.RoomID][client]; ok {
				delete(h.Rooms[client.RoomID], client)
				close(client.Send)
				client.Conn.Close()
			}
			h.mu.Unlock()

		case message := <-h.Broadcast:
			h.mu.Lock()
			// ส่งข้อความให้ทุกคนที่อยู่ใน RoomID เดียวกัน
			if clients, ok := h.Rooms[message.ChatRoomID]; ok {
				for client := range clients {
					select {
					case client.Send <- message:
					default:
						close(client.Send)
						delete(h.Rooms[message.ChatRoomID], client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}