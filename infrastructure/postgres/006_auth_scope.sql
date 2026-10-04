create table user_scopes(
 user_id uuid not null references users(id) on delete cascade,
 scope_type scope_type not null,
 scope_id uuid not null,
 created_at timestamptz not null default now(),
 primary key(user_id,scope_type,scope_id)
);
create index user_scopes_scope_idx on user_scopes(scope_type,scope_id,user_id);
create index users_org_active_idx on users(organization_id,active);
