import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Search,
  CheckCheck,
  Image as ImageIcon,
  Hash,
  ArrowLeft,
  Loader2,
  FileText,
  ExternalLink,
  X,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { ChatRoom, Message } from "@/interfaces/chat";
import type { User } from "@/interfaces/user";
import {
  getChatRooms,
  getChatHistory,
  deleteMessage,
} from "@/services/chatService";
import { getMyProfile } from "@/services/profileService";
import apiClient, { WS_URL } from "@/services/apiClient";
import { getImageUrl } from "@/utils/imageUtils";

export default function StudentCommunicationPage() {
  const { postID } = useParams<{ postID: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(
    postID ? parseInt(postID) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [myProfile, setMyProfile] = useState<User | null>(null);
  const [myUserID, setMyUserID] = useState<number>(0);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  const getAvatar = (msg: Message) => {
    if (msg.isMe && myProfile?.avatar_url) {
      return getImageUrl(myProfile.avatar_url);
    }
    return msg.user_avatar;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isImage = (body: string) => {
    return (
      body &&
      (body.startsWith("http") || body.startsWith("upload/")) &&
      /\.(jpeg|jpg|gif|png)$/i.test(body)
    );
  };

  const getFileName = (url: string) => {
    try {
      return (
        url
          .substring(url.lastIndexOf("/") + 1)
          .split("_")
          .slice(1)
          .join("_") || "File"
      );
    } catch (e) {
      return "Attached File";
    }
  };

  const handleVisitProfile = (msg: Message) => {
    const sutId = msg.sut_id;

    if (sutId) {
      navigate(`/student/profile-skill/${sutId}`);
    } else {
      console.warn("SUT ID missing in message object:", msg);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อความนี้?")) {
      return;
    }

    const success = await deleteMessage(messageId);
    if (success) {
      setMessages((prev) =>
        prev.map((m) => (m.ID === messageId ? { ...m, body: "[DELETED]" } : m))
      );
      toast.success("ลบข้อความเรียบร้อยแล้ว");
    } else {
      toast.error("ไม่สามารถลบข้อความได้");
    }
  };

  const canDeleteMessage = (msg: Message): boolean => {
    if (!msg.isMe || msg.body === "[DELETED]") return false;

    const messageTime = new Date(msg.Created_At).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    return now - messageTime <= fifteenMinutes;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์รูปภาพต้องไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await apiClient.post("/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      const url = data.url || data.data?.url || data;

      if (url && socket) {
        socket.send(JSON.stringify({ body: url, type: "image" }));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์เอกสารต้องไม่เกิน 10MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await apiClient.post("/chat/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      const url = data.url || data.data?.url || data;

      if (url && socket) {
        socket.send(JSON.stringify({ body: url, type: "file" }));
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      toast.error("อัปโหลดไฟล์ไม่สำเร็จ");
    } finally {
      setIsUploading(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const fetchMyIdentity = async () => {
      if (!token) return;
      try {
        const response = await getMyProfile();

        if (response && response.data) {
          const user = response.data;
          setMyProfile(user);

          const id = Number(user.id || user.sut_id);
          setMyUserID(id);
          localStorage.setItem("userID", String(id));
        }
      } catch (err) {
        console.error("Failed to fetch my profile:", err);
      }
    };
    fetchMyIdentity();
  }, [token]);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await getChatRooms();
        setRooms(data);
        if (!activeRoomId && data.length > 0) {
          setActiveRoomId(data[0].ID);
        }
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) loadRooms();
  }, [token]);

  useEffect(() => {
    if (!activeRoomId || !token || myUserID === 0) return;

    const loadHistory = async () => {
      try {
        const history = await getChatHistory(activeRoomId);
        setMessages(history);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
    const ws = new WebSocket(`${WS_URL}/${activeRoomId}?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "delete" && data.ID) {
          setMessages((prev) =>
            prev.map((m) =>
              m.ID === data.ID ? { ...m, body: "[DELETED]" } : m
            )
          );
          return;
        }

        const avatarUrl = getImageUrl(data.user_avatar);

        const newMsg: Message = {
          ID: data.ID || Date.now(),
          body: data.body,
          user_id: data.user_id,
          user_name: data.user_name,
          user_avatar: avatarUrl,
          Created_At: data.created_at || new Date().toISOString(),
          chat_room_id: data.chat_room_id,
          isMe: Number(data.user_id) === myUserID,
          sut_id: data.sut_id,
        };
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 50);
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, [activeRoomId, token, myUserID]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;
    const payload = { body: inputValue, type: "text" };
    socket.send(JSON.stringify(payload));
    setInputValue("");
  };

  const handleSelectRoom = (id: number) => {
    setActiveRoomId(id);
  };

  const handleOpenSubChat = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    navigate(`chat/${id}`);
  };

  const currentRoom = rooms.find((r) => r.ID === activeRoomId);

  return (
    <div className="h-screen overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="md:hidden mb-4 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Chat</h1>
      </div>

      <div className="bg-white h-screen flex overflow-hidden">
        <div className="w-[80px] md:w-[320px] bg-white border-r border-slate-200/80 flex flex-col">
          <div className="p-4 md:p-6 pb-4 hidden md:block">
            <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Hash className="text-slate-900" /> Event Lobby
            </h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหากิจกรรม..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 md:px-3 pb-4 space-y-1 pt-4 md:pt-0">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : (
              rooms
                .filter((room) =>
                  room.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((room) => (
                  <div
                    key={room.ID}
                    onClick={() => handleSelectRoom(room.ID)}
                    className={`group flex items-center gap-3 p-2 md:p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      activeRoomId === room.ID
                        ? "bg-white shadow-md border border-slate-300/50 scale-[1.02]"
                        : "hover:bg-white/60 hover:shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <div
                      className={`relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all duration-200 overflow-hidden ${
                        activeRoomId === room.ID
                          ? "bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg"
                          : "bg-gradient-to-br from-slate-400 to-slate-300 group-hover:from-slate-500 group-hover:to-slate-400"
                      }`}
                    >
                      {room.picture ? (
                        <img
                          src={room.picture}
                          alt={room.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (room.picture) {
                              setViewingImage(room.picture);
                            }
                          }}
                        />
                      ) : (
                        room.title.charAt(0)
                      )}
                    </div>

                    <div className="hidden md:block flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3
                          className={`text-sm font-bold truncate ${
                            activeRoomId === room.ID
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {room.title}
                        </h3>

                        <button
                          onClick={(e) => handleOpenSubChat(e, room.ID)}
                          className={`p-1.5 rounded-full hover:bg-slate-100 hover:text-slate-900 transition-colors ${
                            activeRoomId === room.ID
                              ? "text-slate-400"
                              : "text-transparent group-hover:text-slate-400"
                          }`}
                          title="เปิดในหน้าแยก"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {room.detail}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white">
          <div className="h-16 md:h-20 border-b border-slate-200/60 px-4 md:px-6 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur-sm">
            {currentRoom ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                    <Hash size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">
                      {currentRoom.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-slate-500">Live</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleOpenSubChat(e, currentRoom.ID)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
                  title="ขยายเต็มจอ / เปิดหน้าแยก"
                >
                  <ExternalLink size={20} />
                </button>
              </div>
            ) : (
              <div className="text-slate-400">เลือกห้องเพื่อเริ่มแชท</div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-50/50 to-slate-100/30">
            <div className="flex flex-col space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex w-full mb-4 group ${
                    msg.isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {!msg.isMe && (
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 border border-slate-200 bg-white self-end group">
                      <img
                        src={getAvatar(msg)}
                        alt="sender"
                        className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-110"
                        onClick={() => handleVisitProfile(msg)}
                        title={`ดูโปรไฟล์ของ ${msg.user_name}`}
                      />
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-[70%] ${
                      msg.isMe ? "items-end" : "items-start"
                    }`}
                  >
                    {!msg.isMe && (
                      <span
                        onClick={() => handleVisitProfile(msg)}
                        className="text-[10px] text-slate-500 ml-1 mb-1 cursor-pointer hover:text-slate-900 hover:underline"
                      >
                        {msg.user_name}
                      </span>
                    )}

                    <div className="relative">
                      {canDeleteMessage(msg) && (
                        <button
                          onClick={() => handleDeleteMessage(msg.ID)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                          title="ลบข้อความ"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <div
                        className={`${
                          msg.body === "[DELETED]"
                            ? "px-4 py-2.5 text-sm shadow-md relative break-words rounded-2xl transition-all bg-slate-100 text-slate-500 border border-slate-200"
                            : isImage(msg.body)
                            ? "relative"
                            : msg.isMe
                            ? "px-4 py-2.5 text-sm shadow-md relative break-words rounded-2xl transition-all bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-br-none shadow-lg"
                            : "px-4 py-2.5 text-sm shadow-md relative break-words rounded-2xl transition-all bg-white text-slate-800 border border-slate-200/60 rounded-bl-none hover:shadow-lg"
                        }`}
                      >
                        {isImage(msg.body) ? (
                          <img
                            src={getImageUrl(msg.body)}
                            alt="sent image"
                            className="max-w-[250px] h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-lg"
                            onClick={() =>
                              setViewingImage(getImageUrl(msg.body))
                            }
                          />
                        ) : msg.body.startsWith("http") ||
                          msg.body.startsWith("upload/") ? (
                          <a
                            href={getImageUrl(msg.body)}
                            target="_blank"
                            rel="noreferrer"
                            className={`flex items-center gap-3 p-1 no-underline ${
                              msg.isMe ? "text-white" : "text-slate-900"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-full ${
                                msg.isMe ? "bg-white/20" : "bg-slate-200"
                              }`}
                            >
                              <FileText
                                size={20}
                                className={
                                  msg.isMe ? "text-white" : "text-slate-600"
                                }
                              />
                            </div>
                            <div className="flex flex-col overflow-hidden text-left">
                              <span className="font-medium truncate max-w-[150px] underline">
                                {getFileName(msg.body)}
                              </span>
                              <span
                                className={`text-[10px] ${
                                  msg.isMe ? "text-slate-100" : "text-slate-400"
                                }`}
                              >
                                คลิกเพื่อดาวน์โหลด
                              </span>
                            </div>
                          </a>
                        ) : (
                          <span
                            className={msg.body === "[DELETED]" ? "italic" : ""}
                          >
                            {msg.body === "[DELETED]"
                              ? msg.isMe
                                ? "คุณลบข้อความ"
                                : `${msg.user_name.split(" ")[0]} ลบข้อความ`
                              : msg.body}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${
                        msg.isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.Created_At).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {msg.isMe && (
                        <CheckCheck size={12} className="text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/60 shadow-lg">
            <form
              onSubmit={handleSendMessage}
              className="flex items-end gap-2 bg-gradient-to-r from-slate-50 to-slate-100/50 p-2 rounded-2xl border border-slate-200/80 shadow-sm"
            >
              <div className="flex gap-1 pb-2 pl-2">
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:bg-slate-200 rounded-full disabled:opacity-50"
                  disabled={isUploading}
                >
                  <Paperclip size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:bg-slate-200 rounded-full disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ImageIcon size={20} />
                  )}
                </button>
              </div>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={currentRoom ? `ส่งข้อความ...` : "เลือกห้อง..."}
                disabled={!currentRoom}
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 py-2.5 resize-none disabled:bg-slate-100"
                rows={1}
              />

              <div className="flex gap-1 pb-2 pr-2">
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className={`p-2.5 rounded-xl shadow-lg transition-all duration-200 ${
                    inputValue.trim()
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img
            src={viewingImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
