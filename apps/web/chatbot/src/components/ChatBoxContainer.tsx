import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatButton  from "./ChatButton";

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

    // Mensagem do usuário
    const userMessage: Message = { text: input, from: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await response.json();

      console.log(data)

      // Mensagem do bot
      const botMessage: Message = { text: data.response, from: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = { text: "Erro ao enviar mensagem", from: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden text-black h-screen">
      <div className="p-4 border-b border-gray-200 font-semibold">Chatbox</div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-2 rounded-lg text-sm ${
              msg.from === "user" ? "bg-gray-200 self-end" : "bg-gray-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
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
