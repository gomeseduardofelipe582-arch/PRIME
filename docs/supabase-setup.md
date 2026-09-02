# Supabase e Vercel

## Supabase

1. Crie um projeto Supabase e mantenha o cadastro publico desativado em **Auth > Providers > Email**.
2. Copie somente a URL do projeto e a chave `anon` para `frontend/.env.local`, usando os nomes de `frontend/.env.example`. Nunca use `service_role` no frontend.
3. Com a Supabase CLI autenticada e o projeto vinculado, aplique `supabase/migrations/202609020001_initial_schema.sql` e depois `supabase/seed.sql`.
4. Crie o primeiro usuario administrativo pelo painel Auth. Depois promova-o uma unica vez, no SQL Editor, com `update public.profiles set role = 'admin' where email = 'seu-email';`.
5. Confirme no Storage que o bucket `enrollment-documents` esta privado. A aplicacao usa URLs assinadas e temporarias; nunca URLs publicas.
6. Em **Auth > URL Configuration**, defina a URL de producao como `Site URL` e adicione as URLs local e de producao em `Redirect URLs`. Isso e necessario para os fluxos de sessao e recuperacao de senha.

## Desenvolvimento local

- Diretorio do aplicativo: `frontend`.
- Instale dependencias com `yarn install` nesse diretorio e versione o `yarn.lock` resultante.
- Execute `yarn build` antes de publicar. Nenhuma configuracao de Supabase ou Vercel esta incluida neste repositorio.

## Vercel

- Root directory: `frontend`
- Package manager: Yarn 1.22.22, conforme `frontend/package.json`.
- Node.js validado localmente: 24.15.0.
- Install command: `yarn install --frozen-lockfile`, somente depois que o `yarn.lock` for gerado e versionado.
- Build command: `yarn build`
- Output directory: `build`
- Environment variables: `REACT_APP_SUPABASE_URL` e `REACT_APP_SUPABASE_ANON_KEY`.

Nao publique o projeto nem preencha variaveis reais sem autorizacao explicita.
