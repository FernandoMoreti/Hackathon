const pdfParse = require('pdf-parse');

exports.uploadPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });

        const pdfBuffer = req.file.buffer;
        const pdfData = await pdfParse(pdfBuffer);
        const texto = pdfData.text;

        // Regex para "Exames Laboratoriais" (tolerante a acentos/maiúsculas/espaços)
        const regexExames = /exames?\s+laborat[óo]riais?/i;

        // Regex para "D ata: DD/MM/AAAA" (aceita D + espaço + ata:)
        const regexData = /d\s*ata\s*:\s*\d{2}\/\d{2}\/\d{4}/i;

        let textoFiltrado = "";

        // Tenta primeiro "Exames Laboratoriais"
        const matchExames = texto.match(regexExames);

        if (matchExames) {
            textoFiltrado = texto.substring(matchExames.index + matchExames[0].length).trim();
        } else {
            // Se não achou, tenta "DATA"
            const matchData = texto.match(regexData);
            if (matchData) {
                textoFiltrado = texto.substring(matchData.index + matchData[0].length).trim();
            } else {
                // fallback → retorna todo o texto
                textoFiltrado = texto.trim();
            }
        }

        // Divide em linhas
        const paragrafos = textoFiltrado
            .split('\n')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        const resultado = paragrafos.slice(0, -2);

        res.json({ paragrafos: resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar o PDF' });
    }
};
