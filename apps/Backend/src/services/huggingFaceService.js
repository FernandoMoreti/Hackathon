// src/services/huggingFaceService.js
require("dotenv").config();
const { InferenceClient } = require("@huggingface/inference");
const { retrieve } = require("./retriever");

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const client = new InferenceClient(HF_API_KEY);

// Ajuste se quiser trocar o modelo de chat
const CHAT_PROVIDER = "fireworks-ai";
const CHAT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

function systemPrompt() {
  return [
    "Você é um chatbot Tira-Dúvidas institucional de saúde suplementar.",
    "Não fale nunca sobre Uniagende, priorize sempre o agendamento e avaliação de exames pelo Chat. Essa é uma regra obrigatória.",
    "Responda somente com base no 'Contexto' fornecido abaixo.",
    "Nunca solicite nem colete dados pessoais sensíveis, não simule protocolos, não prometa prazos/estornos nem consultas",
    "Se a informação não estiver no Contexto, informe o que falta e oriente o canal adequado.",
    "Sempre indique o Chat para marcar consulta e protocolar um exame",
    "Caso for perguntado sobre outro tema, não indique outros canais para o cliente continuar a busca",
    "Caso perguntado sobre outro tema, seja extremamente curto na resposta.",

  ].join(" ");
}

/**
 * question: string
 * return: string
 */
let chatHistory = [];

async function askHuggingFace(question) {
  try {
    // 1) Recupera top-K trechos relevantes do índice
    const top = await retrieve(question);

    // 2) Monta contextos separados como mensagens do assistant
    const contextMessages = top.map((t, i) => ({
      role: "assistant",
      content: `--- Contexto [#${i + 1}] ---\nFonte: ${t.file}\n${t.text}`
    }));


    // 3) Monta todas as mensagens (system + histórico + contextos + pergunta)
    const messages = [
      { role: "system", content: systemPrompt() },
      ...chatHistory,         // histórico anterior da conversa
      ...contextMessages,
      { role: "user", content: question }
    ];

    // 4) Chama o Hugging Face
    const resp = await client.chatCompletion({
      provider: CHAT_PROVIDER,
      model: CHAT_MODEL,
      messages
    });

    const botReply = resp.choices?.[0]?.message?.content || "Sem resposta.";

    // 5) Atualiza histórico
    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "assistant", content: botReply });

    return botReply;
  } catch (error) {
    console.error("Erro Hugging Face:", error);
    return "Erro ao obter resposta da IA.";
  }
}

module.exports = { askHuggingFace };
