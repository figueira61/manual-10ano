-- Testes da migração 0003 (a aluna vê o nome dos encarregados ligados).
-- Uma transação revertida no fim; falha com 'FALHA: ...'.
--
--   A  = aluna       00000000-0000-4000-8000-0000000000a1
--   E  = encarregado 00000000-0000-4000-8000-0000000000e1 (ligado a A a meio do teste)
--   E2 = encarregado 00000000-0000-4000-8000-0000000000e2 (sem ligação)

begin;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-a@exemplo.invalid', '{"nome":"Aluna A"}'),
  ('00000000-0000-4000-8000-0000000000e1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-e@exemplo.invalid', '{"nome":"Encarregado E","papel":"encarregado"}'),
  ('00000000-0000-4000-8000-0000000000e2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-e2@exemplo.invalid', '{"nome":"Encarregado E2","papel":"encarregado"}');

-- privilégios: authenticated lê id e nome de perfis; anon nada
do $$
begin
  if not has_column_privilege('authenticated', 'public.perfis', 'nome', 'select')
     or not has_column_privilege('authenticated', 'public.perfis', 'id', 'select') then
    raise exception 'FALHA: authenticated devia poder ler id e nome de perfis';
  end if;
  if has_table_privilege('anon', 'public.perfis', 'select') then
    raise exception 'FALHA: anon não devia ler perfis';
  end if;
end $$;

-- 1. Antes da ligação, A não vê E
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000e1') then
    raise exception 'FALHA: A vê E antes da ligação';
  end if;
  perform set_config('teste.c', public.gerar_codigo_ligacao(), true);
end $$;

-- E usa o código de A
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e1', 'role', 'authenticated')::text, true);
select public.usar_codigo_ligacao(current_setting('teste.c'));

-- 2. Depois da ligação, A vê o nome de E, mas não E2
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
do $$
begin
  if coalesce((select nome from public.perfis where id = '00000000-0000-4000-8000-0000000000e1'), '') <> 'Encarregado E' then
    raise exception 'FALHA: A devia ver o nome de E depois da ligação';
  end if;
  if exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000e2') then
    raise exception 'FALHA: A vê E2, que não está ligado';
  end if;
  if (select count(*) from public.perfis) <> 2 then
    raise exception 'FALHA: A devia ver exatamente 2 perfis (o seu e o de E)';
  end if;
end $$;

-- 3. E2 continua sem ver A nem E
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000e2', 'role', 'authenticated')::text, true);
do $$
begin
  if (select count(*) from public.perfis) <> 1 then
    raise exception 'FALHA: E2 devia ver só o próprio perfil';
  end if;
end $$;

-- 4. Depois de A revogar, deixa de ver E
select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
delete from public.ligacoes where aluna_id = '00000000-0000-4000-8000-0000000000a1';
do $$
begin
  if exists (select 1 from public.perfis where id = '00000000-0000-4000-8000-0000000000e1') then
    raise exception 'FALHA: A ainda vê E depois de revogar';
  end if;
end $$;

reset role;
select 'OK 0003_rls' as resultado;

rollback;
