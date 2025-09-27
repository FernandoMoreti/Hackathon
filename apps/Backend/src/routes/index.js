const express = require("express");
const { createBeneficiario } = require("../Controllers/UserController");
const { especialidade } = require("../Controllers/EspecialidadeController");
const router = express.Router();

router.get("/beneficiario/", createBeneficiario)
router.get("/especialidade/", especialidade)

module.exports = router;
