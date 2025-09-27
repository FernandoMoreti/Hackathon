import { type Dispatch, type SetStateAction } from "react";

export type Message = {
  text: string;
  from: "user" | "bot";
};

type ChatButtonProps = {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onSend?: () => void; 
};

export default function ChatButton({
  input,
  setInput,
  messages,
  setMessages,
  onSend,
}: ChatButtonProps) {
  const handleClick = () => {
    if (!input.trim()) return;

    const newMessage: Message = { text: input, from: "user" };
    setMessages([...messages, newMessage]);
    setInput("");

    setTimeout(() => {
      const chatDiv = document.getElementById("chat-messages");
      chatDiv?.scrollTo(0, chatDiv.scrollHeight);
    }, 100);

    if (onSend) onSend();
  };

  return (
    <button
      onClick={handleClick}
      className="bg-black text-white p-3 flex items-center justify-center rounded hover:bg-gray-800 transition"
    >
      ➤
    </button>
  );
}
