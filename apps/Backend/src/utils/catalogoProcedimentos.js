// src/utils/catalogoProcedimentos.js
const path = require('path');
const xlsx = require('xlsx');

// Normaliza texto/código para comparação tolerante
function normalize(s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s\-./]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Lê uma planilha e cria Sets de nomes e códigos
function lerPlanilhaParaSets(absPath) {
  const wb = xlsx.readFile(absPath, { cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });

  const names = new Set();
  const codes = new Set();

  for (const r of rows) {
    const nome =
      r.procedimento || r['Procedimento'] || r['Nome'] ||
      r['terminologiaprocedimentos'] || r['Terminologia'] ||
      r['Denominação'] || r['Denominacao'] || '';
    const codigo = r.codigo || r['Código'] || r['Codigo'] || r['cod'] || r['Cod'] || '';

    if (nome) names.add(normalize(nome));
    if (codigo !== '' && codigo !== null && codigo !== undefined) codes.add(normalize(codigo));
  }

  return { names, codes };
}

// Ajuste este caminho se necessário (está relativo a src/)
const base = path.resolve(__dirname, '..', 'assets');
const AUD_PATH = path.join(base, 'auditoria.xlsx');
const OPME_PATH = path.join(base, 'opme.xlsx');
const ROL_PATH = path.join(base, 'Rol - Procedimentos.xlsx');

const aud = lerPlanilhaParaSets(AUD_PATH);
const opm = lerPlanilhaParaSets(OPME_PATH);
const rol = lerPlanilhaParaSets(ROL_PATH);

/**
 * Retorna a categoria do procedimento com base nas planilhas.
 * Prioridade: OPME > AUDITORIA > ROL
 */
function getCategoriaByNameOrCode({ name, code }) {
  const nName = normalize(name || '');
  const nCode = normalize(code || '');

  const inOPME = (nName && opm.names.has(nName)) || (nCode && opm.codes.has(nCode));
  if (inOPME) return 'OPME';

  const inAUD = (nName && aud.names.has(nName)) || (nCode && aud.codes.has(nCode));
  if (inAUD) return 'AUDITORIA';

  const inROL = (nName && rol.names.has(nName)) || (nCode && rol.codes.has(nCode));
  if (inROL) return 'ROL';

  return null;
}

module.exports = {
  getCategoriaByNameOrCode,
  normalize,
};
