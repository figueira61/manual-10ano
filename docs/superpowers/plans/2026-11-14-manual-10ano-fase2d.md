# Fase 2D — Modos e páginas: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A aluna passa a ter Treino (sugestão diária ou escolha livre, níveis de ajuda), Teste (temas, 10/15/20, nota 0–20), a página O meu progresso e uma vista só de leitura para o encarregado, tudo sobre o motor e os geradores já publicados.

**Architecture:** As regras ficam em módulos puros, testáveis em Node: `js/treino.js`, `js/teste.js`, `js/painel.js`. As vistas DOM ficam em `js/vistas-estudo.js` (Treino, Teste) e `js/vistas-progresso.js` (progresso e encarregado), montadas por `Manual.vistasConta.montar`. O `quiz.js` ganha opções de modo: pista, guiado, sem feedback durante o teste, "Rever no manual". A tabela `tentativas` ganha a coluna `contexto` (migração 0004), aplicada antes de o cliente novo ser publicado.

**Tech Stack:** O mesmo das fases anteriores: JS clássico no namespace `Manual`, sem build, testes com `node --test`, Supabase via `js/conta.js`, KaTeX vendorizado e service worker com `lista-cache.js`.

**Spec:** `docs/superpowers/specs/2026-11-12-manual-10ano-fase2-design.md`, secções 5.5, 5.6, 7 e 8.

## Global Constraints

- Português europeu, tratamento por "tu", sem anglicismos na interface.
- Sem dependências novas, sem CDN e sem passo de build. Cada ficheiro novo entra no `index.html` e no `lista-cache.js` (`npm run cache`).
- Só `js/conta.js` fala com o Supabase. Os testes nunca chamam o Supabase. Só a chave `anon` vai no cliente.
- `localStorage` só dentro de try/catch. Sem rede ou sem conta, tudo funciona com o histórico local. Só contas de aluna registam tentativas (regra de `Manual.render.responderMiniquiz`).
- Os estados mostram cor e etiqueta e leem-se sem cor: "Domina", "Com dificuldade", "Não conseguiu resolver", "Sem tentativas".
- A layout funciona a 375 px de largura e no tema escuro.
- Consultas SQL de verificação só leem colunas não pessoais. Não se cria nenhuma conta, nem se escreve palavra-passe nenhuma.
- A migração 0004 só se aplica na base de produção com aprovação explícita do utilizador, e antes do push do cliente que envia `contexto`.
- Commits com a identidade noreply e o trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Ramo `fase-2d`, criado a partir de `main` (8736eae).
- O `npm test`, o `npm run validar` e o `npm run verificar` (77 geradores, 0 erros) continuam a passar.

## Decisões deste plano

1. **O nível 0 (guiado) é só apresentação.** Antes de responder, a aluna vê os passos da resolução um a um ("passo — porquê", com o botão "Próximo passo"), **sem o cálculo**, e escreve só a resposta final. A spec previa verificar cada passo. Isso obrigaria cada gerador a declarar o valor intermédio de cada passo (cerca de 52 geradores numéricos) e fica como tarefa de conteúdo para depois. `def.niveis` continua opcional e os geradores são sempre chamados com o nível 2.
2. **O nível 1 é a pista.** O botão "Dá-me uma pista" mostra o primeiro passo ("passo — porquê", sem o cálculo) e marca `usou_pista: true`. No nível 2 não há botão.
3. **Treino e Teste só usam exercícios gerados.** Os bancos estão nos ficheiros de tema, que só carregam quando são abertos. Todos os subtemas de Matemática A têm pelo menos 3 geradores, e uma disciplina sem geradores não aparece nestes modos.
4. **Erros frequentes em linguagem simples.** Há 356 códigos, demasiados para um texto escrito à mão para cada um. O texto vem do próprio código (`nao_dividiu_por_2` → "Não dividiu por 2"), com um mapa de exceções para os códigos partilhados e para os que não se leem bem, e é mostrado com o nome do gerador onde aconteceu.
5. **"Rever no manual" liga à página do subtema.** Só aparece no Treino e no Teste, porque no mini-quiz a aluna já está nessa página. `rever.ancora` fica por usar, porque nenhum gerador a declara.
6. **Exportar, apagar conta e ligações.** A página de progresso reutiliza os blocos de `vistas-conta.js` (passam a ser exportados) e não os duplica. `#/conta` mantém-se.

## Review Focus

1. **Ordem de publicação:** um cliente que envia `contexto` antes de a coluna existir recebe um erro permanente do PostgREST, e as tentativas vão para a quarentena. A Task 8 aplica a 0004 antes do push e confirma a coluna. A Task 1 testa que `construirTentativa` não manda `contexto: undefined`.
2. **Aluna nova, sem histórico:** a sugestão do Treino nunca vem vazia e propõe os primeiros subtemas do currículo (teste na Task 2).
3. **Teste com poucos geradores nos temas escolhidos:** completa com os outros temas escolhidos, nunca repete um tipo e, se mesmo assim ficarem menos perguntas, diz quantas (teste na Task 3).
4. **Encarregado sem educandas, ou ligação revogada enquanto a página está aberta:** mostra uma mensagem e uma ligação para inserir um código, sem erro (teste na Task 6 para o modelo e verificação no browser na Task 7).
5. **Sair a meio de um Teste:** o cronómetro para, as perguntas por responder não se registam e voltar à página começa de novo (teste na Task 4: `destruir()` limpa o intervalo).

---

### Task 1: Coluna `contexto` e tentativas por modo

**Files:** Create `supabase/migracoes/0004_contexto.sql`, `supabase/testes/0004_contexto.sql`. Modify `js/quiz.js` (`construirTentativa`), `js/miniquiz.js` (`candidatos` acrescenta `tema`), `tests/quiz.test.js`, `tests/miniquiz.test.js`, `supabase/README.md`.

**Interfaces:**
- Produces:
  - `Manual.quiz.construirTentativa(contexto, pergunta, indice, resultado, duracaoMs, sessaoId, erroTipico, modo?)`. O último argumento é opcional e vale `{ modo = 'quiz', nivel_ajuda = 2, usou_pista = false, viu_resolucao = false }`. Quando `pergunta.contexto` é uma string, a tentativa leva `contexto`; quando não é, não leva a chave.
  - Cada candidato gerado de `Manual.miniquiz.candidatos` passa a ter `tema: def.tema`.
- Migração 0004: `alter table public.tentativas add column contexto text null check (contexto is null or char_length(contexto) <= 40);`. As políticas RLS não mudam.

- [ ] **Step 1: Testes que falham**
  - `construirTentativa` com `{ modo: 'treino', nivel_ajuda: 1, usou_pista: true }` devolve esses valores.
  - Sem o 8.º argumento, mantém `modo: 'quiz'`, `nivel_ajuda: 2`, `usou_pista: false` e `viu_resolucao: false`.
  - Uma pergunta com `contexto: 'deposito'` dá `t.contexto === 'deposito'`. Uma pergunta sem contexto, ou com `contexto: null`, dá `!('contexto' in t)`.
  - Cada candidato gerado tem `tema` igual ao tema do gerador.
  - `modo` fora de quiz/treino/teste lança um erro.
- [ ] **Step 2:** Correr `node --test tests/quiz.test.js tests/miniquiz.test.js` e ver que FALHA.
- [ ] **Step 3:** Implementar e escrever a migração e o teste SQL. O teste SQL, no estilo de `supabase/testes/0003_rls.sql`, insere uma tentativa com `contexto` e outra sem, como aluna de teste, numa transação com `rollback`.
- [ ] **Step 4:** Correr `npm test`, que tem de PASSAR. **Não aplicar a migração** (a Task 8 aplica-a).
- [ ] **Step 5:** Commit `feat: tentativas guardam o contexto e o modo (migração 0004 por aplicar)`.

### Task 2: Lógica do Treino (`js/treino.js`)

**Files:** Create `js/treino.js`, `tests/treino.test.js`. Modify `index.html` (depois de `miniquiz.js`), `lista-cache.js`.

**Interfaces:**
- Consumes:
  - `Manual.aprendizagem.{classificarSubtema, emRevisao, proximoNivel, diaLisboa}`;
  - `Manual.selecao.escolher`;
  - `Manual.miniquiz.candidatos`;
  - `Manual.geradores.{doSubtema, gerar}`;
  - `Manual.indice`.
- Produces `Manual.treino`:
  - `nivelInicial(estado) -> 0|1|2`: `'nao_resolvido'`→0, `'dificuldade'`→1, `'domina'`→2, `null`→1.
  - `nivelAtual(historico, chave, estado) -> 0|1|2`. Parte de `nivelInicial(estado)` e aplica `proximoNivel` às tentativas com `modo === 'treino'` dessa chave, por ordem de `criado_em`. Cada vez que o nível muda, a janela recomeça.
  - `sugestao(estados: {chave,estado,proxima_revisao}[], indice, agora: Date, max = 3) -> chave[]`. Vem primeiro `emRevisao`, depois `nao_resolvido`, depois `dificuldade`, e completa com os primeiros subtemas do índice ainda sem estado. Só entram chaves com geradores, nunca há repetidas, e o resultado nunca vem vazio quando há geradores.
  - `montarTreino(chaves: string[], historico, { n = 9, rng }) -> pergunta[]`. Reparte `n` pelas chaves (com `selecao.escolher` por chave), materializa com `geradores.gerar` e põe em cada pergunta `chave`. Uma chave em que o gerador falha passa as suas vagas às outras.
  - `resumo(respostas: {chave, resultado}[], estadosAntes: {[chave]: estado|null}, estadosDepois: {[chave]: {estado, proxima_revisao}|null}) -> { melhorias: chave[], dificuldades: chave[], proximas: {chave, proxima_revisao}[] }`. Há melhoria quando o estado depois é melhor do que antes, pela ordem nao_resolvido < dificuldade < domina. Há dificuldade quando a chave teve ≥ 1 erro na sessão e não melhorou.
- `n` fica limitado a 8–10.

- [ ] **Step 1: Testes que falham**
  - Os quatro valores de `nivelInicial`.
  - `nivelAtual`: `[certa, certa]` em treino no nível 1 dá 2; depois `errada` dá 1; tentativas com `modo: 'quiz'` não contam.
  - `sugestao([], indice, agora)` devolve 3 chaves de Matemática A pela ordem do índice.
  - Com `{chave:k1, estado:'dificuldade'}` e `{chave:k2, estado:'nao_resolvido'}`, `k2` vem antes de `k1`.
  - Uma chave em revisão hoje vem primeiro.
  - `montarTreino([k], [], { n: 9, rng })` devolve 9 perguntas, todas com `chave === k` e sem pares (tipo, semente) repetidos.
  - Com 2 chaves, as quotas ficam 5/4.
  - `n: 20` fica em 10.
  - `resumo`: dificuldade→domina conta como melhoria; uma chave com um erro e sem mudança conta como dificuldade.
- [ ] **Step 2:** Correr `node --test tests/treino.test.js` e ver que FALHA.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Correr `npm test` e `npm run cache`, e ver que PASSAM.
- [ ] **Step 5:** Commit `feat: lógica do Treino (sugestão diária, níveis de ajuda, resumo)`.

### Task 3: Lógica do Teste (`js/teste.js`)

**Files:** Create `js/teste.js`, `tests/teste.test.js`. Modify `index.html`, `lista-cache.js`.

**Interfaces:**
- Consumes `Manual.selecao.estratificar`, `Manual.miniquiz.candidatos` (com `tema`, da Task 1) e `Manual.geradores.gerar`.
- Produces `Manual.teste`:
  - `TAMANHOS = [10, 15, 20]`.
  - `montarTeste(disciplina, temas: string[], n, historico, rng) -> { perguntas: pergunta[], pedidas: n }`. Junta os candidatos de todos os subtemas dos temas escolhidos, sem sementes já vistas no mesmo tipo, e distribui-os com `estratificar`. Sorteia `formato` e `contexto` por candidato. Materializa e põe em cada pergunta `chave`. Um candidato que falha a gerar é trocado por outro do mesmo tema.
  - `nota(certas, total) -> { valores: number, percentagem: number }`. `valores = Math.round(200 * certas / total) / 10` (escala 0–20, uma casa decimal); `percentagem = Math.round(100 * certas / total)`.
  - `temasARever(respostas: {pergunta, resultado}[]) -> { tema, certas, total }[]`: temas com menos de 50 % de respostas certas, do pior para o melhor.

- [ ] **Step 1: Testes que falham**
  - `montarTeste('mat-a', ['funcoes', 'estatistica'], 10, [], rng)` dá 5 perguntas de cada tema e nenhum tipo repetido.
  - `n: 15` com 3 temas dá 5/5/5.
  - Um tema com poucos tipos (simulado com um registo reduzido) faz com que os outros temas completem a quota. Se os tipos não chegarem, `perguntas.length < pedidas`.
  - `nota(7, 10)` dá `{ valores: 14, percentagem: 70 }`; `nota(2, 3)` dá `{ valores: 13.3, percentagem: 67 }`.
  - `temasARever` com 1/4 em funções e 3/4 em estatística devolve só funções.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache` PASSAM.
- [ ] **Step 5:** Commit `feat: lógica do Teste (amostra estratificada e nota 0–20)`.

### Task 4: Modos no `quiz.js`

**Files:** Modify `js/quiz.js`, `css/base.css`, `tests/quiz.test.js` (testes DOM com o stub de documento que os testes atuais já usam, ou funções puras extraídas).

**Interfaces:** `Manual.quiz.montar(el, perguntasOuFn, aoTerminar, aoResponder, opcoes)` aceita mais opções, todas opcionais. Sem elas, o comportamento atual fica byte a byte igual.
- `opcoes.modo`: `'quiz'` (por omissão), `'treino'` ou `'teste'`.
- `opcoes.nivel(pergunta) -> 0|1|2` (só no treino; por omissão 2).
  - **Nível 1:** botão "Dá-me uma pista", que mostra `resolucaoDetalhada[0]` ("passo — porquê", sem cálculo) e desativa-se.
  - **Nível 0:** "Vamos por passos" com os passos (sem cálculo) revelados um a um pelo botão "Próximo passo"; o campo de resposta está sempre ativo.
  - Perguntas sem `resolucaoDetalhada` não mostram nenhum destes botões.
- `aoResponder` recebe também `{ nivel, usouPista, viuPassos }`. `viuPassos` é verdadeiro no nível 0 quando a aluna abriu pelo menos um passo.
- **Modo teste:** depois de "Verificar" só aparece "Resposta registada." e o botão "Seguinte"; não há veredicto, nem resolução, nem esquema. No fim aparece o ecrã de revisão, com cada pergunta a mostrar veredicto, resposta correta, erro típico, resolução e verificação. `aoTerminar(certas, total, respostas)`.
- `opcoes.cronometro: boolean` (teste): mostra mm:ss a contar, num `role="timer"` com `aria-live="off"`. `destruir()` limpa o intervalo.
- `opcoes.ligacaoRever(pergunta) -> href|null`: no feedback (treino) e na revisão (teste) aparece uma ligação "Rever no manual".
- `opcoes.fim(cartao, certas, total, respostas)`: substitui o conteúdo do cartão final, sem "Repetir", quando é dada. O Treino e o Teste usam-na para o resumo.

- [ ] **Step 1: Testes que falham**
  - No modo teste, depois de verificar, o feedback não contém `resposta-correta`.
  - A revisão final mostra N blocos com "Resposta correta".
  - O nível 1 mostra o botão de pista, e clicar nele faz o `aoResponder` seguinte trazer `usouPista: true`.
  - O nível 0 com 3 passos revela-os um a um, e nenhum mostra cálculo.
  - Sem `opcoes.modo`, o DOM gerado para uma pergunta de banco é igual ao atual (snapshot).
  - `destruir()` no teste com cronómetro deixa 0 intervalos ativos (`setInterval`/`clearInterval` espiados).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. A tentativa do treino é `construirTentativa(..., { modo: 'treino', nivel_ajuda: nivel, usou_pista: usouPista || viuPassos, viu_resolucao: false })`; isto liga-se na Task 5.
- [ ] **Step 4:** `npm test` PASSA.
- [ ] **Step 5:** Commit `feat: quiz com modos treino (pista, guiado) e teste (revisão no fim, cronómetro)`.

### Task 5: Vistas Treino e Teste, rotas e menu

**Files:** Create `js/vistas-estudo.js`. Modify `js/router.js` (consulta `?s=` em `treino`), `js/vistas-conta.js` (`montar` delega `treino`/`teste`; o menu do topo ganha entradas), `js/render.js` (o fim do mini-quiz convida a treinar), `index.html`, `lista-cache.js`, `tests/router.test.js`, `tests/index-geradores.test.js` (ordem dos scripts).

**Interfaces:**
- **Router:** `analisar('#/treino?s=mat-a/funcoes/afim')` dá `{ vista: 'treino', subtema: 'mat-a/funcoes/afim' }`, e `caminho` faz o inverso. Um `s` inválido (que não sejam 3 segmentos válidos) dá `{ vista: 'treino' }`.
- `Manual.vistasEstudo.treino(principal, rota) -> { destruir }`:
  - Sem `rota.subtema`, mostra o cartão "Sugestão de hoje" (`treino.sugestao`, com os títulos dos subtemas e "~10 min") com o botão "Começar", e a "Escolha livre" (uma lista de temas e subtemas com caixas de seleção, até 3).
  - Com `rota.subtema`, começa logo esse subtema.
  - Durante a sessão: `quiz.montar` com `modo: 'treino'` e `nivel: treino.nivelAtual(...)`, recalculado a cada pergunta a partir do histórico, que entretanto cresce. As tentativas registam-se como no mini-quiz, só para contas de aluna, com o modo treino.
  - No fim aparece o resumo: "Melhoraste em…", "Ainda com dificuldade em…" e "Próxima revisão: <data dd/mm>".
- `Manual.vistasEstudo.teste(principal) -> { destruir }`:
  - Configuração: caixas por tema da disciplina (Matemática A), tamanho 10/15/20 em botões de opção, e "Com cronómetro".
  - Depois, `quiz.montar` com `modo: 'teste'` e a `ligacaoRever` para o subtema.
  - No fim: "Nota: 14,0 valores (70 %)", a revisão, e "Temas a rever" com uma ligação `#/treino?s=` para o subtema com mais erros de cada tema.
  - Mostra "Este teste tem N perguntas" quando `perguntas.length < pedidas`.
- **Menu do topo:**
  - Aluna: "O meu progresso", "Treino", "Teste", "A minha conta", "Sair".
  - Encarregado: "Educandas" (`#/encarregado`), "A minha conta", "Sair".
  - Sem sessão: mantém-se "Entrar". Treino e Teste funcionam sem conta (só histórico local, sem registo remoto). A página inicial ganha os atalhos "Treino" e "Teste".
- **Mini-quiz:** o cartão final ganha a ligação "Treinar este subtema" → `#/treino?s=<chave>`. O "Repetir" e o resto do fluxo não mudam (decisão do utilizador: "mantém como está").

- [ ] **Step 1: Testes que falham**
  - O router com `?s=` válido e inválido, e o `caminho` inverso.
  - `index.html` carrega `treino.js`, `teste.js` e `vistas-estudo.js` depois de `miniquiz.js` e antes de `app.js`, e o `lista-cache` contém-nos.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test`, `npm run validar` e `npm run cache`.
- [ ] **Step 5: Browser** (`preview_start {name: "manual"}`): sem conta, abrir `#/treino`, começar a sugestão, usar a pista e chegar ao resumo. Abrir `#/teste` com 2 temas e 10 perguntas, responder a tudo e ver a nota e a revisão. Repetir a 375 px e no tema escuro, sem erros na consola.
- [ ] **Step 6:** Commit `feat: páginas Treino e Teste, menu da conta e convite para treinar`.

### Task 6: Modelo do progresso (`js/painel.js`)

**Files:** Create `js/painel.js`, `tests/painel.test.js`. Modify `index.html`, `lista-cache.js`.

**Interfaces:** `Manual.painel`:
- `humanizarErro(codigo) -> string`. Vem do mapa `EXCECOES` quando o código lá está. Caso contrário troca `_` por espaço, põe a primeira letra em maiúscula e escreve a forma acentuada das palavras do dicionário `ACENTOS` (`nao→não`, `divisao→divisão`, `razao→razão`, `subtracao→subtração`, `funcao→função`, `media→média`, `potencia→potência`, `tercos→terços`; o implementador completa-o lendo o snapshot abaixo). O mapa `EXCECOES` cobre pelo menos os códigos partilhados da allowlist de `tests/geradores-codigos.test.js`.
- `modelo(tentativas, estados: {chave,estado,proxima_revisao}[], indice, agora: Date) -> objeto`, com:
  - `disciplinas: [{ id, nome, temas: [{ id, titulo, subtemas: [{ chave, titulo, estado|null, proxima_revisao|null }] }] }]`: só disciplinas disponíveis e todos os subtemas, mesmo os que ainda não têm estado;
  - `contagens: { domina, dificuldade, nao_resolvido, sem }`;
  - `erros: [{ codigo, texto, onde: nomeDoGerador, contagem }]`: no máximo 5, a partir de `agregarErros(tentativas, 30)`; `onde` vem de `geradores.obter(tipo).nome` na tentativa mais recente com esse código, e é `''` quando o tipo não for gerador;
  - `evolucao: [{ semana: 'AAAA-MM-DD' (segunda-feira de Lisboa), tentativas, certas }]`: as últimas 4 semanas, com zeros;
  - `sugestoes: chave[]`: `treino.sugestao(estados, indice, agora)`;
  - `ultimaAtividade: ISO|null`.
- `rotuloEstado(estado) -> { texto, classe }`: "Domina"/"estado-domina", "Com dificuldade"/"estado-dificuldade", "Não conseguiu resolver"/"estado-nao-resolvido", "Sem tentativas"/"estado-sem".

- [ ] **Step 1: Testes que falham**
  - Todos os códigos usados nos geradores (lidos como em `geradores-codigos.test.js`) dão um texto não vazio, sem `_`, que começa com maiúscula.
  - O teste compara a lista "código → texto" de todos os códigos com o snapshot `tests/fixtures/erros-humanizados.txt`. O snapshot fica no commit, para a revisão o ler e apanhar palavras sem acento ou frases que não se percebem.
  - `humanizarErro('nao_dividiu_por_2')` dá `'Não dividiu por 2'`.
  - `modelo([], [], indice, agora)` tem `contagens.sem` igual ao número total de subtemas e `erros` vazio, com 4 semanas a zero.
  - Uma tentativa de segunda-feira às 23:30 em Lisboa conta nessa semana.
  - `ultimaAtividade` é o maior `criado_em`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test` e `npm run cache` PASSAM.
- [ ] **Step 5:** Commit `feat: modelo da página de progresso (estados, erros em linguagem simples, evolução)`.

### Task 7: Páginas O meu progresso e Encarregado

**Files:** Create `js/vistas-progresso.js`. Modify `js/vistas-conta.js` (exporta `blocoLigacoesAluna`, `blocoDados` e `blocoLigacoesEncarregado`; `montar` delega `progresso` e `encarregado`), `css/base.css`, `index.html`, `lista-cache.js`.

**Interfaces:**
- `Manual.vistasProgresso.progresso(principal) -> { destruir }`:
  - Os dados vêm de `Manual.motor.historico()` e de `Manual.motor.estadoDe(chave)` para cada chave do índice. Volta a desenhar com `motor.aoMudar`.
  - Secções:
    1. Resumo das contagens;
    2. "Por tema": lista de temas com os subtemas, cada um com o seu rótulo de estado e uma ligação ao subtema, e com "Treinar" quando o estado não for domina;
    3. "Erros mais frequentes": "Texto — em Onde (N vezes)";
    4. "Evolução": tabela de 4 semanas com tentativas e % de certas, e uma barra que tem o número escrito;
    5. "Sugestões": ligação para `#/treino`.
  - Com conta de aluna, aparecem também "A minha conta e dados", com Exportar e Apagar conta (`blocoDados`), e "Encarregado de educação" (`blocoLigacoesAluna`).
  - Sem conta, aparece o aviso "Este progresso só está guardado neste dispositivo." com a ligação "Criar conta".
  - Um encarregado que abre `#/progresso` é redirecionado para `#/encarregado`.
- `Manual.vistasProgresso.encarregado(principal) -> { destruir }`:
  - Só para o papel encarregado; com qualquer outro papel mostra "Esta página é para encarregados de educação." e a ligação para entrar.
  - Lê `conta.ligacoes()`. Com zero ligações, mostra a mensagem e o `blocoLigacoesEncarregado` para inserir o código.
  - Com mais do que uma ligação, mostra um seletor `<select>` "Educanda".
  - Para a educanda escolhida lê `conta.tentativas({ alunaId, desde: há 90 dias })` e `conta.estados(alunaId)`, e desenha o mesmo modelo (`painel.modelo`) sem botões de treino, nem exportar, nem apagar, com "Última atividade: dd/mm/aaaa".
  - Um erro de leitura (por exemplo uma ligação revogada) mostra "Não foi possível ler os dados desta educanda." sem lançar.
- O selo de estado no subtema e esta página usam o mesmo `rotuloEstado` e as mesmas classes.

- [ ] **Step 1:** Escrever o teste de ordem dos scripts e da cache para `painel.js` e `vistas-progresso.js` (FAIL), e depois implementar.
- [ ] **Step 2:** `npm test`, `npm run validar` e `npm run cache` PASSAM.
- [ ] **Step 3: Browser:**
  - Sem conta: responder a 3 perguntas no Treino, abrir `#/progresso` e ver estados, erros e evolução coerentes com o que foi respondido.
  - Simular o encarregado com stubs de `Manual.conta` na consola, só para esta verificação: zero ligações, duas ligações com o seletor, e um erro de leitura.
  - 375 px, tema escuro e leitura sem cor (as etiquetas estão sempre presentes).
- [ ] **Step 4:** Commit `feat: páginas O meu progresso e Educandas (só leitura)`.

### Task 8: Publicação da Fase 2D

**Files:** `progress.md` do ledger (fora do git).

- [ ] **Step 1:** Revisão final do ramo e ronda de correções. Depois `npm test`, `npm run validar` e `npm run verificar`, que tem de dar 77/77 com 0 erros.
- [ ] **Step 2:** Pedir aprovação ao utilizador para aplicar a 0004 em `manual-10ano`. Com aprovação: `apply_migration`, e depois `execute_sql` com `select column_name, data_type from information_schema.columns where table_name='tentativas' and column_name='contexto'`, que tem de devolver 1 linha. Correr `get_advisors` (security) sem avisos novos.
- [ ] **Step 3:** Pedir aprovação para publicar. Com aprovação: fast-forward de `main` para `fase-2d`, push, e esperar pelo build do Pages em "built".
- [ ] **Step 4:** Browser no site ao vivo: `#/treino`, `#/teste` e `#/progresso` sem erros na consola.
- [ ] **Step 5:** Depois de uso real pela aluna: `select modo, count(*), count(contexto) from tentativas group by modo` (sem colunas pessoais), e registar no ledger.
