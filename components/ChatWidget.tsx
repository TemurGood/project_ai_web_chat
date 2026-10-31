"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import Avatar from "./Avatar";
import Background3D from "./Background3D";
import VoiceInput from "./VoiceInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isRippling, setIsRippling] = useState(true);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Здравствуйте! Я виртуальный консультант по медицинским товарам MedChat. Помогу выбрать тонометр, ингалятор, ортопедию или другие товары. Чем могу помочь?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Скролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Логика пульсации (рябь при загрузке и каждые 5 секунд, если не нажимали)
  useEffect(() => {
    if (hasOpened) {
      setIsRippling(false);
      return;
    }

    // Первоначальная пульсация 2.5 секунды
    const initialTimer = setTimeout(() => {
      setIsRippling(false);
    }, 2500);

    // Запуск ряби каждые 5 секунд
    const interval = setInterval(() => {
      if (!hasOpened) {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 2500);
      }
    }, 5000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [hasOpened]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setHasOpened(true);
    setIsRippling(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Сбой сети. Проверьте соединение с интернетом.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Окно чата */}
      {isOpen && (
        <div className="relative mb-4 w-[92vw] sm:w-[380px] h-[550px] bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden transition-all duration-300">
          
          {/* 3D фон на Three.js */}
          <Background3D />

          {/* Шапка чата */}
          <div className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <Avatar size={40} />
              <div>
                <h3 className="font-semibold text-sm leading-tight">MedChat AI</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Консультант онлайн
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              title="Закрыть"
            >
              <X size={20} />
            </button>
          </div>

          {/* Область сообщений */}
          <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && <Avatar size={28} className="mt-1" />}
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : "bg-white/90 text-gray-800 rounded-bl-none shadow-sm border border-gray-100 backdrop-blur-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-gray-500 bg-white/80 w-fit px-3 py-1.5 rounded-full border border-gray-100 backdrop-blur-sm">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                <span>Консультант печатает...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Нижняя панель ввода */}
          <div className="relative z-10 p-3 bg-white/90 border-t border-gray-200/60 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Голосовой ввод */}
              <VoiceInput
                onTranscript={(transcript) => {
                  setInputMessage(transcript);
                  handleSendMessage(transcript);
                }}
                disabled={isLoading}
              />

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Задайте вопрос о товаре..."
                className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Отправить"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Кнопка вызова чата (с анимацией ряби) */}
      <button
        onClick={isOpen ? () => setIsOpen(false) : handleOpenChat}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${
          isRippling && !isOpen ? "ripple-effect" : ""
        }`}
        title="Открыть чат с консультантом"
      >
        {isOpen ? <X size={26} /> : <Avatar size={48} />}
      </button>
    </div>
  );
}