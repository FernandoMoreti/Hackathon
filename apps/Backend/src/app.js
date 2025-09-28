const express = require('express');
const cors = require('cors');

const app = express();

// Importa as rotas
const routes = require('./routes');                // Rotas gerais
const chatRoutes = require('./routes/chat');       // Rota do chatbot


// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas específicas primeiro
app.use('/api/chat', chatRoutes);


// Rotas gerais por último
app.use(routes);

// Exporta a instância do app
module.exports = app;
