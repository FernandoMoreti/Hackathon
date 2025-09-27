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
    "Responda somente com base no 'Contexto' fornecido abaixo.",
    "Não colete dados pessoais sensíveis, não simule protocolos, não prometa prazos/estornos.",
    "Quando sair do escopo, oriente o canal oficial apropriado (App/Portal/WhatsApp/Telefone da Central).",
    "Se a informação não estiver no Contexto, informe o que falta e oriente o canal adequado."
  ].join(" ");
}

/**
 * question: string
 * return: string
 */
async function askHuggingFace(question) {
  try {
    // 1) Recupera top-K trechos relevantes do índice
    const top = await retrieve(question);
    const contextoDinamico = top
      .map((t, i) => `[#${i + 1}] Fonte: ${t.file}\n${t.text}`)
      .join("\n\n");

    // 2) Monta as mensagens
    const messages = [
      { role: "system", content: systemPrompt() },
      { role: "assistant", content: `Contexto:\n${contextoDinamico}` },
      { role: "user", content: question }
    ];

    // 3) Chama o chat do provedor via Hugging Face Inference Client
    const resp = await client.chatCompletion({
      provider: CHAT_PROVIDER,
      model: CHAT_MODEL,
      messages
    });

    return resp.choices?.[0]?.message?.content || "Sem resposta.";
  } catch (error) {
    console.error("Erro Hugging Face:", error);
    return "Erro ao obter resposta da IA.";
  }
}

module.exports = { askHuggingFace };
