// utils/matchRol.js
const { Op, QueryTypes } = require('sequelize');
const Auditoria = require('../Models/Auditoria');
const { sequelize } = require('../Models');

function normalize(str = '') {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim();
}

function tokenize(s) {
  return normalize(s).split(/[^a-z0-9]+/).filter(t => t.length >= 4);
}

/** ===== Cobertura / Auditoria / OPME ===== */
function hasCoverage(row) {
  return !!(row?.od || row?.amb || row?.hco || row?.hso || row?.pac);
}

function isOPME(row) {
  const g = `${row?.grupo || ''} ${row?.subgrupo || ''}`.toUpperCase();
  return g.includes('OPME');
}

function needsAudit(row) {
  const hasDut = !!(row?.dut && String(row.dut).trim());
  const cap = (row?.capitulo || '').toUpperCase();
  const isCirurgico = cap.includes('CIRÚRGICOS') || cap.includes('CIRURGICOS') || cap.includes('INVASIVOS');

  const ta = (row?.tipoAuditoria || '').toString().trim().toUpperCase();
  const flagTA = ['SIM', 'TRUE', '1', 'Y'].includes(ta);

  const dom = `${row?.grupo || ''} ${row?.subgrupo || ''}`.toUpperCase();
  const isHemodinamica = /HEMODIN[ÂA]MICA|INTERVENCIONISTA/.test(dom);

  return hasDut || isCirurgico || flagTA || isHemodinamica;
}

/** ===== Filtro de domínio por intenção ===== */
function domainFilter(row, freeText) {
  const g = `${row.grupo || ''} ${row.subgrupo || ''}`.toUpperCase();
  const txt = freeText.toUpperCase();
  const proc = (row.procedimento || '').toUpperCase();

  const isAngio = /ANGIOPLASTIA|STENT|CORON[ÁA]RIA|BAL[ÃA]O/.test(txt);
  if (isAngio) {
    if (!/(HEMODIN[ÂA]MICA|INTERVENCIONISTA)/.test(g)) return false;
    if (/CONSULTA|VISITA/.test(proc)) return false; // blacklist
    return true;
  }

  const isLab = /HEMOGLOB.*GLICAD|BILIRRUBIN|MAGNES|TSH|T3|T4/.test(txt);
  if (isLab) {
    return /(LAB|AN[ÁA]LISES|DIAGN[ÓO]STICO)/.test(g);
  }

  return true; // fallback
}

function minScoreOk(score) {
  return score >= 2; // exige ≥ 2 tokens em comum
}

/** ===== LIKE com score ===== */
async function likeBestMatch(freeText) {
  const terms = tokenize(freeText);
  if (!terms.length) return null;

  const top = terms.slice(0, 5);
  const orConds = [];
  for (const t of top) {
    const like = { [Op.iLike]: `%${t}%` };
    orConds.push({ procedimento: like });
    orConds.push({ terminologiaProcedimentos: like });
  }

  const candidates = await Auditoria.findAll({ where: { [Op.or]: orConds }, limit: 50 });
  if (!candidates.length) return null;

  const filtered = candidates.filter(c => domainFilter(c, freeText));
  const base = filtered.length ? filtered : candidates;

  const scored = base.map(row => {
    const texto = `${row.procedimento || ''} ${row.terminologiaProcedimentos || ''}`.toLowerCase();
    let score = 0;
    for (const t of terms) if (texto.includes(t)) score++;
    return { row, score };
  }).filter(s => minScoreOk(s.score))
    .sort((a, b) => b.score - a.score);

  return scored.length ? scored[0].row : null;
}

/** ===== pg_trgm (recomendado) =====
 * Rode antes no seu DB:
 *   CREATE EXTENSION IF NOT EXISTS pg_trgm;
 *   CREATE INDEX IF NOT EXISTS idx_tb_auditoria_proc_trgm
 *     ON tb_auditoria USING GIN (procedimento gin_trgm_ops);
 *   CREATE INDEX IF NOT EXISTS idx_tb_auditoria_term_trgm
 *     ON tb_auditoria USING GIN (terminologiaprocedimentos gin_trgm_ops);
 */
const TRIGRAM_THRESHOLD = 0.25;

async function trigramBestMatch(freeText) {
  const q = String(freeText || '');
  if (!q.trim()) return null;

  const sql = `
    SELECT *, 
      GREATEST(similarity(procedimento, :q), similarity(terminologiaprocedimentos, :q)) AS sim
    FROM tb_auditoria
    WHERE (procedimento % :q OR terminologiaprocedimentos % :q)
    ORDER BY sim DESC
    LIMIT 15;
  `;
  const rows = await sequelize.query(sql, { replacements: { q }, type: QueryTypes.SELECT });
  if (!rows.length) return null;

  // aplica filtro de domínio e threshold
  const filtered = rows.filter(r => domainFilter(r, freeText) && r.sim >= TRIGRAM_THRESHOLD);
  return (filtered[0] || rows[0]) || null;
}

/** ===== Função pública: tenta trigram e cai para LIKE ===== */
async function findBestRolMatch(freeText) {
  const tri = await trigramBestMatch(freeText);
  if (tri) return tri;
  return likeBestMatch(freeText);
}

module.exports = {
  findBestRolMatch,
  hasCoverage,
  needsAudit,
  isOPME,
};
