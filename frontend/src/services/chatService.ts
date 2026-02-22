import apiClient from "./apiClient";
import type { ChatRoom, Message } from "@/interfaces/chat";
import { getImageUrl } from "@/utils/imageUtils";

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const res = await apiClient.get("/post/student");
    const json = res.data;
    const dataList = Array.isArray(json) ? json : json.data;

    if (!dataList) return [];

    const now = new Date();

    return dataList
      .map((item: unknown) => {
        const post = item as Partial<ChatRoom> & { 
          picture?: string;
          start_date?: string;
          stop_date?: string;
        };
        let pictureUrl = null;
        if (post.picture && post.picture.trim() !== "") {
          pictureUrl = post.picture.startsWith("data:")
            ? post.picture
            : `data:image/jpeg;base64,${post.picture}`;
        }
        
        return {
          ID: post.ID ?? 0,
          title: post.title || "No Title",
          detail: post.detail || "",
          picture: pictureUrl,
          start_date: post.start_date,
          stop_date: post.stop_date,
        };
      })
      .filter((room: ChatRoom) => {
        if (!room.start_date || !room.stop_date) return false;
        const startDate = new Date(room.start_date);
        const stopDate = new Date(room.stop_date);
        return now >= startDate && now <= stopDate;
      });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
};

export const getAllChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const res = await apiClient.get("/post");
    const json = res.data;
    const dataList = Array.isArray(json) ? json : json.data;

    return dataList
      ? dataList.map((item: unknown) => {
          const post = item as Partial<ChatRoom> & { picture?: string };
          let pictureUrl = null;
          if (post.picture && post.picture.trim() !== "") {
            pictureUrl = post.picture.startsWith("data:")
              ? post.picture
              : `data:image/jpeg;base64,${post.picture}`;
          }
          
          return {
            ID: post.ID ?? 0,
            title: post.title || "No Title",
            detail: post.detail || "",
            picture: pictureUrl,
          };
        })
      : [];
  } catch (error) {
    console.error("Error fetching all rooms:", error);
    return [];
  }
};

export const getChatHistory = async (roomId: number): Promise<Message[]> => {
  const myUserID = Number(localStorage.getItem("userID"));

  try {
    const res = await apiClient.get(`/chat/history/${roomId}`);
    const json = res.data;
    const messages = Array.isArray(json) ? json : json.data || [];

    return messages.map((item: unknown) => {
      const m = item as Partial<Message> & { 
        created_at?: string; 
        CreatedAt?: string;
      };
      
      return {
        ID: m.ID ?? 0,
        body: m.body ?? "",
        user_id: m.user_id ?? 0,
        user_name: m.user_name || "Unknown",
        user_avatar: getImageUrl(m.user_avatar),
        Created_At: m.created_at || m.CreatedAt || "",
        chat_room_id: m.chat_room_id ?? 0,
        isMe: Number(m.user_id) === myUserID,
        type: m.type || 1,
        sut_id: m.sut_id,
      };
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

export const deleteMessage = async (messageId: number): Promise<boolean> => {
  try {
    const res = await apiClient.delete(`/chat/message/${messageId}`);
    return res.status === 200;
  } catch (error) {
    console.error("Error deleting message:", error);
    return false;
  }
};
