// src/services/retriever.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { InferenceClient } = require("@huggingface/inference");

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";
const TOP_K = Number(process.env.TOP_K || 4);

const client = new InferenceClient(HF_API_KEY);

const indexPath = path.join(__dirname, "..", "rag", "index.json");
if (!fs.existsSync(indexPath)) {
  throw new Error("Index não encontrado. Rode: node src/rag/ingest.js");
}
const INDEX = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

function l2norm(v) {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / n);
}

async function embed(text) {
  const out = await client.featureExtraction({
    model: EMBEDDING_MODEL,
    inputs: text
  });
  const vec = Array.isArray(out[0]) ? out[0] : out;
  return l2norm(vec.map(Number));
}

function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

async function retrieve(query, k = TOP_K) {
  const qv = await embed(query);
  const scored = INDEX.map(e => ({ ...e, score: cosine(qv, e.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  return scored;
}

module.exports = { retrieve };
