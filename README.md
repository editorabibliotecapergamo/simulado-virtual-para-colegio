# simulado-virtual-para-colegio
Simulado para facilitar os estudos e avaliação dos alunos

## Onde paramos (pausa em 23/11/2026)

> **Para quem retomar o trabalho:** quando o Augusto der o comando de retorno, comece relembrando a ele, exatamente, o que está
> abaixo (o que está pronto e o que falta), e só depois siga em frente. Esta seção é pública: não coloque aqui nomes de
> alunos, códigos de acesso nem texto do material do Objetivo.

**Pronto e no ar (`main`):**
- **Simulado de Ciências** (6º ao 9º ano): 40 questões por série (20 fáceis + 20 médias), prova igual para todos da série, sem gabarito
  para o aluno, resultados na planilha do Augusto. Cada aluno entra com um **código individual** (aba **Códigos**), que vale uma vez.
- **Simulado de Biologia** (PRs #6, #7 e #8 mesclados): 50 questões (25 fáceis + 25 médias) sobre artrópodes (14), divisão celular (11),
  membrana celular (10), equinodermos (8) e cordados (7). Links: `?s=biologia` na prova e `gabarito.html?s=biologia`.
  É **restrito**: só entra o código com "Disponível" na coluna **Situação (Biologia)** da aba Códigos, e hoje só **um código avulso** está liberado.
- Em 17/11 dois códigos de alunas do 6º A estavam "Usado" sem prova enviada (efeito de apagar a linha de teste dos resultados) e foram
  liberados. Regra: **apagar o resultado não libera o aluno; é preciso trocar a Situação para "Disponível" na aba Códigos.**

**Falta (últimas informações, de 18/11; não confirmado se já foi feito):**
1. O Augusto **colar o `apps-script/Codigo.gs` mais novo** no Apps Script e publicar em Implantar > Gerenciar implantações > lápis > **Nova versão**.
   Sem isso a versão antiga continua ativa (deixa qualquer código entrar na Biologia e lê as colunas por posição).
2. Depois, avisar a thread do simulado: ela insere a coluna **Aluno** (nomes) na coluna A da aba Códigos, com a lista privada de nomes.
   Em 23/11 a coluna **ainda não existia** na planilha (o cabeçalho começa em "Código"). **Não inserir a coluna antes do passo 1**: o script
   antigo passaria a ler o nome no lugar do código e todos os alunos veriam "código não encontrado".
3. Testar no ar com o código avulso da Biologia (o ambiente do Claude não alcança o Google nem o GitHub Pages, então só o Augusto consegue testar o site).

**Ideias ainda não pedidas:** liberar a Biologia para mais alunos (escrever "Disponível" na coluna G da linha deles) ou limitar por série
(`seriesPermitidas` no `config.js`); novos temas de Biologia entram refazendo o banco e o gabarito (a prova muda).

## Simulado online (para o aluno fazer em casa)

O site do aluno é o `index.html`. Ele funciona no computador, tablet e celular.

1. O aluno informa **nome, código de acesso e data**. A série, a turma e o número vêm do código.
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

**Código de acesso (um envio por aluno):** cada aluno recebe um código de 3 letras + 3 números (ex.: `ABC123`).
Os códigos ficam na segunda aba da planilha, chamada **Códigos** (colunas: Código, Série, Turma, Número,
Situação, Usado em), **nunca no repositório**: ele é público e os códigos, e principalmente os nomes
dos alunos, não podem ser publicados nele. A aba não tem nomes. Ao enviar a prova, o Apps Script grava o resultado
e troca a Situação do código para "Usado"; um código usado não entra de novo.
Para liberar um aluno, troque "Usado" por "Disponível" na aba Códigos.

### Outros simulados no mesmo site (Biologia)

Além do simulado de Ciências (`index.html`), o site tem o **Simulado de Biologia**: 50 questões (25 fáceis + 25 médias)
sobre artrópodes, equinodermos, cordados, membrana celular e divisão celular. Os links são:

- Prova: `index.html?s=biologia`
- Gabarito do professor: `gabarito.html?s=biologia` (imprima em PDF)

Como funciona: as questões ficam em `questoes_biologia.json` (gerado por `python3 scripts/gerar_biologia.py`, a partir de
`scripts/dados/biologia_50.py`) e a configuração em `window.SIMULADOS` no `config.js`. O aluno usa o **mesmo código de acesso**,
e o código vale uma vez em cada simulado: o Apps Script guarda a Situação do simulado de Biologia nas colunas "Situação (Biologia)" e "Usado em (Biologia)" da
aba **Códigos** e grava os resultados numa aba própria chamada **Biologia** (criada sozinha no primeiro envio).
O simulado de Biologia é **restrito**: só entra o código que tiver "Disponível" escrito na coluna **Situação (Biologia)** da aba **Códigos**
(célula vazia = "este simulado não está liberado para o seu código"). Para dar acesso a mais alguém, escreva "Disponível"
na coluna **Situação (Biologia)** da linha dele; para liberar quem já usou, troque "Usado" por "Disponível". A lista de quem tem acesso fica só na
planilha, nunca no site público.
Depois de mudar o `Codigo.gs`, publique uma **nova versão** no Apps Script.

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

A aba **Códigos** pode ter uma coluna **Aluno** (nome), na coluna A ou em qualquer outra: o script acha as colunas pelo nome do
cabeçalho (Código, Série, Turma, Número, Situação, Usado em, Situação (Biologia), Usado em (Biologia)), então a ordem não
importa. Não renomeie esses cabeçalhos. Os nomes ficam só na planilha, nunca neste repositório público.
