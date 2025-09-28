// Models/Auditoria.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const Auditoria = sequelize.define('Auditoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  },
  codigo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'codigo',
  },
  terminologiaProcedimentos: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'terminologiaprocedimentos', // minúsculo
  },
  correlacao: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'correlacao',
  },
  procedimento: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'procedimento',
  },
  resolucaoNormativa: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'resolucaoNormativa', // exato como está no banco
  },
  vigencia: { type: DataTypes.STRING, allowNull: true, field: 'vigencia' },
  od: { type: DataTypes.STRING, allowNull: true, field: 'od' },
  amb: { type: DataTypes.STRING, allowNull: true, field: 'amb' },
  hco: { type: DataTypes.STRING, allowNull: true, field: 'hco' },
  hso: { type: DataTypes.STRING, allowNull: true, field: 'hso' },
  pac: { type: DataTypes.STRING, allowNull: true, field: 'pac' },
  dut: { type: DataTypes.STRING, allowNull: true, field: 'dut' },
  subgrupo: { type: DataTypes.TEXT, allowNull: true, field: 'subgrupo' },
  grupo: { type: DataTypes.TEXT, allowNull: true, field: 'grupo' },
  capitulo: { type: DataTypes.TEXT, allowNull: true, field: 'capitulo' },
  tipoauditoria: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    field: 'tipoAuditoria', // exato como está no banco
  },
}, {
  tableName: 'tb_auditoria',
  timestamps: false,
  freezeTableName: true,
});

module.exports = Auditoria;
