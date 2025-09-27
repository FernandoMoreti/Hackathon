const Especialidade = require("../Models/Especialidade");
const Medico = require("../Models/Medico");
const yup = require("yup");

const validateEspecialidade = async (req, res, next) => {
  try {
    const { codigo } = req.query;

    const medicoComEspecialidades = await Medico.findByPk(medico.id, {
        include: Especialidade,
    });

    
    return res.status(200).json({ message: "ok", data: medicoComEspecialidades})
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    console.log(error);
  }
};

module.exports = {
  validateEspecialidade,
};
