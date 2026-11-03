/**
 * CONFIGURAÇÕES DO SIMULADO ONLINE
 * Edite este arquivo para ajustar o simulado sem mexer no restante do código.
 */
window.CONFIG_SIMULADO = {
  escola: "Colégio Nova Jornada",
  titulo: "Simulado Online de Ciências",

  // Séries disponíveis para o aluno escolher (precisam existir no banco).
  // 6º e 7º anos estão fora por enquanto: as questões novas (baseadas no Caderno do 4º bimestre)
  // só existem para 8º e 9º. Para liberar, acrescente "6º Ano" e "7º Ano" de volta à lista.
  series: ["8º Ano", "9º Ano"],

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
