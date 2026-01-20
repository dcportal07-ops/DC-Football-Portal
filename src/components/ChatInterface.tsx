"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Send, Hash, Users, Crown, ShieldCheck, Menu, X, Search } from "lucide-react";
import { sendMessage, getChatMessages } from "@/lib/actions";
import { Button } from "./ui/button";

// 🔥 CUSTOM "DUMB" INPUT COMPONENT (Visuals only, no URL logic)
const ChatInput = ({ value, onChange, onKeyDown, placeholder }: any) => {
  return (
    <div className="flex-1 bg-white rounded-full shadow-sm flex items-center gap-2 px-4 py-2 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 transition-all">
      <Search className="w-4 h-4 text-slate-400" />
      <input
        className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default function ChatInterface({ currentUser, conversationId, initialMessages }: any) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);
  const [inputText, setInputText] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // 2. Real-time Polling (Safe Version)
  useEffect(() => {
    // Only poll if the tab is visible to save resources
    if (document.hidden) return;

    const interval = setInterval(async () => {
      if (conversationId) {
        try {
          const latestMessages = await getChatMessages(conversationId);
          setMessages((prev) => {
            // Only update state if count is different to prevent re-renders
            if (latestMessages.length !== prev.length) return latestMessages;
            return prev;
          });
        } catch (error) {
          console.error("Polling error:", error);
        }
      }
    }, 4000); // Increased to 4s to reduce network load

    return () => clearInterval(interval);
  }, [conversationId]);


  const handleSend = async () => {
    if (!inputText.trim()) return;

    const optimisticMsg = {
      id: Date.now().toString(),
      content: inputText,
      senderId: currentUser.id,
      createdAt: new Date(),
      sender: currentUser,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("senderId", currentUser.id);
    formData.append("content", optimisticMsg.content);

    await sendMessage(formData);
  };

  const getMessageStyles = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-slate-900 text-white border border-slate-700 shadow-md";
      case "COACH": return "bg-blue-600 text-white shadow-md";
      case "PLAYER": default: return "bg-teal-100 text-orange-800 border border-teal-200";
    }
  };

  return (
    <div className="flex h-[85vh] w-full bg-[#E5E5E5] border border-slate-300 rounded-xl shadow-xl overflow-hidden font-sans relative">

      {/* === MOBILE OVERLAY === */}
      {isMobileMenuOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* === LEFT SIDEBAR === */}
      <div className={`
        absolute inset-y-0 left-0 z-50 w-72 bg-white flex flex-col border-r border-slate-200 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-slate-700">DCWay Portal</h2>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Online
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-2 space-y-1">
          <p className="text-xs font-bold text-slate-400 px-2 mb-2 uppercase tracking-wide">Channels</p>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium border border-slate-200 shadow-sm"
          >
            <Hash className="w-4 h-4 text-slate-500" />
            general
          </button>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-300 overflow-hidden relative border border-slate-200">
            {currentUser.photo ? (
              <img src={currentUser.photo} alt="Me" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-sm">
                {currentUser.name?.[0]}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</div>
            <div className="text-[10px] text-slate-500 truncate font-mono">@{currentUser.userCode}</div>
          </div>
        </div>
      </div>

      {/* === MAIN CHAT AREA === */}
      <div className="flex-1 flex flex-col bg-[#EFE7DD] w-full min-w-0">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 shadow-sm z-10 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1 text-slate-600 hover:bg-slate-100 rounded"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-100 rounded-full flex items-center justify-center">
                <Hash className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 leading-tight text-sm md:text-base">general</h3>
                <p className="text-[10px] md:text-xs text-slate-500">Community Chat</p>
              </div>
            </div>
          </div>
          <Users className="w-5 h-5 text-slate-400" />
        </div>

        {/* Messages Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

            return (
              <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                {!isMe && (
                  <div className="w-8 flex-shrink-0 mr-2 flex flex-col items-center">
                    {showAvatar ? (
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shadow-sm">
                        {msg.sender?.photo ? (
                          <img src={msg.sender.photo} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-500">
                            {msg.sender?.name?.[0]}
                          </div>
                        )}
                      </div>
                    ) : <div className="w-8" />}
                  </div>
                )}
                <div className={`max-w-[85%] md:max-w-[70%] relative group`}>
                  {!isMe && showAvatar && (
                    <div className="flex items-center gap-1 mb-1 ml-1">
                      <span className="text-xs font-bold text-slate-600">{msg.sender?.name}</span>
                      {msg.sender?.role === "COACH" && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-100" />}
                      {msg.sender?.role === "ADMIN" && <ShieldCheck className="w-3 h-3 text-slate-800 fill-slate-200" />}
                    </div>
                  )}
                  <div className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl shadow-sm text-sm md:text-[15px] leading-snug break-words ${getMessageStyles(msg.sender?.role)} ${isMe ? "rounded-tr-sm" : "rounded-tl-sm"}`}>
                    {msg.content}
                  </div>
                  <div className={`text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-right mr-1" : "text-left ml-1"}`}>
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* === INPUT AREA === */}
        <div className="p-3 bg-[#F0F2F5] border-t border-slate-200">
          <div className="bg-white rounded-2xl flex items-center px-4 py-2 shadow-sm border border-slate-200 focus-within:border-blue-400 transition-colors">
            <button className="p-1 mr-2 text-slate-400 hover:text-slate-600">
              <span className="text-xl leading-none mb-1 block">+</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} variant="ghost" size="sm" className="ml-1 hover:bg-slate-100 rounded-full w-10 h-10 p-0 flex items-center justify-center">
              <Send className="w-5 h-5 text-slate-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
