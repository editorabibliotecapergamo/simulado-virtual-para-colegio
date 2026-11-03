/**
 * RECEBE OS RESULTADOS DO SIMULADO ONLINE E GRAVA NA PLANILHA.
 *
 * Como instalar (uma vez só):
 * 1. Crie uma planilha no Google Planilhas (ex.: "Resultados do Simulado").
 * 2. Menu Extensões > Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 * 3. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize e copie o "URL do app da Web" (termina em /exec).
 * 5. Cole esse endereço em config.js, no campo urlPlanilha.
 */

var CABECALHO = [
  "Recebido em", "Nome", "Número", "Série", "Data informada", "Acertos", "Total", "Nota",
  "Duração (min)", "Código da prova", "Respostas (nº:letra)", "Questões do banco (uid=letra original)"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Resultados")
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Resultados");
    if (aba.getLastRow() === 0) {
      aba.appendRow(CABECALHO);
      aba.setFrozenRows(1);
      aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
    }
    aba.appendRow([
      new Date(), texto(d.nome), texto(d.numero), texto(d.serie), texto(d.data),
      Number(d.acertos) || 0, Number(d.total) || 0, Number(d.nota) || 0,
      Number(d.duracaoMin) || 0, texto(d.codigoProva), texto(d.respostas), texto(d.questoes)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Evita que um texto começando com "=" seja interpretado como fórmula.
function texto(v) {
  var s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
