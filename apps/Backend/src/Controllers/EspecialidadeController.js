const { validateEspecialidade } = require("../services/EspecialidadeService")

const especialidade = async (req, res) => {
   try {

    await validateEspecialidade(req, res);

   } catch (error) {
      console.error(error)
  }
    
}

module.exports = {
  especialidade
}
