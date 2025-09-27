// services/authorizationService.js
const Autorizacao = require('../Models/Autorizacao');
const { findBestRolMatch, hasCoverage, needsAudit, isOPME } = require('../utils/matchRol');
const { genProtocol } = require('../utils/text');

function prazoDias(eh_opme) {
  return eh_opme ? 10 : 5; // OPME = 10 dias; demais = 5
}

async function decidirExame({ descricao, beneficiario, arquivo_origem }) {
  const match = await findBestRolMatch(descricao);

  if (!match) {
    return Autorizacao.create({
      beneficiario, arquivo_origem,
      descricao_exame: descricao,
      status: 'indefinido',
      motivo: 'Não encontrado no Rol',
      tem_cobertura: false,
      requer_auditoria: false,
      eh_opme: false,
    });
  }

  const cobertura = hasCoverage(match);
  const auditoria = needsAudit(match);
  const opme = isOPME(match);

  if (!auditoria && cobertura) {
    return Autorizacao.create({
      beneficiario, arquivo_origem,
      descricao_exame: descricao,
      codigo: String(match.codigo || match.Codigo || ''),
      procedimento: match.procedimento,
      tem_cobertura: true,
      requer_auditoria: false,
      eh_opme: opme,
      status: 'autorizado_imediato',
      protocolo: genProtocol('AUT'),
      numero_guia: genProtocol('GUI'),
      prazo_retorno: null,
      motivo: null,
    });
  }

  if (auditoria) {
    const d = new Date();
    d.setDate(d.getDate() + prazoDias(opme));

    return Autorizacao.create({
      beneficiario, arquivo_origem,
      descricao_exame: descricao,
      codigo: String(match.codigo || match.Codigo || ''),
      procedimento: match.procedimento,
      tem_cobertura: !!cobertura,
      requer_auditoria: true,
      eh_opme: opme,
      status: 'em_auditoria',
      protocolo_retorno: genProtocol('AUD'),
      prazo_retorno: d.toISOString().slice(0, 10),
      motivo: null,
    });
  }

  // sem cobertura
  return Autorizacao.create({
    beneficiario, arquivo_origem,
    descricao_exame: descricao,
    codigo: String(match.codigo || match.Codigo || ''),
    procedimento: match.procedimento,
    tem_cobertura: false,
    requer_auditoria: false,
    eh_opme: opme,
    status: 'negado_sem_cobertura',
    protocolo: genProtocol('NEG'),
    numero_guia: null,
    prazo_retorno: null,
    motivo: 'Procedimento sem cobertura no Rol',
  });
}

module.exports = { decidirExame };
