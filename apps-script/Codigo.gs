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
 *
 * UM ENVIO POR NÚMERO
 * Cada aluno (série + número) só pode enviar uma prova. Um segundo envio com o mesmo número
 * na mesma série é recusado, e o site também avisa o aluno antes de ele começar.
 * Para LIBERAR um aluno (por exemplo, se outro aluno usou o número dele por engano):
 * na última coluna ("Situação") da linha do primeiro envio, troque "Válido" por "Liberado".
 * Apagar a linha também libera. A linha "Liberada" fica na planilha como histórico.
 */

// Só é usado se o script NÃO tiver sido criado de dentro da planilha.
var ID_PLANILHA = "1WBE_STUHO-NFqKfBt8MhY0lzfhf3UJNbxm856VC2TnA";

var CABECALHO = [
  "Recebido em", "Nome", "Número", "Série", "Data informada", "Acertos", "Total", "Nota",
  "Duração (min)", "Código da prova", "Respostas (nº:letra)", "Questões do banco (uid=letra original)",
  "ID do envio", "Situação"
];
var COL_NUMERO = 3, COL_SERIE = 4, COL_ID = 13, COL_SITUACAO = 14;
var VALIDO = "Válido", LIBERADO = "Liberado";

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.acao === "verificar") {
    try {
      var aba = abrirAba();
      return resposta({ ok: true, bloqueado: existeEnvio(aba, p.serie, p.numero) });
    } catch (err) {
      return resposta({ ok: false, erro: String(err) });
    }
  }
  return resposta({ ok: true, status: "Simulado online: ativo" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var aba = abrirAba();
    prepararAba(aba);

    // Se o aluno tocar em "Tentar enviar de novo", não duplica a linha.
    var id = texto(d.id);
    if (id && aba.getLastRow() > 1) {
      var achou = aba.getRange(2, COL_ID, aba.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (achou) return resposta({ ok: true, repetido: true });
    }

    // Um envio por número (dentro da mesma série), a menos que o professor tenha liberado.
    if (existeEnvio(aba, d.serie, d.numero)) {
      return resposta({
        ok: false, bloqueado: true,
        erro: "Já existe uma prova enviada com este número nesta série."
      });
    }

    aba.appendRow([
      new Date(), texto(d.nome), texto(d.numero), texto(d.serie), texto(d.data),
      Number(d.acertos) || 0, Number(d.total) || 0, Number(d.nota) || 0,
      Number(d.duracaoMin) || 0, texto(d.codigoProva), texto(d.respostas), texto(d.questoes), id,
      VALIDO
    ]);
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function abrirAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(ID_PLANILHA);
  return planilha.getSheets()[0]; // primeira aba da planilha
}

// Cria/atualiza o cabeçalho, a coluna "Situação" e a lista "Válido / Liberado".
function prepararAba(aba) {
  if (aba.getLastRow() === 0) aba.appendRow(CABECALHO);
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight("bold");

  var ultima = aba.getLastRow();
  if (ultima > 1) {
    // Linhas de envios antigos (de antes desta coluna existir) passam a valer como "Válido".
    var faixa = aba.getRange(2, COL_SITUACAO, ultima - 1, 1);
    var valores = faixa.getValues();
    var mudou = false;
    for (var i = 0; i < valores.length; i++) {
      if (String(valores[i][0]).trim() === "") { valores[i][0] = VALIDO; mudou = true; }
    }
    if (mudou) faixa.setValues(valores);
  }
  var regra = SpreadsheetApp.newDataValidation().requireValueInList([VALIDO, LIBERADO], true).setAllowInvalid(true).build();
  aba.getRange(2, COL_SITUACAO, Math.max(aba.getMaxRows() - 1, 1), 1).setDataValidation(regra);
}

// Já existe um envio "Válido" (não liberado) para esta série + número?
function existeEnvio(aba, serie, numero) {
  var ultima = aba.getLastRow();
  if (ultima < 2) return false;
  var alvoSerie = normalizar(serie), alvoNumero = normalizarNumero(numero);
  if (!alvoSerie || alvoNumero === "") return false;
  var linhas = aba.getRange(2, 1, ultima - 1, COL_SITUACAO).getValues();
  for (var i = 0; i < linhas.length; i++) {
    var l = linhas[i];
    if (String(l[COL_SITUACAO - 1]).trim().toLowerCase() === LIBERADO.toLowerCase()) continue;
    if (normalizar(l[COL_SERIE - 1]) === alvoSerie && normalizarNumero(l[COL_NUMERO - 1]) === alvoNumero) return true;
  }
  return false;
}

function normalizar(v) {
  return String(v == null ? "" : v).replace(/^'/, "").trim().toLowerCase();
}

// "07", 7 e "7" são o mesmo número.
function normalizarNumero(v) {
  var s = String(v == null ? "" : v).replace(/^'/, "").trim();
  var n = Number(s);
  return s !== "" && !isNaN(n) ? String(n) : s.toLowerCase();
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Evita que um texto começando com "=" seja interpretado como fórmula.
function texto(v) {
  var s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
