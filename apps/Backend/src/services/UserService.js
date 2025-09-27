const Paciente = require("../Models/User");
const yup = require("yup");

function isValidCPF(cpf) {
  if (!cpf) return false;

  cpf = cpf.toString().replace(/\D/g, ""); // garante apenas números

  if (cpf.length !== 11) return false;

  // invalida CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  // 1º dígito verificador
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // 2º dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

const beneficiarioSchema = yup.object().shape({
  cpf: yup
    .string()
    .required("CPF é obrigatório")
    .test("is-cpf", "CPF inválido", value => isValidCPF(value || "")),
});

const validateBeneficiario = async (req, res, next) => {
  try {
    const { cpf } = await beneficiarioSchema.validate({ cpf: req.query.cpf }, { abortEarly: false });

    const user = await Paciente.findOne({ where: { cpf } });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado!" });
    }

    return res.status(200).json({ message: "Sucesso", user });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    next(error);
  }
};

module.exports = {
  validateBeneficiario,
};
