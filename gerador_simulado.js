/**
 * MÓDULO GERADOR DE SIMULADOS & EXPORTAÇÃO PADRÃO
 * Colégio Nova Jornada — Sistema Integrado de Avaliações
 */

const GeradorSimulado = {
  /**
   * Exporta a lista de questões selecionadas para o formato Word (.doc)
   * respeitando a diagramação padrão oficial (2 colunas, cabeçalho, instruções e cartão óptico).
   */
  exportarWord: function(selectedList, options = {}) {
    if (!selectedList || selectedList.length === 0) {
      alert("Selecione pelo menos uma questão para exportar.");
      return;
    }

    const {
      turmaLabel = "9º ANO A",
      disciplina = "CIÊNCIAS NATURAIS",
      includeAnswers = false,
      includeCard = true,
      twoCols = true,
      hideTags = false,
      serieFileTag = "simulado"
    } = options;

    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Simulado Colégio Nova Jornada - ${turmaLabel}</title>
        <style>
          @page {
            size: 21.0cm 29.7cm;
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
            mso-page-orientation: portrait;
          }
          @page SectionHeader {
            size: 21.0cm 29.7cm;
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
          }
          @page SectionTwoCols {
            size: 21.0cm 29.7cm;
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
            mso-columns: 2 24.0pt;
          }
          @page SectionSingleCol {
            size: 21.0cm 29.7cm;
            margin: 1.8cm 1.5cm 1.8cm 1.5cm;
          }
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 10.5pt;
            line-height: 1.25;
            color: #0f172a;
          }
          div.SectionHeader { page: SectionHeader; }
          div.SectionBody { 
            ${twoCols ? 'page: SectionTwoCols; column-count: 2; column-gap: 24pt;' : 'page: SectionSingleCol;'} 
          }
          div.SectionCard { page: SectionSingleCol; page-break-before: always; mso-break-type: section-break; }
          table.header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12pt;
            border: 1.5pt solid #1e3a8a;
          }
          table.header-table td {
            padding: 4pt 6pt;
            border: 0.5pt solid #cbd5e1;
            font-size: 9.5pt;
          }
          .instrucoes {
            background-color: #f8fafc;
            border-left: 3pt solid #0d9488;
            border-top: 0.5pt solid #cbd5e1;
            border-right: 0.5pt solid #cbd5e1;
            border-bottom: 0.5pt solid #cbd5e1;
            padding: 6pt 10pt;
            margin-bottom: 14pt;
            font-size: 9pt;
            line-height: 1.35;
          }
          .q-box {
            margin-bottom: 12pt;
            page-break-inside: avoid;
            break-inside: avoid;
            font-size: 10.5pt;
          }
          .q-num {
            font-weight: bold;
            color: #1e3a8a;
          }
          .q-tag {
            font-size: 8.5pt;
            color: #64748b;
            font-style: italic;
          }
          .alt-item {
            margin-left: 12pt;
            margin-top: 1.5pt;
            margin-bottom: 1.5pt;
            font-size: 10pt;
          }
          .gabarito-tag {
            color: #166534;
            background-color: #f0fdf4;
            border: 0.5pt solid #bbf7d0;
            padding: 3pt 6pt;
            font-size: 8.5pt;
            margin-top: 3pt;
          }
          .cartao-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5pt solid #1e3a8a;
            margin-top: 10pt;
          }
          .cartao-table td {
            border: 0.5pt solid #cbd5e1;
            padding: 3.5pt;
            text-align: center;
            font-size: 9pt;
          }
          .cartao-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            padding: 4pt;
            font-size: 9pt;
            font-weight: bold;
          }
          .prof-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
            margin-top: 10pt;
          }
          .prof-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            border: 0.5pt solid #000;
            padding: 4pt;
            font-weight: bold;
          }
          .prof-table td {
            border: 0.5pt solid #cbd5e1;
            padding: 3.5pt 5pt;
            font-size: 8.5pt;
          }
        </style>
      </head>
      <body>
        <div class="SectionHeader">
          <table class="header-table">
            <tr>
              <td colspan="3" style="text-align: center; font-weight: bold; font-size: 12pt; background-color: #f1f5f9; color: #1e3a8a;">
                COLÉGIO NOVA JORNADA — ENSINO FUNDAMENTAL II<br>
                <span style="font-size: 9.5pt; color: #0d9488; font-weight: 700;">AVALIAÇÃO BIMESTRAL DE CIÊNCIAS NATURAIS — 4º BIMESTRE DE 2026</span>
              </td>
            </tr>
            <tr>
              <td style="width: 50%;"><strong>ALUNO(A):</strong> ___________________________________</td>
              <td style="width: 25%;"><strong>Nº:</strong> _______</td>
              <td style="width: 25%;"><strong>TURMA:</strong> ${turmaLabel}</td>
            </tr>
            <tr>
              <td><strong>DISCIPLINA:</strong> ${disciplina}</td>
              <td><strong>DATA:</strong> ___/___/2026</td>
              <td><strong>NOTA:</strong> _________</td>
            </tr>
          </table>

          <div class="instrucoes">
            <strong>INSTRUÇÕES GERAIS PARA O ESTUDANTE:</strong><br>
            • Avaliação contendo ${selectedList.length} questões objetivas de múltipla escolha (A a E) de resposta única.<br>
            • Preencha o Cartão-Resposta com caneta azul ou preta. Não amasse ou rasure. Proibido uso de aparelhos eletrônicos.
          </div>
        </div>

        <div class="SectionBody">
    `;

    selectedList.forEach((q, idx) => {
      const num = idx + 1;
      docContent += `
        <div class="q-box">
          <p>
            <span class="q-num">${num < 10 ? '0' + num : num}.</span> 
            ${!hideTags ? `<span class="q-tag">[${q.modulo.split(':')[0]} • ${q.dificuldade}]</span> ` : ''}
            ${q.enunciado}
          </p>
          ${['A','B','C','D','E'].map(l => `
            <div class="alt-item"><strong>(${l})</strong> ${q.alternativas[l]}</div>
          `).join('')}
          ${includeAnswers ? `
            <div class="gabarito-tag"><strong>[Gabarito: (${q.resposta_correta})]</strong> ${q.justificativa}</div>
          ` : ''}
        </div>
      `;
    });

    docContent += `</div>`;

    if (includeCard) {
      docContent += `
        <div class="SectionCard">
          <h3 style="text-align: center; font-size: 13pt; color: #1e3a8a; margin-top: 15pt; text-transform: uppercase;">
            FOLHA DE RESPOSTAS OFICIAL — SIMULADO 4º BIMESTRE
          </h3>
          <p style="text-align: center; font-size: 9pt; color: #64748b; margin-bottom: 12pt;">
            Preencha integralmente a bolha correspondente com caneta azul ou preta. Exemplo: ( ● )
          </p>
          <table class="cartao-table">
            <tr>
              <th>Q.</th><th>Alternativas</th>
              <th>Q.</th><th>Alternativas</th>
              <th>Q.</th><th>Alternativas</th>
              <th>Q.</th><th>Alternativas</th>
            </tr>
      `;

      const total = selectedList.length;
      const rows = Math.ceil(total / 4);

      for (let r = 0; r < rows; r++) {
        const isZebra = (r % 2 === 1);
        docContent += `<tr style="${isZebra ? 'background-color: #f8fafc;' : ''}">`;
        for (let c = 0; c < 4; c++) {
          const qNum = r + 1 + c * rows;
          if (qNum <= total) {
            docContent += `
              <td style="font-weight: bold; color: #1e3a8a; width: 28pt;">${qNum < 10 ? '0' + qNum : qNum}</td>
              <td style="letter-spacing: 3pt; font-family: monospace; font-size: 9.5pt;">(A) (B) (C) (D) (E)</td>
            `;
          } else {
            docContent += `<td></td><td></td>`;
          }
        }
        docContent += `</tr>`;
      }
      docContent += `</table></div>`;
    }

    if (includeAnswers) {
      docContent += `
        <div class="SectionCard">
          <h3 style="text-align: center; font-size: 13pt; color: #1e3a8a; margin-top: 15pt;">
            GABARITO COMENTADO & JUSTIFICATIVAS DOCENTES
          </h3>
          <p style="text-align: center; font-size: 9pt; color: #64748b; margin-bottom: 10pt;">
            Documento pedagógico de apoio e resolução analítica detalhada.
          </p>
          <table class="prof-table">
            <tr>
              <th style="width: 25pt;">Q.</th>
              <th style="width: 32pt;">Gabarito</th>
              <th style="width: 45pt;">Série</th>
              <th style="width: 140pt;">Módulo & Tema</th>
              <th style="width: 50pt;">Dificuldade</th>
              <th>Justificativa Pedagógica</th>
            </tr>
            ${selectedList.map((q, idx) => `
              <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${q.resposta_correta}</td>
                <td style="text-align: center;">${q.serie}</td>
                <td><strong>${q.modulo.split(':')[0]}:</strong> ${q.tema}</td>
                <td style="text-align: center;">${q.dificuldade}</td>
                <td style="line-height: 1.3;">${q.justificativa}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }

    docContent += `</body></html>`;

    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Simulado_Ciencias_${serieFileTag}_Padrao_ColegioNovaJornada.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Aciona a impressão nativa com CSS otimizado para PDF
   */
  imprimirPDF: function() {
    window.print();
  }
};
