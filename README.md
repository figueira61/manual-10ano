# Manual interativo — 10.º ano

Manual de estudo interativo, em português europeu, para o 10.º ano. É um site estático (HTML, CSS e JavaScript simples, sem passo de compilação) que funciona offline depois da primeira visita.

A Fase 1 cobre **Matemática A** (25 subtemas em 5 temas: Modelos Matemáticos para a Cidadania, Estatística, Geometria sintética no plano, Funções, Geometria analítica). Cada subtema tem o essencial, exemplos com resolução passo a passo, esquemas interativos (14 no total), um resumo e um mini-quiz (135 perguntas). Há ainda uma página de resumos por disciplina, pesquisa por título e palavras-chave, progresso guardado no browser e tema claro/escuro. As restantes disciplinas aparecem no menu como «em breve».

## Referência curricular

- Aprendizagens Essenciais (AE) de 2018 e, para Matemática A, as AE de 2023 (Despacho n.º 702/2023).
- Uma revisão do programa está prevista para 2027/28; quando acontecer, é preciso rever `conteudos/mat-a/ae.js` (lista de objetivos) e os subtemas afetados. O validador (`npm run validar`) indica os objetivos que deixarem de estar cobertos.

## Como abrir

- **Diretamente:** abrir `index.html` no browser (`file://`). Tudo funciona, mas sem modo offline (o service worker não corre em `file://`).
- **Servido (recomendado):** na pasta do projeto, `python -m http.server 8080` e abrir <http://localhost:8080>. Assim ficam ativos a PWA e o modo offline: a primeira visita guarda todos os ficheiros em cache e as seguintes funcionam sem rede.

## Alojamento (GitHub Pages)

É só copiar o repositório tal como está: nas definições do repositório, *Pages* → ramo principal, pasta raiz. Não há compilação. Se publicares uma alteração, regenera antes a lista de cache (ver abaixo) para os utilizadores receberem a versão nova.

## Contas e base de dados

- **Projeto Supabase:** "manual-10ano" (região UE, plano gratuito), em `https://dhflcwqwmhbyxqcsxvlh.supabase.co`. O site só usa a chave pública ("anon") de `js/config.js`; a proteção dos dados é feita por RLS. Nunca guardar a chave de serviço no repositório.
- **Migrações:** em `supabase/migracoes/` (SQL por ordem numérica) e testes SQL em `supabase/testes/`.
- **Anti-pausa:** o workflow `.github/workflows/manter-supabase.yml` chama `rpc/ping` todos os dias às 06:00 UTC e também manualmente em *Actions* → *Manter Supabase ativo* → *Run workflow*. Usa os secrets do repositório `SUPABASE_URL` e `SUPABASE_ANON_KEY`; falha se a resposta não for HTTP 200.
- **Regra dos 60 dias:** o GitHub desativa workflows agendados em repositórios públicos sem atividade durante 60 dias. Por isso o workflow, depois do ping, verifica o último commit e, se tiver mais de 45 dias, cria um commit vazio ("chore: manter repositório ativo") e faz push. Só esse segundo passo (tarefa `manter-ativo`, que corre depois de `ping`) tem permissão `contents: write`; o ping só lê. Ao trabalhar no repositório, faz `git pull` antes de `git push`, porque a tarefa pode criar um commit automático.
- **Se o workflow for desativado:** abrir o separador *Actions* do repositório, escolher *Manter Supabase ativo* e carregar em *Enable workflow*; depois *Run workflow* para confirmar.
- **Se o projeto pausar:** entrar em <https://supabase.com/dashboard>, abrir o projeto "manual-10ano" e carregar em *Restore project*; depois lançar o workflow manualmente para confirmar `HTTP 200`.
- **Endereço do site (GitHub Pages):** <https://figueira61.github.io/manual-10ano/>
- **Auth (Supabase → Authentication → URL Configuration):** *Site URL* = `https://figueira61.github.io/manual-10ano/`; *Redirect URLs* = `https://figueira61.github.io/manual-10ano/**` (e `http://localhost:8080/**` para testes locais).

## Publicação como Artifact

O `index.html` pode ser publicado como Artifact, com o parâmetro `files` a mapear **todos** os caminhos listados em `lista-cache.js` (css, js, conteudos, esquemas, vendor, manifest e ícone), sem alterar código. Nota: o service worker pode não correr dentro do Artifact, por isso não há modo offline e o progresso é guardado por browser.

URL: https://claude.ai/artifact/UjrxtUhRG7eQK7N8Ee4nUv (privado; partilhar pelo menu Partilhar da página)

A página publicada é gerada a partir do `index.html` sem as etiquetas `<html>`, `<head>` e `<body>` (a plataforma acrescenta-as), com `files` a mapear todos os caminhos de `lista-cache.js`.

## Testes e ferramentas

Requer Node.js (testado com a v24). Não há dependências a instalar.

| Comando | O que faz |
| --- | --- |
| `npm test` | Corre os testes (`node --test`, pasta `tests/`): lógica pura, cálculos, quiz, router, pesquisa, progresso, validador, lista de cache. |
| `npm run validar` | Valida os conteúdos: estrutura de cada subtema, perguntas, resultados dos blocos `exemplo` com `verificar`, ficheiros de esquema existentes, índice vs. ficheiros de tema e cobertura dos objetivos AE. |
| `npm run cache` | Regenera `lista-cache.js` (lista de pré-carregamento e versão do service worker). |

**Depois de qualquer alteração ao site (conteúdos, esquemas, CSS, JS) corre `npm run cache`** e inclui o `lista-cache.js` atualizado no commit; caso contrário os browsers que já visitaram o site continuam com a versão antiga em cache.

## Estrutura

```
index.html            shell da aplicação (carrega os scripts por ordem)
sw.js, lista-cache.js service worker e lista gerada (npm run cache)
manifest.webmanifest, icone.svg
css/base.css          estilos, tokens de cor (claro/escuro)
js/                   motor: nucleo, router, texto (Markdown + KaTeX), quiz,
                      progresso, pesquisa, render, tema, app
conteudos/indice.js   índice de disciplinas, temas e subtemas (+ palavras-chave)
conteudos/<disc>/     ae.js (objetivos AE) e um ficheiro por tema
esquemas/nucleo/      núcleo dos diagramas (referencial SVG, pontos arrastáveis, controlos, 3D)
esquemas/<disc>/      esquemas interativos e módulos de cálculo (calculo-*.js)
vendor/katex/         KaTeX (local, sem CDN)
tests/, tools/        testes e scripts (validador, gerador da lista de cache)
```

## Acrescentar uma disciplina ou um tema

1. **Índice:** em `conteudos/indice.js`, preencher a disciplina (`disponivel: true`) com os seus temas e subtemas (`id`, `titulo`, `palavras` para a pesquisa). Os ids usam só `a-z`, `0-9` e `-`.
2. **Ficheiro de tema:** criar `conteudos/<disciplina>/<tema>.js` com `Manual.registarTema('<disciplina>', { id, titulo, subtemas: [...] })`. Cada subtema tem `id`, `titulo`, `ae` (objetivos cobertos), `minutos`, `essencial` (blocos), `resumo` e `quiz` (4 a 6 perguntas: `escolha`, `vf` ou `numerica`, com `resolucao` e/ou `explicacao`). Blocos: `texto`, `definicao`, `formula`, `exemplo` (`enunciado`, `resolucao`, opcionalmente `resultado` e `verificar`), `quadro`, `codigo`, `erro-frequente`, `esquema`. Seguir um tema existente como modelo.
3. **Objetivos AE:** criar `conteudos/<disciplina>/ae.js` com `Manual.ae['<disciplina>'] = [...]`, uma entrada por objetivo; o texto de cada objetivo tem de aparecer no campo `ae` de algum subtema. Este ficheiro só é lido pelo validador (não é carregado pelo site).
4. **Esquemas:** um bloco `{ tipo: 'esquema', id }` carrega `esquemas/<disciplina>/<id>.js`, que regista `Manual.esquemas.registar(id, { montar(el, opcoes) })` e devolve `{ destruir() }`. Usar o núcleo (`Manual.nucleo`) e os módulos `calculo-*.js` para todos os números mostrados.
5. **Scripts em `index.html`:** acrescentar as tags `<script>` só dos ficheiros que têm de estar sempre carregados (por exemplo módulos de cálculo partilhados); o índice já lá está e os temas e esquemas são carregados a pedido.
6. **Validar e testar:** `npm run validar`, `npm test` e, no fim, `npm run cache`. Regras do validador: ids únicos; todos os subtemas do índice existem no ficheiro do tema (e vice-versa); `ae`, `essencial`, `resumo` e `minutos` preenchidos; 4 a 6 perguntas por subtema com `correta` dentro do intervalo, sem opções duplicadas e com resolução; tipos de bloco conhecidos; ficheiros de esquema existentes; resultados dos exemplos conferidos por `verificar`; todos os objetivos de `ae.js` cobertos.

## Limitações conhecidas

- Os objetivos do domínio Estatística relativos ao **trabalho de projeto** não estão cobertos (não se prestam a conteúdo interativo estático).
- As tabelas de IRS e de retenção na fonte são **ilustrativas** (valores de exemplo, não as tabelas oficiais em vigor); servem para compreender a progressividade e o cálculo, não para cálculos fiscais reais.
- O progresso (subtemas lidos, melhor resultado dos quizzes) fica no `localStorage` do browser: não é partilhado entre dispositivos.
- Só Matemática A está disponível nesta fase.
