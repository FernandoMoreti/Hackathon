// routes/authorization.js
const { Router } = require('express');
const multer = require('multer');
const { uploadAndDecide, decidirLista, getAutorizacao } = require('../controllers/authorizationController');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/autorizacao/upload  (PDF de pedido)
router.post('/upload', upload.single('file'), uploadAndDecide);

// POST /api/autorizacao/decidir  (lista de exames em JSON)
router.post('/decidir', decidirLista);

// GET /api/autorizacao/:id  (consultar decisão)
router.get('/:id', getAutorizacao);

router.post('/:id/finalizar', async (req, res) => {
  try {
    const { decisao, motivo } = req.body; // 'aprovado' | 'negado'
    const Autorizacao = require('../Models/Autorizacao');
    const item = await Autorizacao.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Não encontrado' });
    if (item.status !== 'em_auditoria') return res.status(400).json({ error: 'Esta solicitação não está em auditoria' });

    if (decisao === 'aprovado') {
      item.status = 'autorizado_imediato';
      item.protocolo = item.protocolo || require('../utils/text').genProtocol('AUT');
      item.numero_guia = require('../utils/text').genProtocol('GUI');
      item.motivo = null;
    } else if (decisao === 'negado') {
      item.status = 'negado_sem_cobertura';
      item.protocolo = item.protocolo || require('../utils/text').genProtocol('NEG');
      item.numero_guia = null;
      item.motivo = motivo || 'Negado pela auditoria';
    } else {
      return res.status(400).json({ error: 'decisao inválida' });
    }
    await item.save();
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Falha ao finalizar auditoria' });
  }
});
module.exports = router;
