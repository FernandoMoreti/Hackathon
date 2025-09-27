const { Op } = require('sequelize');
const Consulta = require('../Models/Consulta');

// Retorna datas disponíveis para um médico
async function getDatasDisponiveis(medicoId, dias = 30) {
  const hoje = new Date();
  const dataFim = new Date();
  dataFim.setDate(hoje.getDate() + dias);

  const consultas = await Consulta.findAll({
    where: {
      id_medico: medicoId,
      dt_consulta: { [Op.between]: [hoje, dataFim] },
    },
    attributes: ['dt_consulta'],
  });

  const datasOcupadas = consultas.map(c => c.dt_consulta); // já está YYYY-MM-DD


  const datasDisponiveis = [];
  for (let d = new Date(hoje); d <= dataFim; d.setDate(d.getDate() + 1)) {
    const str = d.toISOString().split('T')[0];
    if (!datasOcupadas.includes(str)) datasDisponiveis.push(str);
  }

  return datasDisponiveis;
}

// Marca uma consulta
async function marcarConsulta(medicoId, pacienteId, dataEscolhida) {
  try {
    const consulta = await Consulta.create({
      id_medico: medicoId,
      id_paciente: pacienteId,
      dt_consulta: dataEscolhida,
    });
    return consulta;
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new Error('O médico já possui consulta nesta data.');
    }
    throw err;
  }
}

module.exports = {
  getDatasDisponiveis,
  marcarConsulta,
};
