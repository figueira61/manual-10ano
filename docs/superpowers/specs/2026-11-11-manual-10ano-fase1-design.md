# Manual Interativo do 10.º Ano — Fase 1 (Motor + Matemática A)

- **Data:** 2026-11-11
- **Estado:** aprovado em conversa; aguarda revisão escrita
- **Fase:** 1 de 7 (ver Roadmap)

## 1. Objetivo

Manual interativo, sucinto e objetivo, dos conteúdos do 10.º ano do ensino secundário em Portugal, para **estudo autónomo de um aluno** (rever matéria e preparar testes), em computador e telemóvel.

Critérios de sucesso:
- O aluno encontra o essencial de cada tema em poucos minutos de leitura, sem texto supérfluo.
- Nas ciências, esquemas interativos permitem experimentar os conceitos.
- O aluno consegue autoavaliar-se com mini-quizzes e **comparar o seu cálculo com o cálculo correto apresentado passo a passo**.
- Funciona offline e pode também ser publicado como Artifact do claude.ai, a partir dos mesmos ficheiros.

## 2. Referencial curricular (verificado a 2026-11-11)

Ano letivo 2026/2027, 10.º ano — documentos **em vigor**:

| Disciplina | Documento |
|---|---|
| Português, Inglês (continuação), Filosofia, Física e Química A, Biologia e Geologia | Aprendizagens Essenciais (AE) — Despacho n.º 8476-A/2018 |
| Matemática A | Novas AE de Matemática — Despacho n.º 702/2023 (10.º ano desde 2024/2025) |

A revisão geral das AE (consulta pública mar–abr 2026; nova consulta prevista em 2027) **não está em vigor**; entrada gradual prevista a partir de 2027/2028. O manual segue os documentos em vigor e está organizado para facilitar a futura atualização (fase 7).

Fonte: https://www.dge.mec.pt/aprendizagens-essenciais-ensino-secundario

## 3. Âmbito da Fase 1

Incluído:
- Motor completo do manual (navegação, modelo de página, quizzes, progresso, pesquisa, tema claro/escuro, PWA offline).
- Biblioteca partilhada de esquemas (`esquemas/nucleo/`).
- **Matemática A 10.º ano completa** (todos os temas da secção 6).
- Publicação: site estático/PWA e Artifact multi-ficheiro.

Fora do âmbito (YAGNI): contas de utilizador, servidor/backend, sincronização entre dispositivos, exercícios de exame completos, exportação PDF, outras línguas de interface, as restantes 5 disciplinas (fases seguintes).

## 4. Arquitetura

Três camadas, sem passo de build:

1. **Motor** (`js/`) — router por hash, renderização, quizzes, progresso, pesquisa, tema. Não contém conteúdo.
2. **Conteúdo** (`conteudos/`) — um ficheiro `.js` por tema, que regista um objeto de dados. Ficheiros `.js` (e não `.json`) para funcionar também em `file://`.
3. **Esquemas** (`esquemas/`) — componentes interativos independentes, carregados só quando o subtema é aberto.

```
manual-10ano/
├── index.html                 SPA; rotas #/<disciplina>/<tema>/<subtema>
├── manifest.webmanifest
├── sw.js                      service worker (cache offline)
├── css/                       estilos + tokens de cor (claro/escuro)
├── js/                        motor
├── vendor/katex/              KaTeX local (sem CDN)
├── conteudos/indice.js        disciplinas → temas → subtemas
├── conteudos/mat-a/*.js
├── esquemas/nucleo/*.js       referencial, ponto arrastável, slider, desenho de funções/vetores
├── esquemas/mat-a/*.js
├── tests/                     testes Node (node --test)
└── tools/validar-conteudos.js
```

Regras:
- JavaScript moderno em **scripts clássicos** (não módulos ES — os browsers bloqueiam módulos e `import()` em `file://`). Cada ficheiro regista-se no namespace global `Manual`; o carregamento preguiçoso faz-se injetando `<script>`. Sem frameworks, sem dependências de runtime além de KaTeX vendorizado.
- Nenhum recurso externo carregado em runtime (requisito do offline e do Artifact).
- Service worker só ativo quando servido por http(s); em `file://` o site funciona sem cache offline.

## 5. Modelo de dados e de página

### 5.1 Subtema (estrutura de dados)

```js
{
  id: "quadratica",
  titulo: "Função quadrática",
  ae: ["Estudar famílias de funções quadráticas…"],   // objetivos AE cobertos (texto do documento)
  minutos: 6,
  essencial: [ /* blocos */ ],
  resumo: [ /* itens curtos, podem conter LaTeX */ ],
  quiz: [ /* perguntas */ ]
}
```

Tipos de bloco em `essencial`: `texto`, `definicao`, `exemplo` (enunciado + `resolucao` em passos), `erro-frequente`, `formula`, `quadro` (tabela estática), `codigo` (Python ilustrativo, só leitura), `esquema` (`{ tipo: "esquema", id: "parabola", opcoes: {...}, legenda: "Mexe em a, h e k…" }`).

### 5.2 Página de subtema (ordem fixa)

1. Cabeçalho: título, tema, etiqueta AE, minutos de leitura.
2. **O essencial**: parágrafos ≤ 3–4 linhas; definições em caixa; um exemplo resolvido por conceito principal; avisos de erros frequentes; esquemas embutidos no ponto relevante, com legenda de uma linha sobre o que experimentar.
3. **Resumo rápido**: cartão com fórmulas e conceitos-chave. Página agregadora de resumos por disciplina.
4. **Mini-quiz**: 4–6 perguntas.
5. Navegação anterior/seguinte.

### 5.3 Quiz e apresentação dos cálculos

Tipos de pergunta:
- `escolha` — escolha múltipla (exatamente uma opção correta).
- `vf` — verdadeiro/falso.
- `numerica` — o aluno escreve um valor; correção com tolerância definida por pergunta (ex.: `tolerancia: 0.01`) e aceitação de vírgula ou ponto decimal.

**Requisito de verificação:** depois de responder, o aluno vê sempre:
- se acertou;
- a resposta correta;
- a **resolução passo a passo com os resultados intermédios** (campo `resolucao`, obrigatório em perguntas `numerica` e em qualquer pergunta que envolva cálculo), para poder comparar com o seu próprio cálculo e localizar onde errou.

Os exemplos resolvidos do "Essencial" seguem a mesma regra: passos e valores intermédios explícitos.

Os esquemas que envolvem cálculos mostram também os valores intermédios em texto (ex.: tabela de quocientes de Hondt, decomposição bruto → SS → IRS → líquido, tabela de desvios para o desvio padrão, somatórios de *r*).

Todos os valores numéricos de exemplos, resoluções e respostas são **gerados ou verificados por código** (funções de `esquemas/mat-a/calculo.js` ou equivalentes) — o validador falha se uma resposta declarada não coincidir com o valor calculado.

### 5.4 Progresso

`localStorage` (envolvido em try/catch; o site funciona sem ele): subtemas lidos e melhor resultado por quiz. Apenas no dispositivo; sem conta.

### 5.5 Navegação e interface

- Início → disciplina → tema → subtema.
- Barra lateral fixa no desktop; gaveta no telemóvel (≥ 375 px, sem scroll horizontal, margem lateral 16 px).
- Pesquisa global por título e palavras-chave.
- Tema claro/escuro (segue o sistema; alternável manualmente).
- Língua: português europeu, Acordo Ortográfico de 1990.

## 6. Conteúdos de Matemática A (10.º ano, AE 2023)

| Tema | Subtemas | Esquemas |
|---|---|---|
| Modelos Matemáticos para a Cidadania | Maioria simples e absoluta; Método de Borda; Métodos de Hondt e St. Laguë (vantagens/limitações); Salários (bruto/líquido, SS, retenção IRS, escalões, progressividade); Juro simples e composto, poupança e crédito | Simulador Hondt/St. Laguë; Contagem de Borda; Juro simples vs. composto; Calculadora salário/IRS (valores ilustrativos, com aviso de que as tabelas mudam anualmente) |
| Estatística | Problema estatístico e variabilidade; População, amostra, variável, fases do procedimento; Dados quantitativos discretos/contínuos; Tabelas de frequências e histograma; Medidas de localização (média, mediana, moda, percentis/quartis); Medidas de dispersão (amplitude, AIQ, desvio padrão e variância amostrais); Propriedades das medidas (transformação *a·x+b*, resistência, outliers, dados agrupados); Dados bivariados: diagrama de dispersão, coeficiente *r*, reta de regressão, correlação ≠ causalidade; Gráfico de linhas | Histograma dinâmico; Medidas e outliers (com diagrama de extremos e quartis); Dispersão e regressão |
| Geometria sintética no plano | Incentro e circunferência inscrita; Circuncentro e circunferência circunscrita; Ortocentro; Baricentro e propriedades das medianas (6 triângulos equivalentes, 2/3 da mediana); Reta de Euler e circunferência dos nove pontos | Pontos notáveis (vértices arrastáveis, camadas ligáveis) |
| Funções | Generalidades (domínio, conjunto de chegada, contradomínio, representações); Função afim (zeros, sinal, monotonia); Função quadrática (concavidade, eixo, vértice, zeros, sinal, extremos); Transformações *f(x−h)+k*, *a·f(x)*; Equações e inequações do 2.º grau; Funções definidas por ramos; Função módulo | Família afim; Transformações da parábola; Ramos e módulo |
| Geometria analítica | Referencial no plano: coordenadas, reflexões, meia-volta, ponto médio, distância; Conjuntos de pontos: retas, semiplanos, mediatriz, circunferência, círculo; Referencial no espaço: planos paralelos aos coordenados, retas paralelas aos eixos, plano mediador, superfície esférica e esfera; Vetores no plano e no espaço (coordenadas, operações, colinearidade, norma); Equação vetorial da reta e relação com a equação reduzida | Plano (distância, ponto médio, mediatriz, circunferência); Vetores no plano; Espaço 3D (SVG com projeção, rotação por arrasto) |

Pensamento computacional: subtemas com cálculo incluem, quando útil, um pequeno bloco de código Python ilustrativo (apenas leitura), em linha com os exemplos das AE.

## 7. Esquemas interativos

- Interface comum: `Manual.esquemas.registar(id, { montar(el, opcoes) → { destruir() } })`.
- Biblioteca `esquemas/nucleo/`: referencial 2D com zoom/arrasto, pontos arrastáveis (rato e toque), sliders, desenho de funções, vetores, projeção 3D simples.
- Lógica de cálculo separada do desenho (módulos puros testáveis).
- Acessibilidade: controlos acessíveis por teclado; valores sempre também em texto; cores com contraste adequado em claro e escuro.
- Desempenho: carregamento preguiçoso (injeção de `<script>`) ao abrir o subtema.

## 8. Qualidade e testes

- **Unitários** (`node --test`, sem dependências): cálculos (Hondt, St. Laguë, Borda, juros, IRS ilustrativo, média/mediana/quartis/desvio padrão, *r*, regressão, pontos notáveis, distância, vetores), correção de quizzes (incluindo tolerância e vírgula decimal), router, progresso.
- **Validador de conteúdo** (`tools/validar-conteudos.js`): todas as partes obrigatórias presentes; exatamente uma resposta correta por pergunta de escolha; `resolucao` presente onde obrigatório; respostas numéricas coincidem com o valor calculado; esquemas referidos existem; ids únicos; cobertura dos objetivos AE listados.
- **Verificação no browser**: navegação, todos os esquemas (arrasto, sliders, toque), quizzes com resolução, modo escuro, largura 375 px, funcionamento offline depois da primeira visita.
- **Publicação**: teste de publicação como Artifact multi-ficheiro sem alterações ao código.

## 9. Roadmap

1. **Fase 1 (esta spec):** motor, PWA, Artifact, Matemática A completa.
2. Física e Química A.
3. Biologia e Geologia.
4. Português.
5. Filosofia.
6. Inglês (conteúdo em inglês, notas curtas em português).
7. Atualização para as AE revistas, quando entrarem em vigor (previsto 2027/2028).

Cada fase tem spec e plano próprios. Disciplinas de letras usam o mesmo modelo de página sem esquemas interativos, com quadros-síntese estáticos.
