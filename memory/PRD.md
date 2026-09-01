# Prime Excelência — Painel do Revendedor (CRM de Matrículas)

## Problema original
Sistema web para revendedor de cursos da Prime Excelência em Trânsito, centralizando cadastro de alunos, matrículas, cursos, documentação, valores (repasse/venda/margem), origem de lead, campanhas, acompanhamento de status e geração de resumo profissional para envio à escola via WhatsApp (cópia manual, sem integração real).

**Fase 1 (atual):** foco em DESIGN, UX, estrutura de telas e fluxo. Sem WhatsApp API, pagamentos, autenticação real ou integrações externas. Dados simulados, código organizado para fácil migração futura para banco real (ex.: Supabase).

## Decisões do usuário
- Tema escuro/profissional (slate + indigo)
- Frontend-only com dados mockados em localStorage (sem backend nesta fase)
- Poucos exemplos demonstrativos
- Tipografia moderna/técnica (Outfit + Manrope)
- Login fake (qualquer e-mail/senha)

## Persona
Revendedor/atendente comercial que cadastra alunos, cria matrículas, acompanha documentação e envia resumos para a escola parceira.

## Arquitetura implementada
- **Stack:** React (CRA + craco) + Tailwind + shadcn/ui + Recharts (somente evolução de matrículas em Relatórios) + framer-motion + phosphor-icons. Sem chamadas a backend (FastAPI/Mongo do template não são usados nesta fase).
- **Camada de dados (`/app/frontend/src`):**
  - `data/seed.js` — dados demonstrativos (8 cursos, 10 alunos, 12 matrículas, 6 campanhas)
  - `lib/storage.js` — localStorage helpers + seed único (`ensureSeeded`)
  - `services/*.js` — courseService, studentService, enrollmentService, campaignService (funções `async`, prontas para trocar storage local por chamadas Supabase/API no futuro sem alterar as telas)
  - `context/DataContext.jsx` — estado global (courses/students/enrollments/campaigns) + CRUD
  - `context/AuthContext.jsx` — login fake (localStorage `crm_auth`)
- **Entidades:** Student, Course (com `extraStudentFields` e `requiredDocuments` dinâmicos), Enrollment (relaciona student+course+origin+campaign+status), Campaign, LeadSource (constante).
- **Rotas:** `/login`, `/dashboard`, `/matriculas`, `/matriculas/nova` (wizard 5 passos), `/matriculas/:id`, `/alunos`, `/alunos/:id`, `/cursos`, `/campanhas`, `/relatorios`.

## Implementado (até 01/09/2026)
- Login fake + logout + rota protegida
- Sidebar responsiva (drawer mobile) com 7 itens de menu
- Dashboard: KPIs fixos (hoje/semana/mês) + KPIs filtráveis por período + rankings em lista (sem gráficos) + matrículas recentes
- Wizard "Nova Matrícula" completo: seleção de categoria/curso com preço editável e margem em tempo real → dados do aluno com máscaras (CPF/telefone/CEP) e campos dinâmicos (EJA) → checklist de documentos → informações comerciais (origem/campanha/observações internas) → revisão e geração de matrícula com numeração sequencial
- Detalhe da matrícula: visão geral (editável: status, documentos) + aba "Resumo para Escola" (sem margem/campanha/observações) com copiar para WhatsApp, imprimir e botão de PDF (desabilitado, "em breve")
- Matrículas: tabela com busca + 5 filtros + 5 presets de período
- Alunos: lista + detalhe (dados pessoais, histórico, cursos realizados, observações editáveis)
- Cursos: catálogo por categoria + drawer de edição
- Campanhas: agregação de matrículas/receita/margem por campanha
- Relatórios: filtros de período, cinco KPIs (inclui ticket médio), um gráfico de evolução das matrículas, destaques executivos e tabelas de cursos, campanhas e origens
- Correções pós-teste (01/09): perda de dados do aluno ao reaproveitar CPF existente; observações do aluno não apareciam após reload direto; numeração sequencial agora usa máx(número)+1; ajuste de `NavLink end` no sidebar; polimento de rótulos de gráficos e stepper mobile

## Backlog priorizado
**P0 (bloqueadores para próxima fase):**
- Nenhum bloqueador conhecido no fluxo atual

**P1:**
- Migrar camada de serviços de localStorage para Supabase/API real
- Autenticação real (login com validação de servidor)
- Geração de PDF real do resumo da matrícula

**P2:**
- Integração WhatsApp API (envio automático)
- Pagamentos
- Automações (ex.: mudança automática de status por documentação completa)
- Configurações (usuários, permissões)

## Próximos passos sugeridos
1. Validar fluxo completo com o usuário (dashboard → nova matrícula → resumo)
2. Conectar Supabase substituindo `services/*.js`
3. Adicionar autenticação real

## 2026-06 — Verificação de erros
- Removidos 5 avisos ESLint `react-hooks/exhaustive-deps` em Dashboard.jsx e Reports.jsx (lookups inlined nos useMemo; `now` memoizado).
- Build compila sem warnings; 0 erros de console em todas as rotas.
- Criado test_credentials.md (auth mockada).

## 2026-06 — Meta do mês + limpeza de gráficos
- Novo componente MonthlyGoalCard (barras de progresso R$ e matrículas, meta editável salva em localStorage `crm_monthly_goal`, default R$20.000/10).
- Removidos gráficos Recharts do Dashboard (evolução 14 dias e barras de cursos) a pedido do usuário; "Cursos mais vendidos" agora é ranking em lista; origem+campanha no mesmo card.

## 2026-09 — Relatórios executivos
- Simplificada exclusivamente a página `/relatorios`: removidos gráficos de curso, categoria, campanha e origem.
- Mantido somente o gráfico "Evolução das matrículas" e adicionados KPIs, destaques e rankings tabulares para decisão comercial.
- Verificado em build de produção e em prévia desktop/mobile, incluindo troca para o filtro de 7 dias sem overflow horizontal.
