# Fase 2C — Exercícios gerados de Matemática A — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ~78 geradores de exercícios de Matemática A (≥ 3 tipos por subtema), cada um verificado automaticamente com 2000 sementes e um segundo método, com resoluções que explicam o porquê e erros típicos — e o mini-quiz de cada subtema passa a misturar exercícios gerados com as perguntas de banco, escolhidos pelo motor adaptativo.

**Architecture:** Um registo comum (`js/geradores/registo.js`) normaliza a saída de cada gerador para a forma de pergunta que o quiz já entende. Um harness de verificação (`tools/verificar-geradores.js` + teste) aplica as 6 regras da spec §6.2 a todos os geradores registados. Os geradores vivem em `js/geradores/mat-a/<tema>.js` (um ficheiro por tema) e só usam `Manual.calc.*`, `Manual.formatar` e `Manual.aleatorio`. O mini-quiz usa `Manual.selecao.escolher` sobre candidatos gerados + banco.

**Tech Stack:** JS clássico (namespace `Manual`), `node --test`, KaTeX vendorizado (também usado em Node para verificar fórmulas).

**Spec:** `docs/superpowers/specs/2026-11-12-manual-10ano-fase2-design.md` (§6; §5.5 para seleção; §7 mini-quiz).

## Global Constraints

- Contrato exatamente como na spec §6.1; todo o cálculo via `Manual.calc.*` existente (nenhum gerador reimplementa matemática já existente; se faltar uma função pura, acrescenta-se ao módulo `calculo-*.js` respetivo com teste).
- Mesmo `(id, semente, formato, contexto)` ⇒ exatamente o mesmo exercício.
- Verificação (§6.2) **bloqueante**: `npm run verificar` corre 2000 sementes por gerador × formato × contexto; `npm test` corre a mesma verificação com 200 sementes. Nenhum gerador entra sem passar as duas.
- Resolução: cada passo `{ passo, porque, calculo }` — o que se faz, porquê (uma frase), cálculo com valores intermédios em `$…$`; termina com `verificacao` (confirmar a resposta por substituição/soma/invariante).
- Valores "simpáticos": inteiros ou frações com denominador ≤ 10; decimais com no máximo 2 casas (dinheiro: cêntimos); nada de valores absurdos (limites declarados por gerador).
- PT-PT (AO1990), tratamento por "tu", vírgula decimal, menos tipográfico (U+2212) em texto; números via `Manual.formatar`.
- Erros típicos: códigos `^[a-z0-9_]+$` ≤ 80; numérica: valor ≠ resposta (fora da tolerância); escolha: cada opção errada corresponde a um erro típico.
- Scripts clássicos; geradores sem DOM; após alterações ao site `npm run cache`; `npm test` e `npm run validar` verdes.
- Commits `tipo: descrição` com trailer do modelo que escreveu; branch `fase-2c` a partir de `main`; publicar só com confirmação do utilizador.

## Review Focus

1. **Divisões que não dão "simpático"** (ex.: Hondt com empates na fronteira, zeros irracionais, médias periódicas) → o gerador escolhe parâmetros que evitam o caso ou declara arredondamento no enunciado e tolerância coerente; o harness apanha incoerências (regra 2).
2. **Opções de escolha múltipla iguais** (um erro típico que dá o mesmo valor que a resposta ou que outro erro) → o gerador re-sorteia; regra 3 do harness.
3. **Sinais e formatação** (`x − −2`, `+ −3`, `1x`, `0x`) → usar `Manual.formatar.soma/polinomio/fator`; regra 4.
4. **Determinismo** (uso de `Math.random` ou `Date` dentro de `gerar`) → proibido; o harness gera duas vezes cada semente e compara (regra 6).
5. **Repetição no mini-quiz** (mesmo exercício duas vezes na mesma sessão) → `selecao.escolher` exclui sementes vistas; teste na Task 7.

---

### Task 1: Registo, ajudas e harness de verificação

**Files:** Create `js/geradores/registo.js`, `js/geradores/ajudas.js`, `tools/verificar-geradores.js`, `tests/geradores.test.js`; Modify `package.json` (script `"verificar": "node tools/verificar-geradores.js"`), `index.html`

**Interfaces:**
- Produces:
  - `Manual.geradores.registar(def)` (lança se `id` repetido ou faltar `gerar`/`verificarIndependente`/`formatos`), `obter(id)`, `todos() -> def[]`, `doSubtema(disciplina, subtema) -> def[]`.
  - `Manual.geradores.gerar(id, semente, { formato, contexto, nivel = 2 }) -> pergunta` — chama `def.gerar` com `Manual.aleatorio.criar(semente)` disponível via `opcoes.rng`, e normaliza para a forma do quiz: `{ id: def.id, tipo: formato ('numerica'|'escolha'|'vf'), gerador: def.id, semente, formato, contexto, competencia: def.tipo, enunciado, resposta?, tolerancia?, unidade?, opcoes?, correta?, resolucao: string[] (cada passo formatado "**passo** — porque: $calculo$"), resolucaoDetalhada: [{passo, porque, calculo}], verificacao, explicacao: '', errosTipicos, esquema?, rever? }`.
  - `Manual.geradores.ajudas`: `escolhaDeErros(rng, certa, errosTipicos, n = 4) -> { opcoes, correta, errosTipicos (com opcao) }` (baralha; garante opções distintas; re-sorteio é responsabilidade do gerador se faltarem distratores), `vfDe(rng, afirmacaoCerta, afirmacaoFalsa, erroFalsa) -> { enunciado, correta, errosTipicos }`, `entre(rng, min, max, passo = 1)`, `diferenteDe(rng, gerar, proibidos)`, `fmt(n, casas?)` (→ `Manual.formatar.num`).
  - `tools/verificar-geradores.js`: exporta `verificar(def, { sementes, katex }) -> string[]` (erros) e, como CLI, carrega todos os geradores e corre 2000 sementes; sai com 1 se houver erros. Regras: (1) `verificarIndependente` verdadeiro; (2) último passo/verificação coerente: para numérica, `|resposta − valorDaVerificacao| ≤ tol` onde o gerador expõe `verificacao.valor`; (3) opções distintas, cada errada mapeia erro típico, valores de erro ≠ resposta; (4) nenhum `NaN|undefined|Infinity|− −|\+ −|−\s*−` em textos; todas as fórmulas `$…$` passam em `katex.renderToString(…, {throwOnError:true})`; (5) limites declarados `def.limites(exercicio) -> boolean`; (6) determinismo: gerar duas vezes e comparar JSON.
- [ ] **Step 1: Testes falhados** em `tests/geradores.test.js`: registar/obter/doSubtema; id repetido lança; `gerar` normaliza (com um gerador de teste trivial "soma de dois inteiros"); determinismo; `verificar` deteta cada regra violada (6 geradores de teste "maus", um por regra) e aceita o bom; `escolhaDeErros` produz 4 opções distintas com a certa num índice registado.
- [ ] **Step 2:** FAIL. **Step 3:** implementar (KaTeX em Node: `require('../vendor/katex/katex.min.js')`). **Step 4:** PASS. **Step 5:** commit `feat: registo e verificação de geradores`.

### Tasks 2–6: Geradores por tema

Regras comuns: ficheiro `js/geradores/mat-a/<tema>.js` registando os geradores abaixo (ids `<subtema>-<tipo>`, ex. `afim-zero`); cada gerador com ≥ 2 formatos **ou** ≥ 2 contextos; `errosTipicos` com explicação dirigida em PT-PT; `esquema` (id e `opcoes` com os mesmos valores) quando existir esquema do subtema; `rever.ancora` opcional; acrescentar a `index.html`; teste `tests/geradores-<tema>.test.js` que corre `verificar` com 200 sementes para cada gerador do ficheiro e alguns valores exatos para 2–3 sementes fixas (snapshot pequeno do enunciado/resposta); `npm run verificar` limpo; commit `feat: geradores de Matemática A — <tema>`.

Tipos por subtema (mínimo; o implementador pode acrescentar):

**Task 2 — Cidadania** (`cidadania.js`)
- `maiorias`: `limiar` (votos para maioria absoluta dado o total), `vencedor` (há maioria absoluta? escolha/vf), `em-falta` (quantos votos faltam ao 1.º para a maioria absoluta).
- `borda`: `pontos` (pontos de um candidato), `vencedor` (escolha), `divergencia` (vf: o vencedor por maioria simples coincide com o de Borda?).
- `hondt-stlague`: `hondt-mandatos` (mandatos de um partido), `stlague-mandatos`, `ultimo-mandato` (que partido recebe o último mandato; escolha). Sem empates na fronteira (re-sortear).
- `salarios`: `ss` (contribuição 11 %), `liquido` (bruto → líquido com a tabela ilustrativa), `irs-anual` (imposto por escalões ilustrativos), `hora` (salário por hora). Enunciados lembram "tabela ilustrativa".
- `juros`: `simples-montante`, `composto-montante` (capitalizações anual/semestral/trimestral/mensal; arredondamento ao cêntimo), `capital-inicial` (inverso).

**Task 3 — Estatística** (`estatistica.js`)
- `conceitos`: `populacao-amostra` (identificar em contexto; escolha), `tipo-variavel` (qualitativa/quantitativa discreta/contínua; escolha), `enviesamento` (vf: amostra enviesada?). Contextos de um conjunto escrito (≥ 8).
- `frequencias-histograma`: `freq-relativa`, `freq-acumulada`, `classe-modal` / `amplitude-classe`.
- `localizacao`: `media`, `mediana`, `quartil` (método de `percentil` do projeto).
- `dispersao`: `amplitude-aiq`, `desvio-padrao` (amostral; 2 casas), `comparar` (qual conjunto tem maior dispersão; escolha).
- `propriedades`: `media-transformada` (a·x+b), `desvio-transformado`, `outlier` (vf: média vs mediana afetada).
- `bivariada`: `previsao` (dada a reta y = mx + b), `sinal-r` (escolha pelo diagrama descrito/dados), `interpretar-declive` (escolha).

**Task 4 — Geometria sintética** (`geometria-sintetica.js`)
- `incentro-circuncentro`: `circuncentro-retangulo` (coordenadas/raio), `raio-inscrito` (r = 2A/P), `qual-ponto` (escolha: bissetrizes/mediatrizes/alturas/medianas).
- `ortocentro-baricentro`: `baricentro` (coordenadas), `dois-tercos` (AG a partir da mediana), `ortocentro-retangulo`.
- `euler-nove-pontos`: `centro-nove-pontos` (ponto médio de O e H), `raio-nove-pontos` (R/2), `razao-euler` (vf/escolha: OG : GH = 1 : 2).

**Task 5 — Funções** (`funcoes.js`)
- `generalidades`: `imagem`, `objeto` (dada a imagem), `dominio-contradominio` (escolha a partir de tabela/conjunto).
- `afim`: `zero`, `declive-dois-pontos`, `sinal-monotonia` (escolha).
- `quadratica`: `vertice`, `zeros` (inteiros ou frações simples), `contradominio` (escolha).
- `transformacoes`: `vertice-transformado`, `expressao` (escolha da expressão a partir das transformações), `efeito-a` (vf: dilatação/contração/reflexão).
- `equacoes-inequacoes`: `solucoes`, `conjunto-solucao` (escolha de intervalos, notação PT), `numero-solucoes` (pelo Δ).
- `ramos-modulo`: `avaliar-ramos`, `equacao-modulo` (|x − a| = b), `zero-ramos`.

**Task 6 — Geometria analítica** (`geometria-analitica.js`)
- `plano-referencial`: `distancia`, `ponto-medio`, `simetrico` (reflexões/meia-volta).
- `plano-condicoes`: `equacao-circunferencia` (escolha), `pertence` (vf: ponto na mediatriz/semiplano/círculo), `reta-paralela-eixo`.
- `espaco`: `distancia-3d`, `esfera-centro-raio` (a partir da equação reduzida), `plano-paralelo` (escolha).
- `vetores`: `coordenadas-ab`, `norma`, `colinear-k`.
- `reta-vetorial`: `ponto-lambda`, `pertence-reta` (vf ou λ), `declive-vetor`.

### Task 7: Mini-quiz com exercícios gerados

**Files:** Create `js/miniquiz.js`, `tests/miniquiz.test.js`; Modify `js/render.js`, `js/quiz.js` (só se necessário para mostrar `resolucaoDetalhada`), `index.html`, `tools/validar-conteudos.js`, `tests/validador.test.js`

**Interfaces:**
- Consumes: `Manual.geradores` (Task 1), `Manual.selecao.escolher`, `Manual.aleatorio`, `Manual.motor` (histórico local da Fase 2B via `historico()` — acrescentar ao motor um getter `historico() -> tentativa[]` se não existir, com teste).
- Produces:
  - `Manual.miniquiz.candidatos(disciplina, subtema, banco: pergunta[], rng) -> candidato[]` — para cada gerador do subtema × formato × contexto, um candidato `{ tipo: gerador.id, competencia: gerador.tipo, formato, contexto, semente: Manual.aleatorio.novaSemente(), gerador: id }`; para cada pergunta de banco `{ tipo: pergunta.id, competencia: pergunta.id, formato: pergunta.tipo, banco: pergunta }`.
  - `Manual.miniquiz.montarPerguntas(disciplina, subtema, banco, historico, { n = 5, rng, ultimoErro }) -> pergunta[]` — usa `selecao.escolher`; garante pelo menos 3 geradas quando há ≥ 3 geradores; materializa as geradas com `Manual.geradores.gerar`.
  - `render.js`: o mini-quiz do subtema usa `montarPerguntas` (5 perguntas); "Repetir" volta a montar (novas sementes); as tentativas registam `tipo` = id do gerador, `semente`, `formato`, `erro_tipico`.
  - `quiz.js`: o feedback mostra cada passo da `resolucaoDetalhada` como "passo — porquê" + cálculo, e a `verificacao` no fim ("Verifica: …"); sem `resolucaoDetalhada` mantém o comportamento atual.
  - Validador: cada subtema de Matemática A tem ≥ 3 geradores registados (carregando `js/geradores/**`).
- [ ] **Step 1: Testes falhados:** `montarPerguntas` com rng fixo devolve 5 perguntas sem tipos repetidos e ≥ 3 geradas; uma semente vista no histórico nunca volta; `ultimoErro` faz a 1.ª pergunta ser da mesma competência noutro formato; perguntas geradas têm `errosTipicos` e `resolucaoDetalhada`; validador falha com um subtema com 2 geradores.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** `npm test`, `npm run verificar`, `npm run validar`, `npm run cache`. **Step 5:** browser (se houver ferramentas; senão "pendente"): mini-quiz de 2 subtemas mostra exercícios com números diferentes a cada "Repetir"; erro típico mostra "O que provavelmente aconteceu"; 375 px; escuro. **Step 6:** commit `feat: mini-quiz com exercícios gerados e escolhidos pelo motor`.

### Task 8: Publicação e verificação real

- [ ] **Step 1:** Pedir confirmação ao utilizador para juntar `fase-2c` a `main` e publicar. Sem confirmação, parar.
- [ ] **Step 2:** `npm run verificar` limpo (2000 sementes) imediatamente antes do push; push; confirmar nova `VERSAO_CACHE` no Pages.
- [ ] **Step 3:** Com o utilizador: a aluna faz 2 mini-quizzes (um com erros); Claude confirma com `execute_sql` (colunas não pessoais) que as tentativas têm `tipo` de gerador, `semente` não nula e `erro_tipico` quando aplicável.
