const xlsx = require("xlsx");
const sequelize = require("../Config/database"); // seu arquivo de conexão
const Auditoria = require("../Models/Auditoria"); // seu modelo

async function importarExcel(caminhoArquivo) {
  try {
    // Ler arquivo Excel
    const workbook = xlsx.readFile(caminhoArquivo);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Converte planilha em array de objetos
    const dados = xlsx.utils.sheet_to_json(sheet);

    // Sincroniza modelo com banco (cria tabela se não existir)
    await sequelize.sync();

    // Mapeia as colunas do Excel para os campos do modelo
    const dadosFormatados = dados.map(row => ({
        codigo: row['Código'],
        terminologiaProcedimentos: row['Terminologia de Procedimentos e Eventos em Saúde (Tab. 22)'],
        correlacao: row['Correlação (Sim/Não)'],
        procedimento: row['PROCEDIMENTO'],
        resolucaoNormativa: row['Resolução Normativa (alteração)'],
        vigencia: row['VIGÊNCIA'],
        od: row['OD'],
        amb: row['AMB'],
        hco: row['HCO'],
        hso: row['HSO'],
        pac: row['PAC'],
        dut: row['DUT'],
        subgrupo: row['SUBGRUPO'],
        grupo: row['GRUPO'],
        capitulo: row['CAPÍTULO'],
        tipoAuditoria: "Auditoria" // Valor fixo conforme solicitado,
    }));

    // Insere todos os dados em lote
    await Auditoria.bulkCreate(dadosFormatados, { ignoreDuplicates: false });

    console.log("Importação concluída com sucesso!");
    process.exit();
  } catch (err) {
    console.error("Erro ao importar Excel:", err);
    process.exit(1);
  }
}

// Chame a função passando o caminho do Excel
importarExcel("./src/assets/auditoria.xlsx");


