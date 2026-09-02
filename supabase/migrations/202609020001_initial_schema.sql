-- PRIME - persistent data layer. Apply with the Supabase CLI.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'operator');
create type public.enrollment_status as enum (
  'novo_cadastro', 'aguardando_documentos', 'documentacao_completa',
  'pronto_para_enviar', 'enviado_escola', 'matricula_confirmada', 'cancelada'
);
create type public.document_status as enum ('pending', 'received');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null,
  role public.profile_role not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug = lower(slug)),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.course_categories(id),
  name text not null,
  slug text not null unique check (slug = lower(slug)),
  description text,
  workload_hours integer check (workload_hours is null or workload_hours > 0),
  minimum_completion_days integer check (minimum_completion_days is null or minimum_completion_days >= 0),
  maximum_completion_days integer check (maximum_completion_days is null or maximum_completion_days >= 0),
  validity_description text,
  requirements_text text,
  important_notes text,
  repass_amount numeric(12,2) check (repass_amount is null or repass_amount >= 0),
  suggested_price numeric(12,2) check (suggested_price is null or suggested_price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name),
  check (maximum_completion_days is null or minimum_completion_days is null or maximum_completion_days >= minimum_completion_days)
);

create table public.course_required_fields (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  field_key text not null check (field_key ~ '^[a-z][a-z0-9_]*$'),
  label text not null,
  field_type text not null check (field_type in ('text', 'date', 'select', 'textarea', 'phone', 'number')),
  required boolean not null default false,
  placeholder text,
  help_text text,
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, field_key)
);

create table public.course_required_documents (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  document_key text not null check (document_key ~ '^[a-z][a-z0-9_]*$'),
  label text not null,
  required boolean not null default true,
  instructions text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, document_key)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  cpf text not null,
  cpf_normalized text generated always as (regexp_replace(cpf, '\\D', '', 'g')) stored,
  birth_date date,
  phone text,
  email text,
  address text,
  address_number text,
  address_complement text,
  neighborhood text,
  city text,
  state text check (state is null or state ~ '^[A-Z]{2}$'),
  cep text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_cpf_normalized_length check (length(cpf_normalized) = 11),
  unique (owner_id, cpf_normalized)
);

create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique check (slug = lower(slug)),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  channel text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

create sequence public.enrollment_number_seq as bigint start with 1 increment by 1;

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  enrollment_number bigint not null default nextval('public.enrollment_number_seq') unique,
  student_id uuid not null references public.students(id) on delete restrict,
  course_id uuid not null references public.courses(id) on delete restrict,
  campaign_id uuid references public.campaigns(id) on delete set null,
  lead_source_id uuid not null references public.lead_sources(id) on delete restrict,
  status public.enrollment_status not null default 'novo_cadastro',
  sale_price numeric(12,2) not null check (sale_price >= 0),
  suggested_price_snapshot numeric(12,2) check (suggested_price_snapshot is null or suggested_price_snapshot >= 0),
  repass_amount_snapshot numeric(12,2) check (repass_amount_snapshot is null or repass_amount_snapshot >= 0),
  extra_data jsonb not null default '{}'::jsonb check (jsonb_typeof(extra_data) = 'object'),
  internal_notes text not null default '',
  sent_to_school_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enrollment_documents (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  course_required_document_id uuid not null references public.course_required_documents(id) on delete restrict,
  status public.document_status not null default 'pending',
  file_path text,
  original_filename text,
  mime_type text,
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enrollment_id, course_required_document_id),
  check ((file_path is null) = (uploaded_at is null))
);

create table public.monthly_goals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  year integer not null check (year between 2020 and 2200),
  month integer not null check (month between 1 and 12),
  revenue_goal numeric(12,2) not null check (revenue_goal >= 0),
  enrollment_goal integer not null check (enrollment_goal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, year, month)
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, key)
);

create index students_owner_cpf_idx on public.students(owner_id, cpf_normalized);
create index enrollments_owner_created_idx on public.enrollments(owner_id, created_at desc);
create index enrollments_owner_status_idx on public.enrollments(owner_id, status);
create index enrollments_student_idx on public.enrollments(student_id);
create index enrollments_course_idx on public.enrollments(course_id);
create index enrollments_campaign_idx on public.enrollments(campaign_id);
create index enrollments_lead_source_idx on public.enrollments(lead_source_id);
create index enrollment_documents_enrollment_idx on public.enrollment_documents(enrollment_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','course_categories','courses','course_required_fields','course_required_documents','students','lead_sources','campaigns','enrollments','enrollment_documents','monthly_goals','app_settings']
  loop execute format('create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()', table_name, table_name); end loop;
end $$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.course_categories enable row level security;
alter table public.courses enable row level security;
alter table public.course_required_fields enable row level security;
alter table public.course_required_documents enable row level security;
alter table public.students enable row level security;
alter table public.lead_sources enable row level security;
alter table public.campaigns enable row level security;
alter table public.enrollments enable row level security;
alter table public.enrollment_documents enable row level security;
alter table public.monthly_goals enable row level security;
alter table public.app_settings enable row level security;

create policy "profiles read own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "catalog read authenticated" on public.course_categories for select to authenticated using (true);
create policy "catalog categories admin write" on public.course_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "courses read authenticated" on public.courses for select to authenticated using (true);
create policy "courses admin write" on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "course fields read authenticated" on public.course_required_fields for select to authenticated using (true);
create policy "course fields admin write" on public.course_required_fields for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "course documents read authenticated" on public.course_required_documents for select to authenticated using (true);
create policy "course documents admin write" on public.course_required_documents for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "lead sources read authenticated" on public.lead_sources for select to authenticated using (true);
create policy "lead sources admin write" on public.lead_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "students private" on public.students for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "campaigns private" on public.campaigns for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "enrollments private" on public.enrollments for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "enrollment documents private" on public.enrollment_documents for all to authenticated using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.owner_id = auth.uid())) with check (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.owner_id = auth.uid()));
create policy "monthly goals private" on public.monthly_goals for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "app settings private" on public.app_settings for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Private storage: only the authenticated owner may access a folder named with their UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('enrollment-documents', 'enrollment-documents', false, 10485760, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "private enrollment files select" on storage.objects for select to authenticated using (bucket_id = 'enrollment-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private enrollment files insert" on storage.objects for insert to authenticated with check (bucket_id = 'enrollment-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private enrollment files update" on storage.objects for update to authenticated using (bucket_id = 'enrollment-documents' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'enrollment-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "private enrollment files delete" on storage.objects for delete to authenticated using (bucket_id = 'enrollment-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- One transaction: locate/create the student, create or reuse campaign, allocate a sequence number,
-- and initialize the full required-document checklist.
create or replace function public.create_enrollment_with_documents(
  p_student jsonb,
  p_course_id uuid,
  p_sale_price numeric,
  p_lead_source_id uuid,
  p_campaign_name text default null,
  p_extra_data jsonb default '{}'::jsonb,
  p_internal_notes text default '',
  p_document_statuses jsonb default '{}'::jsonb,
  p_update_existing_student boolean default false
) returns public.enrollments
language plpgsql security invoker set search_path = public as $$
declare
  v_owner uuid := auth.uid();
  v_student public.students;
  v_course public.courses;
  v_campaign_id uuid;
  v_enrollment public.enrollments;
  v_cpf text := regexp_replace(coalesce(p_student ->> 'cpf', ''), '\\D', '', 'g');
begin
  if v_owner is null then raise exception 'Authentication required'; end if;
  if length(v_cpf) <> 11 then raise exception 'A valid CPF is required'; end if;
  select * into v_course from public.courses where id = p_course_id and active;
  if not found then raise exception 'Active course not found'; end if;

  select * into v_student from public.students where owner_id = v_owner and cpf_normalized = v_cpf for update;
  if found then
    if p_update_existing_student then
      update public.students set
        full_name = coalesce(nullif(p_student ->> 'full_name', ''), v_student.full_name),
        birth_date = coalesce(nullif(p_student ->> 'birth_date', '')::date, v_student.birth_date),
        phone = coalesce(nullif(p_student ->> 'phone', ''), v_student.phone),
        email = coalesce(nullif(p_student ->> 'email', ''), v_student.email),
        address = coalesce(nullif(p_student ->> 'address', ''), v_student.address),
        address_number = coalesce(nullif(p_student ->> 'address_number', ''), v_student.address_number),
        address_complement = coalesce(nullif(p_student ->> 'address_complement', ''), v_student.address_complement),
        neighborhood = coalesce(nullif(p_student ->> 'neighborhood', ''), v_student.neighborhood),
        city = coalesce(nullif(p_student ->> 'city', ''), v_student.city),
        state = coalesce(nullif(p_student ->> 'state', ''), v_student.state),
        cep = coalesce(nullif(p_student ->> 'cep', ''), v_student.cep)
      where id = v_student.id returning * into v_student;
    end if;
  else
    insert into public.students (owner_id, full_name, cpf, birth_date, phone, email, address, address_number, address_complement, neighborhood, city, state, cep)
    values (v_owner, nullif(p_student ->> 'full_name', ''), v_cpf, nullif(p_student ->> 'birth_date', '')::date, nullif(p_student ->> 'phone', ''), nullif(p_student ->> 'email', ''), nullif(p_student ->> 'address', ''), nullif(p_student ->> 'address_number', ''), nullif(p_student ->> 'address_complement', ''), nullif(p_student ->> 'neighborhood', ''), nullif(p_student ->> 'city', ''), nullif(p_student ->> 'state', ''), nullif(p_student ->> 'cep', '')) returning * into v_student;
  end if;

  if nullif(trim(p_campaign_name), '') is not null then
    insert into public.campaigns (owner_id, name, channel) values (v_owner, trim(p_campaign_name), (select name from public.lead_sources where id = p_lead_source_id))
    on conflict (owner_id, name) do update set updated_at = now()
    returning id into v_campaign_id;
  end if;

  insert into public.enrollments (owner_id, student_id, course_id, campaign_id, lead_source_id, sale_price, suggested_price_snapshot, repass_amount_snapshot, extra_data, internal_notes)
  values (v_owner, v_student.id, v_course.id, v_campaign_id, p_lead_source_id, p_sale_price, v_course.suggested_price, v_course.repass_amount, coalesce(p_extra_data, '{}'::jsonb), coalesce(p_internal_notes, ''))
  returning * into v_enrollment;

  insert into public.enrollment_documents (enrollment_id, course_required_document_id, status)
  select v_enrollment.id, d.id, case when coalesce((p_document_statuses ->> d.id::text)::boolean, false) then 'received'::public.document_status else 'pending'::public.document_status end
  from public.course_required_documents d where d.course_id = v_course.id and d.active;
  return v_enrollment;
end; $$;

revoke all on function public.create_enrollment_with_documents(jsonb, uuid, numeric, uuid, text, jsonb, text, jsonb, boolean) from public;
grant execute on function public.create_enrollment_with_documents(jsonb, uuid, numeric, uuid, text, jsonb, text, jsonb, boolean) to authenticated;
