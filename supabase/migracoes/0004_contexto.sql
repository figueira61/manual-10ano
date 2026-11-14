-- 0004: a tentativa guarda o contexto do enunciado (opcional, até 40 caracteres).
-- As políticas RLS não mudam.
alter table public.tentativas
  add column contexto text null check (contexto is null or char_length(contexto) <= 40);
