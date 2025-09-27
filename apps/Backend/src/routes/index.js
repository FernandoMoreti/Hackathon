const express = require("express");
const { createBeneficiario } = require("../Controllers/UserController");
const { especialidade } = require("../Controllers/EspecialidadeController");
const { listarDisponiveis, agendar } = require("../Controllers/ConsultaController");
const router = express.Router();

router.get("/beneficiario/", createBeneficiario)
router.get("/especialidade/", especialidade)
router.get('/disponibilidade/', listarDisponiveis);
router.post('/agendar/', agendar);

module.exports = router;
