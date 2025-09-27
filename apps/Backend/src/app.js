const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes'); // Suas rotas principais
const chatRoutes = require('./routes/chat'); // Nova rota do chatbot

app.use(cors());
app.use(express.json());

// 🔹 Rotas principais
app.use(routes);

// 🔹 Rota específica do chatbot
app.use('/api/chat', chatRoutes);

module.exports = app;