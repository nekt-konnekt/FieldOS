create index if not exists users_org_role_active_idx on users(organization_id,role,active);
create index if not exists tasks_org_assignee_status_idx on tasks(organization_id,assignee_id,status);
create index if not exists tasks_org_updated_idx on tasks(organization_id,updated_at desc);
create index if not exists task_events_operation_idx on task_events(client_operation_id) where client_operation_id is not null;
