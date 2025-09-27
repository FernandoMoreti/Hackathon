// utils/pdfOcr.js
const pdf = require('pdf-parse');

function extractPatientAndExams(rawText) {
  const text = rawText.replace(/\r/g, '');
  const get = (re) => (text.match(re) || [])[1];

  const paciente = get(/Nome:\s*(.+)/i) || get(/Paciente:\s*(.+)/i) || null;
  const dataPedido = get(/Data(?:\s*do\s*pedido)?:\s*([0-9/.-]+)/i) || null;

  // split após "Exames"
  let after = text;
  const idx = text.toLowerCase().indexOf('exames');
  if (idx >= 0) after = text.slice(idx + 6);

  let lines = after.split('\n').map(s => s.trim()).filter(Boolean);

  // remove cabeçalhos ruidosos
  lines = lines.filter(l =>
    !/crm|assinatura|carimbo|médico/i.test(l)
  );

  // junta linhas quebradas simples
  const out = [];
  let buf = '';
  for (const l of lines) {
    if (l.length < 3 && buf) { buf += ' ' + l; continue; }
    if (buf) out.push(buf); buf = l;
  }
  if (buf) out.push(buf);

  // elimina linhas muito genéricas
  const exames = out.filter(l => !/^laboratoriais?$/i.test(l));

  return { paciente, dataPedido, exames };
}

async function parsePdf(buffer) {
  const data = await pdf(buffer);
  return extractPatientAndExams(data.text || '');
}

// (Opcional) OCR de imagem
async function parseImage(/* buffer */) {
  // usar tesseract.js aqui se necessário
  return { paciente: null, dataPedido: null, exames: [] };
}

module.exports = { parsePdf, parseImage, extractPatientAndExams };
