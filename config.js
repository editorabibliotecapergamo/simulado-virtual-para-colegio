/**
 * CONFIGURAÇÕES DO SIMULADO ONLINE
 * Edite este arquivo para ajustar o simulado sem mexer no restante do código.
 */
window.CONFIG_SIMULADO = {
  escola: "Colégio Nova Jornada",
  titulo: "Simulado Online de Ciências",

  // Séries disponíveis para o aluno escolher (precisam existir no banco).
  series: ["6º Ano", "7º Ano", "8º Ano", "9º Ano"],

  // Composição da prova: 20 fáceis + 20 médias = 40 questões.
  quantidadeFaceis: 20,
  quantidadeMedias: 20,

  // true  = cada aluno recebe uma prova diferente (sorteio individual, dificulta a "cola").
  // false = todos os alunos da mesma série recebem a MESMA prova (definida pelo codigoProva).
  // ATENÇÃO: se você mudar o codigoProva, a prova muda. Gere de novo os PDFs do gabarito
  // (página gabarito.html) antes de aplicar.
  provaIndividual: false,
  codigoProva: "4BIM-2026",

  // Embaralha a ordem das alternativas (A–E) de cada questão.
  // Recomendado: no banco atual a maioria das respostas corretas é a letra B.
  embaralharAlternativas: true,

  // Mostrar ao aluno o gabarito comentado depois que ele finaliza.
  // false = o aluno vê só a nota; o gabarito é entregue pelo professor (PDF da página gabarito.html).
  mostrarGabarito: false,

  // Endereço do Google Apps Script que grava os resultados na planilha.
  // Deixe vazio ("") enquanto não estiver configurado. Veja o README.
  urlPlanilha: "https://script.google.com/macros/s/AKfycbxCiMI8j0IcDwuF2OYXm2Aa0R2Qr9wbMhLSSbxEvap8uq6c6oN_2tG9iC9AZ8_ejsb6DA/exec"
};

/**
 * OUTROS SIMULADOS no mesmo site.
 * O simulado acima (Ciências) abre em .../index.html. Cada simulado abaixo abre com ?s=NOME,
 * por exemplo .../index.html?s=biologia  (e o gabarito em .../gabarito.html?s=biologia).
 * Cada um tem seu banco de questões, seus resultados (uma aba própria na planilha) e o seu próprio
 * controle de "código usado": o aluno pode fazer um simulado de cada, com o mesmo código.
 */
window.SIMULADOS = {
  biologia: {
    titulo: "Simulado Online de Biologia",
    bancoQuestoes: "questoes_biologia.json",
    serieBanco: "Biologia",      // as questões do banco pertencem a esta "série"
    series: ["Biologia"],        // usado pela página do gabarito
    seriesPermitidas: [],        // [] = qualquer série com código; ex.: ["8º Ano", "9º Ano"] limita o acesso
    quantidadeFaceis: 25,
    quantidadeMedias: 25,
    codigoProva: "BIO-2026"
  }
};
(function () {
  var id = null;
  try { id = new URLSearchParams(location.search).get("s"); } catch (e) { /* ignore */ }
  var o = id && Object.prototype.hasOwnProperty.call(window.SIMULADOS, id) ? window.SIMULADOS[id] : null;
  if (o) {
    Object.keys(o).forEach(function (k) { window.CONFIG_SIMULADO[k] = o[k]; });
    window.CONFIG_SIMULADO.simulado = id;
  }
})();
