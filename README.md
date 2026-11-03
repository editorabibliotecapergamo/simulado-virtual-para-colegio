# simulado-virtual-para-colegio
Simulado para facilitar os estudos e avaliação dos alunos

## Simulado online (para o aluno fazer em casa)

O site do aluno é o `index.html`. Ele funciona no computador, tablet e celular.

1. O aluno informa **nome, número, série e data**.
2. Recebe uma prova de **40 questões** (20 fáceis + 20 médias) sorteadas do banco da sua série,
   distribuídas igualmente entre os módulos. **Todos os alunos da mesma série fazem a mesma prova.**
3. Responde no próprio aparelho. As respostas ficam salvas: se a página fechar, é só abrir o link de novo.
4. Ao finalizar, vê a nota (0 a 10) e os acertos, **sem o gabarito**. Se a planilha estiver configurada,
   o resultado é enviado automaticamente para o professor.

### Gabarito para o professor

Abra `gabarito.html` (no mesmo endereço do site, sem link na página do aluno), escolha a série e clique em
**Baixar PDF do gabarito** (no diálogo, *Salvar como PDF*). O gabarito sempre corresponde à prova que os alunos
recebem. Se mudar o `codigoProva` em `config.js`, a prova muda: baixe os PDFs de novo.

### Arquivos

| Arquivo | Para que serve |
|---|---|
| `index.html`, `simulado.css`, `simulado.js`, `prova.js` | O site do simulado (`prova.js` sorteia a prova) |
| `gabarito.html` | Página do professor: gabarito comentado por série, para salvar em PDF |
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

Cada prova finalizada vira uma linha na primeira aba da planilha (nome, número, série, data, acertos, nota,
duração e as respostas marcadas).

**Um envio por número:** cada aluno (série + número) só pode enviar uma prova. O site avisa ao digitar o número
e o Apps Script recusa um segundo envio. Para liberar um aluno (por exemplo, se outro usou o número dele),
troque "Válido" por "Liberado" na última coluna ("Situação") da linha do primeiro envio, ou apague a linha.

### Limitações conhecidas

- O gabarito fica dentro do site (`questoes.json`) e a página `gabarito.html` não tem senha. Um aluno com conhecimento técnico conseguiria encontrá-lo.
  Para um simulado de estudo isso é aceitável; para uma prova valendo nota alta, a correção teria que
  ser feita no servidor.
- No banco atual, cerca de 83% das respostas corretas são a letra **B**. Por isso o simulado
  embaralha a ordem das alternativas (`embaralharAlternativas: true` em `config.js`).

### Testar no computador

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```
