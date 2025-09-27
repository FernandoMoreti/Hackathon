// utils/matchRol.js
const { Op } = require('sequelize');
const Auditoria = require('../Models/Auditoria');
const { normalize } = require('./text');

const COLUMNS = {
  PROCEDIMENTO: 'procedimento',
  TERMINOLOGIA: 'terminologiaProcedimentos',
};

function tokenize(s) {
  return normalize(s).split(/[^a-z0-9]+/).filter(t => t.length >= 4);
}

async function findBestRolMatch(freeText) {
  const terms = tokenize(freeText);
  if (!terms.length) return null;

  // Estratégia simples: testa top 5 termos (reduz custo do LIKE)
  const top = terms.slice(0, 5);

  // Busca candidatos (OR de iLike)
  const orConds = [];
  for (const t of top) {
    const like = { [Op.iLike]: `%${t}%` };
    orConds.push({ [COLUMNS.PROCEDIMENTO]: like });
    orConds.push({ [COLUMNS.TERMINOLOGIA]: like });
  }

  const candidates = await Auditoria.findAll({
    where: { [Op.or]: orConds },
    limit: 30,
  });

  if (!candidates.length) return null;

  // Scoring: conta quantos termos casam no PROCEDIMENTO+TERMINOLOGIA
  const scored = candidates.map(row => {
    const texto = `${row.procedimento || ''} ${row.terminologiaProcedimentos || ''}`.toLowerCase();
    let score = 0;
    for (const t of terms) if (texto.includes(t)) score++;
    return { row, score };
  }).sort((a,b) => b.score - a.score);

  return scored[0].row;
}

function hasCoverage(row) {
  // qualquer coluna OD/AMB/HCO/HSO/PAC preenchida indica cobertura
  return !!(row?.od || row?.amb || row?.hco || row?.hso || row?.pac);
}

function needsAudit(row) {
  // heurística: se DUT possui texto, exige auditoria
  const v = (row?.dut || '').trim();
  return v.length > 0;
}

function isOPME(row) {
  const g = `${row?.grupo || ''} ${row?.subgrupo || ''}`.toUpperCase();
  return g.includes('OPME');
}

module.exports = {
  findBestRolMatch, hasCoverage, needsAudit, isOPME
};
