const { DataTypes } = require("sequelize")
const sequelize = require('../Config/database');

const Consulta = sequelize.define('Consulta', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    dt_consulta: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    id_paciente: {
        type: DataTypes.UUID,
        references: {
            model: 'tb_paciente',
            key: 'id',
        }
    },
    id_medico: {
        type: DataTypes.UUID,
        references: {
            model: 'tb_medico',
            key: 'id',
        }
    }
}, {
    tableName: "tb_consulta",
    timestamps: true,
})

module.exports = Consulta;