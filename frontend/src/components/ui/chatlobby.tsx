import React, { useState, useEffect, useRef } from "react";
import { X, Send, User } from "lucide-react";
import { WS_URL } from "../../services/apiClient";

interface Message {
  body: string;
  user_id: number;
  user_name: string;
  user_avatar: string;
  created_at: string;
  is_me?: boolean;
}

interface ChatLobbyProps {
  postId: number;
  onClose: () => void;
}

const ChatLobby: React.FC<ChatLobbyProps> = ({ postId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const myUserID = Number(localStorage.getItem("userID"));

  const API_URL = import.meta.env.VITE_API_URL;
  const WS_LOBBY_URL = `${WS_URL}/chat/ws/lobby`;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/history/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.data) {
          const formatted = data.data.map((m: any) => ({
            body: m.body,
            user_id: m.user_id,
            user_name: `${m.user.first_name} ${m.user.last_name}`,
            user_avatar: m.user.avatar_url,
            created_at: m.created_at,
            is_me: m.user_id === myUserID,
          }));
          setMessages(formatted);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    fetchHistory();
  }, [postId, token, myUserID]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_LOBBY_URL}/${postId}?token=${token}`);

    ws.onopen = () => {
      console.log("Connected to Chat Lobby");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          is_me: data.user_id === myUserID,
        },
      ]);
    };

    ws.onclose = () => {
      console.log("Disconnected from Chat Lobby");
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [postId, token, myUserID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socketRef.current) return;

    const msgPayload = {
      body: inputMsg,
    };
    socketRef.current.send(JSON.stringify(msgPayload));
    setInputMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-blue-600">#</span> Lobby Chat
            </h2>
            <p className="text-xs text-gray-500">
              Room ID: {postId} • General Discussion
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              System Online
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          <div className="text-center">
            <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-1 rounded-md">
              Initialize connection to room {postId}... [OK]
            </span>
          </div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                msg.is_me ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className="flex-shrink-0">
                {msg.user_avatar ? (
                  <img
                    src={msg.user_avatar}
                    alt={msg.user_name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col max-w-[70%] ${
                  msg.is_me ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {msg.user_name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                    msg.is_me
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type a message to find team..."
              className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-400 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatLobby;
