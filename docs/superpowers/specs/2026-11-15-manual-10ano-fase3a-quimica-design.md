# Manual Interativo do 10.º Ano — Fase 3A: Física e Química A, componente de Química

- **Data:** 2026-11-15
- **Estado:** aprovado pelo utilizador ("podes avançar"). O utilizador deixou a construção ao meu critério; as escolhas abaixo marcadas **[decisão minha]** são minhas.
- **Depende de:** Fase 1 (motor, modelo de página, esquemas, PWA), Fase 2 (contas, motor adaptativo, geradores, Treino/Teste/progresso).

## 1. Intenção

A aluna estuda Física e Química A no 10.º ano. Em novembro a matéria corrente é, normalmente, a Química. Esta fase dá-lhe, para a componente de Química, o mesmo que já tem em Matemática A:
- páginas curtas com o essencial, esquemas que se mexem e resumos;
- exercícios **sempre diferentes**, gerados e verificados por código, com resolução passo a passo e erros típicos;
- Treino, Teste e O meu progresso a funcionar também para esta disciplina.

E acrescenta um pedido novo do utilizador, transversal a todas as disciplinas:
- **figuras legendadas com vista explodida**: ao tocar numa figura densa, as partes afastam-se umas das outras com as legendas, para ser fácil perceber o que é cada coisa (secção 6). Pouco usada em Química, muito em Biologia e Geologia; constrói-se agora como componente partilhado.

A componente de **Física** (energia e movimentos, fenómenos elétricos, fenómenos térmicos) fica para a Fase 3B, com spec própria. **[decisão minha]** Razão: entrega útil mais cedo, na matéria que a aluna está a dar.

## 2. Referencial curricular

- Em vigor: Aprendizagens Essenciais de FQ-A 10.º ano, agosto de 2018 (Despacho n.º 8476-A/2018).
- A DGE publicou uma versão revista datada de março de 2026 (`es_10_fisico-quimica_a.pdf`). Comparei as duas para a Química: os subtemas e os objetivos são quase idênticos (a revista acrescenta "reconhecer a importância química dos compostos de carbono…" e escreve "massa atómica relativa" em vez de "relativa média"). **[decisão minha]** O manual cobre a união das duas — serve qualquer que esteja em vigor na escola dela.

## 3. Âmbito

### Incluído
- Disciplina `fqa` passa a `disponivel: true`, com os 2 temas de Química e os subtemas da secção 4.
- Conteúdo por subtema no modelo da Fase 1 (essencial, resumo, mini-quiz de banco com 4–6 perguntas).
- Esquemas interativos da secção 5.
- Geradores de exercícios da secção 7 (≥ 3 por subtema), com verificação automática (§6.2 da spec da Fase 2) a passar 2000 sementes.
- Componente de figura explodida (secção 6) e pelo menos 3 figuras que o usam em Química.
- Dados químicos de referência num módulo único, com fonte (secção 8).
- Treino, Teste e progresso a aceitar FQ-A (hoje partem do princípio de que há só Matemática A em alguns textos e seletores — ver 9).

### Fora do âmbito
- Física (Fase 3B).
- Atividades laboratoriais como protocolos completos: o manual explica o que cada AL mede e porquê, com os cálculos (ex.: densidade relativa por picnometria, diluição), mas não substitui o caderno de laboratório.
- Modelação 3D real de moléculas (WebGL): a geometria usa a projeção 3D em SVG já existente (`esquemas/nucleo/proj3d.js`).

## 4. Conteúdos (temas e subtemas)

| Tema | Subtema (id) | Conteúdo (AE) |
|---|---|---|
| **Elementos químicos e sua organização** (`elementos`) | Constituição do átomo (`atomo`) | protão, neutrão, eletrão; número atómico Z e de massa A; isótopos; notação ${}^{A}_{Z}X$; escala atómica (nm, pm; microscopia de alta resolução, nanotecnologia) e comparação com outras estruturas |
| | Massa atómica e quantidade de matéria (`mole`) | unidade de massa atómica; massa atómica relativa (média ponderada pelas abundâncias isotópicas); massa molecular relativa; quantidade de matéria $n$, constante de Avogadro $N_A$, $N = n N_A$; massa molar, $m = nM$; medição: incerteza de leitura e algarismos significativos |
| | Espectros e energia dos eletrões (`espectros`) | espectro eletromagnético; energia do fotão $E = hf$, $c = \lambda f$; espectros de emissão e absorção (contínuos e de riscas); espectro do hidrogénio e transições entre níveis (séries de Lyman, Balmer, Paschen — visível = Balmer); espectroscopia atómica (estrelas, química forense); testes de chama |
| | Configuração eletrónica (`configuracao`) | modelo da nuvem eletrónica; níveis e subníveis; energias de remoção eletrónica; orbitais s, p, d como distribuições probabilísticas, orbitais degeneradas; Princípio da Construção, Exclusão de Pauli, maximização de eletrões desemparelhados; configurações até $Z = 23$ (notação spd e diagrama de caixas) |
| | Tabela Periódica (`tabela-periodica`) | contributo histórico (breve); organização em grupos e períodos a partir da configuração; blocos s, p, d; energia de ionização e raio atómico (elementos representativos) como propriedades periódicas; tendência para formar iões; baixa reatividade dos gases nobres; densidade relativa de metais por picnometria (AL) |
| **Propriedades e transformações da matéria** (`materia`) | Ligação química (`ligacao`) | estabilidade e forças de atração/repulsão núcleos‑eletrões; gráfico energia × distância internuclear (energia e comprimento de ligação); ligação covalente, iónica e metálica; modelo de Lewis e regra do octeto; ligações simples, duplas e triplas; parâmetros de ligação (energia e comprimento) para átomos dos mesmos elementos |
| | Geometria e polaridade das moléculas (`geometria`) | repulsão dos pares de eletrões de valência: linear, angular, triangular plana, piramidal trigonal, tetraédrica; polaridade das ligações e das moléculas simples; forças intermoleculares (Van der Waals: dispersão de London, dipolo‑dipolo, dipolo‑dipolo induzido) e ligações de hidrogénio; consequências (pontos de ebulição, solubilidade, sistemas biológicos) |
| | Compostos de carbono (`carbono`) | importância e variedade dos compostos de carbono; hidrocarbonetos saturados e insaturados (alcanos, alcenos, alcinos — nomes simples até C4); grupos funcionais: álcoois, aldeídos, cetonas, ácidos carboxílicos, aminas, em moléculas orgânicas, biomoléculas e fármacos |
| | Gases (`gases`) | lei de Avogadro; volume molar ($V_m = 22{,}4\ \mathrm{dm^3\,mol^{-1}}$ em PTN; depende só de $p$ e $T$); massa volúmica de gases $\rho = M / V_m$; fração molar; composição da troposfera, poluentes e gases com efeito de estufa |
| | Soluções e dispersões (`solucoes`) | soluções, coloides e suspensões; concentração em massa, concentração (molar), percentagem em massa e em volume, partes por milhão; diluição ($c_i V_i = c_f V_f$, fator de diluição); preparação de soluções a partir de soluto sólido e por diluição (material de laboratório) |
| | Energia nas reações químicas (`entalpia`) | reação como quebra e formação de ligações; processos exotérmicos e endotérmicos; variação de entalpia $\Delta H$ e o seu sinal; a pressão constante, $\Delta H$ = calor trocado; $\Delta H \approx \sum E_{\text{ligações quebradas}} - \sum E_{\text{ligações formadas}}$ |
| | Reações fotoquímicas e ozono (`fotoquimica`) | a luz como fonte de energia das reações fotoquímicas; fotodecomposição do cloreto de prata (AL); ozono na troposfera e na estratosfera; formação e decomposição do ozono estratosférico; radicais livres (eletrões desemparelhados) e CFC |

12 subtemas. Ordem dos subtemas = ordem da tabela. Cada subtema declara os objetivos AE (`ae`) que cobre; o validador confirma que todos os objetivos das AE de Química (lista em `conteudos/fqa/ae.js`, como em Matemática A) estão cobertos por algum subtema.

## 5. Esquemas interativos (Química)

Interface e regras da Fase 1 §7 (teclado, valores sempre também em texto, claro/escuro, 375 px, carregamento preguiçoso). Cálculos em módulos puros testáveis (`esquemas/fqa/calculo-quimica.js`), nunca no desenho.

| Esquema (id) | Subtema | O que a aluna faz |
|---|---|---|
| `fqa-atomo` | atomo | escolhe Z e A (ou um isótopo da lista) e vê o núcleo e os eletrões, com Z, N, A e a notação a atualizar |
| `fqa-isotopos` | mole | ajusta as abundâncias de 2–3 isótopos e vê a massa atómica relativa a mudar (cálculo da média ponderada escrito) |
| `fqa-espectro` | espectros | desliza o comprimento de onda no espectro eletromagnético e vê frequência e energia do fotão; vê as riscas do H e de outros elementos (emissão/absorção) |
| `fqa-niveis` | espectros | diagrama de níveis do H: escolhe a transição, vê a risca, a série e se é emissão ou absorção |
| `fqa-configuracao` | configuracao | escolhe o elemento (Z ≤ 23) e vê o preenchimento de caixas por ordem de energia, passo a passo, com a notação spd |
| `fqa-tabela` | tabela-periodica | tabela periódica (Z ≤ 36 desenhada; dados até onde a fonte tem) com mapa de cor para energia de ionização ou raio atómico; tocar num elemento mostra configuração, grupo, período, bloco, valores |
| `fqa-energia-distancia` | ligacao | curva energia potencial × distância internuclear (H₂, e mais 2 diatómicas): arrastar a distância mostra atração/repulsão e marca o mínimo (comprimento e energia de ligação) |
| `fqa-geometria` | geometria | escolhe a molécula (H₂O, NH₃, CH₄, CO₂, BF₃, HCl, …) e roda-a em 3D (proj3d); mostra pares não ligantes, ângulo, geometria e se é polar |
| `fqa-diluicao` | solucoes | escolhe volume a pipetar e volume final; vê o balão volumétrico a encher, a concentração final e o fator de diluição |
| `fqa-entalpia` | entalpia | diagrama de energia reagentes → produtos para uma reação escolhida, com as ligações quebradas e formadas somadas e $\Delta H$ |

## 6. Figura legendada com vista explodida (componente partilhado)

Pedido do utilizador: "se houver figuras para legendar, … ter uma vista explodida ou pressionar a imagem e 'explodi-la' de forma a ser mais fácil de interpretar … se a imagem for muito densa". Vale para todas as disciplinas, sobretudo Biologia e Geologia.

- **Componente** `esquemas/nucleo/figura.js`, registado como esquema `figura` (genérico, sem lógica de disciplina), usável em blocos `esquema` do conteúdo e no feedback de exercícios.
- **Dados da figura:** SVG desenhado em código ou ficheiro SVG próprio do projeto (sem imagens de terceiros), dividido em **partes**; cada parte tem `id`, `rotulo` (texto da legenda), `descricao` curta opcional e um **vetor de explosão** (para onde se afasta e quanto).
- **Estados:**
  1. **Montada** — a figura normal, com números discretos nas partes e uma legenda numerada por baixo (lida por leitores de ecrã).
  2. **Explodida** — ao tocar/clicar na figura ou no botão "Separar as partes", as partes afastam-se com animação curta (≤ 400 ms; sem animação se `prefers-reduced-motion`) e cada uma ganha a sua legenda ao lado, ligada por uma linha. "Juntar" volta ao estado montado.
  3. **Foco numa parte** — tocar numa parte (ou na sua legenda) destaca-a, esbate as outras e mostra a descrição; tocar fora ou Esc volta.
- **Ampliar:** botão "Ampliar" abre a figura em ecrã inteiro (diálogo modal acessível), com o mesmo comportamento, para figuras grandes no telemóvel.
- **Acessibilidade:** botões reais (teclado: Tab entre partes, Enter para focar, Esc para sair); cada parte tem `aria-label` com o rótulo; a lista de legendas é sempre texto; contraste em claro e escuro; funciona a 375 px sem scroll horizontal.
- **Modo exercício:** a mesma figura pode esconder os rótulos e pedir "Que estrutura é a parte 3?" (formato `escolha`), para um gerador de banco (§6.4 da spec da Fase 2). Em Química usa-se pouco; fica pronto para Biologia e Geologia.
- **Figuras de Química que o usam (mínimo 3):** constituição do átomo (núcleo, protões, neutrões, nuvem eletrónica); material de laboratório para preparar uma solução (balança, espátula, gobelé, funil, balão volumétrico, pipeta, pompete, esguicho); picnómetro e montagem da densidade relativa.

## 7. Geradores de exercícios (Química)

Contrato e verificação da spec da Fase 2 (§6.1, §6.2) sem alterações: semente → exercício; resolução com passo, porquê e cálculo; verificação por método independente; erros típicos com explicação; harness de 2000 sementes, KaTeX estrito. Mínimo **3 geradores por subtema (≥ 36)**, cada um com ≥ 2 formatos ou contextos. Exemplos de tipos (o plano fecha a lista):

| Subtema | Tipos de gerador (exemplos) |
|---|---|
| atomo | Z, N, A e eletrões de um átomo ou ião a partir da notação; identificar isótopos; ordens de grandeza (comparar tamanhos em nm/pm) |
| mole | massa atómica relativa a partir das abundâncias; $n$, $N$, $m$, $M$ (todas as direções); número de átomos numa amostra de composto; algarismos significativos e incerteza de leitura |
| espectros | $E = hf$ e $c = \lambda f$ (com notação científica); zona do espectro; transição no H (emissão/absorção, série, energia do fotão a partir dos níveis) |
| configuracao | configuração de átomos e iões simples até Z = 23; nº de eletrões de valência / desemparelhados / orbitais ocupadas; identificar configuração correta, impossível ou excitada |
| tabela-periodica | grupo, período e bloco a partir de Z; comparar energias de ionização e raios (com justificação); ião mais provável; densidade relativa a partir de massas do picnómetro |
| ligacao | tipo de ligação entre elementos; nº de pares ligantes/não ligantes numa estrutura de Lewis; ordem de ligação vs energia e comprimento |
| geometria | geometria e ângulo aproximado a partir da fórmula; molécula polar ou apolar; tipo de forças intermoleculares dominantes |
| carbono | saturado/insaturado; grupo funcional a partir da fórmula de estrutura; nome de alcanos/alcenos/alcinos simples |
| gases | volume ↔ quantidade em PTN; massa volúmica de um gás; fração molar numa mistura; comparar gases à mesma $p$ e $T$ |
| solucoes | concentração (molar e em massa); massa de soluto a pesar; diluição (volume a pipetar, fator); % (m/m), % (V/V), ppm |
| entalpia | $\Delta H$ a partir das energias de ligação; exo vs endo pelo sinal; energia libertada/absorvida para uma dada quantidade |
| fotoquimica | identificar radicais (eletrões desemparelhados); energia do fotão necessária para quebrar uma ligação (energia de ligação por molécula ↔ $\lambda$); equações de formação/decomposição do ozono |

Regras específicas da Química **[decisão minha]**:
- **Unidades e notação:** unidades SI com espaço fino ($6{,}02 \times 10^{23}\ \mathrm{mol^{-1}}$), vírgula decimal, notação científica com mantissa entre 1 e 10; resposta numérica com o número de algarismos significativos pedido no enunciado e tolerância coerente com esse arredondamento.
- **Fórmulas químicas** em KaTeX com `\mathrm{}` (sem dependência nova; não se usa mhchem). Índices e cargas corretos ($\mathrm{SO_4^{2-}}$).
- **Respostas numéricas** introduzidas como hoje (vírgula ou ponto). Se o valor for muito grande ou pequeno, o enunciado pede em notação científica e o campo aceita `6,02e23` e `6,02×10^23` além do valor completo. **[decisão minha]** (exige alargar `Manual.quiz.lerNumero`, com testes.)
- **Perguntas de raciocínio** (comparar EI, prever polaridade) em formato `escolha` ou `vf`, com cada opção errada = um erro típico real (ex.: "maior raio → maior EI").

## 8. Dados químicos de referência

- **Módulo único** `esquemas/fqa/dados-quimicos.js` com: símbolo, nome, Z, massa atómica relativa, configuração (Z ≤ 36), grupo, período, bloco, primeira energia de ionização, raio atómico; isótopos e abundâncias dos elementos usados nos exercícios; energias e comprimentos de ligação usados; constantes ($N_A$, $h$, $c$, $V_m$ em PTN, níveis do H $E_n = -2{,}18\times10^{-18}/n^2$ J).
- **Fonte:** os valores devem coincidir com os que a aluna vê nos testes e exames — a **Tabela Periódica e o formulário do IAVE** (Exame Nacional de Física e Química A, 715) para massas atómicas e constantes; para EI, raios, energias e comprimentos de ligação, uma fonte de referência citada no ficheiro (ex.: tabelas de manuais escolares portugueses ou CRC Handbook), com a fonte por linha ou por bloco. Nenhum valor sem fonte.
- **Testes:** os dados respeitam as tendências que o manual ensina (EI cresce no período e decresce no grupo para os representativos, com as exceções conhecidas assinaladas; raio no sentido inverso; ligação tripla mais forte e mais curta que dupla que simples para os mesmos elementos). Um teste falha se um valor contradiz uma regra ensinada sem estar marcado como exceção.

## 9. Alterações ao motor para mais de uma disciplina

- Validador: "≥ 3 geradores por subtema" passa a valer para todas as disciplinas disponíveis com geradores.
- Teste: hoje a configuração diz "Matemática A" e lista os seus temas — passa a escolher primeiro a disciplina (só as disponíveis), depois os temas.
- Treino: sugestão e escolha livre já percorrem o índice; confirmar com duas disciplinas, agrupando por disciplina na escolha livre.
- Progresso e Educandas: já agrupam por disciplina; confirmar com duas.
- Esquemas no feedback em Treino/Teste usam a disciplina de cada pergunta (hoje usam a da primeira — limitação conhecida da Fase 2D).
- Página inicial, símbolo da disciplina (ícone próprio de FQ-A já existe em `js/icones.js` — confirmar), pesquisa, resumos e cache offline incluem FQ-A.

## 10. Qualidade e testes

- Pacote da spec da Fase 2 §8 e Fase 1 §8, mais:
  - testes dos cálculos de Química (mole, massas, concentrações, diluição, $E=hf$, transições do H, $\Delta H$ por energias de ligação, configurações com Aufbau);
  - testes de dados (secção 8);
  - testes do componente de figura (estados, teclado, Esc, reduced motion) com o DOM falso de `tests/dom-minimo.js`;
  - harness de geradores (2000 sementes) a 0 erros para todos os geradores (Matemática A e Química);
  - verificação no browser: cada esquema e figura a 375 px, claro e escuro, sem erros na consola.
- Linguagem: PT-PT, "tu", nomenclatura IUPAC em português como nos manuais portugueses (ex.: "ligação de hidrogénio", "energia de ionização", "quantidade de matéria").

## 11. Decisões de construção (resposta à verificação do construtor) **[decisões minhas]**

1. **Lista de objetivos AE (`conteudos/fqa/ae.js`):** transcrição literal dos objetivos de Química das AE de 2018 (texto extraído do PDF oficial da DGE, guardado em `docs/referencias/ae-fqa-10-2018.txt`), mais, como entradas próprias marcadas `revisao2026: true`, as frases da versão de março de 2026 que não têm equivalente em 2018 (texto em `docs/referencias/ae-fqa-10-2026.txt`). Cada subtema declara em `ae` os índices/ids dessas entradas; o validador confere a cobertura por id, não por comparação de frases.
2. **Fontes de dados:** massas atómicas relativas e constantes — Tabela Periódica e formulário do IAVE (exame 715); primeira energia de ionização — NIST Atomic Spectra Database (domínio público), convertida para kJ/mol; raio atómico — um único conjunto citado no ficheiro (raios atómicos empíricos, Slater 1964, como nos manuais), só para os elementos representativos até Z = 36; energias e comprimentos de ligação — uma tabela de valores médios citada no ficheiro. Pode-se ir buscar os dados à web; o ficheiro guarda a fonte por bloco. Exceções às tendências assinaladas e testadas: EI de Be > B, N > O, Mg > Al, P > S (e as dos períodos seguintes equivalentes). Os enunciados dos geradores **dizem sempre os valores de que a aluna precisa** (como nos testes), por isso a fonte só tem de ser coerente, não igual à do manual dela.
3. **Respostas numéricas muito grandes ou pequenas:** o contrato do gerador ganha `toleranciaRelativa` (opcional, alternativa a `tolerancia`); a correção e o harness aceitam-na; os geradores de Matemática A não mudam. Para respostas com "x algarismos significativos", a tolerância é meia unidade do último algarismo pedido. Um valor certo com algarismos significativos a mais ou a menos conta como **certo** (os algarismos significativos treinam-se num gerador próprio de escolha múltipla).
4. **Formatos:** só `numerica`, `escolha` e `vf`, como em Matemática A. Configurações eletrónicas, estruturas de Lewis, nomes e equações escolhem-se entre opções (cada opção errada é um erro típico real). Não há resposta em texto livre nesta fase. O nível guiado continua a ser só apresentação dos passos (decisão da Fase 2D).
5. **Moléculas desenhadas:** novo esquema `fqa-molecula` que desenha em SVG fórmulas de estrutura e de Lewis a partir de um **catálogo** de ~25 moléculas com coordenadas 2D escritas à mão (átomos, ligações simples/duplas/triplas, pares não ligantes) — sem algoritmo de disposição. Usado no conteúdo e no `esquema` dos exercícios de ligação, geometria e compostos de carbono. Fórmulas químicas lineares continuam em KaTeX.
6. **Onde vivem as figuras explodidas:** o componente `esquemas/nucleo/figura.js` carrega-se no `index.html` com os outros ficheiros do núcleo e expõe `Manual.figura.criarEsquema(definicao)`. Cada figura é um ficheiro `esquemas/fqa/fig-<nome>.js` que regista um esquema normal (`Manual.esquemas.registar('fig-atomo', Manual.figura.criarEsquema({...}))`), por isso o carregador, a cache e o validador ("esquemas referidos existem") funcionam sem mudanças.
7. **Modo exercício da figura:** construído e testado nesta fase (`criarEsquema` aceita `modo: 'exercicio'` com uma parte destacada e rótulos escondidos), com um gerador de banco em `atomo` ("Que parte é a 2?") que o usa. Assim fica provado antes de Biologia e Geologia.
8. **Banco do mini-quiz:** 4–6 perguntas escritas por subtema (48–72), obrigatórias nos 12 subtemas antes de `disponivel: true`; validadas pelo validador de conteúdos (como as 135 de Matemática A), não pelo harness de sementes; as de escolha múltipla têm `errosTipicos` nas opções erradas quando o erro é identificável. O mini-quiz mistura-as com as geradas, como em Matemática A.
9. **Física ainda por fazer:** a página da disciplina mostra os 2 temas de Química e, por baixo, "Física — em breve" (sem ligação). FQ-A aparece no início, no Treino e no Teste como as outras disciplinas disponíveis.

## 12. Riscos e decisões

- **Exatidão química dos textos** (não só dos números): cada subtema é revisto contra as AE e contra a fonte de dados; a revisão por tarefa inclui uma leitura de conteúdo por um revisor com instruções de verificar factos.
- **Valores de dados divergentes entre fontes** (EI, raios): usa-se uma fonte por grandeza, citada; as perguntas comparam valores da mesma fonte.
- **Densidade das figuras explodidas no telemóvel:** o modo "Ampliar" resolve; nenhuma figura tem mais de ~10 partes.
- **AE revistas:** cobertura da união (secção 2); se a escola seguir a versão de 2026, nada falta.
