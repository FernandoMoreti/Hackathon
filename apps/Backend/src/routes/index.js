const express = require("express");
const { createBeneficiario } = require("../Controllers/UserController");
const router = express.Router();

router.get("/beneficiario/", createBeneficiario)

module.exports = router;
