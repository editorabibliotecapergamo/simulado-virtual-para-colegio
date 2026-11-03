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
  // false = todos os alunos da mesma série recebem as mesmas questões (definidas pelo codigoProva).
  provaIndividual: true,
  codigoProva: "4BIM-2026",

  // Embaralha a ordem das alternativas (A–E) de cada questão.
  // Recomendado: no banco atual a maioria das respostas corretas é a letra B.
  embaralharAlternativas: true,

  // Mostrar ao aluno o gabarito comentado depois que ele finaliza.
  mostrarGabarito: true,

  // Endereço do Google Apps Script que grava os resultados na planilha.
  // Deixe vazio ("") enquanto não estiver configurado. Veja o README.
  urlPlanilha: ""
};
