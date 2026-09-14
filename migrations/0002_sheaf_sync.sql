create table if not exists sheaf_workspaces (
  user_id text primary key,
  payload text not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
