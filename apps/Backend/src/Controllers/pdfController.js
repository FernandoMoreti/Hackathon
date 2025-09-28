// Controllers/pdfController.js
const pdfParse = require('pdf-parse');
const { Auditoria, Autorizacao } = require('../Models');
const { Op } = require('sequelize');
const { getCategoriaByNameOrCode, normalize } = require('../utils/catalogoProcedimentos');
const crypto = require('crypto');

/* ========= helpers ========= */
function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}
function toDateOnlyStr(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Protocolo numérico aleatório (sem usar código do BD)
async function gerarProtocoloRandom(digits = 12) {
  const randDigits = () =>
    Array.from(crypto.randomBytes(digits))
      .map(b => (b % 10).toString())
      .join('')
      .slice(0, digits);

  for (let i = 0; i < 5; i++) {
    const candidate = randDigits();
    const exists = await Autorizacao.count({ where: { protocolo: candidate } });
    if (!exists) return candidate;
  }
  return `${Date.now()}${Math.floor(Math.random() * 1e6).toString().padStart(6, '0')}`;
}

// Busca no BD: exato -> like
async function encontrarNoBD(descricao) {
  const texto = (descricao || '').trim();
  if (!texto) return null;

  let proc = await Auditoria.findOne({
    where: { [Op.or]: [{ procedimento: texto }, { terminologiaProcedimentos: texto }] },
  });
  if (proc) return proc;

  proc = await Auditoria.findOne({
    where: {
      [Op.or]: [
        { procedimento: { [Op.iLike]: `%${texto}%` } },
        { terminologiaProcedimentos: { [Op.iLike]: `%${texto}%` } },
      ],
    },
  });
  return proc;
}

// Heurística para descartar linhas de ruído (nomes, CRM, cabeçalhos, etc.)
function isLinhaRuido(raw) {
  const s = raw.trim();
  const n = normalize(s);

  // Cabeçalhos/atores do fluxograma e afins
  const lixoCabecalho = /^(atencao|quem:|como:|tempo:|whatsapp|aguardar|processo|monitorar|informar ao|procedimento tem cobertura\?|auditoria\?)\b/;
  if (lixoCabecalho.test(n)) return true;

  // CRM do médico
  if (/\bcrm\b\s*[:\-]?\s*\d{3,}/i.test(s)) return true;

  // Dr/Dra/Médico
  if (/^\s*(dr\.?|dra\.?|m[eé]dico|medico|m[eé]dica|medica)\b/i.test(s)) return true;

  // Linha começando com letra curta + bullet (ex.: "D • Fulano", "D • ...")
  if (/^[A-Za-zÀ-ÿ]{1,3}\s*[•\u2022\-]\s*/.test(s)) return true;

  // Linhas muito curtas
  if (n.length < 3) return true;

  return false;
}

// Limpa lixo + dedup
function extrairExames(textoFiltrado) {
  const linhas = textoFiltrado
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const candidatas = linhas.filter((l) => !isLinhaRuido(l));

  const seen = new Set();
  const exames = [];
  for (const l of candidatas) {
    const key = normalize(l);
    if (!seen.has(key)) {
      seen.add(key);
      exames.push(l);
    }
  }
  return exames;
}

/* ========= controller ========= */
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

    const now = new Date();
    const dataSolicitacaoStr = toDateOnlyStr(now);

    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const texto = pdfData.text || '';

    // Recorte do bloco de exames (sua lógica original)
    const regexExames = /exames?\s+laborat[óo]riais?/i;
    const regexData = /d\s*ata\s*:\s*\d{2}\/\d{2}\/\d{4}/i;
    let textoFiltrado = '';
    const m1 = texto.match(regexExames);
    if (m1) {
      textoFiltrado = texto.substring(m1.index + m1[0].length).trim();
    } else {
      const m2 = texto.match(regexData);
      textoFiltrado = m2 ? texto.substring(m2.index + m2[0].length).trim() : texto.trim();
    }

    const examesExtraidos = extrairExames(textoFiltrado);
    const mensagens = [];

    for (const exame of examesExtraidos) {
      const procBD = await encontrarNoBD(exame);

      // dados base para persistir
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

      // Nome e código (se vierem do BD)
      const codigoBD = procBD?.codigo != null ? String(procBD.codigo) : null;
      const nomeBD = procBD?.procedimento || procBD?.terminologiaProcedimentos || null;

      // Classificação via planilhas (fonte do prazo)
      const categoria = getCategoriaByNameOrCode({
        name: nomeBD || exame,
        code: codigoBD,
      });

      // Se não achou no BD nem nas planilhas, pular (não transformar lixo em mensagem)
      if (!procBD && !categoria) {
        continue;
      }

      const nome = nomeBD || exame;
      const codigo = codigoBD || null;

      autorizacao.tem_cobertura = true;
      autorizacao.codigo = codigo;
      autorizacao.procedimento = nome;

      if (categoria === 'OPME') {
        // OPME -> 10 dias + protocolo aleatório
        autorizacao.eh_opme = true;
        autorizacao.requer_auditoria = true;
        autorizacao.status = 'em_auditoria';
        const dt = addDays(now, 10);
        autorizacao.prazo_retorno = toDateOnlyStr(dt);
        autorizacao.protocolo = await gerarProtocoloRandom();

        mensagens.push({
          mensagem: `🕒 "${nome}": OPME — retorno em até 10 dias. Protocolo (exemplo): ${autorizacao.protocolo}.`,
          status: 'em_auditoria',
          procedimento: nome,
          codigo,
          protocolo: autorizacao.protocolo,
          data_solicitacao: dataSolicitacaoStr,
          prazo_retorno: autorizacao.prazo_retorno,
        });
      } else if (categoria === 'AUDITORIA') {
        // AUDITORIA -> 5 dias + protocolo aleatório
        autorizacao.requer_auditoria = true;
        autorizacao.status = 'em_auditoria';
        const dt = addDays(now, 5);
        autorizacao.prazo_retorno = toDateOnlyStr(dt);
        autorizacao.protocolo = await gerarProtocoloRandom();

        mensagens.push({
          mensagem: `🕒 "${nome}": em auditoria — retorno em até 5 dias. Protocolo (exemplo): ${autorizacao.protocolo}.`,
          status: 'em_auditoria',
          procedimento: nome,
          codigo,
          protocolo: autorizacao.protocolo,
          data_solicitacao: dataSolicitacaoStr,
          prazo_retorno: autorizacao.prazo_retorno,
        });
      } else {
        // ROL -> autorizado imediato (sem retorno, sem protocolo)
        autorizacao.status = 'autorizado_imediato';

        mensagens.push({
          mensagem: `✅ "${nome}": autorizado imediatamente.`,
          status: 'autorizado_imediato',
          procedimento: nome,
          codigo,
          protocolo: null,
          data_solicitacao: dataSolicitacaoStr,
          prazo_retorno: null,
        });
      }

      // Persiste decisão
      await Autorizacao.create(autorizacao);
    }

    return res.json({ mensagens });

  } catch (err) {
    console.error('[uploadPDF] Erro:', err);
    return res.status(500).json({ error: 'Erro ao processar o PDF' });
  }
};
