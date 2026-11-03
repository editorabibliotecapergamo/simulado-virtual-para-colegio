/**
 * RECEBE OS RESULTADOS DO SIMULADO ONLINE E GRAVA NA PLANILHA.
 *
 * Como instalar (uma vez só):
 * 1. Abra a planilha "Resultados do Simulado Online" (os resultados entram na primeira aba).
 * 2. Menu Extensões > Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 * 3. Clique em Implantar > Nova implantação > tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize e copie o "URL do app da Web" (termina em /exec).
 * 5. Cole esse endereço em config.js, no campo urlPlanilha.
 *
 * Se você alterar este código depois: Implantar > Gerenciar implantações > (lápis) >
 * Versão: "Nova versão" > Implantar. O endereço /exec continua o mesmo.
 *
 * Para testar: abra o endereço /exec no navegador. Deve aparecer "Simulado online: ativo".
 */

// Só é usado se o script NÃO tiver sido criado de dentro da planilha.
var ID_PLANILHA = "1WBE_STUHO-NFqKfBt8MhY0lzfhf3UJNbxm856VC2TnA";

var CABECALHO = [
  "Recebido em", "Nome", "Número", "Série", "Data informada", "Acertos", "Total", "Nota",
  "Duração (min)", "Código da prova", "Respostas (nº:letra)", "Questões do banco (uid=letra original)",
  "ID do envio"
];

function doGet() {
  return resposta({ ok: true, status: "Simulado online: ativo" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var planilha = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(ID_PLANILHA);
    var aba = planilha.getSheets()[0]; // primeira aba da planilha

    if (aba.getLastRow() === 0) aba.appendRow(CABECALHO);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");

    // Se o aluno tocar em "Tentar enviar de novo", não duplica a linha.
    var id = texto(d.id);
    var colId = CABECALHO.length;
    if (id && aba.getLastRow() > 1) {
      var achou = aba.getRange(2, colId, aba.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (achou) return resposta({ ok: true, repetido: true });
    }

    aba.appendRow([
      new Date(), texto(d.nome), texto(d.numero), texto(d.serie), texto(d.data),
      Number(d.acertos) || 0, Number(d.total) || 0, Number(d.nota) || 0,
      Number(d.duracaoMin) || 0, texto(d.codigoProva), texto(d.respostas), texto(d.questoes), id
    ]);
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Evita que um texto começando com "=" seja interpretado como fórmula.
function texto(v) {
  var s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
