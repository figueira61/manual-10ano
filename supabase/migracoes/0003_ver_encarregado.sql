-- 0003_ver_encarregado — a aluna vê o nome dos encarregados ligados a ela.
--
-- Política de leitura (RLS) sobre perfis: a aluna lê a linha de um encarregado só enquanto
-- existir uma ligação entre os dois. A política de ligacoes (participante_le) já deixa a
-- aluna ver as suas ligações, por isso a subconsulta não recorre a privilégios extra.
--
-- Privilégios: sem alterações. 0001 dá `select` (tabela inteira) em perfis a authenticated,
-- o que já cobre id e nome; o cliente pede só `id, nome`. Não se criam objetos novos.

create policy aluna_le_encarregados on public.perfis
  for select to authenticated
  using (exists (select 1 from public.ligacoes l
                  where l.encarregado_id = perfis.id
                    and l.aluna_id = (select auth.uid())));
