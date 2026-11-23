# Fase 3C — Lacunas face aos manuais: plano de implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para executar este plano tarefa a tarefa. Os passos usam caixas (`- [ ]`) para seguimento.

**Objetivo:** fechar as lacunas encontradas ao comparar os índices dos manuais com o site, e mostrar a ajuda de formato junto de cada campo numérico.

**Arquitetura:** acrescentam-se secções aos subtemas existentes (não há subtemas novos). Há 3 ficheiros de esquema/figura novos e 7 geradores novos, nos ficheiros de geradores já existentes. As figuras explodidas usam `Manual.figura.criarEsquema` (esquemas/nucleo/figura.js), como `esquemas/fqa/fig-calorimetro.js`. Os geradores usam o contrato de `js/geradores/registo.js` e as ajudas de `js/geradores/ajudas.js`.

**Tecnologia:** JS clássico no namespace global `Manual`, sem build. Testes com `node --test`, KaTeX vendorizado, PWA (`lista-cache.js`).

**Spec:** docs/superpowers/specs/2026-11-23-manual-10ano-fase3c-lacunas-design.md

## Restrições globais

- PT-PT, tratamento por «tu», Acordo Ortográfico de 1990, terminologia das AE.
- Sem dependências novas nem CDN. Cada ficheiro novo entra no `index.html` e em `lista-cache.js` (`npm run cache`).
- Os valores físicos e químicos vêm só dos módulos de dados (`esquemas/fqa/calculo-dados.js`, `calculo-dados-fisica.js`), cada um com a sua fonte. Os enunciados dão os valores de que a aluna precisa.
- Geradores: regras de autoria 1–16 do ficheiro `.superpowers/sdd/<workspace>/regras-autoria-geradores.md`. O controlador copia-o para o workspace desta fase; o texto é igual ao da 3B.
- Códigos de erro: snake_case PT; os partilhados vêm só da allowlist (`tests/geradores-codigos.test.js`). Cada código novo leva texto em `EXCECOES` (`js/painel.js`) e entra no snapshot `tests/fixtures/erros-humanizados.txt` (`ATUALIZAR_SNAPSHOT=1`).
- Figuras: vista explodida, teclado, valores também em texto, tema claro e escuro, sem cortes a 375 px.
- Fórmulas longas têm de poder quebrar: nada de um único `\mathrm{}` com operadores.
- Commits com a identidade `308336117+figueira61@users.noreply.github.com` e o trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- No fim, `npm run validar` e `npm test` verdes. O controlador corre `npm run verificar` (≥ 2000 sementes, 0 erros).

## Foco da revisão

1. **Ajuda de formato só nos campos numéricos.** Nunca aparece em escolha nem em V/F, e aparece uma única vez por pergunta. Coberto pelo teste da Task 1.
2. **Condições com ≤ e com <.** O conjunto-solução respeita os extremos (parêntesis abertos ou fechados) e o caso «sem solução» (∅). Coberto pelos testes da Task 3.
3. **Partilha com empates e com mandatos a mais do que entidades.** O total distribuído é sempre igual ao número de itens. Coberto pelo teste da Task 2.
4. **Números da gota de água na escala certa.** Volume ≈ 0,05 mL e cerca de 10²¹ moléculas, com uma só notação por item (regra 14). Coberto pelo teste da Task 7.
5. **Figuras explodidas dentro da viewBox** no estado separado, a 375 px. Coberto pelos testes de montagem das Tasks 4 e 6, e pelo controlador no browser.

---

### Task 1: Ajuda de formato nos campos numéricos

**Ficheiros:** modificar `js/quiz.js` (bloco do `campo-numero`, ~linha 386) e `css` (o ficheiro de estilos onde está `.campo-numero`). Teste: `tests/quiz.test.js`.

- [ ] **Passo 1: testes que falham.** Em `tests/quiz.test.js`:
  - `ajuda de formato aparece por baixo do campo numérico`: montar uma pergunta `tipo: 'numerica'` com `dom-minimo`. Esperar exatamente 1 elemento `.ajuda-formato` cujo texto contém `6,02e23`, `6,02*10^23` e `6,02×10²³`. O campo deve ter `aria-describedby` igual ao id desse elemento.
  - `ajuda de formato não aparece em escolha nem em V/F`: 0 elementos `.ajuda-formato`.
- [ ] **Passo 2:** correr `node --test tests/quiz.test.js` e confirmar que falham.
- [ ] **Passo 3: implementar.** Logo a seguir ao campo (e à unidade), criar um `p.ajuda-formato` com o texto exato «Escreve só o número (com vírgula ou ponto). Notação científica: 6,02e23 · 6,02*10^23 · 6,02×10²³». Dar `inputmode="text"` ao campo; não usar `decimal`, porque o teclado do iOS não tem «−» nem «e». O estilo é texto pequeno com a cor secundária do tema, nos dois temas.
- [ ] **Passo 4:** confirmar que os testes passam e que `npm test` fica verde.
- [ ] **Passo 5:** commit `feat: ajuda de formato nas respostas numéricas`.

### Task 2: Matemática A — partilha proporcional fora das eleições

**Ficheiros:**
- modificar `conteudos/mat-a/cidadania.js`: secção nova no subtema `hondt-stlague`;
- modificar `js/geradores/mat-a/cidadania.js`: gerador novo;
- `conteudos/mat-a/ae.js`, só se faltar a frase oficial «Perceber que existem modelos matemáticos que permitem criar procedimentos para fazer distribuições proporcionais.»;
- teste: `tests/geradores-cidadania.test.js`.

**Interfaces:** usa `calc().hondt(votos, M)` e `calc().stLague(votos, M)`, já existentes em `js/geradores/mat-a/cidadania.js`.

- [ ] **Passo 1: testes que falham.**
  - O gerador `hondt-stlague-partilha` existe com `formatos: ['numerica', 'escolha']`.
  - Em 500 sementes: a soma dos itens distribuídos é igual ao total do enunciado; a resposta é igual ao resultado de `calc()` pelo método pedido; o contexto não é eleitoral (computadores por departamentos, bolsas por escolas, vagas por turnos, ou outro semelhante).
  - Há um caso fixo em que Hondt e St. Laguë dão distribuições diferentes, e a explicação diz isso.
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3: conteúdo.** Secção «Partilha proporcional fora das eleições» no subtema `hondt-stlague`. Inclui um exemplo resolvido com computadores por 3 departamentos, os dois métodos lado a lado e uma frase sobre limitações. Usa o esquema `hondt` existente, se aceitar entidades genéricas; se não aceitar, usa uma tabela.
- [ ] **Passo 4: gerador.** Erros típicos reais: aplicar o outro método; distribuir proporcionalmente e arredondar (com o total errado). Códigos novos com texto em EXCECOES e no snapshot.
- [ ] **Passo 5:** correr `npm test` e `npm run validar` (verdes).
- [ ] **Passo 6:** commit `feat: partilha proporcional fora das eleições`.

### Task 3: Matemática A — condições f(x) = k, f(x) < k, f(x) > k, ≤, ≥ pelo gráfico

**Ficheiros:**
- criar `esquemas/mat-a/condicoes.js`;
- modificar `conteudos/mat-a/funcoes.js` (subtema `generalidades`) e `js/geradores/mat-a/funcoes.js`;
- `index.html` e `lista-cache.js`;
- testes: `tests/calculo-funcoes.test.js` (ou novo `tests/esquemas-mat-condicoes.test.js`) e `tests/geradores-funcoes.test.js`.

**Interfaces:**
- Produz `Manual.funcoes.resolverCondicao(pontos, sinal, k)`, em `esquemas/mat-a/calculo-funcoes.js`.
  - `pontos` é a lista ordenada `[{x, y}]` de uma função contínua, afim por troços (polilinha), definida em `[pontos[0].x, pontos.at(-1).x]`.
  - `sinal` é um de `'=' | '<' | '>' | '<=' | '>='`.
  - Devolve `{ intervalos: [{a, b, fechadoA, fechadoB}], pontosIsolados: [x] }`, já unidos e ordenados.
- O esquema `condicoes` é registado como os outros esquemas de `esquemas/mat-a/`. Desenha a polilinha, uma reta y = k que se pode arrastar ou mudar com o teclado, e realça a solução no eixo Ox.

- [ ] **Passo 1: testes que falham** para `resolverCondicao`, com `pontos = [(-3,2),(-1,-2),(1,2),(3,-1)]`:
  - `k = 0, '='` → `pontosIsolados: [-2, 0, 2.333…]` (tolerância 1e-9);
  - `k = 0, '<'` → `]-2, 0[ ∪ ]2.333…, 3]`, com o 3 fechado porque é extremo do domínio e f(3) < 0;
  - `k = 0, '<='` → `[-2, 0] ∪ [2.333…, 3]`;
  - `k = 5, '>'` → `intervalos: []` (∅);
  - `k = 2, '>='` → `pontosIsolados: [-3, 1]`.
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3:** implementar `resolverCondicao` e o esquema `condicoes`.
- [ ] **Passo 4: conteúdo.** Secção «Condições do tipo f(x) = k, f(x) < k, f(x) > k» em `generalidades`: leitura pela reta horizontal, o papel dos extremos (≤ ou <), o caso ∅ e um exemplo resolvido; inclui o esquema.
- [ ] **Passo 5: gerador `generalidades-condicoes`** (`escolha`). Um gráfico em `figuraEnunciado` com a polilinha, sem revelar a solução, e a pergunta «Qual é o conjunto-solução de f(x) □ k?». Os distratores são erros reais: extremos trocados (aberto ↔ fechado); a região oposta; incluir os pontos onde f(x) = k numa desigualdade estrita. A verificação recalcula com `resolverCondicao`.
- [ ] **Passo 6:** `npm test` e `npm run validar` verdes; commit `feat: condições f(x) = k e desigualdades pelo gráfico`.

### Task 4: FQ-A — modelo de Bohr (figura explodida)

**Ficheiros:**
- criar `esquemas/fqa/fig-bohr.js`;
- modificar `conteudos/fqa/elementos.js` (subtema `espectros`) e `js/geradores/fqa/elementos.js`;
- `index.html` e `lista-cache.js`;
- testes: `tests/esquemas-fqa-elementos.test.js` e `tests/geradores-fqa-elementos.test.js`.

**Interfaces:** a figura `fig-bohr` é registada como `fig-atomo` (`Manual.figura.criarEsquema(def).montar(el, opcoes)`). Peças com legenda: núcleo (+); níveis n = 1, 2, 3, 4 e n = ∞ (ionização); seta de absorção (sobe, com fotão a entrar); seta de emissão (desce, com fotão a sair).

- [ ] **Passo 1: testes que falham.**
  - A figura monta-se com 8 peças legendadas: núcleo, n = 1, 2, 3, 4, ∞, seta de absorção e seta de emissão. As 8 legendas também aparecem no texto alternativo.
  - No estado separado, todos os `getBBox` ficam dentro da viewBox; seguir o padrão dos testes de `fig-calorimetro`.
  - O gerador `espectros-bohr` existe, com `formatos: ['escolha', 'vf']`.
  - Em 500 sementes, a resposta é coerente com a transição sorteada: subir de nível é absorção; descer é emissão; n = 1 é o estado fundamental; n ≥ 2 é um estado excitado; n = ∞ é ionização.
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3: conteúdo.** Secção «Modelo de Bohr» em `espectros`, antes dos níveis do hidrogénio:
  - Bohr (1913) e a ideia de postulado;
  - órbitas circulares e quantização da energia (a energia é negativa e maior quanto mais longe do núcleo);
  - transições por absorção e por emissão de energia com valores bem definidos;
  - estado fundamental, estados excitados, desexcitação, ionização;
  - formas de excitar um átomo: aquecimento, colisões com outros átomos, descargas elétricas, absorção de fotões;
  - uma nota de que hoje se sabe que os eletrões não descrevem órbitas, mas que os níveis de energia continuam válidos;
  - a figura `fig-bohr`, com uma legenda que mande tocar para separar.
- [ ] **Passo 4: gerador.** Erros típicos: confundir absorção com emissão; chamar «excitado» a n = 1; pensar que a energia é positiva ou que diminui com n.
- [ ] **Passo 5:** `npm test` e `npm run validar` verdes; commit `feat: modelo de Bohr com figura explodida`.

### Task 5: FQ-A — corrente contínua e corrente alternada

**Ficheiros:**
- criar `esquemas/fqa/fqa-corrente.js`, com o gráfico I(t) de CC e de CA e um interruptor para alternar entre as duas;
- modificar `conteudos/fqa/eletricidade.js` (subtema `circuitos`) e `js/geradores/fqa/fisica-eletricidade.js`;
- `index.html` e `lista-cache.js`;
- testes: `tests/esquemas-fqa-eletricidade.test.js` e `tests/geradores-fqa-eletricidade.test.js`.

**Interfaces:** os valores da rede (230 V, 50 Hz) entram em `Manual.dadosFisica`, com fonte (ERSE/DGEG, ou norma EN 50160).

- [ ] **Passo 1: testes que falham.**
  - O esquema monta-se nos dois modos, com valores em texto, por exemplo «sentido constante» e «muda de sentido 100 vezes por segundo (50 Hz)».
  - O gerador `circuitos-cc-ca` existe, com `formatos: ['escolha', 'vf']`.
  - Cada fonte sorteada (pilha, bateria de telemóvel, painel fotovoltaico, tomada de casa, alternador) é classificada certo.
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3: conteúdo.** Secção «Corrente contínua e corrente alternada»: definição pelo sentido da corrente, os gráficos, exemplos, e a frase de que a tensão da tomada é 230 V a 50 Hz. Sem valor eficaz nem amplitude, que estão fora das AE.
- [ ] **Passo 4:** gerador e códigos de erro.
- [ ] **Passo 5:** `npm test` e `npm run validar` verdes; commit `feat: corrente contínua e alternada`.

### Task 6: FQ-A — coletor solar (figura explodida)

**Ficheiros:**
- criar `esquemas/fqa/fig-coletor.js`;
- modificar `conteudos/fqa/termica.js` (subtema `transferencias`) e `js/geradores/fqa/fisica-termica.js`;
- `index.html` e `lista-cache.js`;
- testes: `tests/esquemas-fqa-termica.test.js` e `tests/geradores-fqa-termica.test.js`.

**Interfaces:** peças com legenda: cobertura de vidro, placa absorsora escura, tubos com fluido, isolamento térmico, caixa, entrada de água fria e saída de água quente.

- [ ] **Passo 1: testes que falham.**
  - A figura monta-se com as 7 legendas e fica dentro da viewBox no estado separado.
  - O gerador `transferencias-coletor` existe, com `formatos: ['escolha', 'numerica']`.
  - No formato numérico, o rendimento η = E_útil / E_incidente, com E_incidente = irradiância × área × tempo, é ≤ 100 % e bate com o enunciado (regras 14–16).
  - No formato escolha, cada peça corresponde ao mecanismo certo:
    - vidro → reduz perdas por convecção e radiação infravermelha;
    - placa escura → absorve radiação;
    - tubos → condução para o fluido, e o fluido transporta energia;
    - isolamento → reduz a condução.
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3: conteúdo.** Secção «Coletor solar» em `transferencias`, com a figura e um exemplo de rendimento.
- [ ] **Passo 4:** gerador; erros típicos: esquecer a área ou o tempo; inverter a razão (> 100 %); usar a energia incidente no lugar da útil.
- [ ] **Passo 5:** `npm test` e `npm run validar` verdes; commit `feat: coletor solar com figura explodida`.

### Task 7: FQ-A — AL 1.1 Volume e número de moléculas de uma gota de água

**Ficheiros:** modificar `conteudos/fqa/elementos.js` (subtema `mole`) e `js/geradores/fqa/elementos.js`. A massa volúmica da água, M(H₂O) e N_A vêm de `esquemas/fqa/calculo-dados.js` (acrescentar a massa volúmica da água, com fonte, se ainda não estiver). Testes: `tests/geradores-fqa-elementos.test.js`.

- [ ] **Passo 1: testes que falham.**
  - O gerador `mole-gota` existe, com `formatos: ['numerica', 'escolha']`.
  - Em 500 sementes: o volume de uma gota fica entre 0,03 mL e 0,07 mL; o número de moléculas fica entre 10²¹ e 3 × 10²¹.
  - A resposta é igual a (m_total / N_gotas) / M × N_A, com a massa calculada a partir dos dados.
  - Todas as opções usam a mesma notação (regra 14).
- [ ] **Passo 2:** confirmar que falham.
- [ ] **Passo 3: conteúdo.** Secção «AL 1.1 — Volume e número de moléculas de uma gota de água»: objetivo; material; procedimento (pesar N gotas numa balança, ou medir o volume de N gotas numa proveta); cálculos passo a passo; incerteza de leitura; e porque se usam muitas gotas.
- [ ] **Passo 4: gerador.** Erros típicos: não dividir por N gotas; usar mL como se fosse L (×1000); esquecer N_A, ficando em mol.
- [ ] **Passo 5:** `npm test` e `npm run validar` verdes; commit `feat: AL gota de água`.

### Task 8: Fecho

- [ ] **Passo 1:** correr `npm run cache` e confirmar que todos os ficheiros novos estão em `index.html` e em `lista-cache.js` (tem de passar `tests/index-geradores.test.js` e `tests/lista-cache.test.js`).
- [ ] **Passo 2:** `npm run validar` (verde, com a contagem de geradores a subir 7) e `npm test` (verde). Commit `chore: Fase 3C — cache e índice`.
- [ ] **Passo 3 (controlador):** `npm run verificar` em segundo plano, com 0 erros esperados.
- [ ] **Passo 4 (controlador):** verificação no browser a 375 px, tema claro e escuro, das páginas `hondt-stlague`, `generalidades`, `espectros`, `circuitos`, `transferencias` e `mole`. Inclui as figuras no estado separado, a ajuda de formato no Treino e no Teste, e nenhum erro de KaTeX.
