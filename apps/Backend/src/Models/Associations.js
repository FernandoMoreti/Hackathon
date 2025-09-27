const Medico = require('./Medico');
const Especialidade = require('./Especialidade');

// Associação N:N via tabela de junção
Medico.belongsToMany(Especialidade, { 
    through: 'tb_medico_especialidade', 
    foreignKey: 'medico_id', 
    otherKey: 'especialidade_id',
    timestamps: false
});

Especialidade.belongsToMany(Medico, { 
    through: 'tb_medico_especialidade', 
    foreignKey: 'especialidade_id', 
    otherKey: 'medico_id',
    timestamps: false
});

module.exports = { Medico, Especialidade };