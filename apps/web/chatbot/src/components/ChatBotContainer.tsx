import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatButton from "./ChatButton";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../styles/chatbot.css"; // ⬅️ Import do novo estilo

export type Message = {
  text: string;
  from: "user" | "bot";
};

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { text: input, from: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();

      const botMessage: Message = { text: data.response, from: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { text: "Erro ao enviar mensagem", from: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <p>Chatbox</p>
          <div className="status">
            <div className="status-dot" />
            Online
          </div>
        </div>
        <Link to="/"><ArrowLeft className="h-6" /></Link>
      </div>

      {/* Área de mensagens */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="chat-input-area">
        <ChatInput text={input} onChange={setInput} onSend={handleSend} />
        <ChatButton
          input={input}
          setInput={setInput}
          messages={messages}
          setMessages={setMessages}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}