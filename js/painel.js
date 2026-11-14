globalThis.Manual = globalThis.Manual || {};

// Modelo da página «O meu progresso» e da vista do encarregado: lógica pura, sem DOM.
(function () {
  const Manual = globalThis.Manual;

  // Palavras que perdem o acento nos códigos de erro (os códigos são ASCII).
  const ACENTOS = {
    nao: 'não', divisao: 'divisão', razao: 'razão', subtracao: 'subtração', funcao: 'função',
    media: 'média', medias: 'médias', medio: 'médio', potencia: 'potência', tercos: 'terços', terco: 'terço',
    tres: 'três', angulo: 'ângulo', area: 'área', vertice: 'vértice', simetrico: 'simétrico',
    minimo: 'mínimo', maximo: 'máximo', numero: 'número', numerico: 'numérico', fracao: 'fração',
    capitalizacao: 'capitalização', dilatacao: 'dilatação', contracao: 'contração', reflexao: 'reflexão',
    translacao: 'translação', dispersao: 'dispersão', populacao: 'população', conveniencia: 'conveniência',
    frequencia: 'frequência', diametro: 'diâmetro', codigo: 'código', aleatoria: 'aleatória',
    continua: 'contínua', periodo: 'período', pe: 'pé', penultimo: 'penúltimo', ultimo: 'último',
    metodo: 'método', so: 'só', mes: 'mês', modulo: 'módulo', regiao: 'região', direcao: 'direção',
    condicao: 'condição', condicoes: 'condições', posicao: 'posição', operacoes: 'operações',
    dominio: 'domínio', contradominio: 'contradomínio', escalao: 'escalão', retencao: 'retenção',
    impares: 'ímpares', diferenca: 'diferença', forca: 'força', voluntaria: 'voluntária',
    dimensao: 'dimensão', coincidencia: 'coincidência', divergencia: 'divergência', parenteses: 'parênteses',
    variavel: 'variável', unico: 'único', unica: 'única', quociente: 'quociente', ate: 'até',
    pares: 'pares', algebrica: 'algébrica', calculo: 'cálculo', hipotenusa: 'hipotenusa',
    indice: 'índice', proporcao: 'proporção', ordenacao: 'ordenação', solucao: 'solução',
    solucoes: 'soluções', quadratica: 'quadrática', quadratico: 'quadrático', raizes: 'raízes',
    perimetro: 'perímetro', distancia: 'distância', contrario: 'contrário', previsao: 'previsão',
    variaveis: 'variáveis', proprio: 'próprio', frequencias: 'frequências', irs: 'IRS', ss: 'SS',
    ab: 'AB', ag: 'AG', am: 'AM', og: 'OG', oh: 'OH', ox: 'Ox', oy: 'Oy',
  };

  // Textos escritos à mão: códigos partilhados por vários temas e os que não se leem bem sozinhos.
  const EXCECOES = {
    a_ao_quadrado: 'Multiplicou o desvio padrão por a ao quadrado',
    ag_como_metade: 'Tomou AG como metade da mediana',
    ag_como_terco: 'Tomou AG como um terço da mediana',
    alargada_como_amostra: 'Tomou a população alargada como se fosse a amostra',
    aleatoria_vista_como_enviesada: 'Julgou enviesada uma amostra aleatória',
    alinhado_como_perfeito: 'Tomou pontos quase alinhados como correlação perfeita',
    amostra_como_populacao: 'Tomou a amostra como se fosse a população',
    amostra_como_variavel: 'Tomou a amostra como se fosse a variável',
    amplitude_total: 'Deu a amplitude em vez da amplitude interquartil',
    aplicou_b_antes: 'Somou a constante antes de multiplicar',
    aplicou_dois_tercos: 'Multiplicou AG por 2/3 em vez de dividir por 2/3',
    aplicou_na_abcissa: 'Aplicou o fator à abcissa',
    aplicou_na_ordenada: 'Aplicou o fator à ordenada',
    arredondou_e_somou_um: 'Arredondou e somou um a mais',
    arredondou_p_para_baixo: 'Arredondou a posição p para baixo',
    assumiu_coincidencia: 'Assumiu que os dois métodos dão o mesmo vencedor',
    assumiu_divergencia: 'Assumiu que os dois métodos dão vencedores diferentes',
    baricentro: 'Deu o baricentro em vez do circuncentro',
    calculou_gm: 'Calculou GM em vez da mediana',
    calculou_h: 'Parou no ortocentro H',
    calculou_imagem: 'Calculou a imagem em vez do objeto',
    calculou_oh: 'Calculou todo o segmento OH em vez de GH',
    catorze_meses: 'Contou 14 meses de trabalho',
    causalidade: 'Concluiu que x causa y',
    centro_no_ponto: 'Tomou o ponto da circunferência como centro',
    centro_sinais_trocados: 'Trocou os sinais do centro',
    circuncentro: 'Deu o circuncentro em vez do ponto pedido',
    classe_da_mediana: 'Deu a classe da mediana em vez da classe modal',
    classe_do_valor_mais_frequente: 'Deu a classe do valor mais repetido em vez da classe modal',
    codigo_numerico_como_quantitativa: 'Tomou um código numérico por variável quantitativa',
    comparou_distancia_com_r2: 'Comparou a distância com r² em vez de r',
    concavidade_trocada: 'Trocou o sentido da concavidade',
    conjunto_de_chegada: 'Deu o conjunto de chegada em vez do pedido',
    contagem_como_categoria: 'Tomou a contagem por categoria',
    contagem_em_vez_de_percentagem: 'Deu a contagem em vez da percentagem',
    continua_como_discreta: 'Tomou uma variável contínua por discreta',
    continua_como_qualitativa: 'Tomou uma variável contínua por qualitativa',
    contou_o_complementar: 'Contou o contrário do pedido',
    contou_valores: 'Contou os valores diferentes em vez das observações',
    conveniencia: 'Julgou aleatória uma amostra por conveniência',
    cruzou_mal: 'Multiplicou em cruz os termos errados',
    declive_como_r: 'Tomou o declive por coeficiente de correlação',
    declive_e_termo_trocados: 'Trocou o declive com a ordenada na origem',
    declive_invertido: 'Dividiu u₁ por u₂ em vez de u₂ por u₁',
    delta_sem_sinal: 'Esqueceu o sinal de menos em Δ/4a',
    desvio_medio: 'Calculou o desvio médio em vez do desvio padrão',
    deu_o_contradominio: 'Deu o contradomínio em vez do domínio',
    deu_o_dominio: 'Deu o domínio em vez do contradomínio',
    deu_o_juro: 'Deu o juro em vez do capital',
    deu_o_restante: 'Deu o que sobra depois do desconto',
    devolveu_a_soma: 'Somou as coordenadas de M e de A',
    diametro_como_raio: 'Tomou o diâmetro por raio',
    diferenca_das_normas: 'Fez a diferença das normas em vez da norma da diferença',
    diferenca_desfasada: 'Atribuiu cada diferença à classe errada',
    dilatacao_contracao_trocadas: 'Trocou a dilatação com a contração',
    dimensao_como_variavel: 'Tomou a dimensão da amostra por variável',
    direcao_trocada: 'Aplicou o efeito na direção errada',
    discreta_como_continua: 'Tomou uma variável discreta por contínua',
    discreta_como_qualitativa: 'Tomou uma variável discreta por qualitativa',
    distancia_do_baricentro: 'Deu a distância do baricentro ao lado',
    dividiu_a_ordenada: 'Dividiu a ordenada pelo fator',
    dividiu_antes: 'Dividiu antes de isolar o termo em x',
    dividiu_ao_contrario: 'Dividiu pela ordem trocada',
    dividiu_k_menos_1: 'Dividiu por k − 1 em vez de por k',
    dividiu_n_menos_1: 'Dividiu a soma por n − 1 para obter a média',
    dividiu_por_2: 'Dividiu por 2 onde não devia',
    dividiu_por_n: 'Dividiu por n em vez de por n − 1',
    dividiu_so_a_raiz: 'Dividiu só a raiz, e não o resto',
    dividiu_so_por_a: 'Dividiu por a em vez de por 2a',
    divisores_hondt: 'Usou os divisores do método de Hondt',
    divisores_impares: 'Usou os divisores do método de Sainte-Laguë',
    dois_tercos: 'Deu dois terços da mediana em vez de um terço',
    dois_tercos_dos_votos: 'Exigiu dois terços dos votos',
    eixo_reflexao_trocado: 'Trocou o eixo da reflexão',
    escalao_errado: 'Usou a taxa de outro escalão',
    esqueceu_2_no_denominador: 'Esqueceu o 2 no denominador',
    esqueceu_a: 'Esqueceu de multiplicar pelo fator',
    esqueceu_altura_inicial: 'Esqueceu a altura inicial',
    esqueceu_cota: 'Ignorou a cota (z)',
    esqueceu_dividir: 'Esqueceu de dividir',
    esqueceu_dividir_por_3: 'Esqueceu de dividir por 3',
    esqueceu_dobro: 'Esqueceu de multiplicar por 2',
    esqueceu_mais_um: 'Esqueceu de somar 1 à metade',
    esqueceu_o_ponto: 'Esqueceu de somar o ponto',
    esqueceu_partido_menor: 'Esqueceu os quocientes do partido menos votado',
    esqueceu_raiz: 'Esqueceu a raiz quadrada',
    esqueceu_ss: 'Esqueceu o desconto para a Segurança Social',
    esqueceu_ultimo_escalao: 'Esqueceu o último escalão',
    esqueceu_um_candidato: 'Esqueceu os votos de um candidato',
    esqueceu_valor_base: 'Esqueceu o valor base',
    excluiu_extremo: 'Excluiu o extremo em «no máximo»',
    expoente_em_anos: 'Pôs o número de anos no expoente, em vez do de períodos',
    extremos_errados: 'Errou se os zeros pertencem ao conjunto',
    fator_na_ordenada: 'Aplicou o fator às ordenadas',
    fator_so_na_primeira: 'Aplicou o fator só à primeira coordenada',
    forca_sobrestimada: 'Exagerou a força da relação',
    forca_subestimada: 'Subestimou a força da relação',
    fraca_como_nula: 'Tomou uma correlação fraca por nula',
    fronteira_estrita: 'Errou se a fronteira pertence à região',
    g_ponto_medio: 'Tomou G como ponto médio de OH',
    g_ponto_medio_oh: 'Tomou G como ponto médio de OH',
    h_igual_3g: 'Usou H = 3G fora da origem',
    hipotenusa_como_raio: 'Tomou a hipotenusa por raio',
    ignorou_a: 'Ignorou o número dentro do módulo',
    incluiu_extremo: 'Incluiu o extremo em «menos de»',
    incluiu_quociente_seguinte: 'Incluiu um quociente a mais',
    intervalo_entre_extremos: 'Deu o intervalo entre os extremos em vez do conjunto finito',
    inverso_composto: 'Usou juro composto num caso de juro simples',
    inverso_juro_simples: 'Usou juro simples num caso de juro composto',
    inverteu_razao: 'Inverteu a razão',
    irs_depois_ss: 'Aplicou o IRS depois de descontar a Segurança Social',
    juro_composto: 'Usou juro composto em vez de juro simples',
    juro_de_um_ano: 'Deu o juro de um só ano',
    juro_simples: 'Usou juro simples em vez de juro composto',
    lambda_no_ponto: 'Multiplicou λ pelo ponto em vez de pelo vetor',
    leu_acumulada: 'Leu a frequência acumulada em vez da absoluta',
    limites_em_vez_de_partes: 'Aplicou cada taxa ao limite do escalão',
    maior_media_maior_dispersao: 'Julgou que a maior média tem maior dispersão',
    maior_partido: 'Deu o último mandato ao partido mais votado',
    mais_votos_nao_chega: 'Julgou que ter mais votos dá maioria absoluta',
    maioria_simples: 'Confundiu maioria simples com maioria absoluta',
    media_dos_extremos: 'Fez a média dos extremos',
    media_em_vez_de_mediana: 'Deu a média em vez da mediana',
    media_varia_diferenca: 'Esqueceu que a diferença se reparte por todos os valores',
    mediana_afetada: 'Julgou que a mediana varia com o valor corrigido',
    medias_diferentes_nao_comparam: 'Julgou que médias diferentes impedem a comparação',
    mediatriz_horizontal: 'Escolheu a mediatriz horizontal',
    mediatriz_vertical: 'Escolheu a mediatriz vertical',
    meia_volta: 'Trocou o sinal das duas coordenadas, como numa meia-volta',
    menos_dentro_do_quadrado: 'Pôs o sinal de menos dentro do quadrado',
    menos_pontos: 'Deu a vitória a quem tem menos pontos',
    metade_cateto: 'Dividiu um cateto por 2 em vez da hipotenusa',
    metade_nao_chega: 'Julgou que metade dos votos dá maioria absoluta',
    metodo_das_metades: 'Calculou o quartil pelo método das metades',
    monotonia_pelo_b: 'Deduziu a monotonia a partir de b',
    mudou_as_duas: 'Trocou o sinal das duas coordenadas',
    multiplicou: 'Multiplicou em vez de dividir',
    nao_alterou: 'Esqueceu que o desvio padrão também é multiplicado',
    nao_dividiu: 'Não fez a divisão final',
    nao_dividiu_por_2: 'Não dividiu por 2',
    nao_isolou_o_modulo: 'Não isolou o módulo',
    nao_passou_para_zero: 'Não passou tudo para o primeiro membro',
    nao_rejeitou_negativa: 'Não rejeitou a solução negativa',
    nao_verificou_condicao: 'Não verificou a condição do ramo',
    nao_viu_absoluta: 'Disse maioria simples quando havia maioria absoluta',
    o_proprio_eixo: 'Deu o próprio eixo em vez da paralela por P',
    ordem_das_operacoes: 'Fez a soma antes da multiplicação',
    ordenada_como_declive: 'Tomou a ordenada na origem por declive',
    ordenada_como_fronteira: 'Tomou a ordenada na origem por fronteira',
    ordenada_como_previsao: 'Deu a ordenada na origem como valor previsto',
    ordenada_do_ponto: 'Tomou a ordenada de A por ordenada na origem',
    ordenada_igual_a_c: 'Tomou c por ordenada do vértice',
    outro_angulo_reto_errado: 'Escolheu um vértice que não tem o ângulo reto',
    outro_eixo: 'Deu o plano perpendicular ao outro eixo',
    p_inteiro_sem_media: 'Esqueceu a média quando p é inteiro',
    par_so_um_valor: 'Usou só um valor quando há dois ao meio',
    parou_um_antes: 'Parou um quociente antes',
    pe_da_altura: 'Deu o pé da altura em vez do ortocentro',
    penultimo_mandato: 'Deu o penúltimo mandato em vez do último',
    perdeu_zero_nulo: 'Perdeu a solução x = 0',
    periodo_a_menos: 'Contou um período a menos',
    plano_coordenado: 'Deu o plano coordenado em vez do plano por P',
    pontos_como_vetores: 'Usou as coordenadas dos pontos como se fossem vetores',
    pontos_desde_zero: 'Deu pontos a partir de 0 em vez de a partir de 1',
    posicao_como_valor: 'Deu a posição em vez do valor',
    proporcional_restos_maiores: 'Usou o método dos restos maiores',
    quadrado_de_negativo: 'Errou o sinal ao elevar um número negativo ao quadrado',
    quadrado_negativo: 'Errou o sinal ao elevar um número negativo ao quadrado',
    quadrado_sem_parenteses: 'Esqueceu os parênteses no quadrado',
    quadrou_coeficiente: 'Elevou também o coeficiente ao quadrado',
    quociente_de_um_ponto: 'Dividiu a ordenada pela abcissa de um só ponto',
    quociente_menor: 'Deu o mandato a um quociente menor',
    raio_circunscrito: 'Deu o raio da circunferência circunscrita',
    raio_e_o_segundo_membro: 'Tomou o segundo membro, r², por raio',
    raio_inscrito: 'Deu o raio da circunferência inscrita',
    raio_no_segundo_membro: 'Escreveu o raio, e não o seu quadrado, no segundo membro',
    raiz_dupla_contada_duas_vezes: 'Contou a raiz dupla duas vezes',
    ramo_errado: 'Usou o ramo errado da função',
    razao_invertida: 'Inverteu a razão',
    refletiu_a_translacao: 'Refletiu também a translação',
    refletiu_em_ox: 'Refletiu no eixo Ox',
    refletiu_em_oy: 'Refletiu no eixo Oy',
    relativa_acumulada: 'Deu a frequência relativa acumulada',
    resolveu_para_x: 'Resolveu para x em vez de y',
    resposta_voluntaria: 'Julgou aleatória uma amostra de resposta voluntária',
    reta_ab: 'Deu a reta AB em vez da mediatriz',
    reta_duas_condicoes: 'Deu uma reta em vez de um plano',
    reta_paralela_ao_eixo: 'Deu a reta paralela ao eixo em vez do plano',
    rodou_90: 'Rodou 90° em vez de dar meia-volta',
    segundo_com_absoluta: 'Deu maioria absoluta ao segundo mais votado',
    segundo_com_simples: 'Deu maioria simples ao segundo mais votado',
    sem_raiz: 'Esqueceu a raiz quadrada',
    sem_subtrair_minimo: 'Esqueceu de subtrair o mínimo',
    sentido_horizontal_trocado: 'Deslocou o gráfico para o lado errado',
    simetrico_de_o: 'Pôs G a meio de OH',
    sinal_da_razao: 'Perdeu o sinal da razão',
    sinal_de_4ac: 'Errou o sinal de 4ac',
    sinal_de_h: 'Errou o sinal de h',
    sinal_de_k: 'Errou o sinal de k',
    sinal_de_lambda: 'Errou o sinal de λ',
    sinal_negativo_no_raio: 'Errou o sinal ao subtrair um número negativo no raio',
    sinal_no_zero_do_1_ramo: 'Errou o sinal do zero do 1.º ramo',
    sinal_no_zero_do_2_ramo: 'Errou o sinal do zero do 2.º ramo',
    sinal_produto: 'Errou o sinal do produto de dois números negativos',
    sinal_trocado: 'Não trocou o sinal ao passar para o outro membro',
    so_a_segunda_coordenada: 'Tomou a segunda coordenada do vetor por declive',
    so_descontos: 'Deu o total dos descontos em vez do líquido',
    so_horas_semana: 'Dividiu pelas horas de uma só semana',
    so_o_maximo: 'Deu só o máximo em vez da amplitude',
    so_o_valor: 'Contou só as observações desse valor',
    so_primeiros_lugares: 'Contou só os primeiros lugares',
    so_raiz_positiva: 'Ficou só com a raiz positiva',
    so_um_lado: 'Ficou só com um dos lados',
    so_um_mes: 'Deu o desconto de um só mês',
    so_uma_solucao: 'Deu só uma das soluções',
    soma_catetos: 'Somou os catetos em vez de aplicar o teorema de Pitágoras',
    soma_componentes: 'Somou as componentes em vez de usar o teorema de Pitágoras',
    soma_das_normas: 'Somou as normas em vez de calcular a norma da soma',
    somou_antes_de_multiplicar: 'Somou antes de multiplicar',
    somou_b: 'Somou a constante ao desvio padrão',
    somou_cota_a_diagonal: 'Somou a cota à diagonal da base',
    somou_dois: 'Somou um voto a mais do que o necessário',
    somou_lambda: 'Somou λ a cada coordenada',
    somou_termo_quadratico: 'Somou o termo −5t² em vez de o subtrair',
    ss_depois_irs: 'Aplicou a Segurança Social depois do IRS',
    subtraiu_ao_contrario: 'Fez a subtração pela ordem trocada',
    subtraiu_coordenadas: 'Subtraiu as coordenadas em vez de as somar',
    subtraiu_percentagem: 'Retirou a percentagem ao montante em vez de dividir',
    subtraiu_quadrados: 'Subtraiu os quadrados em vez de os somar',
    subtraiu_taxa: 'Multiplicou por 1 − taxa em vez de dividir por 1 + taxa',
    taxa_1_1: 'Escreveu 11 % como 0,011',
    taxa_anual_por_periodo: 'Usou a taxa anual em vez da taxa de cada período',
    taxa_da_entidade: 'Usou a taxa paga pela entidade patronal',
    taxa_unica_ultimo_escalao: 'Aplicou a taxa do último escalão a todo o rendimento',
    todos_os_reais: 'Deu ℝ em vez do contradomínio',
    tres_meios: 'Multiplicou por 3/2 em vez de 2/3',
    triplicou_a_partir_de_g: 'Somou 3 vezes OG a partir de G',
    trocou_as_condicoes: 'Trocou as condições dos dois ramos',
    trocou_q1_q3: 'Trocou Q1 com Q3',
    ultimo_menos_primeiro: 'Subtraiu o último valor ao primeiro',
    um_por_partido: 'Deu primeiro um mandato a cada partido',
    um_sexto: 'Deu um sexto da mediana em vez de um terço',
    usou_c: 'Usou o termo independente c em vez da ordenada do vértice',
    usou_h: 'Usou a abcissa do vértice em vez da ordenada',
    usou_o_ponto: 'Dividiu as coordenadas do ponto em vez das do vetor diretor',
    vertice_angulo_reto: 'Deu o vértice do ângulo reto em vez do ponto pedido',
    vetor_como_ponto: 'Tomou as coordenadas do vetor por coordenadas do ponto',
    vetor_menos_ponto: 'Errou o sinal ao passar o ponto para o outro membro',
    votos_dos_outros: 'Contou os votos de todos os adversários',
    votos_novos: 'Contou votos novos que não existem',
    zero_com_sinal_trocado: 'Trocou o sinal do zero',
    zeros_com_sinal_trocado: 'Trocou o sinal dos zeros',
    ambos_os_sentidos_trocados: 'Trocou ambos os sentidos',
    angulo_reto_errado: 'Errou o ângulo reto',
    coeficiente_trocado: 'Multiplicou x pelo coeficiente errado',
    coordenada_errada: 'Usou a coordenada errada',
    coordenadas_trocadas: 'Trocou as coordenadas',
    esqueceu_b: 'Esqueceu o termo b',
    esqueceu_multiplicar_por_x: 'Esqueceu de multiplicar por x',
    esqueceu_quadrado: 'Esqueceu o quadrado',
    esqueceu_somar_a: 'Esqueceu de somar a',
    esqueceu_somar_quadrados: 'Esqueceu de somar os quadrados',
    esqueceu_subtrair: 'Esqueceu de subtrair',
    esqueceu_reflexao: 'Esqueceu a reflexão',
    esqueceu_retencao: 'Esqueceu a retenção',
    extremo_errado: 'Errou o extremo',
    frequencia_absoluta: 'Deu a frequência absoluta em vez da relativa',
    mediana_em_vez_de_media: 'Deu a mediana em vez da média',
    mediana_em_vez_de_quartil: 'Deu a mediana em vez do quartil',
    menos_so_no_x: 'Pôs o sinal de menos só no x',
    nao_ordenou: 'Não ordenou os dados',
    percentagem_como_euros: 'Tomou a percentagem por euros',
    percentagem_sem_dividir: 'Não dividiu a percentagem por 100',
    populacao_alargada: 'Escolheu a população alargada',
    populacao_como_amostra: 'Tomou a população por amostra',
    populacao_como_variavel: 'Tomou a população por variável',
    variavel_como_amostra: 'Tomou a variável por amostra',
    variavel_como_populacao: 'Tomou a variável por população',
    qualitativa_como_quantitativa: 'Tomou uma variável qualitativa por quantitativa',
    quadrado_da_soma: 'Fez o quadrado da soma em vez da soma dos quadrados',
    quatro_semanas: 'Contou 4 semanas por mês',
    doze_meses: 'Contou só 12 salários',
    sinais_trocados: 'Trocou os sinais',
    sinal_ao_isolar: 'Errou o sinal ao isolar',
    sinal_de_a_trocado: 'Trocou o sinal de a',
    sinal_do_declive: 'Errou o sinal do declive',
    sinal_do_declive_trocado: 'Trocou o sinal do declive',
    sinal_negativo: 'Esqueceu o sinal negativo',
    somou_coordenadas: 'Somou as coordenadas',
    subtracao_trocada: 'Fez a subtração pela ordem trocada',
    trocou_coordenadas: 'Trocou as coordenadas',
    trocou_eixos: 'Trocou os eixos',
    trocou_h_k: 'Trocou h com k',
    trocou_m_b: 'Trocou m com b',
    trocou_media_mediana: 'Trocou a média com a mediana',
    trocou_o_eixo: 'Trocou o eixo',
    trocou_o_sentido: 'Trocou o sentido',
    trocou_sinal: 'Trocou o sinal',
    trocou_variaveis: 'Trocou as variáveis',
    so_juro: 'Deu só o juro',
    so_trocou_abcissa: 'Trocou só a abcissa',
    so_trocou_ordenada: 'Trocou só a ordenada',
    so_ultimo_escalao: 'Usou só o último escalão',
    so_uma_coordenada: 'Alterou só uma coordenada',
    dobro_em_vez_de_quadrado: 'Calculou o quadrado como o dobro',
    sinal_de_m_esquecido: 'Esqueceu o sinal de m',
    sinal_de_x_esquecido: 'Esqueceu o sinal de x',
    ignorou_fator: 'Ignorou o fator',
    ignorou_sinais: 'Ignorou os sinais',
    ignorou_sinal_mais: 'Ignorou o sinal de mais',
    fator_invertido: 'Inverteu o fator',
    fator_nao_invertido: 'Não inverteu o fator',
    nao_trocou_sinal: 'Não trocou o sinal',
    multiplicou_abcissa: 'Multiplicou a abcissa',
    metade_do_raio_inscrito: 'Deu metade do raio inscrito',
    ponto_medio_og: 'Deu o ponto médio de OG',
    ponto_medio_de_am: 'Deu o ponto médio de AM',
    ponto_medio_cateto: 'Deu o ponto médio de um cateto',
    ponto_medio_lado: 'Deu o ponto médio de um lado',
    ponto_medio_mediana: 'Deu o ponto médio da mediana',
    ponto_medio_outro_cateto: 'Deu o ponto médio do outro cateto',
    oh_como_og: 'Tomou OH como OG',
    lado_trocado: 'Escolheu o lado errado do zero',
    regiao_trocada: 'Trocou a região do conjunto-solução',
    letra_do_plano: 'Escolheu a letra errada na equação do plano',
  };

  function humanizarErro(codigo) {
    const c = String(codigo == null ? '' : codigo);
    if (Object.prototype.hasOwnProperty.call(EXCECOES, c)) return EXCECOES[c];
    const palavras = c.split('_').filter(Boolean).map(function (p) {
      return Object.prototype.hasOwnProperty.call(ACENTOS, p) ? ACENTOS[p] : p;
    });
    const texto = palavras.join(' ');
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  const ROTULOS = {
    domina: { texto: 'Domina', classe: 'estado-domina' },
    dificuldade: { texto: 'Com dificuldade', classe: 'estado-dificuldade' },
    nao_resolvido: { texto: 'Não conseguiu resolver', classe: 'estado-nao-resolvido' },
  };
  const SEM = { texto: 'Sem tentativas', classe: 'estado-sem' };

  function rotuloEstado(estado) {
    const r = ROTULOS[estado] || SEM;
    return { texto: r.texto, classe: r.classe };
  }

  // Segunda-feira (AAAA-MM-DD) da semana do dia dado; aritmética de calendário sobre a data, sem hora local.
  function segundaDe(dia) {
    const p = dia.split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    const desde = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - desde);
    return d.toISOString().slice(0, 10);
  }

  function somarDias(dia, n) {
    const p = dia.split('-').map(Number);
    const d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.toISOString().slice(0, 10);
  }

  function evolucao(tentativas, agora) {
    const atual = segundaDe(Manual.aprendizagem.diaLisboa(agora.toISOString()));
    const semanas = [-21, -14, -7, 0].map(function (n) { return { semana: somarDias(atual, n), tentativas: 0, certas: 0 }; });
    const porSemana = {};
    semanas.forEach(function (s) { porSemana[s.semana] = s; });
    tentativas.forEach(function (t) {
      const dia = Manual.aprendizagem.diaLisboa(t && t.criado_em);
      const s = dia && porSemana[segundaDe(dia)];
      if (!s) return;
      s.tentativas += 1;
      if (t.resultado === 'certa') s.certas += 1;
    });
    return semanas;
  }

  function erros(tentativas) {
    return Manual.aprendizagem.agregarErros(tentativas, 30).slice(0, 5).map(function (e) {
      let recente = null;
      tentativas.forEach(function (t) {
        if (t && t.erro_tipico === e.codigo && Number.isFinite(Date.parse(t.criado_em))
          && (!recente || Date.parse(t.criado_em) >= Date.parse(recente.criado_em))) recente = t;
      });
      const def = recente && Manual.geradores && Manual.geradores.obter(recente.tipo);
      return { codigo: e.codigo, texto: humanizarErro(e.codigo), onde: def && def.nome ? def.nome : '', contagem: e.contagem };
    });
  }

  function modelo(tentativas, estados, indice, agora) {
    const ts = Array.isArray(tentativas) ? tentativas : [];
    const es = Array.isArray(estados) ? estados : [];
    const porChave = {};
    es.forEach(function (e) { if (e && e.chave) porChave[e.chave] = e; });
    const contagens = { domina: 0, dificuldade: 0, nao_resolvido: 0, sem: 0 };
    const disciplinas = (Array.isArray(indice) ? indice : []).filter(function (d) { return d && d.disponivel; }).map(function (d) {
      return {
        id: d.id, nome: d.nome,
        temas: (d.temas || []).map(function (t) {
          return {
            id: t.id, titulo: t.titulo,
            subtemas: (t.subtemas || []).map(function (s) {
              const chave = d.id + '/' + t.id + '/' + s.id;
              const e = porChave[chave];
              const estado = e && ROTULOS[e.estado] ? e.estado : null;
              contagens[estado || 'sem'] += 1;
              return { chave: chave, titulo: s.titulo, estado: estado, proxima_revisao: estado && e.proxima_revisao ? e.proxima_revisao : null };
            }),
          };
        }),
      };
    });
    let ultima = null;
    ts.forEach(function (t) {
      const ms = Date.parse(t && t.criado_em);
      if (Number.isFinite(ms) && (ultima === null || ms > Date.parse(ultima))) ultima = t.criado_em;
    });
    return {
      disciplinas: disciplinas,
      contagens: contagens,
      erros: erros(ts),
      evolucao: evolucao(ts, agora),
      sugestoes: Manual.treino.sugestao(es, indice, agora),
      ultimaAtividade: ultima,
    };
  }

  Manual.painel = { humanizarErro: humanizarErro, modelo: modelo, rotuloEstado: rotuloEstado, EXCECOES: EXCECOES, ACENTOS: ACENTOS };
})();
