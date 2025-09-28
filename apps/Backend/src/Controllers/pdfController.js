// Controllers/pdfController.js
const pdfParse = require('pdf-parse');
const { Auditoria, Autorizacao } = require('../Models');
const { Op } = require('sequelize');

/* =========================
   Helpers
========================= */
function normalizar(txt = '') {
  return txt
    .toLowerCase()
    .normalize('NFD')               // remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')           // colapsa espaços
    .trim();
}

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  // retorna apenas data (YYYY-MM-DD) para o campo DATEONLY
  return d.toISOString().slice(0, 10);
}

function gerarProtocolo(tipo = 'GERAL') {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-${tipo}-${ymd}-${rand}`;
}

/**
 * Tenta localizar o procedimento no tb_auditoria
 *  - 1º: match exato (procedimento / terminologia)
 *  - 2º: match flexível (LIKE %texto%)
 *  - 3º: fallback JS por normalização (se quiser ser mais tolerante)
 */
async function encontrarProcedimento(descricaoExame) {
  const texto = descricaoExame?.trim();
  if (!texto) return null;

  // 1) exato (sensível a diferenças de maiúsculas/acentos do banco)
  let proc = await Auditoria.findOne({
    where: {
      [Op.or]: [
        { procedimento: texto },
        { terminologiaProcedimentos: texto },
      ],
    },
  });
  if (proc) return proc;

  // 2) LIKE (case-insensitive, cobre abreviações/partes)
  proc = await Auditoria.findOne({
    where: {
      [Op.or]: [
        { procedimento: { [Op.iLike]: `%${texto}%` } },
        { terminologiaProcedimentos: { [Op.iLike]: `%${texto}%` } },
      ],
    },
  });
  if (proc) return proc;

  // 3) fallback: normaliza e compara em JS (evita dependência de extensão do banco)
  //    traz apenas um conjunto pequeno por performance; ajuste se necessário
  const candidatos = await Auditoria.findAll({
    attributes: ['id', 'codigo', 'procedimento', 'terminologiaProcedimentos', 'tipoauditoria'],
    limit: 200,
  });

  const alvo = normalizar(texto);
  let melhor = null;
  for (const c of candidatos) {
    const p1 = normalizar(c.procedimento || '');
    const p2 = normalizar(c.terminologiaProcedimentos || '');
    if (p1 === alvo || p2 === alvo || p1.includes(alvo) || p2.includes(alvo)) {
      melhor = c;
      break;
    }
  }
  return melhor;
}

/* =========================
   Controller principal
========================= */
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const texto = pdfData.text || '';

    // ====== Mesma estratégia que você já usava para cortar o bloco de exames ======
    const regexExames = /exames?\s+laborat[óo]riais?/i;
    const regexData = /d\s*ata\s*:\s*\d{2}\/\d{2}\/\d{4}/i;

    let textoFiltrado = '';
    const matchExames = texto.match(regexExames);

    if (matchExames) {
      textoFiltrado = texto.substring(matchExames.index + matchExames[0].length).trim();
    } else {
      const matchData = texto.match(regexData);
      if (matchData) {
        textoFiltrado = texto.substring(matchData.index + matchData[0].length).trim();
      } else {
        textoFiltrado = texto.trim();
      }
    }

    // Quebra em linhas → remove vazios → remove possíveis rodapés (mesma lógica do slice)
    const linhas = textoFiltrado
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const examesExtraidos = linhas.slice(0, -2); // mantenho seu comportamento original

    // ====== Processamento contra o banco + criação de autorização ======
    const mensagens = [];

    for (const exame of examesExtraidos) {
      const proc = await encontrarProcedimento(exame);

      // estrutura base que será gravada na tb_autorizacao
      const autorizacao = {
        descricao_exame: exame,
        tem_cobertura: false,
        requer_auditoria: false,
        eh_opme: false,
        status: 'indefinido',
        motivo: null,
        codigo: null,
        procedimento: null,
        protocolo: null,
        prazo_retorno: null, // DATEONLY
      };

      if (!proc) {
        // não achou no Rol → sem cobertura
        autorizacao.status = 'negado_sem_cobertura';
        autorizacao.motivo = 'Procedimento não encontrado no Rol';
        mensagens.push({
          exame,
          status: 'negado_sem_cobertura',
          mensagem: `❌ "${exame}": não encontrado no Rol (sem cobertura).`,
        });
      } else {
        // achou no Rol
        autorizacao.tem_cobertura = true;
        autorizacao.codigo = proc.codigo?.toString() || null;
        autorizacao.procedimento = proc.procedimento || proc.terminologiaProcedimentos || exame;

        const flag = (proc.tipoauditoria || '').toString().toUpperCase();

        if (!flag) {
          // cobertura sem auditoria/OPME
          autorizacao.status = 'autorizado_imediato';
          mensagens.push({
            exame,
            status: 'autorizado_imediato',
            mensagem: `✅ "${autorizacao.procedimento}": autorizado imediatamente.`,
          });
        } else if (flag.includes('OPME')) {
          // OPME → 10 dias
          autorizacao.eh_opme = true;
          autorizacao.requer_auditoria = true;
          autorizacao.status = 'em_auditoria';
          autorizacao.protocolo = gerarProtocolo('OPME');
          autorizacao.prazo_retorno = addDays(new Date(), 10);
          mensagens.push({
            exame,
            status: 'em_auditoria',
            mensagem: `🕒 "${autorizacao.procedimento}": OPME — retorno em até 10 dias. Protocolo (exemplo): ${autorizacao.protocolo}.`,
          });
        } else if (flag.includes('AUD')) {
          // Auditoria → 5 dias
          autorizacao.requer_auditoria = true;
          autorizacao.status = 'em_auditoria';
          autorizacao.protocolo = gerarProtocolo('AUD');
          autorizacao.prazo_retorno = addDays(new Date(), 5);
          mensagens.push({
            exame,
            status: 'em_auditoria',
            mensagem: `🕒 "${autorizacao.procedimento}": em auditoria — retorno em até 5 dias. Protocolo (exemplo): ${autorizacao.protocolo}.`,
          });
        } else {
          // caso venha algo inesperado em tipoAuditoria — trata como auditoria padrão (5 dias)
          autorizacao.requer_auditoria = true;
          autorizacao.status = 'em_auditoria';
          autorizacao.protocolo = gerarProtocolo('AUD');
          autorizacao.prazo_retorno = addDays(new Date(), 5);
          mensagens.push({
            exame,
            status: 'em_auditoria',
            mensagem: `🕒 "${autorizacao.procedimento}": encaminhado para análise — retorno em até 5 dias. Protocolo (exemplo): ${autorizacao.protocolo}.`,
          });
        }
      }

      // persiste o resultado da análise
      await Autorizacao.create(autorizacao);
    }

    // resposta pronta para o front/chatbot
    return res.json({ mensagens });

  } catch (err) {
    console.error('[uploadPDF] Erro:', err);
    return res.status(500).json({ error: 'Erro ao processar o PDF' });
  }
};
