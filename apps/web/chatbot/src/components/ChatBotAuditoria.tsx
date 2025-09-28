import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import "../styles/chatbot.css"; // ⬅️ Import do novo estilo

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
  if (/autorizado/i.test(raw)) status = "autorizado_imediato";
  else if (/negado/i.test(raw) || /sem cobertura/i.test(raw)) status = "negado_sem_cobertura";
  else if (/auditoria/i.test(raw) || /OPME/i.test(raw)) status = "em_auditoria";

  const isOPME = /OPME/i.test(raw);
  const isAuditoria = /auditoria/i.test(raw) || (!isOPME && /retorno em até 5/i.test(raw));

  return { procedimento, protocolo, status, isOPME, isAuditoria };
}

function toRichBotMessage(item: ServerMsg): Message {
  const now = new Date();

  let procedimento = item.procedimento ?? null;
  let protocolo = item.protocolo ?? null;
  let status = normalizeStatus(item.status ?? null);
  let retornoPrevisto: Date | null = null;

  if (item.prazo_retorno) {
    const d = new Date(item.prazo_retorno + "T00:00:00");
    if (!isNaN(d.getTime())) retornoPrevisto = d;
  }

  if (!procedimento || !status || !protocolo || !retornoPrevisto) {
    const parsed = parseFromMensagem(item.mensagem || "");
    procedimento = procedimento || parsed.procedimento;
    protocolo = protocolo || parsed.protocolo;
    status = status || parsed.status;

    if (!retornoPrevisto && status === "em_auditoria") {
      if (parsed.isOPME) retornoPrevisto = addDays(now, 10);
      else if (parsed.isAuditoria) retornoPrevisto = addDays(now, 5);
    }
  }

  const dataSolicitacao = item.data_solicitacao
    ? new Date(item.data_solicitacao + "T00:00:00")
    : now;

  return {
    text: item.mensagem || "",
    from: "bot",
    procedimento: procedimento || null,
    status: status || null,
    protocolo: protocolo || null,
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
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <p>Chat de Auditoria</p>
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
            {msg.from === "user" && <div>{msg.text}</div>}

            {msg.from === "bot" && (msg.procedimento || msg.status || msg.protocolo || msg.dataSolicitacao || msg.retornoPrevisto) ? (
              <div className="chat-card">
                {msg.procedimento && (
                  <div><span>Procedimento</span><span>{msg.procedimento}</span></div>
                )}
                {msg.status && (
                  <div>
                    <span>Status</span>
                    <span>
                      {msg.status === "autorizado_imediato" && "Autorizado imediato"}
                      {msg.status === "em_auditoria" && "Em auditoria"}
                      {msg.status === "negado_sem_cobertura" && "Negado (sem cobertura)"}
                      {!["autorizado_imediato","em_auditoria","negado_sem_cobertura"].includes(msg.status || "") && msg.status}
                    </span>
                  </div>
                )}
                {msg.protocolo && (
                  <div><span>Protocolo</span><span className="font-mono">{msg.protocolo}</span></div>
                )}
                {msg.dataSolicitacao && (
                  <div><span>Solicitação</span><span>{formatDate(msg.dataSolicitacao)}</span></div>
                )}
                {msg.retornoPrevisto && (
                  <div><span>Retorno previsto</span><span>{formatDate(msg.retornoPrevisto)}</span></div>
                )}
              </div>
            ) : (
              msg.from === "bot" && <div>{msg.text}</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      <div className="chat-input-area">
        <label className="chat-attachment" title="Enviar PDF">
          <Paperclip size={20} />
          <input type="file" accept="application/pdf" onChange={handlePdfChange} hidden />
        </label>

        <input
          className="chat-input"
          type="text"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handlePrimaryAction()}
          disabled={sending && !pdfFile}
        />

        <button
          onClick={handlePrimaryAction}
          className="chat-button"
          disabled={sending}
          title={pdfFile ? "Enviar PDF" : "Enviar mensagem"}
        >
          <Send size={18} />
        </button>
      </div>

      {pdfFile && (
        <div style={{ fontSize: "0.75rem", color: "gray", marginLeft: "1rem" }}>
          PDF selecionado: {pdfFile.name}
        </div>
      )}
    </div>
  );
}
