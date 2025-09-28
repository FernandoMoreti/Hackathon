const Especialidade = require("../Models/Especialidade");
const Medico = require("../Models/Medico");

const getMedicosPorEspecialidade = async (req, res) => {
  try {
    const especialidadeId = req.query.codigo;

    if (!especialidadeId) {
      return res.status(400).json({ error: "O id da especialidade é obrigatório." });
    }

    // Busca todos os médicos que possuem a especialidade
    const medicos = await Medico.findAll({
      include: {
        model: Especialidade,
        where: { id: especialidadeId },
        through: { attributes: [] },
      },
    });

    return res.status(200).json({ data: medicos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar médicos por especialidade." });
  }
};

module.exports = {
  getMedicosPorEspecialidade,
};
