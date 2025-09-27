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

  
  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = { text: input, from: "user" };
    setMessages([...messages, newMessage]);
    setInput("");
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
