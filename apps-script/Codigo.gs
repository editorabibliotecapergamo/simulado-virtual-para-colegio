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
 * com a série, a turma e o número na chamada. O site não tem nenhum nome nem código (só esta planilha);
 * a coluna "Aluno" (nome) é só para você identificar quem é quem.
 * - O aluno digita o código; o site pergunta a este script se ele existe e está "Disponível".
 * - Ao receber a prova, o script grava o resultado e troca a Situação do código para "Usado".
 *   Um código "Usado" não entra de novo.
 * Para LIBERAR um aluno (celular quebrou, enviou sem querer etc.): na aba "Códigos", troque a
 * Situação desse código de "Usado" para "Disponível". O resultado antigo continua na primeira aba.
 *
 * VÁRIOS SIMULADOS
 * Cada simulado tem a sua aba de resultados e a sua própria Situação do código:
 *   - Ciências (o principal): resultados na primeira aba; Situação / Usado em = colunas E e F de "Códigos".
 *   - Biologia (?s=biologia no link): resultados na aba "Biologia" (criada sozinha);
 *     Situação / Usado em = colunas "Situação (Biologia)" e "Usado em (Biologia)" de "Códigos". É um simulado
 *     RESTRITO: só entra o código que tiver "Disponível" nessa coluna; célula vazia = sem acesso.
 * O mesmo código vale uma vez em cada simulado. Para dar acesso a mais um aluno na Biologia, escreva
 * "Disponível" em "Situação (Biologia)" na linha dele; para liberar quem já usou, troque "Usado" por "Disponível".
 * As colunas da aba "Códigos" são achadas pelo nome do cabeçalho: dá para ter a coluna "Aluno" (nome) na
 * coluna A ou em qualquer outra, sem mexer no script. Não renomeie os cabeçalhos.
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

// Aba com os códigos de acesso. As colunas são achadas pelo NOME no cabeçalho (linha 1), então
// pode haver outras colunas (ex.: "Aluno" na coluna A) e a ordem não importa:
//   Código | Série | Turma | Número | Situação | Usado em | Situação (Biologia) | Usado em (Biologia)
var ABA_CODIGOS = "Códigos";
var DISPONIVEL = "Disponível", USADO = "Usado", SEM_ACESSO = "Sem acesso";

// Simulados: "" é o principal (primeira aba). Os demais têm aba de resultados própria.
// cabSituacao / cabUsado = nomes dos cabeçalhos, na aba "Códigos", da Situação e do "Usado em" nesse simulado.
var SIMULADOS = {
  "": { aba: null, cabSituacao: "Situação", cabUsado: "Usado em", nome: "Ciências" },
  // restrito: só entra quem tiver "Disponível" escrito na coluna Situação (Biologia) (célula vazia = sem acesso).
  "biologia": { aba: "Biologia", cabSituacao: "Situação (Biologia)", cabUsado: "Usado em (Biologia)", nome: "Biologia", restrito: true }
};
function configSimulado(id) {
  id = String(id == null ? "" : id).trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(SIMULADOS, id)) throw new Error("Simulado desconhecido: " + id);
  return SIMULADOS[id];
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.acao === "verificar") {
    try {
      var sim = configSimulado(p.simulado);
      var achado = buscarCodigo(p.codigo, sim);
      if (!achado) return resposta({ ok: true, valido: false, motivo: "invalido" });
      if (achado.situacao === SEM_ACESSO) return resposta({ ok: true, valido: false, motivo: "sem_acesso" });
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
    var sim = configSimulado(d.simulado);
    var aba = abrirAba(sim);
    prepararAba(aba);
    prepararCodigos();

    // Se o aluno tocar em "Tentar enviar de novo", não duplica a linha.
    var id = texto(d.id);
    if (id && aba.getLastRow() > 1) {
      var achou = aba.getRange(2, COL_ID, aba.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (achou) return resposta({ ok: true, repetido: true });
    }

    // Um envio por código: o código tem de existir e estar "Disponível".
    var cod = buscarCodigo(d.codigo, sim);
    if (!cod) return resposta({ ok: false, codigoInvalido: true, erro: "Código de acesso inválido." });
    if (cod.situacao === SEM_ACESSO) return resposta({ ok: false, codigoInvalido: true, erro: "Este código não tem acesso a este simulado." });
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
    cod.aba.getRange(cod.linha, cod.colSituacao, 1, 1).setValue(USADO);
    cod.aba.getRange(cod.linha, cod.colUsado, 1, 1).setValue(new Date());
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

function abrirAba(sim) {
  var p = planilha();
  if (!sim || !sim.aba) return p.getSheets()[0]; // primeira aba da planilha
  return p.getSheetByName(sim.aba) || p.insertSheet(sim.aba);
}

// Acha as colunas da aba "Códigos" pelo nome do cabeçalho. Devolve {nome do cabeçalho: coluna (1 = A)}.
function colunasCodigos(aba) {
  var mapa = {};
  var n = aba.getLastColumn();
  if (n < 1) return mapa;
  aba.getRange(1, 1, 1, n).getValues()[0].forEach(function (h, i) {
    var nome = String(h).trim();
    if (nome && !mapa[nome]) mapa[nome] = i + 1;
  });
  return mapa;
}

// Garante as colunas de cada simulado na aba "Códigos" (cria no fim, se faltar) e a lista Disponível / Usado.
function prepararCodigos() {
  var aba = planilha().getSheetByName(ABA_CODIGOS);
  if (!aba) return;
  var mapa = colunasCodigos(aba);
  Object.keys(SIMULADOS).forEach(function (id) {
    var sim = SIMULADOS[id];
    if (sim.cabSituacao === "Situação") return; // as colunas do simulado principal já existem
    [sim.cabSituacao, sim.cabUsado].forEach(function (nome) {
      if (mapa[nome]) return;
      var col = aba.getLastColumn() + 1;
      aba.getRange(1, col, 1, 1).setValue(nome).setFontWeight("bold");
      mapa[nome] = col;
    });
    var regra = SpreadsheetApp.newDataValidation().requireValueInList([DISPONIVEL, USADO], true).setAllowInvalid(true).build();
    aba.getRange(2, mapa[sim.cabSituacao], Math.max(aba.getMaxRows() - 1, 1), 1).setDataValidation(regra);
  });
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
function buscarCodigo(valor, sim) {
  sim = sim || SIMULADOS[""];
  var alvo = normalizarCodigo(valor);
  if (!/^[A-Z]{3}[0-9]{3}$/.test(alvo)) return null;
  var aba = planilha().getSheetByName(ABA_CODIGOS);
  if (!aba) throw new Error('A aba "' + ABA_CODIGOS + '" não existe na planilha.');
  var ultima = aba.getLastRow();
  if (ultima < 2) return null;
  var mapa = colunasCodigos(aba);
  var obrigatorias = ["Código", "Série", "Turma", "Número"];
  if (!sim.restrito) obrigatorias.push(sim.cabSituacao);
  obrigatorias.forEach(function (nome) {
    if (!mapa[nome]) throw new Error('Falta a coluna "' + nome + '" na aba "' + ABA_CODIGOS + '". Não renomeie os cabeçalhos.');
  });
  var largura = aba.getLastColumn();
  var linhas = aba.getRange(2, 1, ultima - 1, largura).getValues();
  var val = function (l, nome) { return mapa[nome] ? l[mapa[nome] - 1] : ""; };
  for (var i = 0; i < linhas.length; i++) {
    var l = linhas[i];
    if (normalizarCodigo(val(l, "Código")) !== alvo) continue;
    var sit = String(val(l, sim.cabSituacao)).trim().toLowerCase();
    var situacao = sit === USADO.toLowerCase() ? USADO : DISPONIVEL;
    if (sim.restrito && sit !== USADO.toLowerCase() && sit !== DISPONIVEL.toLowerCase()) situacao = SEM_ACESSO;
    return {
      aba: aba, linha: i + 2, codigo: alvo,
      colSituacao: mapa[sim.cabSituacao], colUsado: mapa[sim.cabUsado],
      serie: String(val(l, "Série")).trim(), turma: String(val(l, "Turma")).trim(), numero: String(val(l, "Número")).trim(),
      situacao: situacao
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
