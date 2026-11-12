# Fase 2A — Contas, registo de aprendizagem e alojamento — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Contas próprias (aluna e encarregado) com Supabase, registo de cada tentativa sincronizado (com fila offline), página "A minha conta" (ligação do encarregado, exportar, apagar), site no GitHub Pages e workflow que impede a pausa da base de dados (pedido de 3 em 3 dias).

**Architecture:** Site estático inalterado na base; um único adaptador `js/conta.js` fala com o Supabase (cliente JS vendorizado). Tabelas com RLS e funções `SECURITY DEFINER` criadas por migrações versionadas em `supabase/migracoes/`. A fila offline é um módulo puro testado em Node. Infraestrutura (projeto Supabase, repositório, Pages, workflow) criada por Claude com o conector Supabase e o `gh`, sempre após confirmação do utilizador.

**Tech Stack:** HTML/CSS/JS clássico; `@supabase/supabase-js` 2.45.4 (UMD `dist/umd/supabase.js`, vendorizado); Postgres 17 (Supabase) com RLS; GitHub Pages; GitHub Actions; testes `node --test`.

**Spec:** `docs/superpowers/specs/2026-11-12-manual-10ano-fase2-design.md` (secções 3, 4, 8, 9).

## Global Constraints

- Continua sem build; scripts clássicos no namespace `Manual`; lógica pura sem DOM.
- Só `js/conta.js` (e `js/config.js` com URL e chave pública) conhecem o Supabase. Nenhuma chave de serviço no cliente nem no repositório.
- Supabase: projeto **novo e dedicado** "manual-10ano", região UE (`eu-central-1`), plano gratuito (0 €/mês confirmado pelo utilizador antes de criar).
- Todas as tabelas com RLS ativo; nenhuma tabela legível por `anon` exceto a função `ping()`.
- Sem conta, o manual funciona como hoje (progresso local). Nada bloqueia o estudo por falta de rede.
- Workflow anti-pausa: `cron: "0 6 */3 * *"` + `workflow_dispatch`; chama `rpc/ping`; falha se a resposta não for 200.
- PT-PT (AO1990) em toda a interface; acessibilidade de formulários (labels, mensagens de erro em `aria-live`).
- Após qualquer alteração ao site: `npm run cache`; `npm test` e `npm run validar` verdes.
- Commits `tipo: descrição` terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch de trabalho: `fase-2` (a partir de `fase-1`).
- Ações externas (criar projeto Supabase, criar repositório, push, ativar Pages, definir secrets) só após confirmação explícita do utilizador na conversa.

## Review Focus

1. **Rotas novas colidem com ids de disciplina** (`#/entrar` interpretado como disciplina "entrar") → o router reconhece nomes reservados; teste na Task 4.
2. **Envio repetido da mesma tentativa** (rede cai a meio, recarregar página) → nunca duplica (`upsert` por `id`); teste na Task 3.
3. **`localStorage` indisponível ou fila corrompida** → a fila funciona em memória e não lança; teste na Task 3.
4. **Código de ligação expirado, já usado, ou usado por uma conta "aluna"** → recusado com mensagem clara; teste SQL na Task 2.
5. **Encarregado tenta escrever ou ler dados de aluna não ligada** → recusado por RLS; teste SQL na Task 2.

---

### Task 1: Projeto Supabase dedicado (infraestrutura)

**Files:** Create `supabase/README.md` (id do projeto, região, como aplicar migrações), `js/config.js`

**Interfaces:**
- Produces: `Manual.config = { supabaseUrl: string, supabaseChavePublica: string }` em `js/config.js` (valores do projeto novo; chave `anon`/publishable).

- [ ] **Step 1:** Pedir confirmação ao utilizador para criar o projeto "manual-10ano" na organização existente, região `eu-central-1`, custo 0 €/mês (repetir o custo devolvido por `get_cost`). Sem confirmação, parar.
- [ ] **Step 2:** Criar o projeto (`confirm_cost` → `create_project`), aguardar `ACTIVE_HEALTHY` com `get_project`.
- [ ] **Step 3:** Obter URL (`get_project_url`) e chave pública (`get_publishable_keys`); escrever `js/config.js`; documentar em `supabase/README.md`.
- [ ] **Step 4:** Commit `chore: projeto Supabase dedicado e configuração pública`.

### Task 2: Esquema, RLS e funções (migração 0001)

**Files:** Create `supabase/migracoes/0001_contas.sql`, `supabase/testes/0001_rls.sql`

**Interfaces:**
- Produces (SQL, schema `public`):
  - Tabelas `perfis`, `codigos_ligacao`, `ligacoes`, `tentativas`, `estados` exatamente como na spec §4.2.
  - Trigger `criar_perfil()` em `auth.users` after insert: cria `perfis(id, papel, nome)` a partir de `raw_user_meta_data->>'papel'` (`'aluna'|'encarregado'`, default `'aluna'`) e `->>'nome'`.
  - `ping() returns timestamptz` (`select now()`), `grant execute to anon, authenticated`.
  - `gerar_codigo_ligacao() returns text` — só para `papel='aluna'`; 8 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`; expira em 48 h; invalida códigos anteriores não usados da mesma aluna.
  - `usar_codigo_ligacao(codigo text) returns uuid` (id da ligação) — só para `papel='encarregado'`; erro `'codigo_invalido'` se inexistente, expirado ou usado; marca usado; cria `ligacoes`.
  - `apagar_conta() returns void` — apaga linhas do chamador em todas as tabelas e o utilizador em `auth.users`.
  - Funções `SECURITY DEFINER` com `set search_path = ''` e nomes qualificados.
  - RLS conforme spec §4.3 (políticas nomeadas `aluna_le_proprio`, `encarregado_le_ligadas`, etc.).

- [ ] **Step 1: Testes falhados** em `supabase/testes/0001_rls.sql` — script SQL que corre numa transação com `rollback` no fim, cria dois utilizadores de teste em `auth.users` (aluna A, aluna B) e um encarregado E, simula cada um com `set local role authenticated; select set_config('request.jwt.claims', json_build_object('sub', <id>, 'role','authenticated')::text, true);` e usa `assert`/`raise exception` para:
  - A insere tentativa própria ✔; A insere tentativa com `aluna_id` de B ✘; A lê só as suas.
  - E sem ligação lê 0 tentativas de A; após A `gerar_codigo_ligacao()` e E `usar_codigo_ligacao(código)`, E lê as de A, não as de B; E não consegue inserir/atualizar tentativas nem estados.
  - Código usado segunda vez ✘ `codigo_invalido`; código expirado (forçar `expira_em` no passado como `postgres`) ✘; A a usar um código ✘.
  - `anon` não lê nenhuma tabela; `anon` executa `ping()` ✔.
  - A `apagar_conta()` remove as suas linhas e o seu `auth.users`.
  Executar com `execute_sql` → falha (tabelas inexistentes).
- [ ] **Step 2:** Escrever `0001_contas.sql`; aplicar com `apply_migration` (nome `0001_contas`).
- [ ] **Step 3:** Correr `0001_rls.sql` com `execute_sql` → sem exceções (todas as asserções passam, transação revertida).
- [ ] **Step 4:** `get_advisors` (security e performance) → sem avisos de RLS em falta nem funções com `search_path` mutável; corrigir numa migração `0002` se houver.
- [ ] **Step 5:** Commit `feat: esquema de contas, RLS e funções (migração 0001)`.

### Task 3: Fila offline e identificadores

**Files:** Create `js/fila.js`, `tests/fila.test.js`

**Interfaces:**
- Produces:
  - `Manual.uuid() -> string` (v4; `crypto.randomUUID` quando existe, senão `crypto.getRandomValues`).
  - `Manual.criarFila(armazenamento | null, chave = 'manual10.fila.v1') -> { juntar(item), pendentes() -> item[], marcarEnviados(ids: string[]), tamanho() }` — persiste em JSON; ignora `id` repetido em `juntar`; tolera exceções e JSON corrompido (como `criarProgresso`).
  - `Manual.enviarFila(fila, enviar: (itens) => Promise<string[] /*ids aceites*/>) -> Promise<{ enviados, restantes }>` — envia em lotes de 50; em erro mantém os itens.

- [ ] **Step 1: Testes falhados:** juntar 2 itens e ler pendentes; `juntar` com `id` repetido não duplica; persistência entre duas filas com o mesmo armazenamento; `marcarEnviados` remove só esses; `getItem` que lança / JSON `'{x'` / `null` → funciona em memória; `enviarFila` com `enviar` que rejeita → `restantes` = todos e nada perdido; com 120 itens faz 3 chamadas (50/50/20); `enviar` que aceita só parte → só esses saem; `uuid()` tem formato v4 e 1000 chamadas são únicas.
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implementar. **Step 4:** PASS. **Step 5:** commit `feat: fila offline e uuid`.

### Task 4: Adaptador `js/conta.js` e rotas reservadas

**Files:** Create `js/conta.js`, `tests/conta.test.js`, `vendor/supabase/supabase.js` (+ `LICENSE.txt`); Modify `js/router.js`, `tests/router.test.js`, `index.html`

**Interfaces:**
- Consumes: `Manual.config` (Task 1), `Manual.criarFila`, `Manual.enviarFila`, `Manual.uuid` (Task 3).
- Produces (`Manual.conta`, todas as funções assíncronas devolvem Promises; erros como `Error` com `codigo` em PT: `'credenciais'`, `'email_por_confirmar'`, `'rede'`, `'codigo_invalido'`, `'sem_sessao'`, `'desconhecido'`):
  - `iniciar({ cliente?, armazenamento? })` — `cliente` injetável (testes usam um falso com a mesma forma que `supabase.createClient(...)` usado: `auth.signUp/signInWithPassword/signOut/getSession/onAuthStateChange`, `from(t).upsert/select/eq/order/limit`, `rpc(nome, args)`); por omissão cria o cliente com `Manual.config` se `window.supabase` existir, senão fica em modo local.
  - `estado() -> { autenticado: boolean, papel: 'aluna'|'encarregado'|null, perfil: {id, nome}|null, modo: 'online'|'local' }`, `aoMudar(fn) -> desligar()`
  - `registar(email, palavraPasse, papel, nome)`, `entrar(email, palavraPasse)`, `sair()`
  - `guardarTentativa(t)` — completa `id` (uuid), `aluna_id`, `criado_em`; junta à fila; tenta enviar se autenticado e online (`upsert` em `tentativas`, `onConflict: 'id'`, `ignoreDuplicates: true`).
  - `sincronizar() -> {enviados, restantes}`; chamado em `iniciar`, no evento `online` e após `entrar`.
  - `tentativas({ desde? })`, `estados(alunaId?)`, `guardarEstado(e)` (`upsert` por `aluna_id,chave`).
  - `gerarCodigoLigacao()`, `ligarEncarregado(codigo)`, `ligacoes()`, `revogarLigacao(id)`, `exportar() -> {perfil, tentativas, estados, ligacoes}`, `apagarConta()`.
- `Manual.router`: nomes reservados `entrar`, `registar`, `conta`, `privacidade`, `progresso`, `treino`, `teste`, `encarregado` → `{ vista: <nome> }` (um só segmento); `caminho({vista:'entrar'})` → `'#/entrar'`.

- [ ] **Step 1:** Vendorizar `@supabase/supabase-js@2.45.4` (`npm pack` em diretório temporário novo; copiar só `package/dist/umd/supabase.js` e `package/LICENSE` como `LICENSE.txt`; não executar scripts). Acrescentar a `index.html`, antes de `js/conta.js`: `vendor/supabase/supabase.js`, `js/config.js`, `js/fila.js`, `js/conta.js`.
- [ ] **Step 2: Testes falhados** (`tests/conta.test.js`, cliente falso):
  - sem cliente → `estado().modo === 'local'`, `guardarTentativa` vai para a fila e não lança;
  - `entrar` com erro do falso `Invalid login credentials` → rejeita `codigo:'credenciais'`; `Email not confirmed` → `'email_por_confirmar'`;
  - após `entrar`, `estado()` tem `papel` e `perfil` lidos de `perfis`; `aoMudar` é chamado;
  - `guardarTentativa` autenticado chama `upsert` com o item e `onConflict:'id'`; se o falso rejeitar (rede), o item fica pendente e `sincronizar()` posterior envia-o uma vez;
  - `usar_codigo_ligacao` a devolver erro `codigo_invalido` → rejeita `codigo:'codigo_invalido'`;
  - `exportar` agrega as quatro coleções.
  - Router: `analisar('#/entrar').vista === 'entrar'`; `analisar('#/conta')` idem; `analisar('#/mat-a').vista === 'disciplina'` mantém-se; `caminho({vista:'privacidade'}) === '#/privacidade'`; o validador (Task 6 da Fase 1) passa a falhar se uma disciplina usar um id reservado — acrescentar regra e teste em `tests/validador.test.js`.
- [ ] **Step 3:** `npm test` → FAIL. **Step 4:** implementar. **Step 5:** PASS; `npm run validar` OK. **Step 6:** commit `feat: adaptador de contas (Supabase) e rotas reservadas`.

### Task 5: Interface de contas e registo das tentativas

**Files:** Create `js/vistas-conta.js`; Modify `js/app.js`, `js/quiz.js`, `js/render.js`, `css/base.css`, `index.html`

**Interfaces:**
- Consumes: `Manual.conta` (Task 4), `Manual.router` vistas reservadas.
- Produces:
  - `Manual.vistasConta.montar(vista, principal, rota)` para `entrar`, `registar`, `conta`, `privacidade` (as restantes reservadas mostram "Disponível em breve" até à Fase 2D).
  - `Manual.quiz.montar(el, perguntas, aoTerminar, aoResponder?)` — novo callback opcional `aoResponder({ indice, pergunta, resultado:'certa'|'errada', duracaoMs })` chamado em cada "Verificar" válido.
- Comportamento:
  - Topo: botão "Entrar" (secundário) quando sem sessão; com sessão, botão com o nome e menu (A minha conta, Sair). Mesmo sistema de botões e ícones existente.
  - `#/registar`: email, palavra-passe (mín. 8), nome a mostrar, papel (Sou aluna / Sou encarregado de educação), caixa obrigatória "Li a informação de privacidade" com ligação; após registo: "Enviámos um email de confirmação para …".
  - `#/entrar`: email, palavra-passe; erros por `codigo` com texto claro em PT.
  - `#/conta` (aluna): nome, papel, botão "Gerar código para o encarregado" (mostra código e validade), lista de encarregados ligados com "Revogar", "Exportar os meus dados" (descarrega JSON via `Blob` + `<a download>`), "Apagar a minha conta" com confirmação escrita na própria página (escrever "APAGAR"). (encarregado): campo "Código da educanda" → `ligarEncarregado`; lista de educandas ligadas.
  - `#/privacidade`: texto da spec §4.7 (dados, finalidade, quem acede, exportar/apagar, idade de consentimento 13 anos — Lei n.º 58/2019).
  - Registo de tentativas: o mini-quiz atual chama `aoResponder`; `render.js` envia `Manual.conta.guardarTentativa({ disciplina, tema, subtema, tipo: subtema.id + '#q' + indice, semente: null, formato: pergunta.tipo, modo: 'quiz', nivel_ajuda: 2, resultado, primeira_tentativa: true, viu_resolucao: false, usou_pista: false, erro_tipico: null, duracao_ms, sessao_id })` (`sessao_id` = uuid por carregamento de página). Sem conta, fica na fila local e é importado ao entrar.

- [ ] **Step 1: Teste falhado** em `tests/quiz.test.js`: com DOM falso mínimo não disponível em Node, testar a parte pura nova: `Manual.quiz.construirTentativa(contexto, pergunta, indice, resultado, duracaoMs, sessaoId)` (nova função pura em `quiz.js`) devolve o objeto acima com os valores exatos.
- [ ] **Step 2:** FAIL. **Step 3:** implementar UI e ligação. **Step 4:** `npm test`, `npm run validar`, `npm run cache` OK.
- [ ] **Step 5: Browser** (preview "manual-10ano"): sem sessão o manual funciona e o quiz grava na fila local (`localStorage['manual10.fila.v1']` cresce); formulários com validação e mensagens; 375 px; tema escuro; sem erros na consola. O registo real com email é testado na Task 7 com o utilizador.
- [ ] **Step 6:** Commit `feat: contas na interface e registo das tentativas do quiz`.

### Task 6: GitHub — repositório, Pages e workflow anti-pausa

**Files:** Create `.github/workflows/manter-supabase.yml`, `.nojekyll`; Modify `README.md`

**Interfaces:**
- Consumes: `Manual.config.supabaseUrl`, chave pública (Task 1); função `ping()` (Task 2).

- [ ] **Step 1:** Pedir confirmação ao utilizador para: criar o repositório público `manual-10ano` na conta GitHub autenticada no `gh`; juntar `fase-1` e `fase-2` em `main` e fazer push; ativar Pages (`main`, raiz); definir os secrets `SUPABASE_URL` e `SUPABASE_ANON_KEY`. Sem confirmação, parar.
- [ ] **Step 2:** Workflow `manter-supabase.yml`:
  ```yaml
  name: Manter Supabase ativo
  on:
    schedule:
      - cron: "0 6 */3 * *"
    workflow_dispatch:
  jobs:
    ping:
      runs-on: ubuntu-latest
      steps:
        - name: Chamar ping()
          run: |
            codigo=$(curl -s -o resposta.txt -w "%{http_code}" -X POST \
              "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/ping" \
              -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
              -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
              -H "Content-Type: application/json" -d '{}')
            echo "HTTP $codigo: $(cat resposta.txt)"
            test "$codigo" = "200"
  ```
- [ ] **Step 3:** `gh repo create`, `git push`, `gh api` para ativar Pages, `gh secret set` ×2 (executados após a confirmação do Step 1). `.nojekyll` na raiz.
- [ ] **Step 4: Verificação:** `gh workflow run manter-supabase.yml`; `gh run watch` → sucesso e log com `HTTP 200`. Abrir `https://<conta>.github.io/manual-10ano/` no browser: página inicial carrega, sem erros.
- [ ] **Step 5:** Pedir ao utilizador que, no painel do Supabase (Authentication → URL Configuration), defina **Site URL** = endereço do Pages e acrescente-o a **Redirect URLs** (Claude indica os valores exatos; o conector não altera esta configuração).
- [ ] **Step 6:** README: secção "Contas e base de dados" (projeto, migrações, workflow, como reativar se pausar). Commit `chore: GitHub Pages e workflow anti-pausa do Supabase`; push.

### Task 7: Verificação de ponta a ponta com o utilizador

**Files:** Modify o que a verificação revelar.

- [ ] **Step 1:** Com o utilizador: criar a conta da aluna no site publicado (email real dela ou do utilizador), confirmar o email, entrar, responder a 3 perguntas de um mini-quiz, sair.
- [ ] **Step 2:** Claude confirma com `execute_sql` (só contagens e colunas não pessoais) que existem 3 `tentativas` dessa conta e 1 `perfis` com papel `aluna`.
- [ ] **Step 3:** Criar a conta do encarregado, ligar com o código gerado pela aluna; confirmar que o encarregado vê a ligação e não consegue gerar código (é encarregado).
- [ ] **Step 4:** Offline: no browser, desligar a rede (DevTools) ou simular, responder a 1 pergunta, voltar a ligar → a tentativa aparece na base sem duplicados.
- [ ] **Step 5:** Exportar dados (ficheiro JSON com as tentativas). Não apagar as contas reais; testar `apagarConta` só numa conta de teste criada para o efeito.
- [ ] **Step 6:** Commit das correções (se houver) e atualização do `lista-cache.js`; push.
