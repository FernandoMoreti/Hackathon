import { useState } from "react";
import ChatContainer from "./components/ChatBoxContainer";

interface Message {
  from: "user" | "bot";
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { from: "user", text },
      { from: "bot", text: "Recebi: " + text },
    ]);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-50 p-4 ">
      <div className="w-full flex justify-around">
        <ChatContainer messages={messages} onSend={sendMessage} />
        <ChatContainer messages={messages} onSend={sendMessage} />
        <ChatContainer messages={messages} onSend={sendMessage} />
      </div>
    </div>
  );
}

export default App;
