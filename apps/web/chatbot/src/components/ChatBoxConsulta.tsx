import { useState, useRef, useEffect } from "react";
import ChatInput from "./ChatInput";
import ChatButton from "./ChatButton";
import { Link } from "react-router-dom"

import { ArrowLeft } from "lucide-react";

export type Message = {
  text: string;
  from: "user" | "bot";
};

type Step =
  | "cpf"
  | "especialidade"
  | "medico"
  | "data"
  | "confirmacao"
  | "finalizado";

export default function ChatAgendamento() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Olá! Informe seu CPF para continuar:", from: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("cpf");

  const [cpf, setCpf] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [medico, setMedico] = useState("");
  const [medicos, setMedicos] = useState([])
  const [medicoId, setMedicoId] = useState("");
  const [data, setData] = useState("");
  const [datas, setDatas] = useState([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text: string) =>
    setMessages((prev) => [...prev, { text, from: "bot" }]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Mensagem do usuário
    const userMessage: Message = { text: input, from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    const value = input.trim();
    setInput("");

    switch (step) {
      case "cpf":
        setCpf(value);
        try {
          const resp = await fetch(
            `http://localhost:8000/beneficiario?cpf=${value}`
          );
          const data = await resp.json();

          if (!data || !data.user) {
            addBotMessage("CPF inválido, tente novamente.");
            return;
          }
          
          addBotMessage("CPF validado");
          addBotMessage("Escolha uma especialidade:");

          data.data.forEach((especialidade: { name: string; id: string }) => {
            addBotMessage(`${especialidade.id} - ${especialidade.name}`);
          });

          setEspecialidades(data.data)
          setPacienteId(data.user);

          setStep("especialidade");
        } catch (err) {
          console.error(err);
          addBotMessage("Erro ao validar CPF.");
        }
        break;

      case "especialidade":
        setEspecialidade(especialidades[value - 1].name);
        try {
          const res = await fetch(`http://localhost:8000/especialidade?codigo=${value}`);
          const data = await res.json();

          setMedicos(data.data)

          addBotMessage("Selecione o médico: ")
          data.data.map((m: { name: string; id: string }, i) => addBotMessage(`${i + 1} - ${m.name}`));
          setStep("medico");
        } catch (err) {
          console.error(err);
          addBotMessage("Erro ao buscar médicos.");
        }
        break;

      case "medico":
        setMedico(medicos[value - 1].name);
        setMedicoId(medicos[value - 1].id);
        try {
          const res = await fetch(`http://localhost:8000/disponibilidade?medicoId=${medicos[value - 1].id}`);
          const data = await res.json();

          setDatas(data.datasDisponiveis)

          addBotMessage(`Escolha uma data disponível: `)
          addBotMessage(data.datasDisponiveis.map((d: string, i) => addBotMessage(`${i + 1} - ${d}`)));
          setStep("data");
        } catch (err) {
          console.error(err);
          addBotMessage("Erro ao buscar datas.");
        }
        break;

      case "data":
        setData(datas[value - 1]);
        addBotMessage(
          `Confirma sua consulta com ${medico}, em ${datas[value - 1]}, na especialidade ${especialidade}? (Responda "sim" ou "não")`
        );
        setStep("confirmacao");
        break;

      case "confirmacao":
        if (value.toLowerCase() === "sim") {
          try {
            await fetch("http://localhost:8000/agendar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                medicoId,
                pacienteId,
                dataEscolhida: data,
              }),
            });
            addBotMessage("✅ Consulta agendada com sucesso!");
            setStep("finalizado");
          } catch (err) {
            console.error(err);
            addBotMessage("Erro ao agendar.");
          }
        } else {
          addBotMessage("Ok, escolha outra data.");
          setStep("data");
        }
        setStep("cpf")
        addBotMessage("Insira um novo CPF caso queira uma nova consulta: ")
        break;
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden text-black h-screen">
      <div className="flex  items-center justify-between p-4 border-b border-black font-semibold">
        <p>Chatbox</p>
        <Link to="/" ><ArrowLeft className="h-8"></ArrowLeft></Link>
      </div>


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
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-black flex gap-2">
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
