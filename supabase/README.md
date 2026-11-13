# Supabase — manual-10ano

- **Projeto:** `manual-10ano` (id `dhflcwqwmhbyxqcsxvlh`), organização do utilizador, região `eu-central-1` (Frankfurt, UE), plano gratuito (0 €/mês).
- **URL:** `https://dhflcwqwmhbyxqcsxvlh.supabase.co`
- **Chave pública:** a chave `anon` em `js/config.js` (pública por desenho; a segurança é feita por RLS). A chave de serviço **nunca** entra no repositório.

## Migrações

As alterações ao esquema estão em `supabase/migracoes/`, numeradas (`0001_…sql`, `0002_…sql`). Aplicam-se por ordem, uma vez, pelo conector Supabase (`apply_migration`) ou pelo editor SQL do painel.

## Testes de acesso (RLS)

`supabase/testes/` tem scripts SQL que correm numa transação com `rollback` no fim: criam utilizadores de teste, simulam cada um e falham com exceção se alguma regra de acesso não se comportar como esperado. Não deixam dados.

## Pausa por inatividade

O plano gratuito pausa a base de dados após ~1 semana sem atividade. O workflow `.github/workflows/manter-supabase.yml` chama a função `ping()` todos os dias para o evitar. Se mesmo assim pausar: painel do Supabase → projeto → **Restore**.
