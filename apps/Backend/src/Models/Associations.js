module.exports = (db) => {
    const { Medico, Especialidade } = db;

    if (Medico && Especialidade) {
        Medico.belongsToMany(Especialidade, {
        through: 'tb_medicoEspecialidade',
        foreignKey: 'medicoId',
        otherKey: 'especialidadeId',
        timestamps: false,
        });

        Especialidade.belongsToMany(Medico, {
        through: 'tb_medicoEspecialidade',
        foreignKey: 'especialidadeId',
        otherKey: 'medicoId',
        timestamps: false,
        });
    }
};
