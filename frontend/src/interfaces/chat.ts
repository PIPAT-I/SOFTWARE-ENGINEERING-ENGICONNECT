
export interface ChatRoom {
    ID: number;
    title: string;
    detail: string;
    picture?: string;
    start_date?: string;
    stop_date?: string;
  }
  
  export interface Message {
    ID: number;
    body: string;
    user_id: number;
    sut_id?: string;
    user_name: string;
    user_avatar: string;
    Created_At: string;
    chat_room_id: number;
    isMe?: boolean;
    type?: number;
  }