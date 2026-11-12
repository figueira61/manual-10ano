-- Testes de acesso (RLS) e funções da migração 0001.
-- Corre tudo numa transação revertida no fim: não deixa dados.
-- Cada asserção falha com exceção 'FALHA: ...'; se o script chegar ao fim, tudo passou.
--
-- Utilizadores de teste (ids fixos):
--   A  = aluna       00000000-0000-4000-8000-0000000000a1
--   B  = aluna       00000000-0000-4000-8000-0000000000b1
--   E  = encarregado 00000000-0000-4000-8000-0000000000e1

begin;

-- ---------------------------------------------------------------------------
-- 0. Preparação (como postgres): utilizadores e trigger criar_perfil
-- ---------------------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-a@exemplo.invalid', '{"nome":"Aluna A"}'),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-b@exemplo.invalid', '{"nome":"Aluna B","papel":"aluna"}'),
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-e@exemplo.invalid', '{"nome":"Encarregado E","papel":"encarregado"}');

do $$
begin
  if (select papel from public.perfis where id = '00000000-0000-4000-8000-0000000000a1') is distinct from 'aluna' then
    raise exception 'FALHA: perfil de A devia ter papel aluna (omissão)';
  end if;
  if (select nome from public.perfis where id = '00000000-0000-4000-8000-0000000000a1') is distinct from 'Aluna A' then
    raise exception 'FALHA: perfil de A devia ter nome "Aluna A"';
  end if;
  if (select papel from public.perfis where id = '00000000-0000-4000-8000-0000000000e1') is distinct from 'encarregado' then
    raise exception 'FALHA: perfil de E devia ter papel encarregado';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1. Aluna A: insere e lê as suas tentativas/estados; não escreve pela B
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
set local role authenticated;

do $$
begin
  insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, formato, modo, nivel_ajuda, resultado,
                                 primeira_tentativa, viu_resolucao, usou_pista, duracao_ms, sessao_id)
  values ('10000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1', 'mat-a', 'funcoes', 'afim',
          'afim#q0', 'escolha', 'quiz', 2, 'certa', true, false, false, 1200, gen_random_uuid());

  -- reenvio idempotente (como o cliente: on conflict do nothing)
  insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
  values ('10000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1', 'mat-a', 'funcoes', 'afim',
          'afim#q0', 'quiz', 'certa')
  on conflict (id) do nothing;

  insert into public.estados (aluna_id, chave, estado, tipos, proxima_revisao, intervalo_dias)
  values ('00000000-0000-4000-8000-0000000000a1', 'mat-a/funcoes/afim', 'domina', '{}'::jsonb, current_date + 3, 3);

  update public.estados set estado = 'dificuldade'
   where aluna_id = '00000000-0000-4000-8000-0000000000a1' and chave = 'mat-a/funcoes/afim';
  if not found then raise exception 'FALHA: A devia conseguir atualizar o seu estado'; end if;
end $$;

do $$
begin
  begin
    insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
    values (gen_random_uuid(), '00000000-0000-4000-8000-0000000000b1', 'mat-a', 'funcoes', 'afim', 'afim#q0', 'quiz', 'certa');
    raise exception 'FALHA: A conseguiu inserir tentativa com aluna_id de B';
  exception when insufficient_privilege then null; -- esperado (RLS 42501)
  end;
  begin
    insert into public.estados (aluna_id, chave, estado)
    values ('00000000-0000-4000-8000-0000000000b1', 'mat-a/funcoes/afim', 'domina');
    raise exception 'FALHA: A conseguiu inserir estado com aluna_id de B';
  exception when insufficient_privilege then null;
  end;
end $$;

-- B insere os seus dados (para verificar isolamento depois)
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000b1', 'role', 'authenticated')::text, true);

do $$
begin
  insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
  values ('10000000-0000-4000-8000-0000000000b1', '00000000-0000-4000-8000-0000000000b1', 'mat-a', 'funcoes', 'afim',
          'afim#q1', 'treino', 'errada');
  insert into public.estados (aluna_id, chave, estado)
  values ('00000000-0000-4000-8000-0000000000b1', 'mat-a/funcoes/afim', 'nao_resolvido');
  if (select count(*) from public.tentativas) <> 1 then
    raise exception 'FALHA: B devia ver só a sua tentativa';
  end if;
end $$;

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);

do $$
begin
  if (select count(*) from public.tentativas) <> 1
     or exists (select 1 from public.tentativas where aluna_id <> '00000000-0000-4000-8000-0000000000a1') then
    raise exception 'FALHA: A devia ler só a sua tentativa (sem duplicado)';
  end if;
  if (select count(*) from public.estados) <> 1 then
    raise exception 'FALHA: A devia ler só o seu estado';
  end if;
  if (select count(*) from public.perfis) <> 1 then
    raise exception 'FALHA: A devia ler só o seu perfil';
  end if;
  -- ninguém apaga tentativas individuais
  delete from public.tentativas where id = '10000000-0000-4000-8000-0000000000a1';
  raise exception 'FALHA: A conseguiu apagar uma tentativa';
exception
  when insufficient_privilege then null;
end $$;

-- A não muda o seu papel (só o nome é atualizável)
do $$
begin
  update public.perfis set nome = 'Aluna A2' where id = '00000000-0000-4000-8000-0000000000a1';
  if not found then raise exception 'FALHA: A devia conseguir atualizar o seu nome'; end if;
  begin
    update public.perfis set papel = 'encarregado' where id = '00000000-0000-4000-8000-0000000000a1';
    raise exception 'FALHA: A conseguiu mudar o seu papel';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Encarregado E sem ligação: não lê nada de A
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);

do $$
begin
  if (select count(*) from public.tentativas) <> 0 then raise exception 'FALHA: E sem ligação leu tentativas'; end if;
  if (select count(*) from public.estados) <> 0 then raise exception 'FALHA: E sem ligação leu estados'; end if;
  if (select count(*) from public.perfis where id <> '00000000-0000-4000-8000-0000000000e1') <> 0 then
    raise exception 'FALHA: E sem ligação leu perfis alheios';
  end if;
  begin
    perform public.gerar_codigo_ligacao();
    raise exception 'FALHA: E (encarregado) conseguiu gerar código';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'papel_invalido' then raise exception 'FALHA: erro inesperado ao E gerar código: %', sqlerrm; end if;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 3. A gera códigos; o anterior não usado fica inválido
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);

do $$
declare
  c1 text;
  c2 text;
begin
  c1 := public.gerar_codigo_ligacao();
  c2 := public.gerar_codigo_ligacao();
  if c1 !~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$' or c2 !~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$' then
    raise exception 'FALHA: código com formato inválido (% / %)', c1, c2;
  end if;
  if c1 = c2 then raise exception 'FALHA: códigos repetidos'; end if;
  if (select expira_em from public.codigos_ligacao where codigo = c2) not between now() + interval '47 hours 59 minutes'
                                                                             and now() + interval '48 hours 1 minute' then
    raise exception 'FALHA: código devia expirar em 48 h';
  end if;
  if (select count(*) from public.codigos_ligacao where aluna_id = '00000000-0000-4000-8000-0000000000a1') <> 2 then
    raise exception 'FALHA: A devia ler os seus 2 códigos';
  end if;
  perform set_config('teste.c1', c1, true);
  perform set_config('teste.c2', c2, true);
end $$;

-- B não vê os códigos de A
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000b1', 'role', 'authenticated')::text, true);
do $$
declare cb text;
begin
  if (select count(*) from public.codigos_ligacao) <> 0 then raise exception 'FALHA: B leu códigos de A'; end if;
  cb := public.gerar_codigo_ligacao();
  perform set_config('teste.cb', cb, true);
end $$;

-- ---------------------------------------------------------------------------
-- 4. E usa códigos: anterior inválido ✘; atual ✔; depois lê A mas não B
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);

do $$
declare
  lig uuid;
begin
  if (select count(*) from public.codigos_ligacao) <> 0 then raise exception 'FALHA: E leu códigos'; end if;
  begin
    perform public.usar_codigo_ligacao(current_setting('teste.c1'));
    raise exception 'FALHA: código anterior (invalidado) foi aceite';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'codigo_invalido' then raise exception 'FALHA: erro inesperado (c1): %', sqlerrm; end if;
  end;
  begin
    perform public.usar_codigo_ligacao('ZZZZZZZZ');
    raise exception 'FALHA: código inexistente foi aceite';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'codigo_invalido' then raise exception 'FALHA: erro inesperado (inexistente): %', sqlerrm; end if;
  end;

  lig := public.usar_codigo_ligacao(lower(current_setting('teste.c2')));
  if lig is null or not exists (select 1 from public.ligacoes where id = lig) then
    raise exception 'FALHA: usar_codigo_ligacao devia devolver o id da ligação';
  end if;
  perform set_config('teste.lig', lig::text, true);

  if (select count(*) from public.tentativas) <> 1
     or exists (select 1 from public.tentativas where aluna_id <> '00000000-0000-4000-8000-0000000000a1') then
    raise exception 'FALHA: E ligado devia ler só as tentativas de A';
  end if;
  if (select count(*) from public.estados) <> 1
     or exists (select 1 from public.estados where aluna_id <> '00000000-0000-4000-8000-0000000000a1') then
    raise exception 'FALHA: E ligado devia ler só os estados de A';
  end if;
  if (select nome from public.perfis where id = '00000000-0000-4000-8000-0000000000a1') is distinct from 'Aluna A2' then
    raise exception 'FALHA: E ligado devia ler o nome de A';
  end if;
  if exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000b1') then
    raise exception 'FALHA: E leu o perfil de B';
  end if;
end $$;

-- E só lê: não insere, não atualiza, não apaga
do $$
begin
  begin
    insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
    values (gen_random_uuid(), '00000000-0000-4000-8000-0000000000a1', 'mat-a', 'funcoes', 'afim', 'afim#q0', 'quiz', 'certa');
    raise exception 'FALHA: E inseriu tentativa de A';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
    values (gen_random_uuid(), '00000000-0000-4000-8000-0000000000e1', 'mat-a', 'funcoes', 'afim', 'afim#q0', 'quiz', 'certa');
    raise exception 'FALHA: E inseriu tentativa própria (encarregado só lê)';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.estados (aluna_id, chave, estado)
    values ('00000000-0000-4000-8000-0000000000a1', 'mat-a/outro/x', 'domina');
    raise exception 'FALHA: E inseriu estado de A';
  exception when insufficient_privilege then null;
  end;
  update public.estados set estado = 'domina' where aluna_id = '00000000-0000-4000-8000-0000000000a1';
  if found then raise exception 'FALHA: E atualizou estados de A'; end if;
  begin
    update public.tentativas set resultado = 'errada' where aluna_id = '00000000-0000-4000-8000-0000000000a1';
    raise exception 'FALHA: E atualizou tentativas de A';
  exception when insufficient_privilege then null;
  end;
  begin
    delete from public.estados where aluna_id = '00000000-0000-4000-8000-0000000000a1';
    raise exception 'FALHA: E apagou estados de A';
  exception when insufficient_privilege then null;
  end;
  delete from public.ligacoes where id = current_setting('teste.lig')::uuid;
  if found then raise exception 'FALHA: E apagou a ligação (só a aluna revoga)'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Código já usado ✘; código expirado ✘; aluna a usar código ✘
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    perform public.usar_codigo_ligacao(current_setting('teste.c2'));
    raise exception 'FALHA: código usado foi aceite segunda vez';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'codigo_invalido' then raise exception 'FALHA: erro inesperado (usado): %', sqlerrm; end if;
  end;
end $$;

-- forçar expiração do código de B (como postgres)
reset role;
update public.codigos_ligacao set expira_em = now() - interval '1 minute' where codigo = current_setting('teste.cb');
set local role authenticated;

do $$
begin
  begin
    perform public.usar_codigo_ligacao(current_setting('teste.cb'));
    raise exception 'FALHA: código expirado foi aceite';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'codigo_invalido' then raise exception 'FALHA: erro inesperado (expirado): %', sqlerrm; end if;
  end;
  if exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000b1') then
    raise exception 'FALHA: código expirado criou ligação a B';
  end if;
end $$;

-- A gera um código e tenta usá-lo (papel aluna) → recusado
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
do $$
declare c text;
begin
  c := public.gerar_codigo_ligacao();
  begin
    perform public.usar_codigo_ligacao(c);
    raise exception 'FALHA: aluna conseguiu usar um código';
  exception when others then
    if sqlerrm like 'FALHA%' then raise; end if;
    if sqlerrm <> 'papel_invalido' then raise exception 'FALHA: erro inesperado (aluna usa código): %', sqlerrm; end if;
  end;
  if (select usado from public.codigos_ligacao where codigo = c) then
    raise exception 'FALHA: código ficou marcado como usado após recusa';
  end if;
  -- aluna lê a sua ligação
  if (select count(*) from public.ligacoes) <> 1 then raise exception 'FALHA: A devia ler a sua ligação'; end if;
  perform set_config('teste.c4', c, true);
end $$;

-- B não lê nem apaga a ligação de A
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000b1', 'role', 'authenticated')::text, true);
do $$
begin
  if (select count(*) from public.ligacoes) <> 0 then raise exception 'FALHA: B leu a ligação de A'; end if;
  delete from public.ligacoes where id = current_setting('teste.lig')::uuid;
  if found then raise exception 'FALHA: B apagou a ligação de A'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 6. A revoga a ligação → E deixa de ler; volta a ligar com código novo
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
do $$
begin
  delete from public.ligacoes where id = current_setting('teste.lig')::uuid;
  if not found then raise exception 'FALHA: A devia conseguir revogar a ligação'; end if;
end $$;

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);
do $$
begin
  if (select count(*) from public.tentativas) <> 0 then raise exception 'FALHA: E lê tentativas após revogação'; end if;
  perform public.usar_codigo_ligacao(current_setting('teste.c4'));
  if (select count(*) from public.tentativas) <> 1 then raise exception 'FALHA: E devia ler A após nova ligação'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 7. anon: não lê tabelas nem chama funções de conta; ping ✔
-- ---------------------------------------------------------------------------
reset role;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
set local role anon;

do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array['perfis', 'codigos_ligacao', 'ligacoes', 'tentativas', 'estados'] loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n <> 0 then raise exception 'FALHA: anon leu % linhas de %', n, t; end if;
    exception when insufficient_privilege then null;
    end;
  end loop;
  if public.ping() is null then raise exception 'FALHA: ping devolveu null'; end if;
  begin
    perform public.gerar_codigo_ligacao();
    raise exception 'FALHA: anon executou gerar_codigo_ligacao';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.usar_codigo_ligacao('AAAAAAAA');
    raise exception 'FALHA: anon executou usar_codigo_ligacao';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.apagar_conta();
    raise exception 'FALHA: anon executou apagar_conta';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 8. A apaga a conta: desaparecem os seus dados e o auth.users; B e E ficam
-- ---------------------------------------------------------------------------
reset role;
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
set local role authenticated;
select public.apagar_conta();
reset role;

do $$
declare a uuid := '00000000-0000-4000-8000-0000000000a1';
begin
  if exists (select 1 from public.tentativas where aluna_id = a) then raise exception 'FALHA: ficaram tentativas de A'; end if;
  if exists (select 1 from public.estados where aluna_id = a) then raise exception 'FALHA: ficaram estados de A'; end if;
  if exists (select 1 from public.codigos_ligacao where aluna_id = a) then raise exception 'FALHA: ficaram códigos de A'; end if;
  if exists (select 1 from public.ligacoes where aluna_id = a or encarregado_id = a) then raise exception 'FALHA: ficaram ligações de A'; end if;
  if exists (select 1 from public.perfis where id = a) then raise exception 'FALHA: ficou o perfil de A'; end if;
  if exists (select 1 from auth.users where id = a) then raise exception 'FALHA: ficou o auth.users de A'; end if;
  if (select count(*) from public.tentativas where aluna_id = '00000000-0000-4000-8000-0000000000b1') <> 1
     or not exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000e1') then
    raise exception 'FALHA: apagar_conta de A afetou B ou E';
  end if;
end $$;

-- encarregado também pode apagar a conta (remove as suas ligações e perfil)
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);
set local role authenticated;
select public.apagar_conta();
reset role;

do $$
begin
  if exists (select 1 from auth.users where id = '00000000-0000-4000-8000-0000000000e1')
     or exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000e1') then
    raise exception 'FALHA: apagar_conta de E não removeu a conta';
  end if;
  raise notice 'OK: todas as asserções de 0001_rls passaram';
end $$;

rollback;

select 'OK: 0001_rls passou (transação revertida)' as resultado;
