const { validateBeneficiario } = require("../services/UserService")

const createBeneficiario = async (req, res) => {
   try {

    await validateBeneficiario(req, res);

   } catch (error) {
      console.error(error)
  }
    
}

module.exports = {
  createBeneficiario
}
