-- 0002_endurecer — endurecimento de acessos (dados de menores).

-- 1. Códigos de ligação só nascem por gerar_codigo_ligacao() (sem INSERT direto do cliente)
drop policy aluna_cria_proprio on public.codigos_ligacao;
revoke insert on public.codigos_ligacao from authenticated;

-- 2. Objetos futuros começam fechados (tabelas, sequências e funções criadas por postgres)
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, public;
-- o EXECUTE para PUBLIC das funções é um privilégio por omissão global: retira-se sem "in schema"
alter default privileges for role postgres revoke execute on functions from public;

-- 4. Limites de comprimento
alter table public.perfis
  add constraint perfis_nome_comprimento check (char_length(nome) <= 60);

alter table public.tentativas
  add constraint tentativas_disciplina_comprimento  check (char_length(disciplina)  <= 80),
  add constraint tentativas_tema_comprimento        check (char_length(tema)        <= 80),
  add constraint tentativas_subtema_comprimento     check (char_length(subtema)     <= 80),
  add constraint tentativas_tipo_comprimento        check (char_length(tipo)        <= 80),
  add constraint tentativas_formato_comprimento     check (char_length(formato)     <= 80),
  add constraint tentativas_erro_tipico_comprimento check (char_length(erro_tipico) <= 80);

alter table public.estados
  add constraint estados_chave_comprimento check (char_length(chave) <= 200);

-- o trigger corta o nome a 60 caracteres para nunca impedir o registo
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, papel, nome)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'papel' = 'encarregado' then 'encarregado' else 'aluna' end,
    pg_catalog.left(nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'nome'), ''), 60)
  );
  return new;
end;
$$;
revoke execute on function public.criar_perfil() from public, anon, authenticated;
