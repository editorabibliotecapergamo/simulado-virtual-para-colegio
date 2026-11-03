/**
 * SIMULADO ONLINE — lógica da prova do aluno.
 * Carrega questoes.json, sorteia a prova, registra as respostas, corrige e
 * (opcionalmente) envia o resultado para uma planilha do Google.
 */
(function () {
  "use strict";

  var CFG = window.CONFIG_SIMULADO || {};
  var LETRAS = ProvaSimulado.LETRAS;
  var CHAVE = "simulado-online-v1";

  var banco = [];
  var porUid = {};
  var estado = null;

  var $ = function (id) { return document.getElementById(id); };

  // ---------- utilidades ----------
  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function hojeISO() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function dataBR(iso) {
    var p = (iso || "").split("-");
    return p.length === 3 ? p[2] + "/" + p[1] + "/" + p[0] : iso;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento */ }
  }
  function carregarSalvo() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || "null"); } catch (e) { return null; }
  }
  function limparSalvo() {
    try { localStorage.removeItem(CHAVE); } catch (e) { /* ignore */ }
  }
  function mostrarTela(id) {
    ["telaInicio", "telaProva", "telaResultado"].forEach(function (t) { $(t).hidden = t !== id; });
    window.scrollTo(0, 0);
  }

  // ---------- montagem da prova ----------
  function montarProva(aluno) {
    return ProvaSimulado.montarProva(banco, CFG, aluno.serie, aluno.nome + "|" + aluno.numero);
  }
  function letraCorreta(item) {
    return ProvaSimulado.letraCorreta(item, porUid[item.uid]);
  }

  // ---------- tela inicial ----------
  function prepararInicio() {
    $("nomeEscola").textContent = CFG.escola || "Colégio";
    $("tituloSimulado").textContent = CFG.titulo || "Simulado Online";
    document.title = (CFG.titulo || "Simulado Online") + " | " + (CFG.escola || "");
    $("totalQuestoesInfo").textContent = (CFG.quantidadeFaceis || 20) + (CFG.quantidadeMedias || 20);
    var sel = $("serie");
    (CFG.series || []).forEach(function (s) {
      var o = el("option", null, s); o.value = s; sel.appendChild(o);
    });
    $("data").value = hojeISO();

    $("formInicio").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var aluno = {
        nome: $("nome").value.trim().replace(/\s+/g, " "),
        numero: $("numero").value.trim(),
        serie: $("serie").value,
        data: $("data").value
      };
      var erro = "";
      if (aluno.nome.split(" ").length < 2) erro = "Digite seu nome completo (nome e sobrenome).";
      else if (!aluno.numero || +aluno.numero < 1) erro = "Informe seu número na chamada.";
      else if (!aluno.serie) erro = "Escolha a sua série.";
      else if (!aluno.data) erro = "Informe a data.";
      $("erroInicio").textContent = erro;
      if (erro) return;
      iniciar(aluno);
    });

    $("btnRetomar").addEventListener("click", function () { abrirProva(); });
    $("btnDescartar").addEventListener("click", function () {
      if (!confirm("Descartar a prova em andamento e começar outra?")) return;
      limparSalvo(); estado = null; $("cartaoRetomar").hidden = true;
    });
  }

  function iniciar(aluno) {
    estado = {
      aluno: aluno,
      codigoProva: CFG.codigoProva || "",
      questoes: montarProva(aluno),
      respostas: {},
      atual: 0,
      inicio: new Date().toISOString(),
      fim: null,
      envio: null
    };
    salvar();
    abrirProva();
  }

  // ---------- prova ----------
  function abrirProva() {
    $("alunoTopo").hidden = false;
    $("alunoTopo").textContent = estado.aluno.nome + " · Nº " + estado.aluno.numero + " · " + estado.aluno.serie;
    montarGrade();
    mostrarTela("telaProva");
    mostrarQuestao(estado.atual || 0);
  }

  function montarGrade() {
    var g = $("grade");
    g.innerHTML = "";
    estado.questoes.forEach(function (_, i) {
      var b = el("button", null, String(i + 1).padStart(2, "0"));
      b.type = "button";
      b.setAttribute("aria-label", "Ir para a questão " + (i + 1));
      b.addEventListener("click", function () { mostrarQuestao(i); });
      g.appendChild(b);
    });
    atualizarGrade();
  }

  function atualizarGrade() {
    var botoes = $("grade").children;
    var total = estado.questoes.length;
    var feitas = Object.keys(estado.respostas).length;
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].classList.toggle("respondida", estado.respostas[i] != null);
      botoes[i].classList.toggle("atual", i === estado.atual);
    }
    $("contadorRespondidas").textContent = feitas + "/" + total;
    $("progresso").style.width = (100 * feitas / total) + "%";
  }

  function mostrarQuestao(i) {
    estado.atual = i;
    salvar();
    var item = estado.questoes[i];
    var q = porUid[item.uid];
    var box = $("questao");
    box.innerHTML = "";

    var cab = el("div", "questao-cabecalho");
    cab.appendChild(el("span", "questao-numero", "Questão " + (i + 1) + " de " + estado.questoes.length));
    cab.appendChild(el("span", "questao-tag", q.tema));
    box.appendChild(cab);
    box.appendChild(el("p", "enunciado", q.enunciado));

    var lista = el("div", "alternativas");
    lista.setAttribute("role", "radiogroup");
    lista.setAttribute("aria-label", "Alternativas");
    item.ordem.forEach(function (original, pos) {
      var letra = LETRAS[pos];
      var b = el("button", "alternativa");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", estado.respostas[i] === letra ? "true" : "false");
      b.appendChild(el("span", "letra", letra));
      b.appendChild(el("span", null, q.alternativas[original]));
      b.addEventListener("click", function () { responder(letra); });
      lista.appendChild(b);
    });
    box.appendChild(lista);

    $("btnAnterior").disabled = i === 0;
    $("btnProxima").textContent = i === estado.questoes.length - 1 ? "Revisar e finalizar" : "Próxima ›";
    atualizarGrade();
  }

  function responder(letra) {
    var i = estado.atual;
    estado.respostas[i] = letra;
    salvar();
    var botoes = $("questao").querySelectorAll(".alternativa");
    botoes.forEach(function (b, pos) { b.setAttribute("aria-checked", LETRAS[pos] === letra ? "true" : "false"); });
    atualizarGrade();
  }

  function pedirFinalizar() {
    var faltam = estado.questoes.length - Object.keys(estado.respostas).length;
    $("dialogoTexto").textContent = faltam > 0
      ? "Você ainda não respondeu " + faltam + (faltam === 1 ? " questão" : " questões") + ". Questões em branco contam como erro. Deseja finalizar mesmo assim?"
      : "Você respondeu todas as questões. Depois de finalizar não será possível alterar as respostas. Finalizar agora?";
    var d = $("dialogo");
    if (typeof d.showModal !== "function") {
      if (confirm($("dialogoTexto").textContent)) finalizar();
      return;
    }
    d.returnValue = "";
    d.showModal();
  }

  function prepararProva() {
    $("btnAnterior").addEventListener("click", function () { if (estado.atual > 0) mostrarQuestao(estado.atual - 1); });
    $("btnProxima").addEventListener("click", function () {
      if (estado.atual < estado.questoes.length - 1) mostrarQuestao(estado.atual + 1);
      else pedirFinalizar();
    });
    $("btnFinalizar").addEventListener("click", pedirFinalizar);
    $("dialogo").addEventListener("close", function () { if ($("dialogo").returnValue === "sim") finalizar(); });

    document.addEventListener("keydown", function (ev) {
      if ($("telaProva").hidden || $("dialogo").open || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var k = ev.key.toUpperCase();
      var idx = LETRAS.indexOf(k);
      if (idx < 0 && k >= "1" && k <= "5") idx = +k - 1;
      if (idx >= 0) { responder(LETRAS[idx]); ev.preventDefault(); }
      else if (ev.key === "ArrowRight") $("btnProxima").click();
      else if (ev.key === "ArrowLeft" && estado.atual > 0) mostrarQuestao(estado.atual - 1);
    });
  }

  // ---------- resultado ----------
  function corrigir() {
    var acertos = 0;
    var detalhes = estado.questoes.map(function (item, i) {
      var q = porUid[item.uid];
      var marcada = estado.respostas[i] || null;
      var certa = letraCorreta(item);
      var ok = marcada === certa;
      if (ok) acertos++;
      return {
        n: i + 1, uid: item.uid, modulo: q.modulo, dificuldade: q.dificuldade,
        marcada: marcada, correta: certa,
        // letras originais do banco (úteis para o professor conferir no banco de questões)
        marcadaOriginal: marcada ? item.ordem[LETRAS.indexOf(marcada)] : null,
        acertou: ok
      };
    });
    var total = estado.questoes.length;
    return { acertos: acertos, total: total, nota: Math.round(100 * acertos / total) / 10, detalhes: detalhes };
  }

  function finalizar() {
    estado.fim = new Date().toISOString();
    estado.resultado = corrigir();
    salvar();
    mostrarResultado();
    enviarResultado();
  }

  function mostrarResultado() {
    var r = estado.resultado;
    var a = estado.aluno;
    $("alunoTopo").hidden = false;
    $("alunoTopo").textContent = a.nome + " · Nº " + a.numero + " · " + a.serie;
    $("dadosAluno").textContent = a.nome + " · Nº " + a.numero + " · " + a.serie + " · " + dataBR(a.data);
    $("nota").textContent = r.nota.toFixed(1).replace(".", ",");
    $("acertos").textContent = r.acertos + "/" + r.total;
    atualizarStatusEnvio();

    var g = $("gabarito");
    g.innerHTML = "";
    if (CFG.mostrarGabarito !== false) {
      var titulo = el("h1", null, "Gabarito comentado");
      titulo.style.margin = "8px 0 12px";
      g.appendChild(titulo);
      estado.questoes.forEach(function (item, i) {
        var q = porUid[item.uid];
        var d = r.detalhes[i];
        var c = el("article", "cartao item-gabarito" + (d.acertou ? " correta" : ""));
        var cab = el("div", "questao-cabecalho");
        cab.appendChild(el("span", "questao-numero", "Questão " + (i + 1)));
        cab.appendChild(el("span", "situacao " + (d.acertou ? "ok" : "nok"),
          d.acertou ? "✓ Acertou" : (d.marcada ? "✗ Errou" : "✗ Em branco")));
        c.appendChild(cab);
        c.appendChild(el("p", "enunciado", q.enunciado));
        var lista = el("div", "alternativas");
        item.ordem.forEach(function (original, pos) {
          var letra = LETRAS[pos];
          var cls = "alternativa";
          if (letra === d.correta) cls += " e-correta";
          else if (letra === d.marcada) cls += " e-errada";
          var b = el("div", cls);
          b.appendChild(el("span", "letra", letra));
          b.appendChild(el("span", null, q.alternativas[original]));
          lista.appendChild(b);
        });
        c.appendChild(lista);
        c.appendChild(el("p", "justificativa", q.justificativa));
        g.appendChild(c);
      });
    }
    mostrarTela("telaResultado");
  }

  function atualizarStatusEnvio() {
    var s = $("statusEnvio");
    var reenviar = $("btnReenviar");
    reenviar.hidden = true;
    if (!CFG.urlPlanilha) {
      s.className = "envio info";
      s.textContent = "Mostre esta tela ao seu professor (ou imprima / salve em PDF).";
    } else if (estado.envio === "ok") {
      s.className = "envio ok";
      s.textContent = "Resultado enviado ao professor.";
    } else if (estado.envio === "enviando") {
      s.className = "envio info";
      s.textContent = "Enviando resultado ao professor…";
    } else {
      s.className = "envio falha";
      s.textContent = "Não foi possível enviar o resultado ao professor. Verifique a internet e toque em \"Tentar enviar de novo\"." + (estado.erroEnvio ? " (" + estado.erroEnvio + ")" : "");
      reenviar.hidden = false;
    }
  }

  function enviarResultado() {
    if (!CFG.urlPlanilha) return;
    var r = estado.resultado;
    var a = estado.aluno;
    var dados = {
      nome: a.nome, numero: a.numero, serie: a.serie, data: a.data,
      codigoProva: estado.codigoProva,
      acertos: r.acertos, total: r.total, nota: r.nota,
      inicio: estado.inicio, fim: estado.fim,
      duracaoMin: Math.round((new Date(estado.fim) - new Date(estado.inicio)) / 60000),
      respostas: r.detalhes.map(function (d) {
        return d.n + ":" + (d.marcada || "-") + (d.acertou ? "✓" : "✗");
      }).join(" "),
      questoes: r.detalhes.map(function (d) { return d.uid + "=" + (d.marcadaOriginal || "-"); }).join(" ")
    };
    dados.id = estado.inicio + "|" + a.nome + "|" + a.numero + "|" + a.serie;
    estado.envio = "enviando";
    atualizarStatusEnvio();
    // text/plain evita a "pré-verificação" do navegador; o Apps Script responde {"ok":true}.
    fetch(CFG.urlPlanilha, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dados)
    }).then(function (r) { return r.json(); })
      .then(function (resp) {
        if (!resp || resp.ok !== true) throw new Error((resp && resp.erro) || "resposta inesperada");
        estado.envio = "ok";
      })
      .catch(function (e) {
        estado.envio = "falha";
        estado.erroEnvio = String(e && e.message || e);
        if (window.console) console.error("Falha ao enviar para a planilha:", e);
      })
      .then(function () {
        salvar();
        atualizarStatusEnvio();
      });
  }

  // ---------- PDF das respostas do aluno (sem indicar acertos) ----------
  function montarMinhasRespostas() {
    var a = estado.aluno;
    var box = $("minhasRespostas");
    box.innerHTML = "";
    box.appendChild(el("h1", null, (CFG.escola || "") + " · " + (CFG.titulo || "Simulado")));
    box.appendChild(el("p", "dados-aluno", a.nome + " · Nº " + a.numero + " · " + a.serie + " · " + dataBR(a.data)));
    box.appendChild(el("p", "dados-aluno", "Minhas respostas (para estudar depois). O gabarito será entregue pelo professor."));
    estado.questoes.forEach(function (item, i) {
      var q = porUid[item.uid];
      var marcada = estado.respostas[i];
      var c = el("div", "copia-questao");
      c.appendChild(el("p", "enunciado", (i + 1) + ". " + q.enunciado));
      item.ordem.forEach(function (original, pos) {
        var letra = LETRAS[pos];
        var linha = el("p", "copia-alt" + (letra === marcada ? " marcada" : ""),
          (letra === marcada ? "(X) " : "(  ) ") + letra + ") " + q.alternativas[original]);
        c.appendChild(linha);
      });
      if (!marcada) c.appendChild(el("p", "copia-branco", "Questão em branco."));
      box.appendChild(c);
    });
  }

  function salvarMinhasRespostas() {
    montarMinhasRespostas();
    document.body.classList.add("imprimindo-respostas");
    var limpar = function () {
      document.body.classList.remove("imprimindo-respostas");
      window.removeEventListener("afterprint", limpar);
    };
    window.addEventListener("afterprint", limpar);
    window.print();
  }

  function prepararResultado() {
    $("btnReenviar").addEventListener("click", enviarResultado);
    $("btnImprimir").addEventListener("click", salvarMinhasRespostas);
    $("btnNovaProva").addEventListener("click", function () {
      if (!confirm("Começar uma nova prova? O resultado desta tela será apagado deste aparelho.")) return;
      limparSalvo();
      estado = null;
      $("alunoTopo").hidden = true;
      $("formInicio").reset();
      $("data").value = hojeISO();
      $("cartaoRetomar").hidden = true;
      mostrarTela("telaInicio");
    });
  }

  // ---------- inicialização ----------
  function iniciarApp() {
    prepararInicio();
    prepararProva();
    prepararResultado();

    fetch("questoes.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (dados) {
        banco = dados;
        banco.forEach(function (q) { porUid[q.uid] = q; });
        $("carregando").hidden = true;

        var salvo = carregarSalvo();
        if (salvo && salvo.questoes && salvo.questoes.every(function (it) { return porUid[it.uid]; })) {
          estado = salvo;
          if (estado.resultado) {
            mostrarResultado();
            if (estado.envio !== "ok" && CFG.urlPlanilha) enviarResultado();
            return;
          }
          $("textoRetomar").textContent = "Há uma prova em andamento neste aparelho para " + estado.aluno.nome +
            " (" + estado.aluno.serie + "), com " + Object.keys(estado.respostas).length + " de " +
            estado.questoes.length + " questões respondidas.";
          $("cartaoRetomar").hidden = false;
        }
        mostrarTela("telaInicio");
      })
      .catch(function () {
        $("carregando").textContent = "Não foi possível carregar as questões. Verifique a internet e recarregue a página.";
      });
  }

  mostrarTela(null);
  iniciarApp();
})();
