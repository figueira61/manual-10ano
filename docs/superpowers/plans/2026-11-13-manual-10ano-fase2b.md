# Fase 2B — Motor adaptativo — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Classificar cada subtema da aluna em domina / com dificuldade / não conseguiu resolver, detetar erros típicos, calcular revisões espaçadas, escolher exercícios sem repetir e gerir níveis de ajuda — com funções puras testadas, ligadas ao registo de tentativas da Fase 2A e visíveis num selo de estado por subtema.

**Architecture:** Toda a lógica vive em módulos puros (`js/aleatorio.js`, `js/aprendizagem.js`, `js/selecao.js`) testados em Node. A camada de ligação (`js/motor.js`) mantém um histórico local recente, recalcula o estado do subtema após cada tentativa e grava-o em `estados` via `Manual.conta.guardarEstado`. Os geradores (2C) e os modos Treino/Teste (2D) consomem estas funções; aqui só o mini-quiz atual as usa.

**Tech Stack:** JS clássico (namespace `Manual`), `node --test`; Supabase já configurado (tabela `estados` com `estado`, `tipos jsonb`, `proxima_revisao date`, `intervalo_dias smallint`).

**Spec:** `docs/superpowers/specs/2026-11-12-manual-10ano-fase2-design.md` (secção 5; §4.2 para colunas).

## Global Constraints

- Scripts clássicos no namespace `Manual`; lógica pura sem DOM nem rede (testável com `require`).
- Janelas: por tipo, últimas **4** tentativas; por subtema, últimas **6**. Intervalos de revisão **1 → 3 → 7 → 14 → 30** dias. Pesos de seleção: `nao_resolvido` **4**, com erros recentes **3**, sem prática **2**, `domina` **0,5**. Ajuda: níveis **0/1/2**, sobe após **2** acertos seguidos no nível, desce após **1** erro. Agregação de erros: últimas **30** tentativas.
- Valores de estado exatamente: `'domina'`, `'dificuldade'`, `'nao_resolvido'`; sem tentativas → `null`.
- "Hoje" é sempre um parâmetro (`agora: Date`), nunca `new Date()` dentro de funções puras; datas comparadas por dia civil em **Europe/Lisbon**.
- Nenhuma alteração ao esquema da base de dados (as colunas necessárias já existem).
- Após alterações ao site: `npm run cache`; `npm test` e `npm run validar` verdes.
- PT-PT (AO1990) em todo o texto visível; estado legível sem cor (etiqueta de texto).
- Commits `tipo: descrição` com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; branch `fase-2b` a partir de `main`; push/merge só com confirmação do utilizador.

## Review Focus

1. **Tentativas fora de ordem ou com datas iguais** (sincronização offline traz itens antigos depois de novos) → a classificação ordena por `criado_em` e desempata por `id`; teste na Task 2.
2. **Mudança de dia à meia-noite / fuso horário** ("≥ 2 dias diferentes") → dia civil em Europe/Lisbon, não UTC; teste com 23:30 e 00:30 de Lisboa na Task 2.
3. **Subtema só com perguntas de banco (sem semente)** → a regra "sementes diferentes" de `nao_resolvido` usa o `tipo` + `semente` (banco: `semente` nula conta como a mesma "semente" só se for o mesmo `tipo`); teste na Task 2.
4. **Histórico local corrompido ou indisponível** → o motor recalcula com o que tiver e nunca lança; teste na Task 7.
5. **Encarregado ou visitante** → o motor não grava estados (só alunas com sessão); teste na Task 7.

---

### Task 1: RNG com semente

**Files:** Create `js/aleatorio.js`, `tests/aleatorio.test.js`

**Interfaces:**
- Produces: `Manual.aleatorio.criar(semente: number) -> () => number` (mulberry32, valores em [0,1)); `Manual.aleatorio.inteiro(rng, min, max) -> number` (inclusivo); `Manual.aleatorio.baralhar(rng, lista) -> nova lista` (Fisher–Yates); `Manual.aleatorio.novaSemente() -> number` (inteiro 32 bits; `crypto.getRandomValues` quando existe, senão `Math.random`).

- [ ] **Step 1: Testes falhados:** mesma semente → mesma sequência de 5 valores; sementes diferentes → sequências diferentes; 10 000 valores todos em [0,1); `inteiro(rng,1,6)` nunca sai de 1..6 e produz os 6 valores em 1000 tiragens; `baralhar` devolve permutação e não altera a original; `novaSemente()` é inteiro em [0, 2^32).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** acrescentar a `index.html` depois de `js/nucleo.js`; `npm run cache`; commit `feat: gerador aleatório com semente`.

### Task 2: Classificação (estado por tipo e por subtema)

**Files:** Create `js/aprendizagem.js`, `tests/aprendizagem.test.js`

**Interfaces:**
- Consumes: forma das tentativas de `tentativas` (§4.2): `{ id, subtema, disciplina, tema, tipo, semente, resultado, primeira_tentativa, viu_resolucao, usou_pista, erro_tipico, criado_em }`.
- Produces:
  - `Manual.aprendizagem.diaLisboa(dataIso: string) -> 'AAAA-MM-DD'` (via `Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Lisbon'})`).
  - `Manual.aprendizagem.estadoTipo(tentativasDoTipo) -> 'nao_resolvido' | null` — últimas 4 por ordem; `nao_resolvido` se as **duas últimas** são `errada` **e** têm `semente` diferente (ou ambas `null` com ids diferentes — perguntas de banco repetidas contam).
  - `Manual.aprendizagem.classificarSubtema(tentativasDoSubtema) -> { estado, tipos: { [tipo]: 'nao_resolvido' } }` — regras da spec §5.2: `nao_resolvido` se algum tipo está; senão `domina` se as últimas 3 (da janela de 6) são `certa` com `primeira_tentativa`, sem `viu_resolucao` nem `usou_pista`, em ≥ 2 dias Lisboa diferentes; senão `dificuldade` se há tentativas; senão `null`.
  - `Manual.aprendizagem.classificarTudo(tentativas) -> { [chave 'disciplina/tema/subtema']: { estado, tipos } }`.
  - Ordenação interna: `criado_em` ascendente, desempate por `id`.

- [ ] **Step 1: Testes falhados** (factory `t({...})` com defaults): sem tentativas → `null`; 1 certa → `dificuldade` (não chega a 3); 3 certas no mesmo dia → `dificuldade`; 3 certas em 2 dias → `domina`; 3 certas mas uma com `usou_pista` → `dificuldade`; tipo com 2 erradas seguidas de sementes diferentes → subtema `nao_resolvido` e `tipos[tipo]==='nao_resolvido'`; 2 erradas com a mesma semente → não é `nao_resolvido`; errada, errada, **certa** → tipo recuperado (não `nao_resolvido`); janela: 6 erradas antigas + 3 certas recentes em 2 dias com tipos diferentes dos errados há >4 tentativas → `domina` só se nenhum tipo ainda `nao_resolvido`; fora de ordem (chegam por ordem errada) → mesmo resultado que ordenado; Lisboa: `diaLisboa('2026-11-12T23:30:00Z') === '2026-11-12'` e `diaLisboa('2026-11-13T00:30:00Z') === '2026-11-13'` (inverno, UTC+0); verão `diaLisboa('2026-07-12T23:30:00Z') === '2026-07-13'` (UTC+1).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: classificação de subtemas (domina, dificuldade, não resolvido)`.

### Task 3: Repetição espaçada e níveis de ajuda

**Files:** Modify `js/aprendizagem.js`, `tests/aprendizagem.test.js`

**Interfaces:**
- Produces:
  - `Manual.aprendizagem.INTERVALOS = [1, 3, 7, 14, 30]`.
  - `Manual.aprendizagem.proximaRevisao(intervaloAtual: number|null, tentativa, agora: Date) -> { intervalo_dias, proxima_revisao: 'AAAA-MM-DD' }` — `errada` → 1; `certa` à primeira sem pista nem resolução → próximo da lista (de `null` → 1; 30 mantém 30); `certa` com ajuda → mantém (null → 1). Data = dia Lisboa de `agora` + intervalo.
  - `Manual.aprendizagem.proximoNivel(nivel: 0|1|2, historicoNoNivel: ('certa'|'errada')[]) -> 0|1|2` — sobe 1 se as 2 últimas são `certa` (máx. 2); desce 1 se a última é `errada` (mín. 0); senão mantém.
  - `Manual.aprendizagem.emRevisao(estados, agora) -> chave[]` — subtemas com `proxima_revisao` ≤ hoje (Lisboa), ordenados por prioridade (`nao_resolvido`, `dificuldade`, `domina`) e depois data.

- [ ] **Step 1: Testes falhados:** sequência certa×5 desde null → 1,3,7,14,30 e depois mantém 30; errada a meio volta a 1; certa com pista mantém; `proxima_revisao` de `agora=2026-11-13T10:00Z` com intervalo 3 → `'2026-11-16'`; viragem de mês/ano (`2026-12-30` + 7 → `2027-01-06`); `proximoNivel(0,['certa','certa'])===1`, `(2,['certa','certa'])===2`, `(1,['errada'])===0`, `(0,['errada'])===0`, `(1,['certa'])===1`; `emRevisao` com 3 estados (um futuro) devolve os 2 vencidos pela ordem certa.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: repetição espaçada e níveis de ajuda`.

### Task 4: Erros típicos

**Files:** Modify `js/aprendizagem.js`, `js/quiz.js`, `tests/aprendizagem.test.js`, `tests/quiz.test.js`

**Interfaces:**
- Consumes: forma de pergunta/exercício com `errosTipicos?: [{ codigo, valor?, opcao?, explicacao }]` (spec §6.1).
- Produces:
  - `Manual.aprendizagem.detetarErro(pergunta, resposta) -> { codigo, explicacao } | null` — `numerica`: `Manual.quiz.lerNumero(resposta)` comparado com cada `valor` com `tolerancia` da pergunta (+1e-12); `escolha`: índice escolhido igual a `opcao`; resposta certa → `null`; sem `errosTipicos` → `null`.
  - `Manual.aprendizagem.agregarErros(tentativas, n = 30) -> [{ codigo, contagem }]` — últimas `n` com `erro_tipico` não nulo, ordenado por contagem desc e depois código.
  - `Manual.quiz.corrigir(...)` passa a devolver também `erroTipico: { codigo, explicacao } | null`; o feedback mostra a explicação dirigida **antes** da resolução (classe `.erro-tipico`); `construirTentativa(..., erroTipico?)` preenche `erro_tipico` com o código.

- [ ] **Step 1: Testes falhados:** numérica com erro típico `{codigo:'sinal_h', valor:-2}` e resposta "-2" → `sinal_h`; "−2" (menos tipográfico) idem; resposta certa → null; valor de erro dentro da tolerância 0.01 → deteta; escolha com `opcao:2` escolhida → código; agregarErros com 35 tentativas devolve contagens só das últimas 30; `corrigir` devolve `erroTipico`; `construirTentativa` com erroTipico grava `erro_tipico:'sinal_h'`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar (UI: inserir o bloco da explicação no feedback existente, sem mudar o resto). **Step 4:** PASS. **Step 5:** commit `feat: deteção e agregação de erros típicos`.

### Task 5: Seleção de exercícios

**Files:** Create `js/selecao.js`, `tests/selecao.test.js`

**Interfaces:**
- Consumes: `Manual.aleatorio` (Task 1), `Manual.aprendizagem.estadoTipo` (Task 2).
- Produces:
  - Forma de candidato: `{ tipo, competencia, formato, contexto?, semente?, subtema }` (para perguntas de banco: `tipo` = id estável da pergunta, `competencia` = `tipo`, `semente` ausente).
  - `Manual.selecao.pesoTipo(tentativasDoTipo) -> 4 | 3 | 2 | 0.5 | 1` — `nao_resolvido` 4; alguma `errada` nas últimas 4 → 3; sem tentativas → 2; últimas 3 certas à primeira → 0,5 (domina); restante → 1.
  - `Manual.selecao.escolher(candidatos, historico, { n, rng, ultimoErro? }) -> candidato[]` — amostragem ponderada sem reposição por `tipo`; exclui candidatos com `semente` já vista no mesmo `tipo`; para banco (sem semente) prefere os não vistos há mais tempo; se `ultimoErro` (`{competencia, formato, contexto}`) existe, o **primeiro** escolhido é da mesma `competencia` com `formato` ou `contexto` diferente, se houver.
  - `Manual.selecao.estratificar(candidatos, temas: string[], n, rng) -> candidato[]` — distribui `n` pelos temas o mais igual possível (resto pelos primeiros), sem repetir tipo.

- [ ] **Step 1: Testes falhados** (rng fixo): com 3 tipos (`nao_resolvido`, sem prática, domina) e n=1 em 10 000 tiragens, frequências ≈ 4:2:0,5 (±10 %); nunca devolve semente vista; `ultimoErro` força primeira escolha da mesma competência noutro formato; sem alternativa de formato → qualquer da competência; `estratificar` 10 por 3 temas → 4/3/3; n maior que candidatos → devolve todos sem repetir; mesma semente de rng → mesma escolha.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** `index.html` + `npm run cache`; commit `feat: seleção ponderada de exercícios sem repetição`.

### Task 6: Identificadores estáveis das perguntas

**Files:** Create `tools/atribuir-ids.js`; Modify `conteudos/mat-a/*.js`, `tools/validar-conteudos.js`, `tests/validador.test.js`, `js/quiz.js`, `tests/quiz.test.js`

**Interfaces:**
- Produces: cada pergunta de quiz tem `id` (`'<subtema>-q<NN>'`, NN com 2 dígitos pela ordem atual, ex. `quadratica-q01`); `construirTentativa` usa `tipo = pergunta.id` quando existe (senão o formato antigo `subtema#qN`).

- [ ] **Step 1: Testes falhados:** validador falha se uma pergunta não tem `id`, se o `id` se repete no conjunto da disciplina ou se não corresponde a `/^[a-z0-9-]+-q\d{2}$/`; `construirTentativa` com `pergunta.id='afim-q03'` grava `tipo:'afim-q03'`.
- [ ] **Step 2:** FAIL. **Step 3:** `tools/atribuir-ids.js` (Node, sem dependências) insere `id` em cada objeto de pergunta dos ficheiros de tema, preservando o resto do texto (edição textual mínima, uma linha `id: '…',` a seguir à abertura de cada pergunta do `quiz`); correr uma vez; confirmar com `git diff --stat` que só se acrescentaram linhas `id:`. Atualizar validador e `quiz.js`.
- [ ] **Step 4:** `npm test`, `npm run validar` (25 subtemas, 135 perguntas, todas com id). **Step 5:** commit `feat: identificadores estáveis das perguntas`.

### Task 7: Motor ligado ao registo e selo de estado

**Files:** Create `js/motor.js`, `tests/motor.test.js`; Modify `js/render.js`, `js/app.js`, `css/base.css`, `index.html`

**Interfaces:**
- Consumes: `Manual.aprendizagem.*` (Tasks 2–4), `Manual.conta` (`estado()`, `registaTentativas()`, `tentativas({desde})`, `estados()`, `guardarEstado(e)`), `Manual.criarFila`-style tolerância de armazenamento.
- Produces:
  - `Manual.criarMotor({ conta, armazenamento, agora? }) -> { registar(tentativa), estadoDe(chave) -> {estado, tipos, proxima_revisao, intervalo_dias} | null, carregar() -> Promise, aoMudar(fn) }`.
  - Histórico local `manual10.historico.v1` (últimas 500 tentativas da aluna, por `id`, tolerante a falhas como a fila).
  - `registar(t)`: junta ao histórico; recalcula `classificarSubtema` da chave; calcula `proximaRevisao` com o `intervalo_dias` anterior; se `conta.estado().papel === 'aluna'`, chama `conta.guardarEstado({ chave, estado, tipos, proxima_revisao, intervalo_dias })`; notifica `aoMudar`. Nunca lança.
  - `carregar()`: com sessão de aluna, junta `conta.tentativas({desde: 90 dias})` ao histórico e lê `conta.estados()`; sem sessão, usa só o local.
  - UI: selo de estado no cabeçalho de cada subtema e nas listas de subtemas (tema/disciplina): "Domina" / "Com dificuldade" / "Não conseguiu resolver" (texto + cor de token: `--certo`, `--cor-5`, `--errado`), nada quando `null`. `render.js` chama `motor.registar` com a mesma tentativa enviada a `guardarTentativa` (só quando `registaTentativas()`).
- [ ] **Step 1: Testes falhados** (conta falsa): aluna regista 2 erradas com sementes diferentes no mesmo tipo → `estadoDe(chave).estado === 'nao_resolvido'` e `guardarEstado` chamado com `intervalo_dias:1`; encarregado → `guardarEstado` nunca chamado; armazenamento que lança → `registar` não lança e o estado em memória funciona; `carregar()` junta remotas sem duplicar por `id`; 3 certas em 2 dias → `domina` e intervalo avança.
- [ ] **Step 2:** FAIL. **Step 3:** implementar motor + UI do selo (`.selo-estado`). **Step 4:** `npm test`, `npm run validar`, `npm run cache`.
- [ ] **Step 5: Browser** (preview "manual-10ano", SW desregistado): sem sessão, responder 2 perguntas erradas do mesmo subtema → selo aparece; recarregar → mantém-se (histórico local); 375 px; tema escuro; consola sem erros.
- [ ] **Step 6:** Commit `feat: motor adaptativo ligado ao registo e selo de estado`.

### Task 8: Publicação e verificação real

**Files:** Modify o que a verificação revelar.

- [ ] **Step 1:** Pedir confirmação ao utilizador para juntar `fase-2b` a `main` e publicar (push). Sem confirmação, parar.
- [ ] **Step 2:** Push; confirmar que o GitHub Pages serve a nova `VERSAO_CACHE`.
- [ ] **Step 3:** Com o utilizador: a aluna responde a algumas perguntas de um subtema (incluindo erros); Claude confirma com `execute_sql` (só colunas não pessoais: `chave`, `estado`, `intervalo_dias`, `proxima_revisao`, contagem) que existe uma linha em `estados` coerente com as tentativas.
