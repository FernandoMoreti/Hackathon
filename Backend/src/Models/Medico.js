const { DataTypes } = require("sequelize")
const sequelize = require('../Config/database');

const Medico = sequelize.define('Medico', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    CRM: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    cidade: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    id_especialidade: {
        type: DataTypes.UUID,
        references: {
            model: 'tb_especialidade',
            key: 'id',
        }
    },
    dtBirthday: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    }
}, {
    tableName: 'tb_medico',
    timestamps: false,
})

module.exports = Medico;