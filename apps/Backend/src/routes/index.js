const express = require("express");
const { createBeneficiario } = require("../Controllers/UserController");
const { especialidade } = require("../Controllers/EspecialidadeController");
const { listarDisponiveis, agendar } = require("../Controllers/ConsultaController");
const { uploadPDF } = require("../Controllers/pdfController");
const router = express.Router();

router.get("/beneficiario/", createBeneficiario)
router.get("/especialidade/", especialidade)
router.get('/disponibilidade/', listarDisponiveis);
router.post('/agendar/', agendar);
router.post('/upload/', uploadPDF);

module.exports = router;
