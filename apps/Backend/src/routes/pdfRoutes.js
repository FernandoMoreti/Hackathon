const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadPDF } = require('../Controllers/pdfController');

// Mantém arquivo apenas em memória
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('pdf'), uploadPDF);

module.exports = router;
