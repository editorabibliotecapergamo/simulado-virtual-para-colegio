# simulado-virtual-para-colegio
Simulado para facilitar os estudos e avaliação dos alunos

## Simulado online (para o aluno fazer em casa)

O site do aluno é o `index.html`. Ele funciona no computador, tablet e celular.

1. O aluno informa **nome, número, série e data**.
2. Recebe uma prova de **40 questões** (20 fáceis + 20 médias) sorteadas do banco da sua série,
   distribuídas igualmente entre os módulos.
3. Responde no próprio aparelho. As respostas ficam salvas: se a página fechar, é só abrir o link de novo.
4. Ao finalizar, vê a nota (0 a 10), os acertos e o gabarito comentado. Se a planilha estiver configurada,
   o resultado é enviado automaticamente para o professor.

### Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html`, `simulado.css`, `simulado.js` | O site do simulado |
| `config.js` | **Ajustes**: quantidade de questões, prova igual para todos ou individual, gabarito, endereço da planilha |
| `questoes.json` | As 1.000 questões extraídas do `banco_questoes_simulado.html` |
| `scripts/extrair_questoes.py` | Gera o `questoes.json` de novo quando o banco for alterado |
| `apps-script/Codigo.gs` | Código para a planilha do Google que recebe os resultados |

### 1. Publicar o link (GitHub Pages, gratuito)

No GitHub: **Settings › Pages › Build and deployment** → Source: *Deploy from a branch* →
Branch: `main`, pasta `/ (root)` → **Save**. Em 1 a 2 minutos o link fica disponível em
`https://editorabibliotecapergamo.github.io/simulado-virtual-para-colegio/`.

> Observação: o GitHub Pages gratuito exige que o repositório seja **público**.

### 2. Receber os resultados numa planilha do Google (opcional)

1. Crie uma planilha no Google Planilhas.
2. **Extensões › Apps Script**, apague o conteúdo e cole o arquivo `apps-script/Codigo.gs`.
3. **Implantar › Nova implantação › App da Web**. Executar como: *Eu*. Quem pode acessar: *Qualquer pessoa*.
4. Copie o endereço que termina em `/exec` e cole em `config.js`, no campo `urlPlanilha`.

Cada prova finalizada vira uma linha na aba **Resultados** (nome, número, série, data, acertos, nota,
duração e as respostas marcadas).

### Limitações conhecidas

- O gabarito fica dentro do site (`questoes.json`). Um aluno com conhecimento técnico conseguiria encontrá-lo.
  Para um simulado de estudo isso é aceitável; para uma prova valendo nota alta, a correção teria que
  ser feita no servidor.
- No banco atual, cerca de 83% das respostas corretas são a letra **B**. Por isso o simulado
  embaralha a ordem das alternativas (`embaralharAlternativas: true` em `config.js`).

### Testar no computador

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```
