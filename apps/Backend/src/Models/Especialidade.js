const { DataTypes } = require("sequelize")
const sequelize = require('../Config/database');

const Especialidade = sequelize.define('Especialidade', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, {
    tableName: 'tb_especialidade',
    timestamps: false,
})

module.exports = Especialidade;