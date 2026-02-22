import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  ArrowLeft,
  Loader2,
  FileText,
  Hash,
  CheckCheck,
  X,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { Message } from "@/interfaces/chat";
import type { User } from "@/interfaces/user";
import {
  getChatHistory,
  getChatRooms,
  deleteMessage,
} from "@/services/chatService";
import { getMyProfile } from "@/services/profileService";
import apiClient, { WS_URL } from "@/services/apiClient";
import { getImageUrl } from "@/utils/imageUtils";

export default function StudentCommunicationChat() {
  const { postID } = useParams<{ postID: string }>();
  const navigate = useNavigate();
  const chatRoomId = Number(postID);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const myUserIDRef = useRef<number>(0);
  const [roomTitle, setRoomTitle] = useState("Loading...");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [myProfile, setMyProfile] = useState<User | null>(null);
  const [wsStatus, setWsStatus] = useState<"CONNECTING" | "OPEN" | "CLOSED">(
    "CLOSED"
  );
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
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

  const isImage = (body: string) =>
    body &&
    (body.startsWith("http") || body.startsWith("upload/")) &&
    /\.(jpeg|jpg|gif|png)$/i.test(body);

  const getFileName = (url: string) => {
    try {
      return (
        url
          .substring(url.lastIndexOf("/") + 1)
          .split("_")
          .slice(1)
          .join("_") || "File"
      );
    } catch {
      return "Attached File";
    }
  };

  const canDeleteMessage = (msg: Message): boolean => {
    if (!msg.isMe || msg.body === "[DELETED]") return false;

    const messageTime = new Date(msg.Created_At).getTime();
    const now = Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    return now - messageTime <= fifteenMinutes;
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

  useEffect(() => {
    const initData = async () => {
      try {
        const res = await getMyProfile();
        const user = res.data;

        if (user) {
          setMyProfile(user);
          const id = Number(user.id || user.sut_id);
          myUserIDRef.current = id;
        }
        const rooms = await getChatRooms();
        const currentRoom = rooms.find((r) => r.ID === chatRoomId);
        setRoomTitle(currentRoom ? currentRoom.title : "Chat Room");
      } catch (error) {
        console.error("Error init data:", error);
      } finally {
        setIsProfileLoaded(true);
      }
    };

    if (token) initData();
  }, [chatRoomId, token]);

  useEffect(() => {
    if (!token || !chatRoomId || !isProfileLoaded) return;

    const loadHistory = async () => {
      try {
        const history = await getChatHistory(chatRoomId);
        const currentID = myUserIDRef.current;

        const formatted = history.map((msg) => ({
          ...msg,
          isMe: currentID !== 0 ? Number(msg.user_id) === currentID : false,
        }));

        setMessages(formatted);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error loading history:", error);
      }
    };
    loadHistory();
    setWsStatus("CONNECTING");

    const ws = new WebSocket(`${WS_URL}/${chatRoomId}?token=${token}`);

    ws.onopen = () => setWsStatus("OPEN");
    ws.onerror = () => setWsStatus("CLOSED");
    ws.onclose = () => setWsStatus("CLOSED");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const msgDate =
          data.created_at || data.CreatedAt || new Date().toISOString();
        const currentID = myUserIDRef.current;
        const avatarUrl = getImageUrl(data.user_avatar);
        if (data.type === "delete" && data.ID) {
          setMessages((prev) =>
            prev.map((m) =>
              m.ID === data.ID ? { ...m, body: "[DELETED]" } : m
            )
          );
          return;
        }

        const incomingMsg: Message = {
          ID: data.ID || Date.now(),
          body: data.body,
          user_id: data.user_id,
          user_name: data.user_name,
          user_avatar: avatarUrl,
          Created_At: msgDate,
          chat_room_id: data.chat_room_id,
          isMe: currentID !== 0 ? Number(data.user_id) === currentID : false,
          sut_id: data.sut_id,
        };

        setMessages((prev) => [...prev, incomingMsg]);
        setTimeout(scrollToBottom, 50);
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    setSocket(ws);
    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [chatRoomId, token, isProfileLoaded]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ body: inputValue, type: "text" }));
      setInputValue("");
    }
  };

  const handleUpload = async (file: File, type: "image" | "file") => {
    if (type === "image" && file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์รูปภาพต้องไม่เกิน 5MB");
      return;
    }
    if (type === "file" && file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์เอกสารต้องไม่เกิน 10MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append(type === "image" ? "image" : "file", file);
    try {
      const endpoint = `/chat/upload${type === "file" ? "/file" : ""}`;
      const res = await apiClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const url = res.data?.url || res.data?.data?.url || res.data;

      if (url && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ body: url, type }));
      }
    } catch (e) {
      toast.error("อัปโหลดไม่สำเร็จ");
      console.error(e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/gif"
        onChange={(e) =>
          e.target.files?.[0] && handleUpload(e.target.files[0], "image")
        }
      />
      <input
        type="file"
        ref={docInputRef}
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && handleUpload(e.target.files[0], "file")
        }
      />

      <div className="h-16 md:h-20 border-b border-slate-200/60 px-4 md:px-6 flex items-center gap-3 flex-shrink-0 bg-white/90 backdrop-blur-md shadow-sm z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-900 shadow-md">
            <Hash size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg"> {roomTitle}</h3>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  wsStatus === "OPEN"
                    ? "bg-green-500 animate-pulse"
                    : "bg-slate-400"
                }`}
              ></div>
              <span className="text-xs text-slate-500">
                {wsStatus === "OPEN" ? "Live" : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-slate-50/50 to-slate-100/30">
        {!isProfileLoaded ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : (
          <div className="flex flex-col space-y-4 pb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full mb-2 group ${
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
                  className={`flex flex-col max-w-[75%] ${
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
                          alt="content"
                          className="max-w-[250px] h-auto rounded-2xl cursor-pointer hover:opacity-95 transition-all shadow-lg"
                          onClick={() => setViewingImage(getImageUrl(msg.body))}
                        />
                      ) : msg.body.startsWith("http") ||
                        msg.body.startsWith("upload/") ? (
                        <a
                          href={getImageUrl(msg.body)}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-3 no-underline ${
                            msg.isMe ? "text-white" : "text-slate-900"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              msg.isMe ? "bg-white/20" : "bg-slate-200"
                            }`}
                          >
                            <FileText size={20} />
                          </div>
                          <div className="overflow-hidden text-left">
                            <div className="truncate font-medium underline max-w-[150px]">
                              {getFileName(msg.body)}
                            </div>
                            <div
                              className={`text-[10px] ${
                                msg.isMe ? "text-slate-100" : "text-slate-400"
                              }`}
                            >
                              คลิกเพื่อดาวน์โหลด
                            </div>
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
                      {msg.Created_At &&
                      !isNaN(new Date(msg.Created_At).getTime())
                        ? new Date(msg.Created_At).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Just now"}
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
        )}
      </div>

      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/60 sticky bottom-0 z-10 shadow-2xl">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-end gap-2 bg-gradient-to-r from-slate-50 to-slate-100/50 p-2 rounded-2xl border border-slate-200/80 shadow-md"
        >
          <div className="flex gap-1 pb-1 pl-1">
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={isUploading || !isProfileLoaded}
              className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
            >
              <Paperclip size={20} />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !isProfileLoaded}
              className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
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
            placeholder={
              wsStatus === "OPEN" ? "ส่งข้อความ..." : "กำลังเชื่อมต่อ..."
            }
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 max-h-32 focus:outline-none text-slate-700"
            rows={1}
            disabled={!isProfileLoaded || wsStatus !== "OPEN"}
          />

          <div className="pb-1 pr-1">
            <button
              type="submit"
              disabled={!inputValue.trim() || wsStatus !== "OPEN"}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                inputValue.trim() && wsStatus === "OPEN"
                  ? "bg-primary text-white shadow-md hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
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
