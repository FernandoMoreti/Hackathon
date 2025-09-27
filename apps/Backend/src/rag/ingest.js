// src/rag/ingest.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { InferenceClient } = require("@huggingface/inference");

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

const client = new InferenceClient(HF_API_KEY);

function chunkText(text, maxChars = 1800, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    const slice = text.slice(start, end).trim();
    if (slice) chunks.push(slice);
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}

function l2norm(v) {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / n);
}

async function embed(text) {
  // feature-extraction retorna array; tratamos 1D
  const out = await client.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text
  });
  const vec = Array.isArray(out[0]) ? out[0] : out;
  return l2norm(vec.map(Number));
}

(async () => {
  const ctxDir = path.join(__dirname, "..", "contexto");
  const files = fs.readdirSync(ctxDir).filter(f => f.endsWith(".txt"));
  if (files.length === 0) {
    console.error("Nenhum .txt encontrado em src/contexto");
    process.exit(1);
  }

  const entries = [];
  for (const f of files) {
    const full = fs.readFileSync(path.join(ctxDir, f), "utf-8");
    const chunks = chunkText(full);
    console.log(`[INGEST] ${f}: ${chunks.length} chunks`);
    for (let i = 0; i < chunks.length; i++) {
      const text = chunks[i];
      const vector = await embed(text);
      entries.push({ id: `${f}#${i}`, file: f, text, vector });
    }
  }

  const outPath = path.join(__dirname, "index.json");
  fs.writeFileSync(outPath, JSON.stringify(entries));
  console.log(`[OK] Índice gerado em ${outPath} com ${entries.length} chunks`);
})();
