const { getMedicosPorEspecialidade } = require("../services/EspecialidadeService")

const especialidade = async (req, res) => {
   try {

    await getMedicosPorEspecialidade(req, res);

   } catch (error) {
      console.error(error)
  }
    
}

module.exports = {
  especialidade
}
