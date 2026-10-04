insert into organizations(id,name) values('00000000-0000-0000-0000-000000000001','FieldOS Demo') on conflict (id) do nothing;
insert into users(id,organization_id,full_name,phone,role) values('00000000-0000-0000-0000-000000000101','00000000-0000-0000-0000-000000000001','Demo Field Operative',null,'field_operative') on conflict (id) do nothing;
