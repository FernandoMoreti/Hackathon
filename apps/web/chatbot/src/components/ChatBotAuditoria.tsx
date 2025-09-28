import { useState, useRef, useEffect, ChangeEvent } from "react";
import ChatInput from "./ChatInput";
import ChatButton from "./ChatButton";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export type Message = {
  text: string;
  from: "user" | "bot";
};

export default function ChatAuditoria() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Envia mensagem de texto
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
      setMessages(prev => [...prev, { text: "Erro ao enviar mensagem", from: "bot" }]);
    }
  };

  // Seleção de arquivo PDF
  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Envia PDF
  const handleSendPdf = async () => {
    if (!pdfFile) return;

    const userMessage: Message = { text: `Enviou PDF: ${pdfFile.name}`, from: "user" };
    setMessages(prev => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
        const response = await fetch("http://localhost:8000/pdf/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        // Para cada parágrafo, adiciona como mensagem do bot
        const novasMensagens: Message[] = data.paragrafos.map((p: string) => ({
            text: p,
            from: "bot"
        }));

        setMessages(prev => [...prev, ...novasMensagens]);
        setPdfFile(null);
    } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { text: "Erro ao enviar PDF", from: "bot" }]);
    }
  };


  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden text-black h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 font-semibold">
        <p>Chatbox</p>
        <Link to="/" ><ArrowLeft className="h-8"></ArrowLeft></Link>
      </div>

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

      <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input type="file" accept="application/pdf" onChange={handlePdfChange} />
          <button 
            onClick={handleSendPdf} 
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Enviar PDF
          </button>
        </div>
      </div>
    </div>
  );
}
