// controllers/authorizationController.js
const Autorizacao = require('../Models/Autorizacao');
const { decidirExame } = require('../services/authorizationService');
const { parsePdf } = require('../utils/pdfOcr');

async function uploadAndDecide(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'Envie um PDF com o pedido.' });

    const buffer = req.file.buffer;
    const parsed = await parsePdf(buffer);

    const beneficiario = parsed.paciente || req.body.beneficiario || null;
    const arquivo_origem = req.file.originalname;

    const results = [];
    for (const exame of parsed.exames || []) {
      const item = await decidirExame({
        descricao: exame,
        beneficiario,
        arquivo_origem,
      });
      results.push(item);
    }
    return res.json({ beneficiario, dataPedido: parsed.dataPedido, resultados: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao processar PDF' });
  }
}

async function decidirLista(req, res) {
  try {
    const { beneficiario, arquivo_origem, exames = [] } = req.body || {};
    if (!Array.isArray(exames) || exames.length === 0) {
      return res.status(400).json({ error: 'Informe "exames": string[]' });
    }
    const results = [];
    for (const descricao of exames) {
      const item = await decidirExame({ descricao, beneficiario, arquivo_origem });
      results.push(item);
    }
    return res.json({ resultados: results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Falha ao decidir' });
  }
}

async function getAutorizacao(req, res) {
  const { id } = req.params;
  const item = await Autorizacao.findByPk(id);
  if (!item) return res.status(404).json({ error: 'Não encontrado' });
  return res.json(item);
}

module.exports = { uploadAndDecide, decidirLista, getAutorizacao };
