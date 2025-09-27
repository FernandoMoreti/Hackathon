const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const Auditoria = sequelize.define('Auditoria', {
    codigo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false
    },
    terminologiaProcedimentos: {
        type: DataTypes.TEXT, // antes estava STRING(255)
        allowNull: true
    },
    correlacao: {
        type: DataTypes.TEXT, 
        allowNull: true
    },
    procedimento: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    resolucaoNormativa: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    vigencia: { type: DataTypes.STRING, allowNull: true },
    od: { type: DataTypes.STRING, allowNull: true },
    amb: { type: DataTypes.STRING, allowNull: true },
    hco: { type: DataTypes.STRING, allowNull: true },
    hso: { type: DataTypes.STRING, allowNull: true },
    pac: { type: DataTypes.STRING, allowNull: true },
    dut: { type: DataTypes.STRING, allowNull: true },
    subgrupo: { type: DataTypes.TEXT, allowNull: true },
    grupo: { type: DataTypes.TEXT, allowNull: true },
    capitulo: { type: DataTypes.TEXT, allowNull: true },
    tipoAuditoria: { type: DataTypes.STRING, allowNull: true },
}, {
    tableName: 'tb_auditoria',
    timestamps: false
});

module.exports = Auditoria;
