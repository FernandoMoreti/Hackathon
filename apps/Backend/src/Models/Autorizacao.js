// Models/Autorizacao.js
const { DataTypes } = require("sequelize");
const sequelize = require('../Config/database');

const Autorizacao = sequelize.define('Autorizacao', {
  id: {
    type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4,
    primaryKey: true, allowNull: false,
  },
  beneficiario: { type: DataTypes.STRING, allowNull: true },
  arquivo_origem: { type: DataTypes.STRING, allowNull: true },

  // Request
  descricao_exame: { type: DataTypes.TEXT, allowNull: false },

  // Match no Rol / tb_auditoria
  codigo: { type: DataTypes.STRING, allowNull: true },
  procedimento: { type: DataTypes.TEXT, allowNull: true },

  tem_cobertura: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  requer_auditoria: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  eh_opme: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },

  // Decisão
  status: { // 'autorizado_imediato' | 'em_auditoria' | 'negado_sem_cobertura' | 'indefinido'
    type: DataTypes.STRING, allowNull: false,
  },
  protocolo: { type: DataTypes.STRING, allowNull: true },
  protocolo_retorno: { type: DataTypes.STRING, allowNull: true },
  numero_guia: { type: DataTypes.STRING, allowNull: true },
  prazo_retorno: { type: DataTypes.DATEONLY, allowNull: true },
  motivo: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'tb_autorizacao',
  timestamps: true,
});

module.exports = Autorizacao;
