-- Testes da migração 0002 (endurecimento) e lacunas de 0001_rls.
-- Uma transação revertida no fim; falha com 'FALHA: ...'.
--
--   A  = aluna       00000000-0000-4000-8000-0000000000a1
--   B  = aluna       00000000-0000-4000-8000-0000000000b1
--   E  = encarregado 00000000-0000-4000-8000-0000000000e1 (ligado a A)
--   E2 = encarregado 00000000-0000-4000-8000-0000000000e2 (sem ligação)

begin;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-a@exemplo.invalid', '{"nome":"Aluna A"}'),
  ('00000000-0000-4000-8000-0000000000b1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-b@exemplo.invalid', json_build_object('nome', repeat('x', 100))),
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-e@exemplo.invalid', '{"nome":"Encarregado E","papel":"encarregado"}'),
  ('00000000-0000-4000-8000-0000000000e2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-e2@exemplo.invalid', '{"nome":"Encarregado E2","papel":"encarregado"}');

-- nome longo nos metadados não impede o registo: fica cortado a 60
do $$
begin
  if (select char_length(nome) from public.perfis where id = '00000000-0000-4000-8000-0000000000b1') <> 60 then
    raise exception 'FALHA: nome longo devia ser cortado a 60 caracteres';
  end if;
end $$;

-- dados de base (A e B)
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000b1', 'role', 'authenticated')::text, true);
set local role authenticated;
insert into public.estados (aluna_id, chave, estado)
values ('00000000-0000-4000-8000-0000000000b1', 'mat-a/funcoes/afim', 'nao_resolvido');

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
values ('20000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-0000000000a1', 'mat-a', 'funcoes', 'afim',
        'afim#q0', 'quiz', 'certa');
insert into public.estados (aluna_id, chave, estado)
values ('00000000-0000-4000-8000-0000000000a1', 'mat-a/funcoes/afim', 'domina');

-- ---------------------------------------------------------------------------
-- 1. A não insere códigos diretamente (só por gerar_codigo_ligacao)
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.codigos_ligacao (codigo, aluna_id, expira_em, usado)
    values ('ABCDEFGH', '00000000-0000-4000-8000-0000000000a1', now() + interval '1 hour', false);
    raise exception 'FALHA: A inseriu um código diretamente';
  exception when insufficient_privilege then null;
  end;
  perform set_config('teste.c', public.gerar_codigo_ligacao(), true);
end $$;

-- ---------------------------------------------------------------------------
-- 3. Lacunas: A não atualiza estados de B; não muda aluna_id para B (WITH CHECK)
-- ---------------------------------------------------------------------------
do $$
begin
  update public.estados set estado = 'domina' where aluna_id = '00000000-0000-4000-8000-0000000000b1';
  if found then raise exception 'FALHA: A atualizou estados de B'; end if;
  begin
    update public.estados set aluna_id = '00000000-0000-4000-8000-0000000000b1'
     where aluna_id = '00000000-0000-4000-8000-0000000000a1' and chave = 'mat-a/funcoes/afim';
    raise exception 'FALHA: A passou o seu estado para aluna_id de B';
  exception when insufficient_privilege then null;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- 4. Limites de comprimento
-- ---------------------------------------------------------------------------
do $$
declare
  col text;
begin
  foreach col in array array['disciplina', 'tema', 'subtema', 'tipo', 'formato', 'erro_tipico'] loop
    begin
      insert into public.tentativas
      select * from jsonb_populate_record(null::public.tentativas,
        jsonb_build_object('id', gen_random_uuid(), 'aluna_id', '00000000-0000-4000-8000-0000000000a1',
                           'disciplina', 'mat-a', 'tema', 'funcoes', 'subtema', 'afim', 'tipo', 'afim#q0',
                           'modo', 'quiz', 'resultado', 'certa', 'primeira_tentativa', true,
                           'viu_resolucao', false, 'usou_pista', false, 'criado_em', now())
        || jsonb_build_object(col, repeat('x', 81)));
      raise exception 'FALHA: tentativas.% aceitou 81 caracteres', col;
    exception when check_violation then null;
    end;
  end loop;
  -- 80 caracteres é aceite
  insert into public.tentativas (id, aluna_id, disciplina, tema, subtema, tipo, modo, resultado)
  values ('20000000-0000-4000-8000-0000000000a2', '00000000-0000-4000-8000-0000000000a1', repeat('x', 80), 'funcoes',
          'afim', 'afim#q0', 'quiz', 'certa');
  begin
    insert into public.estados (aluna_id, chave, estado)
    values ('00000000-0000-4000-8000-0000000000a1', repeat('x', 201), 'domina');
    raise exception 'FALHA: estados.chave aceitou 201 caracteres';
  exception when check_violation then null;
  end;
  begin
    update public.perfis set nome = repeat('x', 61) where id = '00000000-0000-4000-8000-0000000000a1';
    raise exception 'FALHA: perfis.nome aceitou 61 caracteres';
  exception when check_violation then null;
  end;
  update public.perfis set nome = repeat('x', 60) where id = '00000000-0000-4000-8000-0000000000a1';
  if not found then raise exception 'FALHA: perfis.nome devia aceitar 60 caracteres'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3. E liga-se a A; E2 (sem ligação) continua a ler 0 linhas de A
-- ---------------------------------------------------------------------------
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);
do $$
begin
  perform public.usar_codigo_ligacao(current_setting('teste.c'));
  if (select count(*) from public.tentativas) <> 2 then raise exception 'FALHA: E ligado devia ler as 2 tentativas de A'; end if;
end $$;

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e2', 'role', 'authenticated')::text, true);
do $$
begin
  if (select count(*) from public.tentativas) <> 0 then raise exception 'FALHA: E2 leu tentativas de A'; end if;
  if (select count(*) from public.estados) <> 0 then raise exception 'FALHA: E2 leu estados de A'; end if;
  if (select count(*) from public.ligacoes) <> 0 then raise exception 'FALHA: E2 leu a ligação de E'; end if;
  if (select count(*) from public.codigos_ligacao) <> 0 then raise exception 'FALHA: E2 leu códigos'; end if;
  if (select count(*) from public.perfis where id <> '00000000-0000-4000-8000-0000000000e2') <> 0 then
    raise exception 'FALHA: E2 leu perfis alheios';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. Privilégios por omissão: objetos futuros de postgres em public começam fechados
-- ---------------------------------------------------------------------------
reset role;
do $$
begin
  -- nenhuma ACL por omissão (de postgres, em public ou global) concede algo a anon/authenticated/PUBLIC
  if exists (
    select 1
      from pg_catalog.pg_default_acl d
      cross join lateral pg_catalog.aclexplode(d.defaclacl) a
     where d.defaclrole = 'postgres'::regrole
       and (d.defaclnamespace = 0 or d.defaclnamespace = 'public'::regnamespace)
       and a.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
  ) then
    raise exception 'FALHA: pg_default_acl ainda concede privilégios a anon/authenticated/PUBLIC';
  end if;

  -- confirmação prática: uma tabela e uma função novas não ficam acessíveis
  create table public.teste_por_omissao (x int);
  create function public.teste_por_omissao_f() returns int language sql set search_path = '' as $f$ select 1 $f$;
  if has_table_privilege('anon', 'public.teste_por_omissao', 'select')
     or has_table_privilege('authenticated', 'public.teste_por_omissao', 'select') then
    raise exception 'FALHA: tabela nova acessível a anon/authenticated';
  end if;
  if has_function_privilege('anon', 'public.teste_por_omissao_f()', 'execute')
     or has_function_privilege('authenticated', 'public.teste_por_omissao_f()', 'execute') then
    raise exception 'FALHA: função nova executável por anon/authenticated';
  end if;
end $$;

rollback;

select 'OK: 0002_rls passou (transação revertida)' as resultado;
