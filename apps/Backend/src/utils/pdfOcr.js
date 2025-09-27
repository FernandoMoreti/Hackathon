// utils/pdfOcr.js
const pdf = require('pdf-parse');

function extractPatientAndExams(rawText) {
  const text = String(rawText || '').replace(/\r/g, '');
  const get = (re) => {
    const m = text.match(re);
    return m ? m[1].trim() : null;
  };

  const paciente = get(/(?:^|\n)\s*(?:Nome|Paciente)\s*:\s*(.+)/i);
  const dataPedido = get(/(?:^|\n)\s*Data(?:\s*(?:do\s*pedido)?)\s*:\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i);

  // tenta iniciar a partir de "Exames" ou "Procedimentos"
  const idxEx = text.toLowerCase().search(/\b(exames?|procedimentos?)\b/);
  let after = idxEx >= 0 ? text.slice(idxEx) : text;

  // corta após seções de rodapé comuns
  const stopIdx = after.toLowerCase().search(/assinatura|carimbo|observa[cç][oõ]es|respons[aá]vel|m[ée]dico/i);
  if (stopIdx > 0) after = after.slice(0, stopIdx);

  let lines = after.split('\n').map(s => s.trim()).filter(Boolean);

  // remove metadados / cabeçalhos / logotipos / endereços / hospital
  const dropRe = new RegExp([
    '^(nome|paciente|data|data de nascimento|crm)\\s*:',
    '\\b(hospital|sociedade|sirio[- ]libanes|benefic[ie]ncia|instituto|unidade|end(?:ere|é)co|telefone|cnpj)\\b',
    'prontu[aá]rio', 'guia', 'carimbo', 'assinatura', 'respons[aá]vel'
  ].join('|'), 'i');

  // heurística de ruído: poucas letras “reais”
  const isNoisy = (s) => (s.replace(/[^a-zA-ZÀ-ÿ]/g, '').length < 4);

  const cleaned = lines
    .filter(l => !dropRe.test(l))
    .filter(l => !isNoisy(l))
    .filter(l => !/^laboratoriais?$/i.test(l));

  return { paciente, dataPedido, exames: cleaned };
}

async function parsePdf(buffer) {
  const data = await pdf(buffer);
  return extractPatientAndExams(data.text || '');
}

// placeholder caso futuramente use Tesseract para imagens
async function parseImage(/* buffer */) {
  return { paciente: null, dataPedido: null, exames: [] };
}

module.exports = { parsePdf, parseImage, extractPatientAndExams };
