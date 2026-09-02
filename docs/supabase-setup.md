# Supabase e Vercel

## Supabase

1. Crie um projeto Supabase e mantenha o cadastro público desativado em **Auth > Providers > Email**.
2. Copie apenas a URL do projeto e a chave `anon` para `frontend/.env.local`, usando os nomes de `frontend/.env.example`. Nunca use a `service_role` no frontend.
3. Com a Supabase CLI autenticada e o projeto vinculado, aplique `supabase/migrations/202609020001_initial_schema.sql` e depois `supabase/seed.sql`.
4. Crie o primeiro usuário administrativo pelo painel Auth. Depois promova-o uma única vez, no SQL Editor, com `update public.profiles set role = 'admin' where email = 'seu-email';`.
5. Confirme no Storage que o bucket `enrollment-documents` está privado. A aplicação usa URLs assinadas e temporárias; nunca URLs públicas.

## Vercel

- Root directory: `frontend`
- Install command: `yarn install --frozen-lockfile` depois que o lockfile for gerado e versionado.
- Build command: `yarn build`
- Output directory: `build`
- Environment variables: `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`.

Não publique o projeto nem preencha variáveis reais sem autorização explícita.
