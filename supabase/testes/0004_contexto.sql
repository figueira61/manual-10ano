-- Testes da migração 0004 (coluna contexto em tentativas).
-- Uma transação revertida no fim; falha com 'FALHA: ...'.
--
--   A = aluna 00000000-0000-4000-8000-0000000000a1

begin;

insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'teste-a@exemplo.invalid', '{"nome":"Aluna A"}');

select set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-4000-8000-0000000000a1', 'role', 'authenticated')::text, true);
set local role authenticated;

-- com contexto e sem contexto
insert into public.tentativas (id, disciplina, tema, subtema, tipo, modo, resultado, contexto) values
  ('00000000-0000-4000-8000-000000000b01', 'mat-a', 'funcoes', 'afim', 'afim-gerado', 'treino', 'certa', 'deposito');
insert into public.tentativas (id, disciplina, tema, subtema, tipo, modo, resultado) values
  ('00000000-0000-4000-8000-000000000b02', 'mat-a', 'funcoes', 'afim', 'afim-gerado', 'quiz', 'errada');

do $$
begin
  if (select contexto from public.tentativas where id = '00000000-0000-4000-8000-000000000b01') is distinct from 'deposito' then
    raise exception 'FALHA: o contexto não foi guardado';
  end if;
  if (select contexto from public.tentativas where id = '00000000-0000-4000-8000-000000000b02') is not null then
    raise exception 'FALHA: a tentativa sem contexto devia ter contexto nulo';
  end if;
  if (select count(*) from public.tentativas) <> 2 then
    raise exception 'FALHA: A devia ver as suas 2 tentativas';
  end if;
end $$;

-- um contexto com mais de 40 caracteres é rejeitado
do $$
begin
  begin
    insert into public.tentativas (id, disciplina, tema, subtema, tipo, modo, resultado, contexto) values
      ('00000000-0000-4000-8000-000000000b03', 'mat-a', 'funcoes', 'afim', 'afim-gerado', 'quiz', 'certa', repeat('x', 41));
    raise exception 'FALHA: aceitou um contexto com mais de 40 caracteres';
  exception when check_violation then
    null;
  end;
end $$;

reset role;
select 'OK 0004_contexto' as resultado;

rollback;
