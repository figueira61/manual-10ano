# Manual Interativo do 10.º Ano — Fase 2 (Contas, aprendizagem adaptativa e exercícios gerados)

- **Data:** 2026-11-12
- **Estado:** aprovado em conversa (4 secções); aguarda revisão escrita
- **Depende de:** Fase 1 (`2026-11-11-manual-10ano-fase1-design.md`) — motor, Matemática A, esquemas, PWA.

## 1. Objetivo

Transformar o manual numa ferramenta de estudo que **aprende as dificuldades da aluna** e a ajuda a consolidar conhecimentos:

- regista o desempenho por subtema em três estados — **domina**, **com dificuldade**, **não conseguiu resolver**;
- apresenta exercícios **sempre diferentes** (outros números, contextos e formatos), para treinar raciocínio e não memorização;
- dá **feedback dirigido ao erro** e resoluções **intuitivas e esclarecedoras**;
- mostra à aluna (e ao encarregado de educação) onde estão as dificuldades e o que treinar;
- funciona **sem conta claude.ai**, com contas próprias online; Claude gere a base de dados e analisa o registo a pedido do utilizador.

Requisitos transversais (inegociáveis):
1. **Correção garantida** — todo o exercício apresentado é gerado e verificado por código (secção 6); nenhum é publicado sem passar a verificação.
2. **Resoluções pedagógicas** — cada passo diz o que se faz, porquê e o cálculo com valores intermédios; termina com verificação.
3. **Transversal a todas as disciplinas** — motor, contrato de gerador e páginas são comuns; cada disciplina fornece geradores ou bancos.
4. **Base de dados nunca pausa por inatividade** — pedido automático diário (secção 4.5).

## 2. Âmbito e decomposição

A Fase 2 divide-se em quatro blocos, cada um com plano próprio, implementados por esta ordem:

| Bloco | Conteúdo | Secções |
|---|---|---|
| **2A — Contas e registo** | Supabase (auth, tabelas, RLS), entrada/registo, ligação ao encarregado, sincronização offline, exportar/apagar, GitHub Pages, GitHub Actions anti-pausa | 4 |
| **2B — Motor adaptativo** | classificação nos 3 estados, erros típicos, repetição espaçada, seleção de exercícios, níveis de ajuda | 5 |
| **2C — Geradores de Matemática A** | contrato de gerador, ~75 geradores (≥3 tipos × 25 subtemas), verificação automática, integração das 135 perguntas atuais como banco | 6 |
| **2D — Modos e páginas** | mini-quiz adaptativo, Treino, Teste, O meu progresso, vista do encarregado | 7 |

Fora do âmbito: conteúdos das outras disciplinas (fases próprias, que reutilizam este motor); geração de exercícios por IA em tempo real (excluída: sem garantia de correção); aplicação nativa; notificações push.

## 3. Arquitetura

- O site continua estático (HTML/CSS/JS clássico, sem build) e passa a ser alojado no **GitHub Pages**; a versão Artifact mantém-se como cópia sem contas.
- **Supabase** fornece autenticação (email + palavra-passe, com confirmação) e Postgres com **Row Level Security**.
- Cliente Supabase JS **vendorizado** (`vendor/supabase/`), versão fixa ≥ 2 semanas, sem CDN em runtime (mantém PWA/offline).
- **Camada de dados isolada:** só `js/conta.js` conhece o Supabase. Interface pública (estável, para permitir trocar por Firebase reescrevendo apenas este ficheiro):
  - `Manual.conta.estado() → { autenticado, papel, perfil } `, `entrar(email, pass)`, `registar(email, pass, papel, nome)`, `sair()`, `aoMudar(fn)`
  - `Manual.conta.guardarTentativa(t)` (assíncrono, via fila offline), `tentativas(filtro)`, `guardarEstado(e)`, `estados(alunaId?)`
  - `Manual.conta.gerarCodigoLigacao()`, `ligarEncarregado(codigo)`, `ligacoes()`, `revogarLigacao(id)`
  - `Manual.conta.exportar() → JSON`, `apagarConta()`
- Novos módulos puros (testáveis em Node): `js/aprendizagem.js` (classificação, repetição espaçada, seleção), `js/aleatorio.js` (RNG com semente), `js/geradores/` (registo e geradores por disciplina).
- Sem conta, tudo funciona com armazenamento local (como hoje); ao criar conta, o progresso local é importado.

## 4. Bloco 2A — Contas, dados e manutenção

### 4.1 Papéis
- **Aluna:** cria conta e estuda. Idade de consentimento digital em Portugal: 13 anos (Lei n.º 58/2019, art. 16.º) — a aluna pode criar conta; o manual pede-lhe que ligue o encarregado.
- **Encarregado:** conta própria, **só leitura** do progresso das alunas ligadas.
- **Administração (Claude):** acesso via conector Supabase, usado apenas a pedido do utilizador (análise, manutenção, migrações).

### 4.2 Tabelas (schema `public`)

| Tabela | Colunas principais |
|---|---|
| `perfis` | `id uuid` (= `auth.users.id`), `papel text check in ('aluna','encarregado')`, `nome text`, `criado_em timestamptz` |
| `codigos_ligacao` | `codigo text pk` (8 caracteres, sem ambíguos), `aluna_id uuid`, `expira_em timestamptz` (48 h), `usado boolean` |
| `ligacoes` | `id uuid`, `aluna_id uuid`, `encarregado_id uuid`, `criado_em`, `unique(aluna_id, encarregado_id)` |
| `tentativas` | `id uuid` (gerado no cliente — idempotência), `aluna_id`, `disciplina`, `tema`, `subtema`, `tipo` (id do gerador ou da pergunta de banco), `semente bigint null`, `formato`, `modo text check in ('quiz','treino','teste')`, `nivel_ajuda smallint`, `resultado text check in ('certa','errada')`, `primeira_tentativa boolean`, `viu_resolucao boolean`, `usou_pista boolean`, `erro_tipico text null`, `duracao_ms int`, `sessao_id uuid`, `criado_em timestamptz` |
| `estados` | `aluna_id`, `chave` (`disciplina/tema/subtema`), `estado text check in ('domina','dificuldade','nao_resolvido')`, `tipos jsonb` (estado por tipo), `proxima_revisao date`, `intervalo_dias smallint`, `atualizado_em`, `pk(aluna_id, chave)` |

### 4.3 Regras de acesso (RLS)
- `perfis`: cada utilizador lê/atualiza o seu; encarregado lê o perfil (nome) das alunas ligadas.
- `tentativas`, `estados`: aluna insere/lê os seus (`aluna_id = auth.uid()`); `estados` também atualiza; encarregado **lê** os das alunas em `ligacoes`; ninguém apaga linhas individuais.
- `codigos_ligacao`: aluna cria/lê os seus; o uso de um código faz-se por função `SECURITY DEFINER` `usar_codigo_ligacao(codigo)` (valida expiração e papel do chamador, cria a ligação, marca usado).
- `ligacoes`: aluna e encarregado leem as suas; aluna pode apagar (revogar).
- `apagar_conta()`: função `SECURITY DEFINER` que apaga todos os dados do chamador e o utilizador de auth.
- Testes de RLS obrigatórios com contas de teste (secção 8).

### 4.4 Sincronização offline
- Cada tentativa é escrita primeiro numa fila local (`localStorage`, try/catch) com `id` uuid; enviada quando houver rede (`online`, arranque, após login); reenvio idempotente (`upsert` por `id`).
- Estados recalculam-se no cliente a partir das tentativas (secção 5) e gravam-se em `estados`.
- Sem rede/sem conta, a app usa os dados locais; nunca bloqueia o estudo.

### 4.5 Manutenção anti-pausa (obrigatória)
- Função SQL `public.ping()` (`select now()`), executável por `anon`.
- Workflow `.github/workflows/manter-supabase.yml`: `on: schedule: - cron: "0 6 * * *"` (diário) e `workflow_dispatch`; faz `POST {SUPABASE_URL}/rest/v1/rpc/ping` com a chave pública (secrets do repositório `SUPABASE_URL`, `SUPABASE_ANON_KEY`); falha (exit ≠ 0) se a resposta não for 200 → o GitHub notifica por email o dono do repositório.
- Verificação na implementação: execução manual (`workflow_dispatch`) com resposta 200 registada.

### 4.6 Alojamento
- GitHub Pages a partir do ramo principal (pasta raiz). Endereço `https://<utilizador>.github.io/manual-10ano/` (ou domínio próprio, se o utilizador quiser).
- Redirecionamentos de autenticação do Supabase configurados para esse endereço.

### 4.7 RGPD
- Dados mínimos: email, nome a mostrar, papel, tentativas e estados.
- Página "Privacidade" curta: que dados, para quê, quem acede (aluna, encarregado ligado, administração a pedido), como exportar e apagar.
- Exportar (JSON) e apagar conta disponíveis na página "O meu progresso".

### 4.8 Preparação pelo utilizador
- Criar conta Supabase (ou autorizar Claude a criar o projeto via conector, custo 0 € no plano gratuito — confirmação explícita antes).
- Criar conta GitHub e repositório (ou autorizar `gh` com a conta dele). Claude não cria contas nem introduz palavras-passe.

## 5. Bloco 2B — Motor adaptativo

### 5.1 Unidades
- **Subtema** (visível) e **tipo de exercício** (interno: id do gerador ou pergunta de banco).

### 5.2 Classificação (janela: tentativas recentes)
Por tipo, considerar as últimas 4 tentativas desse tipo; por subtema, as últimas 6 tentativas do subtema.

| Estado | Regra |
|---|---|
| `nao_resolvido` (tipo) | as duas últimas tentativas desse tipo erradas, com sementes diferentes |
| `domina` (subtema) | as últimas 3 tentativas do subtema certas à primeira, sem ver a resolução nem usar pista, distribuídas por ≥ 2 dias diferentes, e nenhum tipo do subtema em `nao_resolvido` |
| `nao_resolvido` (subtema) | algum tipo do subtema em `nao_resolvido` |
| `dificuldade` (subtema) | qualquer outro caso com tentativas na janela |
| *(sem estado)* | sem tentativas |

Tentativas mais antigas que a janela não contam — o estado melhora quando a aluna melhora. Funções puras com testes de casos limite.

### 5.3 Erros típicos
- Cada gerador declara `errosTipicos` com `codigo`, o valor (numérico) ou opção (escolha) que esse erro produz, e uma `explicacao` dirigida.
- Resposta numérica: compara-se com cada valor de erro típico dentro da tolerância; se coincidir, regista-se `erro_tipico` e mostra-se a explicação antes da resolução.
- Escolha múltipla: cada opção errada é um erro típico.
- Agregação: contagem por `codigo` nas últimas 30 tentativas, mostrada em linguagem simples.

### 5.4 Repetição espaçada
- Intervalos por subtema: 1 → 3 → 7 → 14 → 30 dias. Acerto à primeira avança um nível; erro volta a 1 dia. `proxima_revisao = hoje + intervalo`.

### 5.5 Seleção de exercícios (anti-memorização)
- Nunca repetir uma `semente` já vista no mesmo tipo.
- Peso por tipo: `nao_resolvido` 4, com erros recentes 3, sem prática 2, `domina` 0,5 (manutenção).
- Depois de um erro, o exercício seguinte do mesmo subtema usa o **mesmo tipo de competência noutra forma**: contexto diferente, formato diferente (numérica ↔ escolha ↔ vf ↔ passos) ou direção inversa, quando o gerador o suporte.
- Teste: amostra estratificada pelos temas escolhidos, sem ajudas.

### 5.6 Níveis de ajuda (Treino)
- `0` guiado (resolução em passos que a aluna preenche, verificação por passo), `1` com pista (botão "Dá-me uma pista"; usar conta como dificuldade), `2` autónomo. Sobe após 2 acertos seguidos no nível; desce após 1 erro.

## 6. Bloco 2C — Geradores e garantia de correção

### 6.1 Contrato
```
Manual.geradores.registar({ id, disciplina, tema, subtema, tipo, nome, formatos, contextos, inverso?,
  gerar(semente, { formato, nivel, contexto }) → {
    enunciado,                         // texto ($…$ para fórmulas), PT-PT, "tu"
    resposta, tolerancia, unidade?,    // numérica
    opcoes?, correta?,                 // escolha / vf
    arredondamento?,                   // dito no enunciado quando aplicável
    resolucao: [{ passo, porque, calculo }],
    verificacao: { passo, calculo },
    errosTipicos: [{ codigo, valor? , opcao?, explicacao }],
    esquema?: { id, opcoes },          // esquema interativo com os mesmos valores
    rever?: { ancora }                 // secção do subtema a rever
  },
  verificarIndependente(exercicio) → boolean   // segundo método
})
```
- RNG com semente (`js/aleatorio.js`, mulberry32) — mesmo `semente` ⇒ mesmo exercício.
- Valores "simpáticos" definidos por gerador (zeros inteiros/frações simples, percentagens redondas, médias limpas).
- Toda a matemática usa `Manual.calc.*` existente; nenhum gerador reimplementa cálculos.

### 6.2 Verificação automática (bloqueante)
Para cada gerador, 2000 sementes × cada formato/contexto:
1. `verificarIndependente` verdadeiro (segundo método: substituição, fórmula alternativa, invariantes como soma de mandatos).
2. O cálculo do último passo da resolução é igual à resposta (dentro da tolerância).
3. Opções distintas entre si e da certa; cada opção errada mapeia um erro típico; valores de erros típicos diferentes da resposta.
4. Nenhum texto com `NaN`, `undefined`, `Infinity`, `− −`, `+ −`; todas as fórmulas passam no KaTeX (`throwOnError: true`).
5. Valores dentro dos limites declarados.
Corre em `npm test` e num passo de verificação obrigatório antes de publicar.

### 6.3 Cobertura de Matemática A
- ≥ 3 tipos por subtema (≈ 75 geradores); cada tipo com ≥ 2 formatos ou contextos.
- As 135 perguntas atuais tornam-se **banco conceptual** (tipo = id da pergunta), misturadas com as geradas.

### 6.4 Disciplinas de letras (fases seguintes)
- Mesmo contrato via "geradores de banco": itens escritos à mão e validados, com variantes e rotação; erros típicos pelas opções.

## 7. Bloco 2D — Modos e páginas

- **Navegação:** topo com "Entrar / Criar conta" ou nome + menu (O meu progresso, Treino, Teste, Sair). Rotas novas: `#/entrar`, `#/registar`, `#/progresso`, `#/treino`, `#/teste`, `#/privacidade`, `#/encarregado`.
- **Mini-quiz do subtema:** 5 exercícios (gerados + banco), pesos da secção 5.5; no fim, estado atualizado e convite "Treinar este subtema".
- **Treino:** sugestão diária (subtemas fracos em data, ~10 min) ou escolha livre; 8–10 exercícios; níveis de ajuda; resumo final (melhorias, dificuldades, próxima revisão).
- **Teste:** escolha de temas e tamanho (10/15/20), cronómetro opcional, sem ajudas; no fim nota (0–20 e %), resolução de cada exercício com erro típico, "temas a rever" com ligação ao treino.
- **O meu progresso:** estados por disciplina/tema (cor + etiqueta, legível sem cor), erros mais frequentes em linguagem simples, evolução, sugestões, Exportar, Apagar conta, gestão do encarregado (código, ligações, revogar).
- **Vista do encarregado:** mesma página, só leitura, com última atividade; seletor se houver várias educandas.
- **Resoluções:** passos com "o que / porquê / cálculo", verificação final, esquema com os mesmos valores quando útil, ligação "Rever no manual".

## 8. Qualidade e testes

- **Unitários (Node):** classificação (casos limite de cada regra), repetição espaçada, seleção (sem sementes repetidas; mudança de forma após erro), fila offline/sincronização (idempotência), RNG reprodutível.
- **Geradores:** pacote da secção 6.2.
- **RLS:** com contas de teste — aluna A não lê dados da aluna B; encarregado só lê as ligadas e não escreve; código de ligação expirado/usado é recusado; `apagar_conta` remove tudo do próprio.
- **Browser:** registo/entrada, ligação do encarregado, três modos, offline → sincronização, 375 px, tema escuro.
- **Manutenção:** execução manual do workflow anti-pausa com resposta 200.

## 9. Riscos e decisões

- **Inatividade do Supabase (plano gratuito):** mitigada pelo workflow diário; se mesmo assim for problema, migração para Firebase reescrevendo `js/conta.js` (+ migração de dados), mantendo GitHub Pages.
- **Chave pública no site:** é a chave `anon` do Supabase, pública por desenho; a proteção é feita por RLS. Nenhuma chave de serviço no cliente nem no repositório.
- **Dados de menor:** dados mínimos, RLS, exportar/apagar, página de privacidade; acesso de administração só a pedido do utilizador.
