# Fase 3C — Lacunas face aos manuais (desenho curto)

## Porquê
O encarregado de educação comparou os índices dos manuais da educanda (Matemática A, Raiz Editora; Física e Química A) com o site. Quase tudo está coberto, mas faltam alguns temas que a aluna vai encontrar nas aulas. Também pediu que os alunos vejam como se escrevem as respostas numéricas.

## Objetivos
1. **Matemática A**
   - **Partilha.** Nas AE oficiais (DGE, 2023, «Modelos matemáticos na partilha»), a partilha corresponde a Hondt e St. Laguë, que o site já tem. Falta a parte não eleitoral, por exemplo «distribuição de um número de computadores por departamentos com diferentes dimensões». Fica como secção nova no subtema `hondt-stlague`, mais um gerador com contextos não eleitorais (computadores, vagas, bolsas).
   - **Condições f(x) = k, f(x) < k, f(x) > k, f(x) ≤ k, f(x) ≥ k pelo gráfico.** Estão no manual (2.5), mas as AE não as nomeiam. Fica como secção nova em `generalidades`, com um esquema interativo (reta y = k a cortar o gráfico e intervalos realçados) e um gerador de escolha (ler o conjunto-solução num gráfico).
2. **FQ-A**
   - **Modelo de Bohr**, no subtema `espectros`: postulados, órbitas e quantização, absorção e emissão como transições, estado fundamental e estados excitados, desexcitação, ionização (n = ∞), e o que excita um átomo (aquecimento, colisões, descargas elétricas, radiação). Leva uma **figura com vista explodida** (núcleo; níveis n = 1, 2, 3, 4, ∞; setas de absorção e de emissão; legendas) e um gerador (absorção/emissão, fundamental/excitado, sobe/desce de nível).
   - **Corrente contínua e corrente alternada**, no subtema `circuitos`: o que as distingue, gráfico I(t) de cada uma, exemplos (pilha; tomada de 230 V e 50 Hz) e um item.
   - **Coletor solar**, no subtema `transferencias`: placa absorvente escura, vidro, tubos com fluido e isolamento; os mecanismos (radiação, condução, convecção) e o rendimento. Leva **figura com vista explodida** e um gerador.
   - **AL 1.1 — volume e número de moléculas de uma gota de água**, no subtema `mole`: procedimento (contar N gotas numa proveta ou pesar), cálculo do volume de uma gota, da massa, da quantidade de matéria e do número de moléculas, e incerteza. Leva um gerador numérico.
3. **Ajuda de formato.** Por baixo de cada campo de resposta numérica, em Treino, Teste e mini-quiz, aparece sempre uma linha curta: «Escreve só o número (com vírgula ou ponto). Notação científica: 6,02e23 · 6,02*10^23 · 6,02×10²³». O texto exato fica a cargo do construtor, mas tem de mostrar as três formas que `Manual.quiz.lerNumero` aceita.

## Fora de âmbito
Calculadora (Fase 3D). Novas atividades laboratoriais além da AL 1.1. Mudar o validador ou as AE já gravadas, a não ser para acrescentar a frase da partilha não eleitoral, se faltar.

## Restrições
São as mesmas das Fases 3A e 3B:
- PT-PT, «tu»;
- sem dependências nem CDN; `index.html` e `lista-cache.js` atualizados;
- valores físicos e químicos só dos módulos de dados, com fonte;
- regras de autoria dos geradores 1–16;
- figuras com vista explodida (`Manual.figura.criarEsquema`), testadas a 375 px nos temas claro e escuro;
- `npm run validar`, `npm test` e `npm run verificar` verdes.

## Abordagens
1. **Uma fase pequena com o método de sempre** (plano por tarefas, subagentes, revisão por tarefa, revisão final). Escolhida, porque mantém a qualidade das fases anteriores.
2. Pôr estes temas dentro da Fase 3D da calculadora. Rejeitada, porque mistura riscos e atrasa o conteúdo.

## Fica para o construtor
A divisão em tarefas, os nomes dos ficheiros novos, os ids dos geradores e o desenho exato das figuras.
