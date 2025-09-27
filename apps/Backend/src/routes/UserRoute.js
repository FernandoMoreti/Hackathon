const express = require('express');
const router = express.Router();
const { createBeneficiario } = require("../Controllers/UserController");

const beneficiarioRoutes = () => {
    router.get("/beneficiario", createBeneficiario)
}

module.exports = { beneficiarioRoutes };
