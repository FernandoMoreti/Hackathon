import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";

type Sender = "user" | "bot";

export type Message = {
  text: string;
  from: Sender;
  procedimento?: string | null;
  status?: string | null;
  protocolo?: string | null;
  dataSolicitacao?: Date | null;
  retornoPrevisto?: Date | null;
};

type ServerMsg = {
  mensagem: string;
  status?: string;
  procedimento?: string;
  protocolo?: string;
  prazo_retorno?: string;
  data_solicitacao?: string;
};

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d?: Date | null) {
  if (!d) return "-";
  try {
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch {
    return "-";
  }
}

function normalizeStatus(s?: string | null) {
  if (!s) return null;
  const v = s.toLowerCase();
  if (v.includes("autorizado")) return "autorizado_imediato";
  if (v.includes("negado")) return "negado_sem_cobertura";
  if (v.includes("auditor")) return "em_auditoria";
  return s;
}

function parseFromMensagem(raw: string) {
  const procMatch = raw.match(/"([^"]+)"/);
  const procedimento = procMatch?.[1] || null;

  const protoMatch = raw.match(/Protocolo.*?:\s*([A-Z0-9\-]+)/i);
  const protocolo = protoMatch?.[1] || null;

  let status: string | null = null;
  const isOPME = /OPME/i.test(raw);
  const isAuditoria = /auditoria/i.test(raw) || (!isOPME && /retorno em até 10/i.test(raw));

  // 👇 status deve ser em_auditoria mesmo se OPME
  if (/autorizado/i.test(raw)) status = "autorizado_imediato";
  else if (/negado/i.test(raw) || /sem cobertura/i.test(raw)) status = "negado_sem_cobertura";
  else if (/auditoria/i.test(raw) || isOPME) status = "em_auditoria";

  return { procedimento, protocolo, status, isOPME, isAuditoria };
}

function toRichBotMessage(item: ServerMsg): Message {
  const now = new Date();

  let procedimento = item.procedimento ?? null;
  let protocolo = item.protocolo ?? null;
  let status = normalizeStatus(item.status ?? null);
  let retornoPrevisto: Date | null = null;

  const parsed = parseFromMensagem(item.mensagem || "");
  procedimento = procedimento || parsed.procedimento;
  protocolo = protocolo || parsed.protocolo;
  status = status || parsed.status;

  // Gera protocolo se ainda estiver faltando
  if (!protocolo) {
    protocolo = `${Math.floor(Math.random() * 100000000000)}`;
  }

  // Calcular retorno baseado em OPME ou auditoria
  if (!retornoPrevisto && status === "em_auditoria") {
    if (parsed.isOPME) retornoPrevisto = addDays(now, 10);
    else if (parsed.isAuditoria) retornoPrevisto = addDays(now, 5);
  }

  // Usar prazo explícito se enviado pela API
  if (!retornoPrevisto && item.prazo_retorno) {
    const d = new Date(item.prazo_retorno + "T00:00:00");
    if (!isNaN(d.getTime())) retornoPrevisto = d;
  }

  const dataSolicitacao = item.data_solicitacao
    ? new Date(item.data_solicitacao + "T00:00:00")
    : now;

  return {
    text: item.mensagem || "",
    from: "bot",
    procedimento: procedimento || null,
    status: parsed.isOPME ? "OPME" : status, // ← aqui mostramos OPME se necessário
    protocolo,
    dataSolicitacao,
    retornoPrevisto,
  };
}


export default function ChatAuditoria() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendText = async () => {
    if (!input.trim() || sending) return;

    const userMessage: Message = { text: input, from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const resp = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.text }),
      });
      const data = await resp.json();
      const botMessage: Message = { text: data.response, from: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: "⚠️ Erro ao enviar mensagem", from: "bot" }]);
    } finally {
      setSending(false);
    }
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setPdfFile(e.target.files[0]);
  };

  const handleSendPdf = async () => {
    if (!pdfFile || sending) return;

    const userMessage: Message = { text: `📎 PDF enviado: ${pdfFile.name}`, from: "user" };
    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    setSending(true);
    try {
      const response = await fetch("http://localhost:8000/pdf/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      const novas: Message[] = Array.isArray(data?.mensagens)
        ? data.mensagens.map((m: ServerMsg) => toRichBotMessage(m))
        : [{ text: "⚠️ Resposta inesperada do servidor.", from: "bot" }];

      setMessages((prev) => [...prev, ...novas]);
      setPdfFile(null);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: "⚠️ Erro ao enviar PDF", from: "bot" }]);
    } finally {
      setSending(false);
    }
  };

  const handlePrimaryAction = () => {
    if (pdfFile) handleSendPdf();
    else handleSendText();
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden text-black h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b border-black font-semibold">
        <p>Chat de Auditoria</p>
        <Link to="/"><ArrowLeft className="h-6" /></Link>
      </div>

      {/* Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-2 rounded-lg text-sm ${
              msg.from === "user"
                ? "bg-gray-200 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            {/* Texto direto ou card estruturado */}
            {msg.from === "bot" && (msg.procedimento || msg.status || msg.protocolo || msg.dataSolicitacao || msg.retornoPrevisto) ? (
              <div className="flex flex-col gap-1 text-xs">
                {msg.procedimento && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Procedimento</span>
                    <span className="font-medium">{msg.procedimento}</span>
                  </div>
                )}
                {msg.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">
                      {msg.status === "autorizado_imediato" && "Autorizado imediato"}
                      {msg.status === "em_auditoria" && "Em auditoria"}
                      {msg.status === "negado_sem_cobertura" && "Negado (sem cobertura)"}
                      {!["autorizado_imediato","em_auditoria","negado_sem_cobertura"].includes(msg.status) && msg.status}
                    </span>
                  </div>
                )}
                {msg.protocolo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Protocolo</span>
                    <span className="font-mono">{msg.protocolo}</span>
                  </div>
                )}
                {msg.dataSolicitacao && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Solicitação</span>
                    <span>{formatDate(msg.dataSolicitacao)}</span>
                  </div>
                )}
                {msg.retornoPrevisto && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Retorno previsto</span>
                    <span>{formatDate(msg.retornoPrevisto)}</span>
                  </div>
                )}
              </div>
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>


      {/* Input + Botão + Upload */}
      <div className="p-4 border-t border-black flex gap-2 items-center">
        <label className="cursor-pointer text-gray-500 hover:text-black">
          <Paperclip size={20} />
          <input type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
        </label>

        <input
          type="text"
          placeholder="Digite sua mensagem..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePrimaryAction()}
          disabled={sending && !pdfFile}
        />

        <button
          onClick={handlePrimaryAction}
          className="bg-black text-white px-3 py-2 rounded-lg flex items-center justify-center disabled:opacity-60"
          disabled={sending}
          title={pdfFile ? "Enviar PDF" : "Enviar mensagem"}
        >
          <Send size={18} />
        </button>

      
      </div>

      {pdfFile && (
        <p className="text-xs text-gray-500 px-4 pb-2">
          PDF selecionado: {pdfFile.name}
        </p>
      )}
    </div>
  );
}
