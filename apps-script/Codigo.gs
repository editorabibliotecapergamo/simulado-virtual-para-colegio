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
 * CÓDIGO DE ACESSO (UM ENVIO POR ALUNO)
 * A segunda aba da planilha, chamada "Códigos", guarda um código por aluno (3 letras + 3 números),
 * com a série, a turma e o número na chamada. Os nomes NÃO ficam nessa aba nem no site.
 * - O aluno digita o código; o site pergunta a este script se ele existe e está "Disponível".
 * - Ao receber a prova, o script grava o resultado e troca a Situação do código para "Usado".
 *   Um código "Usado" não entra de novo.
 * Para LIBERAR um aluno (celular quebrou, enviou sem querer etc.): na aba "Códigos", troque a
 * Situação desse código de "Usado" para "Disponível". O resultado antigo continua na primeira aba.
 */

// Só é usado se o script NÃO tiver sido criado de dentro da planilha.
var ID_PLANILHA = "1WBE_STUHO-NFqKfBt8MhY0lzfhf3UJNbxm856VC2TnA";

var CABECALHO = [
  "Recebido em", "Nome", "Número", "Série", "Data informada", "Acertos", "Total", "Nota",
  "Duração (min)", "Código da prova", "Respostas (nº:letra)", "Questões do banco (uid=letra original)",
  "ID do envio", "Situação", "Turma", "Código de acesso"
];
var COL_ID = 13;
var VALIDO = "Válido";

// Aba com os códigos de acesso: Código | Série | Turma | Número | Situação | Usado em
var ABA_CODIGOS = "Códigos";
var CAB_CODIGOS = ["Código", "Série", "Turma", "Número", "Situação", "Usado em"];
var DISPONIVEL = "Disponível", USADO = "Usado";

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.acao === "verificar") {
    try {
      var achado = buscarCodigo(p.codigo);
      if (!achado) return resposta({ ok: true, valido: false, motivo: "invalido" });
      if (achado.situacao === USADO) return resposta({ ok: true, valido: false, motivo: "usado" });
      return resposta({ ok: true, valido: true, serie: achado.serie, turma: achado.turma, numero: achado.numero });
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

    // Um envio por código: o código tem de existir e estar "Disponível".
    var cod = buscarCodigo(d.codigo);
    if (!cod) return resposta({ ok: false, codigoInvalido: true, erro: "Código de acesso inválido." });
    if (cod.situacao === USADO) {
      return resposta({ ok: false, bloqueado: true, erro: "Este código já foi usado para enviar uma prova." });
    }

    // Série, turma e número vêm da aba "Códigos", não do que o navegador mandou.
    aba.appendRow([
      new Date(), texto(d.nome), texto(cod.numero), texto(cod.serie), texto(d.data),
      Number(d.acertos) || 0, Number(d.total) || 0, Number(d.nota) || 0,
      Number(d.duracaoMin) || 0, texto(d.codigoProva), texto(d.respostas), texto(d.questoes), id,
      VALIDO, texto(cod.turma), cod.codigo
    ]);
    cod.aba.getRange(cod.linha, 5, 1, 2).setValues([[USADO, new Date()]]);
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function planilha() {
  return SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.openById(ID_PLANILHA);
}

function abrirAba() {
  return planilha().getSheets()[0]; // primeira aba da planilha
}

// Cria/atualiza o cabeçalho dos resultados.
function prepararAba(aba) {
  if (aba.getLastRow() === 0) aba.appendRow(CABECALHO);
  aba.setFrozenRows(1);
  aba.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight("bold");

  var ultima = aba.getLastRow();
  if (ultima > 1) {
    // Linhas de envios antigos (de antes da coluna "Situação" existir) passam a valer como "Válido".
    var faixa = aba.getRange(2, 14, ultima - 1, 1);
    var valores = faixa.getValues();
    var mudou = false;
    for (var i = 0; i < valores.length; i++) {
      if (String(valores[i][0]).trim() === "") { valores[i][0] = VALIDO; mudou = true; }
    }
    if (mudou) faixa.setValues(valores);
  }
}

// Procura o código (sem diferenciar maiúsculas, espaços ou hífen) na aba "Códigos".
function buscarCodigo(valor) {
  var alvo = normalizarCodigo(valor);
  if (!/^[A-Z]{3}[0-9]{3}$/.test(alvo)) return null;
  var aba = planilha().getSheetByName(ABA_CODIGOS);
  if (!aba) throw new Error('A aba "' + ABA_CODIGOS + '" não existe na planilha.');
  var ultima = aba.getLastRow();
  if (ultima < 2) return null;
  var linhas = aba.getRange(2, 1, ultima - 1, CAB_CODIGOS.length).getValues();
  for (var i = 0; i < linhas.length; i++) {
    var l = linhas[i];
    if (normalizarCodigo(l[0]) !== alvo) continue;
    return {
      aba: aba, linha: i + 2, codigo: alvo,
      serie: String(l[1]).trim(), turma: String(l[2]).trim(), numero: String(l[3]).trim(),
      situacao: String(l[4]).trim().toLowerCase() === USADO.toLowerCase() ? USADO : DISPONIVEL
    };
  }
  return null;
}

function normalizarCodigo(v) {
  return String(v == null ? "" : v).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Evita que um texto começando com "=" seja interpretado como fórmula.
function texto(v) {
  var s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
