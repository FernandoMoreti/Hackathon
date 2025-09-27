const { getDatasDisponiveis, marcarConsulta } = require('../services/ConsultaService');

async function listarDisponiveis(req, res) {
  const medicoId = req.query.medicoId; // usando query

  if (!medicoId) {
    return res.status(400).json({ error: 'medicoId é obrigatório na query.' });
  }

  try {
    const datas = await getDatasDisponiveis(medicoId);
    return res.status(200).json({ medicoId, datasDisponiveis: datas });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar datas disponíveis' });
  }
}

async function agendar(req, res) {
  const { medicoId, pacienteId, dataEscolhida } = req.body; // usando body

  if (!medicoId || !pacienteId || !dataEscolhida) {
    return res.status(400).json({ error: 'medicoId, pacienteId e dataEscolhida são obrigatórios no body.' });
  }

  try {
    const consulta = await marcarConsulta(medicoId, pacienteId, dataEscolhida);
    return res.status(201).json({ message: 'Consulta agendada com sucesso!', consulta });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}


module.exports = {
  listarDisponiveis,
  agendar,
};
