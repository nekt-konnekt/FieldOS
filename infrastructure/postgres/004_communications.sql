create type broadcast_status as enum ('draft','published','cancelled');
create type delivery_status as enum ('queued','delivered','acknowledged','failed');

create table broadcasts(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references organizations(id) on delete cascade,
 created_by uuid references users(id) on delete set null,
 title text not null,
 body text not null,
 audience_role role_key,
 status broadcast_status not null default 'draft',
 published_at timestamptz,
 created_at timestamptz not null default now()
);

create table message_deliveries(
 id uuid primary key default gen_random_uuid(),
 broadcast_id uuid not null references broadcasts(id) on delete cascade,
 user_id uuid not null references users(id) on delete cascade,
 status delivery_status not null default 'queued',
 delivered_at timestamptz,
 acknowledged_at timestamptz,
 created_at timestamptz not null default now(),
 unique(broadcast_id,user_id)
);

create index broadcasts_org_created_idx on broadcasts(organization_id,created_at desc);
create index message_deliveries_user_status_idx on message_deliveries(user_id,status);
create index message_deliveries_broadcast_status_idx on message_deliveries(broadcast_id,status);
