const express = require('express');
const cors = require('cors');

const app = express();

// Importa as rotas
const routes = require('./routes');                // Rotas gerais
const chatRoutes = require('./routes/chat');       // Rota do chatbot
const authorizationRoutes = require('./routes/authorization'); // Rota de autorização
const pdfRoutes = require('./routes/pdfRoutes');   // Rota de upload de PDF

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas específicas primeiro
app.use('/pdf', pdfRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/autorizacao', authorizationRoutes);

// Rotas gerais por último
app.use(routes);

// Exporta a instância do app
module.exports = app;
