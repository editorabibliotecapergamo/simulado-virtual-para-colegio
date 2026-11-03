/**
 * SORTEIO DA PROVA — usado pelo site do aluno (simulado.js) e pela página do
 * professor (gabarito.html), para que os dois gerem EXATAMENTE a mesma prova.
 */
(function () {
  "use strict";

  var LETRAS = ["A", "B", "C", "D", "E"];

  function hashTexto(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
  }
  function geradorAleatorio(semente) {
    var a = semente >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function embaralhar(lista, rnd) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Distribui as questões igualmente entre os módulos (round-robin).
  function selecionar(lista, quantidade, rnd) {
    var grupos = {};
    lista.forEach(function (q) { (grupos[q.modulo] = grupos[q.modulo] || []).push(q); });
    var filas = embaralhar(Object.keys(grupos), rnd).map(function (m) { return embaralhar(grupos[m], rnd); });
    var escolhidas = [];
    while (escolhidas.length < quantidade && filas.some(function (f) { return f.length; })) {
      for (var i = 0; i < filas.length && escolhidas.length < quantidade; i++) {
        if (filas[i].length) escolhidas.push(filas[i].shift());
      }
    }
    return escolhidas;
  }

  /**
   * Monta a prova de uma série.
   * Prova igual para todos (provaIndividual: false): a semente vem só do código da prova + série,
   * então o aluno e o professor sempre obtêm as mesmas questões, na mesma ordem.
   */
  function montarProva(banco, cfg, serie, nomeAluno) {
    var semente = cfg.provaIndividual === false
      ? hashTexto((cfg.codigoProva || "") + "|" + serie)
      : hashTexto(nomeAluno + "|" + Date.now() + "|" + Math.random());
    var rnd = geradorAleatorio(semente);
    var daSerie = banco.filter(function (q) { return q.serie === serie; });
    var faceis = selecionar(daSerie.filter(function (q) { return q.dificuldade === "Fácil"; }), cfg.quantidadeFaceis || 20, rnd);
    var medias = selecionar(daSerie.filter(function (q) { return q.dificuldade === "Médio"; }), cfg.quantidadeMedias || 20, rnd);
    var prova = embaralhar(faceis.concat(medias), rnd);
    // Letras-alvo da resposta certa, em partes iguais (A–E), para o gabarito não ficar concentrado numa letra.
    var alvos = [];
    for (var n = 0; n < prova.length; n++) alvos.push(LETRAS[n % LETRAS.length]);
    alvos = embaralhar(alvos, rnd);
    return prova.map(function (q, n) {
      if (cfg.embaralharAlternativas === false) return { uid: q.uid, ordem: LETRAS.slice() };
      var ordem = embaralhar(LETRAS, rnd);
      var pos = LETRAS.indexOf(alvos[n]);
      var atual = ordem.indexOf(q.resposta_correta);
      var troca = ordem[pos]; ordem[pos] = ordem[atual]; ordem[atual] = troca;
      return { uid: q.uid, ordem: ordem };
    });
  }

  // Letra exibida ao aluno que corresponde à resposta correta do banco.
  function letraCorreta(item, questao) {
    return LETRAS[item.ordem.indexOf(questao.resposta_correta)];
  }

  window.ProvaSimulado = { LETRAS: LETRAS, montarProva: montarProva, letraCorreta: letraCorreta };
})();
