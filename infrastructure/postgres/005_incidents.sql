create type incident_status as enum ('open','acknowledged','investigating','resolved','dismissed');
create type incident_severity as enum ('low','medium','high','critical');

create table incidents(
 id uuid primary key default gen_random_uuid(),
 organization_id uuid not null references organizations(id) on delete cascade,
 reporter_id uuid references users(id) on delete set null,
 title text not null,
 description text not null,
 severity incident_severity not null default 'medium',
 status incident_status not null default 'open',
 scope_type scope_type,
 scope_id uuid,
 assigned_to uuid references users(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 resolved_at timestamptz
);

create table incident_events(
 id uuid primary key default gen_random_uuid(),
 incident_id uuid not null references incidents(id) on delete cascade,
 actor_id uuid references users(id) on delete set null,
 event_type text not null,
 payload jsonb not null default '{}'::jsonb,
 client_operation_id text,
 created_at timestamptz not null default now()
);

create unique index incident_events_operation_uidx on incident_events(client_operation_id) where client_operation_id is not null;
create index incidents_org_status_idx on incidents(organization_id,status,severity);
create index incidents_assignee_idx on incidents(assigned_to,status);
create index incident_events_incident_idx on incident_events(incident_id,created_at);
