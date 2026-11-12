-- 0001_contas — perfis, códigos de ligação, ligações, tentativas e estados;
-- RLS (spec §4.3) e funções ping, gerar_codigo_ligacao, usar_codigo_ligacao, apagar_conta.

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.perfis (
  id        uuid primary key references auth.users (id) on delete cascade,
  papel     text not null default 'aluna' check (papel in ('aluna', 'encarregado')),
  nome      text,
  criado_em timestamptz not null default now()
);

create table public.codigos_ligacao (
  codigo    text primary key check (codigo ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$'),
  aluna_id  uuid not null references public.perfis (id) on delete cascade,
  expira_em timestamptz not null default now() + interval '48 hours',
  usado     boolean not null default false
);
create index codigos_ligacao_aluna_id_idx on public.codigos_ligacao (aluna_id);

create table public.ligacoes (
  id             uuid primary key default gen_random_uuid(),
  aluna_id       uuid not null references public.perfis (id) on delete cascade,
  encarregado_id uuid not null references public.perfis (id) on delete cascade,
  criado_em      timestamptz not null default now(),
  unique (aluna_id, encarregado_id)
);
create index ligacoes_encarregado_id_idx on public.ligacoes (encarregado_id);

create table public.tentativas (
  id                 uuid primary key,  -- gerado no cliente (idempotência)
  aluna_id           uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  disciplina         text not null,
  tema               text not null,
  subtema            text,
  tipo               text not null,
  semente            bigint,
  formato            text,
  modo               text not null check (modo in ('quiz', 'treino', 'teste')),
  nivel_ajuda        smallint,
  resultado          text not null check (resultado in ('certa', 'errada')),
  primeira_tentativa boolean not null default true,
  viu_resolucao      boolean not null default false,
  usou_pista         boolean not null default false,
  erro_tipico        text,
  duracao_ms         integer,
  sessao_id          uuid,
  criado_em          timestamptz not null default now()
);
create index tentativas_aluna_id_criado_em_idx on public.tentativas (aluna_id, criado_em);

create table public.estados (
  aluna_id        uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  chave           text not null,  -- disciplina/tema/subtema
  estado          text not null check (estado in ('domina', 'dificuldade', 'nao_resolvido')),
  tipos           jsonb not null default '{}'::jsonb,
  proxima_revisao date,
  intervalo_dias  smallint,
  atualizado_em   timestamptz not null default now(),
  primary key (aluna_id, chave)
);

-- ---------------------------------------------------------------------------
-- Privilégios: anon não acede a nenhuma tabela; authenticated só o necessário
-- ---------------------------------------------------------------------------
revoke all on public.perfis, public.codigos_ligacao, public.ligacoes, public.tentativas, public.estados
  from anon, authenticated, public;

grant select                 on public.perfis          to authenticated;
grant update (nome)          on public.perfis          to authenticated;
grant select, insert         on public.codigos_ligacao to authenticated;
grant select, delete         on public.ligacoes        to authenticated;
grant select, insert         on public.tentativas      to authenticated;
grant select, insert, update on public.estados         to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.perfis          enable row level security;
alter table public.codigos_ligacao enable row level security;
alter table public.ligacoes        enable row level security;
alter table public.tentativas      enable row level security;
alter table public.estados         enable row level security;

-- perfis: cada um lê/atualiza o seu; encarregado lê o das alunas ligadas
create policy proprio_le on public.perfis
  for select to authenticated
  using (id = (select auth.uid()));

create policy proprio_atualiza on public.perfis
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy encarregado_le_ligadas on public.perfis
  for select to authenticated
  using (exists (select 1 from public.ligacoes l
                  where l.aluna_id = perfis.id
                    and l.encarregado_id = (select auth.uid())));

-- codigos_ligacao: aluna cria/lê os seus (o uso faz-se por usar_codigo_ligacao)
create policy aluna_le_proprio on public.codigos_ligacao
  for select to authenticated
  using (aluna_id = (select auth.uid()));

create policy aluna_cria_proprio on public.codigos_ligacao
  for insert to authenticated
  with check (aluna_id = (select auth.uid())
              and not usado
              and expira_em <= now() + interval '48 hours'
              and exists (select 1 from public.perfis p
                           where p.id = (select auth.uid()) and p.papel = 'aluna'));

-- ligacoes: aluna e encarregado leem as suas; aluna revoga
create policy participante_le on public.ligacoes
  for select to authenticated
  using (aluna_id = (select auth.uid()) or encarregado_id = (select auth.uid()));

create policy aluna_revoga on public.ligacoes
  for delete to authenticated
  using (aluna_id = (select auth.uid()));

-- tentativas: aluna insere/lê as suas; encarregado lê as das ligadas
create policy aluna_le_proprio on public.tentativas
  for select to authenticated
  using (aluna_id = (select auth.uid()));

create policy aluna_insere_proprio on public.tentativas
  for insert to authenticated
  with check (aluna_id = (select auth.uid())
              and exists (select 1 from public.perfis p
                           where p.id = (select auth.uid()) and p.papel = 'aluna'));

create policy encarregado_le_ligadas on public.tentativas
  for select to authenticated
  using (exists (select 1 from public.ligacoes l
                  where l.aluna_id = tentativas.aluna_id
                    and l.encarregado_id = (select auth.uid())));

-- estados: aluna insere/lê/atualiza os seus; encarregado lê os das ligadas
create policy aluna_le_proprio on public.estados
  for select to authenticated
  using (aluna_id = (select auth.uid()));

create policy aluna_insere_proprio on public.estados
  for insert to authenticated
  with check (aluna_id = (select auth.uid())
              and exists (select 1 from public.perfis p
                           where p.id = (select auth.uid()) and p.papel = 'aluna'));

create policy aluna_atualiza_proprio on public.estados
  for update to authenticated
  using (aluna_id = (select auth.uid()))
  with check (aluna_id = (select auth.uid()));

create policy encarregado_le_ligadas on public.estados
  for select to authenticated
  using (exists (select 1 from public.ligacoes l
                  where l.aluna_id = estados.aluna_id
                    and l.encarregado_id = (select auth.uid())));

-- ---------------------------------------------------------------------------
-- Trigger: cria o perfil quando nasce um utilizador
-- ---------------------------------------------------------------------------
create function public.criar_perfil()
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
    nullif(btrim(new.raw_user_meta_data ->> 'nome'), '')
  );
  return new;
end;
$$;
revoke execute on function public.criar_perfil() from public, anon, authenticated;

create trigger criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------------------
-- Funções
-- ---------------------------------------------------------------------------

-- ping: mantém o projeto ativo (workflow anti-pausa)
create function public.ping()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select pg_catalog.now();
$$;
revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- gerar_codigo_ligacao: só alunas; 8 caracteres sem ambíguos; 48 h; invalida os anteriores
create function public.gerar_codigo_ligacao()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  uid uuid := auth.uid();
  bytes bytea;
  novo text;
  i int;
begin
  if uid is null then
    raise exception 'nao_autenticado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.perfis p where p.id = uid and p.papel = 'aluna') then
    raise exception 'papel_invalido' using errcode = 'P0001';
  end if;

  update public.codigos_ligacao c set usado = true
   where c.aluna_id = uid and not c.usado;

  loop
    -- bytes aleatórios (CSPRNG) de um uuid v4: 0–5 e 9–15 são totalmente aleatórios
    bytes := pg_catalog.uuid_send(pg_catalog.gen_random_uuid());
    novo := '';
    foreach i in array array[0, 1, 2, 3, 4, 5, 9, 10] loop
      -- 256 é múltiplo de 32: distribuição uniforme
      novo := novo || pg_catalog.substr(alfabeto, (pg_catalog.get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    begin
      insert into public.codigos_ligacao (codigo, aluna_id, expira_em, usado)
      values (novo, uid, pg_catalog.now() + interval '48 hours', false);
      return novo;
    exception when unique_violation then
      null;  -- colisão (rara): tenta outro código
    end;
  end loop;
end;
$$;
revoke execute on function public.gerar_codigo_ligacao() from public, anon;
grant execute on function public.gerar_codigo_ligacao() to authenticated;

-- usar_codigo_ligacao: só encarregados; valida o código, marca usado, cria a ligação
create function public.usar_codigo_ligacao(codigo text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  registo public.codigos_ligacao%rowtype;
  lig uuid;
begin
  if uid is null then
    raise exception 'nao_autenticado' using errcode = '42501';
  end if;
  if not exists (select 1 from public.perfis p where p.id = uid and p.papel = 'encarregado') then
    raise exception 'papel_invalido' using errcode = 'P0001';
  end if;

  select * into registo
    from public.codigos_ligacao c
   where c.codigo = pg_catalog.upper(pg_catalog.btrim(usar_codigo_ligacao.codigo))
   for update;

  if not found or registo.usado or registo.expira_em <= pg_catalog.now() then
    raise exception 'codigo_invalido' using errcode = 'P0001';
  end if;

  update public.codigos_ligacao c set usado = true where c.codigo = registo.codigo;

  insert into public.ligacoes (aluna_id, encarregado_id)
  values (registo.aluna_id, uid)
  on conflict (aluna_id, encarregado_id) do nothing
  returning id into lig;

  if lig is null then
    select l.id into lig from public.ligacoes l
     where l.aluna_id = registo.aluna_id and l.encarregado_id = uid;
  end if;

  return lig;
end;
$$;
revoke execute on function public.usar_codigo_ligacao(text) from public, anon;
grant execute on function public.usar_codigo_ligacao(text) to authenticated;

-- apagar_conta: apaga todos os dados do chamador e o utilizador de auth
create function public.apagar_conta()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'nao_autenticado' using errcode = '42501';
  end if;

  delete from public.tentativas t      where t.aluna_id = uid;
  delete from public.estados e         where e.aluna_id = uid;
  delete from public.codigos_ligacao c where c.aluna_id = uid;
  delete from public.ligacoes l        where l.aluna_id = uid or l.encarregado_id = uid;
  delete from public.perfis p          where p.id = uid;
  delete from auth.users u             where u.id = uid;
end;
$$;
revoke execute on function public.apagar_conta() from public, anon;
grant execute on function public.apagar_conta() to authenticated;
