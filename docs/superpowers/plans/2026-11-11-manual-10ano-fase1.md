# Manual Interativo 10.º Ano — Fase 1 (Motor + Matemática A) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o motor do manual (SPA estática, offline, publicável como Artifact) e o conteúdo completo de Matemática A do 10.º ano com esquemas interativos e quizzes com resolução passo a passo.

**Architecture:** Scripts clássicos que se registam no namespace global `Manual` (funciona em `file://`, PWA e Artifact). Três camadas: motor (`js/`), conteúdo como dados (`conteudos/`), esquemas SVG interativos (`esquemas/`) com cálculos em módulos puros testados em Node. Conteúdos e esquemas são carregados preguiçosamente por injeção de `<script>`.

**Tech Stack:** HTML/CSS/JS sem build; KaTeX 0.16.11 vendorizado; testes com `node --test` (Node 24); sem dependências de runtime.

**Spec:** `docs/superpowers/specs/2026-11-11-manual-10ano-fase1-design.md`

## Global Constraints

- Sem frameworks e sem recursos externos em runtime; tudo local (KaTeX em `vendor/katex/`).
- Scripts clássicos, nunca `type="module"` nem `import()`. Cada ficheiro começa por `globalThis.Manual = globalThis.Manual || {};` e regista-se em `Manual.<área>`.
- Ficheiros de cálculo e de lógica do motor não tocam no DOM (testáveis com `require()` em Node).
- Língua: português europeu, Acordo Ortográfico de 1990. Identificadores de código em português.
- Cores definidas como tokens em `:root`; modo escuro em `@media (prefers-color-scheme: dark)` com `:root:not([data-theme="light"])` e também `:root[data-theme="dark"]`; `body` com fundo explícito.
- Layout funcional a 375 px de largura, margem lateral 16 px, sem scroll horizontal.
- Todo o acesso a `localStorage` dentro de try/catch; o site funciona sem ele.
- Service worker só registado em http(s) e dentro de try/catch.
- Parágrafos de conteúdo ≤ 4 linhas; quizzes com 4–6 perguntas; perguntas `numerica` com `resolucao` obrigatória.
- Commits pequenos, mensagem no formato `tipo: descrição`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Números escritos pelo aluno** (`2,5`, `2.5`, ` -3 `, `1.234,5`, `abc`): vírgula e ponto aceites; ambos juntos ou letras → inválido com mensagem "Escreve um número", sem contar como errada. Teste na Tarefa 4.
2. **Triângulo degenerado** (vértices arrastados até ficarem colineares): cálculos devolvem `null`; o esquema mostra "Triângulo degenerado" em vez de `NaN`. Testes nas Tarefas 10 e 14.
3. **Empates e zeros no Hondt/St. Laguë** (dois quocientes iguais, partido com 0 votos, 0 mandatos): empate atribuído ao partido com menos votos; 0 mandatos → todos 0. Teste na Tarefa 9.
4. **`localStorage` indisponível ou com JSON corrompido**: progresso funciona em memória sem lançar erro. Teste na Tarefa 5.
5. **Link direto para um subtema** (abrir `#/mat-a/funcoes/quadratica` a frio, ou rota inexistente): o tema é carregado e mostrado; rota inválida → vista "Página não encontrada" com link para o início. Testes nas Tarefas 2 e 7.

---

## Estrutura de ficheiros

```
index.html                      shell; carrega css, katex, js/*.js, esquemas/nucleo/*.js, esquemas/mat-a/calculo-*.js, conteudos/indice.js
manifest.webmanifest, icone.svg
sw.js, lista-cache.js           service worker + lista gerada de ficheiros a pré-carregar
package.json                    scripts: test, validar, cache
css/base.css                    tokens, layout, componentes
js/nucleo.js                    namespace, registos, carregarScript
js/router.js                    analisar/caminho de rotas (puro)
js/texto.js                     partirTexto: $..$, $$..$$, **negrito** (puro)
js/quiz.js                      lerNumero, corrigir (puro) + montar (DOM)
js/progresso.js                 criarProgresso(armazenamento) (puro)
js/pesquisa.js                  procurar (puro)
js/render.js                    blocos e páginas (DOM)
js/tema.js                      claro/escuro
js/app.js                       arranque, vistas, barra lateral
conteudos/indice.js             disciplinas → temas → subtemas
conteudos/mat-a/ae.js           objetivos AE (cobertura)
conteudos/mat-a/{cidadania,estatistica,geometria-sintetica,funcoes,geometria-analitica}.js
esquemas/nucleo/{referencial,ponto,controlos,desenho,proj3d}.js
esquemas/mat-a/calculo-{cidadania,estatistica,geometria,funcoes}.js
esquemas/mat-a/<id-esquema>.js  14 esquemas
tools/validar-conteudos.js, tools/gerar-lista-cache.js
tests/ajuda.js + tests/*.test.js
vendor/katex/                   katex.min.js, katex.min.css, fonts/*.woff2, LICENSE
```

---

### Task 1: Esqueleto, namespace e testes

**Files:**
- Create: `package.json`, `.gitignore`, `js/nucleo.js`, `tests/ajuda.js`, `tests/nucleo.test.js`

**Interfaces:**
- Produces:
  - `Manual.registarIndice(disciplinas: Disciplina[])`, `Manual.indice: Disciplina[]`
    - `Disciplina = { id, nome, disponivel: boolean, temas: [{ id, titulo, subtemas: [{ id, titulo, palavras: string[] }] }] }`
  - `Manual.registarTema(disciplinaId: string, tema: { id, subtemas: Subtema[] })`, `Manual.obterTema(disciplinaId, temaId) -> tema | undefined`
  - `Manual.esquemas.registar(id: string, def: { montar(el, opcoes) -> { destruir() } })`, `Manual.esquemas.obter(id)`
  - `Manual.carregarScript(src: string) -> Promise<void>` (cache por `src`; rejeita em `onerror`; só browser)
  - `Manual.ficheiroTema(disciplinaId, temaId) -> "conteudos/<d>/<t>.js"`, `Manual.ficheiroEsquema(disciplinaId, id) -> "esquemas/<d>/<id>.js"`
  - `tests/ajuda.js`: `carregar(...caminhos: string[]) -> Manual` — apaga `globalThis.Manual` e o `require.cache` dos caminhos, faz `require` de cada um (relativo à raiz) e devolve `globalThis.Manual`.

- [ ] **Step 1:** `package.json` com `{"name":"manual-10ano","private":true,"scripts":{"test":"node --test tests/","validar":"node tools/validar-conteudos.js","cache":"node tools/gerar-lista-cache.js"}}`; `.gitignore` com `node_modules/`.
- [ ] **Step 2: Testes falhados** em `tests/nucleo.test.js`:
  - `registarTema guarda e obterTema devolve` (registar `('mat-a',{id:'funcoes',subtemas:[]})` → `obterTema('mat-a','funcoes').id === 'funcoes'`; `obterTema('mat-a','x') === undefined`).
  - `registarTema com id repetido lança erro` (`/duplicado/`).
  - `esquemas.registar e obter`; registar id repetido lança.
  - `ficheiroTema e ficheiroEsquema` devolvem os caminhos acima.
- [ ] **Step 3:** `npm test` → FAIL (ficheiro inexistente).
- [ ] **Step 4:** Implementar `js/nucleo.js` e `tests/ajuda.js`.
- [ ] **Step 5:** `npm test` → PASS. Commit `feat: namespace Manual e infraestrutura de testes`.

### Task 2: Router

**Files:** Create `js/router.js`, `tests/router.test.js`

**Interfaces:**
- Produces: `Manual.router.analisar(hash: string) -> Rota`, `Manual.router.caminho(rota: Rota) -> string`
  - `Rota = { vista: 'inicio'|'disciplina'|'tema'|'subtema'|'resumos'|'pesquisa'|'naoEncontrado', disciplina?, tema?, subtema?, termo? }`
  - Formatos: `''`/`'#/'` → inicio; `#/mat-a` → disciplina; `#/mat-a/resumos` → resumos; `#/mat-a/funcoes` → tema; `#/mat-a/funcoes/quadratica` → subtema; `#/pesquisa?q=parab%C3%B3la` → pesquisa com `termo:'parabóla'` (decodificado); mais de 3 segmentos ou caracteres fora de `[a-z0-9-]` num segmento → naoEncontrado. `analisar` não verifica existência (isso é da app).

- [ ] **Step 1: Testes falhados**: um teste por formato acima, mais `caminho(analisar(h)) === h` para `#/mat-a/funcoes/quadratica`, `#/mat-a/resumos` e `#/pesquisa?q=x%20y`; `analisar('#/mat-a/a/b/c').vista === 'naoEncontrado'`; `analisar('#/MAT A').vista === 'naoEncontrado'`.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: router por hash`.

### Task 3: Texto com matemática e KaTeX vendorizado

**Files:** Create `js/texto.js`, `tests/texto.test.js`, `vendor/katex/*`

**Interfaces:**
- Produces: `Manual.texto.partir(s: string) -> Pedaco[]`, `Pedaco = { tipo: 'texto'|'negrito'|'math', valor: string, display?: boolean }`
  - `$...$` → math inline; `$$...$$` → math `display:true`; `**...**` → negrito; `\$` → `$` literal no texto; `$` sem fecho → texto literal.

- [ ] **Step 1: Testes falhados**: `partir('a $x^2$ b')` → `[{texto,'a '},{math,'x^2',display:false},{texto,' b'}]`; `partir('$$f(x)$$')` → um pedaço math display; `partir('custa \\$5')` → um pedaço texto `'custa $5'`; `partir('**zeros** de f')`; `partir('preço $3')` → texto literal.
- [ ] **Step 2:** FAIL. **Step 3:** implementar.
- [ ] **Step 4:** Vendorizar KaTeX: num diretório novo do scratchpad, `npm pack katex@0.16.11`, extrair e copiar só `package/dist/katex.min.js`, `package/dist/katex.min.css`, `package/dist/fonts/*.woff2` e `package/LICENSE` para `vendor/katex/` (o CSS refere woff/ttf; os browsers usam o woff2 primeiro — aceitável). Não executar nada do pacote.
- [ ] **Step 5:** `npm test` → PASS. Commit `feat: parsing de texto com matemática; KaTeX 0.16.11 local`.

### Task 4: Motor de quiz (correção)

**Files:** Create `js/quiz.js` (só a parte pura nesta tarefa), `tests/quiz.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - Tipos de pergunta:
    - `{ tipo:'escolha', enunciado, opcoes: string[], correta: number, explicacao, resolucao?: string[], calculo?: boolean }`
    - `{ tipo:'vf', enunciado, correta: boolean, explicacao, resolucao?, calculo? }`
    - `{ tipo:'numerica', enunciado, resposta: number, tolerancia?: number (default 1e-9), unidade?: string, resolucao: string[], explicacao?, verificar: () => number }`
  - `Manual.quiz.lerNumero(texto: string) -> number` (NaN se inválido): remove espaços nas pontas e espaços internos; aceita um `+`/`-` inicial; aceita **um** separador decimal `,` ou `.`; rejeita se tiver `,` e `.` juntos, letras ou vazio.
  - `Manual.quiz.corrigir(pergunta, resposta) -> { valida: boolean, certa: boolean, respostaCorreta: string, resolucao: string[], explicacao: string }`
    - `escolha`: `resposta` é o índice; `vf`: booleano; `numerica`: string escrita pelo aluno → `lerNumero`; inválida → `{valida:false, certa:false}`.
    - `respostaCorreta`: texto da opção / `'Verdadeiro'|'Falso'` / número formatado em pt-PT com vírgula (`String(n).replace('.', ',')`) + `' ' + unidade` se existir.
    - Certa se `|x − resposta| ≤ tolerancia`.

- [ ] **Step 1: Testes falhados**:
  - `lerNumero`: `'2,5'→2.5`, `'2.5'→2.5`, `' -3 '→-3`, `'+4'→4`, `'1 000'→1000`, `'1.234,5'→NaN`, `'abc'→NaN`, `''→NaN`, `'2,5,1'→NaN`.
  - `corrigir numerica` com `{resposta:307.58, tolerancia:0.01}`: `'307,58'` certa; `'307.585'` certa; `'307,6'` errada; `'x'` → `valida:false`; `respostaCorreta === '307,58 €'` quando `unidade:'€'`; `resolucao` devolvida igual à da pergunta.
  - `corrigir escolha` índice certo/errado; `corrigir vf`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: correção de quizzes com resposta numérica`.

### Task 5: Progresso e pesquisa

**Files:** Create `js/progresso.js`, `js/pesquisa.js`, `tests/progresso.test.js`, `tests/pesquisa.test.js`

**Interfaces:**
- Produces:
  - `Manual.criarProgresso(armazenamento: {getItem, setItem} | null) -> { marcarLido(chave), lido(chave) -> bool, registarQuiz(chave, certas, total), melhorQuiz(chave) -> {certas,total} | null }`. Chave `"<disciplina>/<tema>/<subtema>"`. Persistência em `'manual10.progresso.v1'` como JSON `{lidos:{}, quizzes:{}}`. `registarQuiz` só guarda se `certas/total` for superior ao anterior. Qualquer exceção de `getItem`/`setItem`/`JSON.parse` → continua em memória.
  - `Manual.pesquisa.procurar(indice: Disciplina[], termo: string) -> [{ disciplina, tema, subtema, titulo, caminho }]` — sem distinção de maiúsculas nem acentos (`normalize('NFD')` e remover `\p{M}`), procura em `titulo` e `palavras`; termo com < 2 caracteres → `[]`; só disciplinas `disponivel`; `caminho` via `Manual.router.caminho`.

- [ ] **Step 1: Testes falhados**:
  - progresso: marcar/ler com armazenamento falso em memória; persistência entre duas instâncias com o mesmo armazenamento; `melhorQuiz` mantém 4/5 depois de registar 3/5; **armazenamento cujo `getItem` lança** → `criarProgresso` não lança e `marcarLido`/`lido` funcionam; **`getItem` devolve `'{corrompido'`** → começa vazio; `null` → funciona em memória.
  - pesquisa: índice de teste com subtema `{titulo:'Função quadrática', palavras:['parábola','vértice']}` encontrado por `'parabola'`, `'QUADRÁTICA'`, `'vert'`; `'a'` → `[]`; disciplina `disponivel:false` ignorada.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: progresso local e pesquisa`.

### Task 6: Validador de conteúdos

**Files:** Create `tools/validar-conteudos.js`, `tests/validador.test.js`

**Interfaces:**
- Consumes: `carregar` (Task 1), tipos de pergunta (Task 4), `Disciplina` (Task 1).
- Produces:
  - `validar({ indice, temas: {[disciplina]: tema[]}, ae: {[disciplina]: string[]}, existeFicheiro: (caminho) => boolean }) -> string[]` (lista de erros; vazia = ok), exportado com `module.exports = { validar }`.
  - CLI (`npm run validar`): carrega `conteudos/indice.js`, `esquemas/*/calculo-*.js`, `conteudos/<d>/ae.js` (regista `Manual.ae['<d>'] = [...]`) e os ficheiros de tema de cada disciplina `disponivel`; imprime os erros e sai com código 1 se houver algum, senão imprime `Conteúdos válidos: N subtemas, M perguntas` e sai com 0.
  - Regras (cada uma produz uma mensagem com `disciplina/tema/subtema`):
    1. Todo o tema/subtema do índice existe no ficheiro de tema e vice-versa; ids únicos dentro do tema.
    2. Cada subtema tem `titulo`, `ae` não vazio, `minutos`, `essencial` não vazio, `resumo` não vazio, `quiz` com 4–6 perguntas.
    3. `escolha`: `correta` inteiro em `[0, opcoes.length)` e opções sem duplicados.
    4. `numerica` ou qualquer pergunta com `calculo:true`: `resolucao` com ≥ 1 passo.
    5. `numerica`: `verificar` é função e `|verificar() − resposta| ≤ (tolerancia ?? 1e-9)`; idem para blocos `exemplo` que tenham `resultado` e `verificar`.
    6. Bloco `esquema`: `existeFicheiro(Manual.ficheiroEsquema(d, id))`.
    7. Tipos de bloco só entre `texto, definicao, exemplo, erro-frequente, formula, quadro, codigo, esquema`.
    8. Cobertura AE: cada string de `ae[d]` aparece em `ae` de algum subtema.

- [ ] **Step 1: Testes falhados**: um conteúdo mínimo válido → `[]`; e um teste por regra que parte esse conteúdo e espera uma mensagem que contenha o caminho do subtema (ex.: numérica com `resposta:10` e `verificar:()=>11` → erro com `/não coincide/`; escolha com `correta:3` em 3 opções; esquema inexistente; objetivo AE não coberto).
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: validador de conteúdos`.

### Task 7: Interface — shell, estilos, render, quiz, tema, app

**Files:**
- Create: `index.html`, `css/base.css`, `js/render.js`, `js/tema.js`, `js/app.js`, `conteudos/indice.js` (6 disciplinas; só `mat-a` com `disponivel:true`; por agora só o tema `funcoes` com o subtema de demonstração — cada Task 15–19 acrescenta o seu tema ao índice, para o validador passar em todos os commits), `conteudos/mat-a/ae.js` (vazio por agora: `[]`), `conteudos/mat-a/funcoes.js` provisório com um subtema de demonstração (substituído na Task 18)
- Modify: `js/quiz.js` (acrescentar `Manual.quiz.montar`)

**Interfaces:**
- Consumes: tudo das Tasks 1–5.
- Produces:
  - `Manual.render.texto(el, s)` — usa `Manual.texto.partir`; texto via `textContent` (nunca `innerHTML` com conteúdo), math via `katex.render(valor, span, {displayMode, throwOnError:false})`.
  - `Manual.render.subtema(el, disciplinaId, temaId, subtema, progresso) -> { destruir() }` — ordem fixa: cabeçalho (título, tema, etiqueta "AE <disciplina> 10.º · <tema>", "~N min"), "O essencial" (blocos), "Resumo rápido", "Mini-quiz", anterior/seguinte. Blocos `esquema`: `div` reservado + legenda; carrega `Manual.ficheiroEsquema` com `carregarScript` e chama `montar`; erro de carregamento → mensagem "Não foi possível carregar o esquema." `destruir()` chama `destruir` de todos os esquemas montados. Bloco `exemplo` mostra enunciado e botão "Ver resolução" que revela os passos. Ao abrir o subtema, `progresso.marcarLido(chave)`.
  - `Manual.quiz.montar(el, perguntas, aoTerminar(certas, total))` — uma pergunta de cada vez; botão "Verificar"; feedback com ✔/✘, resposta correta, **resolução passo a passo sempre visível após verificar**, explicação; numérica inválida mostra "Escreve um número" sem avançar; no fim mostra a pontuação e "Repetir".
  - `app.js`: em `hashchange`/arranque usa `router.analisar`; vistas: início (cartões das 6 disciplinas; indisponíveis com "Em breve"), disciplina (temas e subtemas com ✓ de lido e melhor quiz), tema, subtema (carrega o ficheiro do tema se necessário — funciona com link direto), resumos (carrega todos os temas da disciplina e lista os cartões de resumo), pesquisa (campo no topo; resultados), naoEncontrado (também quando disciplina/tema/subtema não existe no índice) com link "Voltar ao início". Barra lateral fixa ≥ 900 px, gaveta com botão ☰ abaixo disso. Título do documento atualizado por vista.
  - `tema.js`: botão claro/escuro que define `document.documentElement.dataset.theme`; persistido em `'manual10.tema'`.
  - `index.html`: `<title>Manual 10.º Ano</title>`, `lang="pt-PT"`, viewport meta; scripts na ordem: katex, `js/nucleo.js`, router, texto, quiz, progresso, pesquisa, render, tema, `esquemas/nucleo/*.js` e `esquemas/mat-a/calculo-*.js` (a criar nas Tasks 8–11; até lá, sem estas linhas), `conteudos/indice.js`, `js/app.js`.

- [ ] **Step 1:** Implementar os ficheiros acima.
- [ ] **Step 2:** `npm test` e `npm run validar` → PASS (o validador aceita o subtema de demonstração; acrescentar ao `ae.js` só o objetivo que esse subtema cobre).
- [ ] **Step 3: Verificação no browser** (preview com servidor estático: criar `.claude/launch.json` com `{"name":"manual","runtimeExecutable":"npx","runtimeArgs":["--yes","http-server@14.1.1","-p","8080","-c-1"],"port":8080}`): início mostra 6 cartões; abrir `#/mat-a/funcoes/<demo>` a frio mostra o subtema; quiz numérico com `2,5` corrige e mostra resolução; `abc` → "Escreve um número"; `#/mat-a/nada` → "Página não encontrada"; alternar modo escuro; largura 375 px sem scroll horizontal; consola sem erros. Abrir também `index.html` por `file://` e confirmar que navega.
- [ ] **Step 4:** Commit `feat: interface do manual (render, quiz, navegação, tema)`.

### Task 8: Núcleo de esquemas

**Files:** Create `esquemas/nucleo/{referencial,ponto,controlos,desenho,proj3d}.js`, `tests/nucleo-esquemas.test.js`, `esquemas/nucleo/demo.html` (página de teste manual, fora da cache)

**Interfaces:**
- Produces (`Manual.nucleo.*`):
  - `transformacao(caixa: {xmin,xmax,ymin,ymax}, largura, altura) -> { paraEcra([x,y]) -> [px,py], paraMundo([px,py]) -> [x,y] }` — puro; y do ecrã invertido; mantém proporção 1:1 (escala = mínimo das duas, centrado).
  - `criarReferencial(el, { caixa, grelha=true, eixos=true, rotulos=true }) -> { svg, t: transformacao, camada(nome) -> SVGGElement, redesenhar(), destruir() }` — SVG com `viewBox` e largura 100%, responsivo.
  - `pontoArrastavel(ref, { x, y, cor, rotulo, aoMover(x,y), restringir?(x,y) -> [x,y], passo=0.5 }) -> { x(), y(), definir(x,y) }` — pointer events (rato e toque, `touch-action:none`); focável (`tabindex=0`, `role="slider"`, `aria-label` com rótulo e coordenadas); setas movem `passo`, Shift+setas `passo*0.2`.
  - `slider(el, { rotulo, min, max, passo, valor, aoMudar(v) }) -> { valor(), definir(v) }` — `<input type=range>` com `<output>`.
  - `painelValores(el) -> { definir(linhas: [rotulo: string, valor: string][]) }` — `aria-live="polite"`.
  - `tabela(el, cabecalho: string[], linhas: (string|number)[][])` — números formatados `toLocaleString('pt-PT')`.
  - `amostrarFuncao(f, xmin, xmax, n=400) -> [x,y][][]` — puro; parte o traçado em segmentos quando `y` não é finito ou `|Δy| > 50 × (ymax−ymin)/n`.
  - `desenharFuncao(ref, camada, f, { cor })`, `desenharVetor(ref, camada, origem, v, { cor, rotulo })`, `desenharSegmento(ref, camada, A, B, estilo)`, `desenharCirculo(ref, camada, centro, raio, estilo)`, `desenharTexto(ref, camada, P, texto)`, `limpar(camada)`.
  - `projetar([x,y,z], { azimute, elevacao }) -> [u, v]` — puro; projeção ortográfica: rotação em z por `azimute`, depois em x por `elevacao`; devolve as coordenadas de ecrã (u para a direita, v para cima).
- Cores: os esquemas usam variáveis CSS (`--cor-1`…`--cor-5`, `--cor-eixos`, `--cor-grelha`) definidas em `css/base.css` para claro e escuro.

- [ ] **Step 1: Testes falhados**: `transformacao` (caixa `[-5,5]×[-5,5]`, 100×100: `paraEcra([0,0])` → `[50,50]`, `paraEcra([5,5])` → `[100,0]`; ida e volta `paraMundo(paraEcra(p))` ≈ p; caixa não quadrada em ecrã quadrado mantém 1:1); `amostrarFuncao(x=>1/x,-1,1)` devolve ≥ 2 segmentos; `amostrarFuncao(x=>x,0,1,10)` devolve 1 segmento com 11 pontos; `projetar([1,0,0],{azimute:0,elevacao:0})` → `[1,0]`, `projetar([0,0,1],{azimute:0,elevacao:0})` → `[0,1]`, `projetar([0,1,0],{azimute:Math.PI/2,elevacao:0})` ≈ `[-1,0]`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS.
- [ ] **Step 5:** Acrescentar os 5 ficheiros `esquemas/nucleo/*.js` ao `index.html` (antes de `conteudos/indice.js`). Verificação manual em `esquemas/nucleo/demo.html`: referencial com um ponto arrastável (rato, toque emulado a 375 px, teclado) e um slider que muda uma parábola. Commit `feat: núcleo de esquemas SVG`.

### Task 9: Cálculos — Cidadania

**Files:** Create `esquemas/mat-a/calculo-cidadania.js`, `tests/calculo-cidadania.test.js`

**Interfaces:** `Manual.calc.cidadania`:
- `maioria(votos: number[]) -> { total, limiarAbsoluta, simples: number|null, absoluta: number|null }` — `limiarAbsoluta = floor(total/2)+1`; `simples` = índice do mais votado, `null` se empate no máximo; `absoluta` = índice com votos ≥ limiar ou `null`.
- `borda(boletins: { ordem: number[], quantidade: number }[], nCandidatos) -> { pontos: number[], vencedor: number|null }` — 1.º lugar recebe `nCandidatos` pontos, último recebe 1; `vencedor` `null` em empate.
- `hondt(votos, mandatos)` e `stLague(votos, mandatos)` `-> { mandatos: number[], quocientes: number[][] /* [partido][k] para k=0..mandatos-1 */, atribuicoes: { partido, divisor, quociente }[] /* por ordem */ }` — divisores Hondt 1,2,3,…; St. Laguë 1,3,5,…; empate de quocientes → partido com **menos votos** (lei eleitoral portuguesa); 0 mandatos → todos 0 e `atribuicoes:[]`.
- `jurosSimples(capital, taxaAnual, anos) -> { juro, montante }`; `jurosCompostos(capital, taxaAnual, anos, periodosPorAno) -> { juro, montante, passos: { periodo, montante }[] }` com `montante = C(1 + r/n)^(n·t)` e número de períodos `Math.round(n·t)` em `passos`.
- `irsAnual(rendimentoColetavel, escaloes: { ate: number, taxa: number }[]) -> { imposto, parcelas: { de, ate, base, taxa, valor }[] }` — progressivo por escalões (último `ate: Infinity`).
- `salario(brutoMensal, { taxaSS = 0.11, tabelaRetencao = TABELA_RETENCAO_ILUSTRATIVA }) -> { bruto, ss, taxaRetencao, retencao, liquido }` — `taxaRetencao` = taxa do primeiro escalão da tabela com `bruto ≤ ate`.
- Constantes `ESCALOES_IRS_ILUSTRATIVOS` e `TABELA_RETENCAO_ILUSTRATIVA` (valores redondos, simples, com comentário "ilustrativo — não corresponde às tabelas oficiais"; os conteúdos e o esquema exibem esse aviso).

- [ ] **Step 1: Testes falhados**:
  - `maioria([270,153,201])` → `total 624`, `limiarAbsoluta 313`, `simples 0`, `absoluta null`; `maioria([5,5,1]).simples === null`.
  - `borda` com 3 candidatos, boletins `[{ordem:[0,1,2],quantidade:4},{ordem:[1,2,0],quantidade:3},{ordem:[2,1,0],quantidade:2}]` → pontos `[17, 21, 16]`, vencedor 1.
  - `hondt([10000,6000,3500,1500], 7).mandatos` → `[4,2,1,0]`; `stLague([10000,6000,3500,1500], 7).mandatos` → `[3,2,1,1]` (os dois métodos divergem); `hondt([12000,7500,4500,3000], 8).mandatos` → `[4,2,1,1]`.
  - Empate na fronteira: `hondt([100,50],2)` → 1.º mandato A (100); o 2.º empata 50 (A÷2) vs 50 (B÷1) e vai para B (menos votos) → `mandatos [1,1]`, `atribuicoes[1].partido === 1`.
  - `hondt([10,0],2).mandatos` → `[2,0]`; `hondt([10,5],0).mandatos` → `[0,0]`.
  - `jurosSimples(1000,0.05,2)` → juro 100, montante 1100; `jurosCompostos(1000,0.03,1,1).montante` → 1030 (exemplo das AE); `jurosCompostos(1000,0.05,2,1).montante` → 1102.5; `jurosCompostos(300,0.03,10/12,12).passos.length === 10`.
  - `irsAnual(15000,[{ate:10000,taxa:0.1},{ate:Infinity,taxa:0.2}]).imposto` → 2000 com 2 parcelas.
  - `salario(1000,{tabelaRetencao:[{ate:900,taxa:0},{ate:Infinity,taxa:0.1}]})` → ss 110, retencao 100, liquido 790.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: cálculos de modelos para a cidadania`.

### Task 10: Cálculos — Estatística, Geometria e Funções

**Files:** Create `esquemas/mat-a/calculo-estatistica.js`, `calculo-geometria.js`, `calculo-funcoes.js`, `tests/calculo-estatistica.test.js`, `tests/calculo-geometria.test.js`, `tests/calculo-funcoes.test.js`

**Interfaces:**
- `Manual.calc.estatistica`: `media(xs)`, `mediana(xs)`, `moda(xs) -> number[]` (todas as modas; `[]` se todos com a mesma frequência), `percentil(xs, k)` (método do ensino secundário português: ordenar; `p = n·k/100`; se `p` inteiro → `(x_p + x_{p+1})/2`, senão `x_{ceil(p)}`, índices a partir de 1), `quartis(xs) -> {q1,q2,q3}`, `amplitude`, `amplitudeInterquartil`, `desvios(xs) -> {x, desvio, quadrado}[]`, `variancia(xs)` e `desvioPadrao(xs)` amostrais (`n−1`; `NaN` se `n < 2`), `tabelaFrequencias(xs) -> {valor, absoluta, absolutaAcumulada, relativa, relativaAcumulada}[]`, `classes(xs, amplitudeClasse, inicio = min) -> {de, ate, absoluta, marca}[]` (intervalos `[de, ate[`, o último inclui o máximo), `mediaAgrupada(classes)`, `desvioPadraoAgrupado(classes)` (via marcas, `n−1`), `extremosQuartis(xs) -> {min,q1,q2,q3,max}`, `correlacao(pares: [x,y][]) -> r` (`NaN` se variância nula ou `n < 2`), `regressao(pares) -> {declive, ordenada}` (`null` se variância de x nula). Funções que recebem lista vazia devolvem `NaN`.
- `Manual.calc.geometria` (pontos como arrays de 2 ou 3 números): `distancia`, `pontoMedio`, `vetor(A,B)`, `somar(u,v)`, `subtrair(u,v)`, `escalar(k,u)`, `norma(u)`, `colineares(u,v) -> bool` (tolerância 1e-9; vetor nulo é colinear com qualquer), `pontoMaisVetor(P,v)`, `retaVetorial(P,v,λ)`, `equacaoReduzida(P,v) -> {m,b} | {vertical: x} | null` (v nulo → null), `mediatriz(A,B) -> {a,b,c}` (`ax+by=c`), `baricentro(A,B,C)`, `circuncentro(A,B,C) -> {centro, raio} | null`, `incentro -> {centro, raio} | null`, `ortocentro -> ponto | null`, `circunferenciaNovePontos(A,B,C) -> {centro, raio} | null` (centro = ponto médio de O e H; raio = R/2), `degenerado(A,B,C) -> bool` (área < 1e-9). Funções de triângulo devolvem `null` se `degenerado`.
- `Manual.calc.funcoes`: `afim(m,b) -> {zero: number|null, monotonia: 'crescente'|'decrescente'|'constante'}`, `quadratica(a,b,c) -> {delta, zeros: number[] (ordenados), vertice:[h,k], eixo:h, concavidade:'cima'|'baixo', extremo:{tipo:'minimo'|'maximo', valor:k}}` (lança `Error` se `a===0`), `canonicaParaGeral(a,h,k) -> {a,b,c}`, `inequacao2(a,b,c, sinal: '>'|'>='|'<'|'<=') -> {intervalos: {de, ate, fechadoDe, fechadoAte}[]}` (±Infinity nas pontas abertas), `avaliarRamos(ramos: {de, ate, incluiDe, incluiAte, f}[], x) -> number | undefined`.

- [ ] **Step 1: Testes falhados**:
  - Estatística: `[2,4,4,4,5,5,7,9]` → média 5, mediana 4.5, moda `[4]`, variância `32/7`, desvio padrão ≈ 2.13809 (tolerância 1e-5), soma de `desvios` = 0; `percentil([1..10],25)` → 3, `50` → 5.5, `75` → 8; `desvioPadrao([3])` NaN; `moda([1,2,3])` → `[]`; `media([])` NaN; `correlacao([[1,2],[2,4],[3,6]])` → 1, `regressao` → declive 2, ordenada 0; `correlacao([[1,1],[2,1],[3,1]])` NaN; `classes([1,2,3,4,10],5)` → `[{de:1,ate:6,absoluta:4},{de:6,ate:11,absoluta:1}]`; propriedade: `media(xs.map(x=>2*x+3)) === 2*media(xs)+3` e `desvioPadrao` multiplica por 2.
  - Geometria com triângulo A(0,0), B(4,0), C(0,3): circuncentro (2,1.5) raio 2.5; ortocentro (0,0); baricentro (4/3,1); incentro (1,1) raio 1; nove pontos centro (1,0.75) raio 1.25; O, G, H colineares (`colineares(vetor(O,G), vetor(O,H))`). Colineares A(0,0),B(1,1),C(2,2) → `circuncentro null`, `incentro null`, `ortocentro null`, `degenerado true`. `distancia([1,2,2],[0,0,0])` → 3; `equacaoReduzida([0,1],[2,4])` → m 2, b 1; `equacaoReduzida([3,0],[0,5])` → `{vertical:3}`; `colineares([2,4],[1,2])` true, `([1,0],[0,1])` false.
  - Funções: `quadratica(1,-2,-3)` → delta 16, zeros `[-1,3]`, vértice `[1,-4]`, mínimo −4; `quadratica(1,0,1).zeros` → `[]`; `quadratica(0,1,1)` lança; `canonicaParaGeral(2,1,3)` → `{a:2,b:-4,c:5}`; `inequacao2(1,0,-1,'>')` → `(-∞,-1)` e `(1,+∞)` abertos; `inequacao2(1,0,-1,'<=')` → `[-1,1]` fechado; `inequacao2(1,0,1,'<')` → `[]`; `afim(2,-4).zero` → 2; `afim(0,3)` → zero null, constante; `avaliarRamos` com `x<0 → -x`, `x≥0 → x²`: `-2→2`, `0→0`, `3→9`.
- [ ] **Step 2:** FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: cálculos de estatística, geometria e funções`. Acrescentar os 4 ficheiros `calculo-*.js` ao `index.html`.

### Task 11: Esquemas — Cidadania (`hondt`, `borda`, `juros`, `salario`)

**Files:** Create `esquemas/mat-a/{hondt,borda,juros,salario}.js`

**Interfaces:**
- Consumes: `Manual.nucleo.*` (Task 8), `Manual.calc.cidadania` (Task 9).
- Produces (ids registados e `opcoes` aceites):
  - `hondt`: `{ partidos: {nome, votos}[], mandatos, metodo: 'hondt'|'stlague' }` — campos editáveis de votos (3–6 partidos, botões +/−), mandatos (1–30), alternador Hondt/St. Laguë, botão "Passo seguinte" e "Mostrar tudo"; tabela de quocientes com o quociente vencedor de cada passo destacado e numerado; barras com mandatos; vista "Comparar" com os dois métodos lado a lado.
  - `borda`: `{ candidatos: string[], boletins: {ordem, quantidade}[] }` — editar quantidades por tipo de boletim; mostra pontos de Borda (com a soma explícita por candidato), vencedor por maioria simples (1.º lugares), maioria absoluta (limiar), e Borda; destaca quando divergem.
  - `juros`: `{ capital, taxa, anos, periodosPorAno }` — sliders; gráfico das duas curvas (simples linear, composto em degraus por período); painel com fórmula substituída e montantes.
  - `salario`: `{ bruto }` — slider/campo de salário bruto; decomposição em texto **bruto → −SS (11%) → −retenção (x%) → líquido** com cada valor; barras dos escalões IRS ilustrativos com o rendimento anual e o imposto por parcela; aviso fixo "Valores ilustrativos: consulta as tabelas oficiais do ano no Portal das Finanças."
- Todos mostram os valores intermédios em texto (`painelValores`/`tabela`), não só no desenho.

- [ ] **Step 1:** Implementar os 4 esquemas.
- [ ] **Step 2:** Verificar no browser numa página de subtema provisória (bloco `esquema` com cada id em `conteudos/mat-a/funcoes.js` de demonstração): `hondt` com `[10000,6000,3500,1500]`, 7 mandatos → `4,2,1,0`, St. Laguë → `3,2,1,1`; empate `[100,50]`, 2 mandatos → `1,1`; editar votos atualiza; teclado e 375 px ok; modo escuro legível.
- [ ] **Step 3:** Commit `feat: esquemas de eleições e finanças`.

### Task 12: Esquemas — Estatística (`histograma`, `medidas`, `regressao`)

**Files:** Create `esquemas/mat-a/{histograma,medidas,regressao}.js`

**Interfaces:**
- Consumes: `Manual.nucleo.*`, `Manual.calc.estatistica`.
- Produces:
  - `histograma`: `{ dados: number[], amplitudeClasse }` — slider da amplitude de classe; histograma (retângulos contíguos, área ∝ frequência) e tabela de frequências (absoluta, acumulada, relativa, relativa acumulada) por classe.
  - `medidas`: `{ dados: number[] }` — pontos numa reta numérica, arrastáveis; botões "Adicionar" e "Remover" (mínimo 2 pontos); diagrama de extremos e quartis; painel com média, mediana, moda(s), Q1, Q3, amplitude, AIQ, desvio padrão; tabela de desvios (x, x−x̄, (x−x̄)²) com somas; controlos `a` e `b` para aplicar `a·x+b` e mostrar média e desvio padrão antes/depois.
  - `regressao`: `{ pares: [x,y][] }` — pontos arrastáveis no plano, clicar para adicionar, duplo clique para remover (mínimo 2); reta de regressão desenhada; painel com `r`, `y = mx + b`, e classificação ("forte positiva", etc., limiares |r| ≥ 0,7 forte, ≥ 0,3 moderada); com `r` NaN mostra "r indefinido (variância nula)".

- [ ] **Step 1:** Implementar. **Step 2:** Verificar no browser: `medidas` com `[2,4,4,4,5,5,7,9]` mostra média 5 e desvio padrão 2,14; arrastar um ponto para 30 mostra a média a mudar muito mais do que a mediana; `regressao` com três pontos colineares → r = 1; colocar todos com o mesmo y → mensagem de r indefinido. **Step 3:** Commit `feat: esquemas de estatística`.

### Task 13: Esquemas — Funções (`afim`, `parabola`, `ramos`)

**Files:** Create `esquemas/mat-a/{afim,parabola,ramos}.js`

**Interfaces:**
- Consumes: `Manual.nucleo.*`, `Manual.calc.funcoes`.
- Produces:
  - `afim`: `{ m, b }` — sliders; gráfico; zero marcado; regiões de sinal coloridas no eixo x; painel com expressão, zero, sinal e monotonia.
  - `parabola`: `{ a, h, k, mostrarBase: true }` — sliders `a` (−3 a 3, passo 0,1, sem 0: salta para ±0,1), `h`, `k`; gráfico de `x²` a tracejado e de `a(x−h)²+k`; vértice, eixo, zeros marcados; painel: forma canónica, forma geral (via `canonicaParaGeral`), Δ, zeros, concavidade, contradomínio, e frase de transformações ("translação de vetor (h,k)", "dilatação vertical de fator |a|", "reflexão no eixo Ox" se `a<0`).
  - `ramos`: `{ ramos: predefinição 'modulo'|'escada'|'mista', mostrarModulo: false }` — seletor de exemplos; gráfico com bolas abertas/fechadas nas pontas; caixa "x =" que mostra a imagem e o ramo usado; alternador `|f(x)|`.

- [ ] **Step 1:** Implementar. **Step 2:** Verificar: `parabola` com a=1,h=1,k=−4 mostra zeros −1 e 3 e forma geral `x² − 2x − 3`; a=−1 indica reflexão e máximo; `ramos` modulo em x=−2 → 2. **Step 3:** Commit `feat: esquemas de funções`.

### Task 14: Esquemas — Geometria (`pontos-notaveis`, `plano`, `vetores`, `espaco3d`)

**Files:** Create `esquemas/mat-a/{pontos-notaveis,plano,vetores,espaco3d}.js`

**Interfaces:**
- Consumes: `Manual.nucleo.*`, `Manual.calc.geometria`.
- Produces:
  - `pontos-notaveis`: `{ A, B, C, camadas: ('incentro'|'circuncentro'|'ortocentro'|'baricentro'|'euler'|'novePontos')[] }` — vértices arrastáveis; caixas para ligar cada camada (com as construções: bissetrizes, mediatrizes, alturas, medianas, circunferências inscrita/circunscrita/nove pontos, reta de Euler); painel com coordenadas e a verificação `AG = 2/3 da mediana`; **se `degenerado` → apaga as construções e mostra "Triângulo degenerado: os vértices estão alinhados."**
  - `plano`: `{ A, B, modo: 'distancia'|'pontoMedio'|'mediatriz'|'circunferencia' }` — A e B arrastáveis; desenho e fórmula substituída (ex.: `d = √((4−1)² + (5−1)²) = 5`); modo circunferência: centro A, raio |AB|, equação `(x−a)²+(y−b)²=r²`.
  - `vetores`: `{ u, v, k, operacao: 'soma'|'diferenca'|'escalar'|'colinearidade' }` — pontas arrastáveis; regra do paralelogramo/triângulo; coordenadas e norma em texto; colinearidade indica "colineares" e o k quando existir.
  - `espaco3d`: `{ P, v, raio, mostrar: ('ponto'|'reta'|'esfera'|'planos')[] }` — eixos 3D projetados (`projetar`), rotação por arrasto e por botões/setas; ponto com linhas de chamada aos planos; reta `P + λv` com slider de λ; esfera de centro P (contorno); planos x=a, y=b, z=c; painel com equação vetorial, ponto para o λ atual e equação da superfície esférica.

- [ ] **Step 1:** Implementar. **Step 2:** Verificar: com A(0,0),B(4,0),C(0,3) os pontos coincidem com os valores da Task 10; arrastar C para (2,0) → mensagem de degenerado e nenhum NaN visível; `plano` com A(1,1),B(4,5) → d = 5; `espaco3d` roda com rato, toque e teclado. **Step 3:** Commit `feat: esquemas de geometria`.

---

### Tasks 15–19: Conteúdos de Matemática A

Regras comuns às cinco tarefas:
- Ficheiro `conteudos/mat-a/<tema>.js` com `Manual.registarTema('mat-a', { id, subtemas: [...] })`; ids e títulos iguais aos do `conteudos/indice.js` (atualizar o índice se mudar).
- Cada subtema segue a spec §5: `ae` com o **texto exato** dos objetivos das AE 2023 que cobre (os mesmos textos acrescentados a `conteudos/mat-a/ae.js`); "Essencial" sucinto, com pelo menos um `exemplo` resolvido (passos com valores intermédios); `erro-frequente` onde houver um típico; esquema(s) da tabela da spec §6 com legenda "o que experimentar"; `resumo` de 3–7 itens; `quiz` de 4–6 perguntas com **pelo menos 2 `numerica`** nos subtemas de cálculo, todas com `resolucao` e `verificar` que chama `Manual.calc.*`.
- Fonte dos objetivos: `mat_a_10_-_vf.pdf` da DGE (texto extraído com `pdftotext -layout`).
- Antes de cada commit: `npm run validar` → `Conteúdos válidos…`, `npm test` → PASS, e verificação no browser de todos os subtemas do tema (esquemas, quiz com uma resposta certa e uma errada a mostrar a resolução, 375 px).
- Remover o subtema de demonstração de `funcoes.js` na Task 18.

### Task 15: Conteúdo — Modelos Matemáticos para a Cidadania (`cidadania`)
Subtemas: `maiorias` (maioria simples e absoluta) · `borda` · `hondt-stlague` (Hondt e St. Laguë, vantagens e limitações) · `salarios` (bruto/líquido, SS, retenção, IRS, escalões, progressividade; aviso de valores ilustrativos) · `juros` (simples e composto, poupança e crédito; inclui bloco `codigo` Python das AE). Esquemas: `hondt`, `borda`, `salario`, `juros`. Commit `content: Matemática A — modelos para a cidadania`.

### Task 16: Conteúdo — Estatística (`estatistica`)
Subtemas: `conceitos` (problema estatístico, variabilidade, população, amostra, variável, fases, amostras enviesadas, dados discretos/contínuos) · `frequencias-histograma` · `localizacao` (média, mediana, moda, percentis/quartis com o método da Task 10) · `dispersao` (amplitude, AIQ, variância e desvio padrão amostrais) · `propriedades` (`a·x+b`, resistência, soma dos desvios = 0, dados agrupados, quando preferir mediana/AIQ, comparação com diagramas de extremos e quartis) · `bivariada` (diagrama de dispersão, r, reta de regressão, variável explicativa/resposta, outliers, extrapolação, correlação ≠ causalidade, gráfico de linhas). Esquemas: `histograma`, `medidas`, `regressao`. Commit `content: Matemática A — estatística`.

### Task 17: Conteúdo — Geometria sintética (`geometria-sintetica`)
Subtemas: `incentro-circuncentro` (definições, circunferências inscrita e circunscrita, ideia da demonstração) · `ortocentro-baricentro` (medianas: 6 triângulos equivalentes, 2/3 da mediana, centro de massa; localização por tipo de triângulo) · `euler-nove-pontos` (reta de Euler, circunferência dos nove pontos, problemas métricos). Esquema: `pontos-notaveis` (com `camadas` diferentes por subtema). Commit `content: Matemática A — geometria sintética`.

### Task 18: Conteúdo — Funções (`funcoes`)
Subtemas: `generalidades` (representações, domínio, conjunto de chegada, contradomínio, objeto/imagem, variáveis) · `afim` · `quadratica` · `transformacoes` (`f(x−h)+k`, `a·f(x)` a partir de `x²`) · `equacoes-inequacoes` (2.º grau, em contexto; inclui `codigo` Python da fórmula resolvente das AE) · `ramos-modulo`. Esquemas: `afim`, `parabola`, `ramos`. Remove o subtema de demonstração. Commit `content: Matemática A — funções`.

### Task 19: Conteúdo — Geometria analítica (`geometria-analitica`)
Subtemas: `plano-referencial` (coordenadas, reflexões nos eixos, meia-volta, ponto médio, distância) · `plano-condicoes` (retas verticais e não verticais, semiplanos, mediatriz, circunferência, círculo, conjunções/disjunções simples) · `espaco` (referencial, planos paralelos aos coordenados, retas paralelas aos eixos, ponto médio, distância, plano mediador, superfície esférica e esfera) · `vetores` (coordenadas, operações, propriedades, colinearidade, norma, vetor definido por dois pontos, ponto + vetor) · `reta-vetorial` (equação vetorial no plano e no espaço; relação com a equação reduzida). Esquemas: `plano`, `vetores`, `espaco3d`. Commit `content: Matemática A — geometria analítica`.

---

### Task 20: PWA offline

**Files:** Create `manifest.webmanifest`, `icone.svg`, `sw.js`, `tools/gerar-lista-cache.js`, `lista-cache.js` (gerado), `tests/lista-cache.test.js`; Modify `index.html`, `js/app.js`

**Interfaces:**
- `tools/gerar-lista-cache.js` exporta `listarFicheiros(raiz) -> string[]` (ordenada; inclui `index.html`, `manifest.webmanifest`, `icone.svg`, tudo em `css/ js/ conteudos/ esquemas/ vendor/`; exclui `esquemas/nucleo/demo.html`, `tests/`, `tools/`, `docs/`, `.claude/`) e, como CLI, escreve `lista-cache.js` com `self.LISTA_CACHE = [...]; self.VERSAO_CACHE = '<sha1 curto do conteúdo de todos os ficheiros>';`.
- `sw.js`: `importScripts('lista-cache.js')`; `install` pré-carrega a lista na cache `manual10-<VERSAO_CACHE>`; `activate` apaga caches antigas; `fetch` cache-first com recurso à rede.
- `app.js`: regista `sw.js` só se `location.protocol` for `http:`/`https:` e `'serviceWorker' in navigator`, em try/catch.

- [ ] **Step 1: Teste falhado** `tests/lista-cache.test.js`: `listarFicheiros('.')` contém `index.html`, `js/app.js`, `vendor/katex/katex.min.js`, todos os `esquemas/mat-a/*.js` e `conteudos/mat-a/*.js` existentes; não contém nada de `tests/` nem `demo.html`; e `lista-cache.js` em disco está atualizado (o conteúdo gerado em memória é igual ao do ficheiro) — força correr `npm run cache` antes de cada commit.
- [ ] **Step 2:** FAIL. **Step 3:** implementar e `npm run cache`. **Step 4:** PASS.
- [ ] **Step 5: Browser:** servido por http, depois da primeira visita, ativar offline (DevTools) e navegar por um subtema não visitado com esquema → funciona. Commit `feat: PWA offline`.

### Task 21: Verificação final e publicação como Artifact

**Files:** Modify o que a verificação revelar; Create `README.md` (como abrir, testar, publicar, acrescentar uma disciplina)

- [ ] **Step 1:** `npm test` e `npm run validar` → PASS; `npm run cache` sem alterações.
- [ ] **Step 2: Passagem completa no browser** (desktop e 375 px, claro e escuro): todos os subtemas de Matemática A, cada esquema exercitado (rato, toque emulado, teclado), um quiz por tema com respostas certas e erradas a mostrar a resolução, pesquisa ("parábola", "Hondt"), resumos da disciplina, progresso guardado após recarregar, consola sem erros.
- [ ] **Step 3: Artifact:** carregar a skill `artifact-design` e confirmar que o shell cumpre o contrato (título, tokens de cor, tema escuro, sem scripts externos). Pedir confirmação ao utilizador antes de publicar; publicar `index.html` com `files` a mapear todos os caminhos de `lista-cache.js` (sem alterar código), `icon: "book"`; abrir o link e repetir uma verificação curta (navegação, um esquema, um quiz). Registar o URL no `README.md`.
- [ ] **Step 4:** Commit `docs: README e verificação final da Fase 1`.
