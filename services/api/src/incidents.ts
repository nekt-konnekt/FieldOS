import type {Incident,IncidentSeverity,IncidentStatus} from "@fieldos/types";
import {Pool} from "pg";

const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL}):null;
const memory:Incident[]=[];

export async function listIncidents(organizationId:string){if(!pool)return memory;const {rows}=await pool.query(`select id,title,description,severity,status,reporter_id as "reporterId",assigned_to as "assignedTo",scope_type as "scopeType",scope_id as "scopeId",created_at as "createdAt",updated_at as "updatedAt",resolved_at as "resolvedAt" from incidents where organization_id=$1 order by case when severity='critical' then 0 when severity='high' then 1 else 2 end,created_at desc`,[organizationId]);return rows;}
export async function createIncident(organizationId:string,userId:string,title:string,description:string,severity:IncidentSeverity){
 const now=new Date().toISOString();
 if(!pool){const i:Incident={id:crypto.randomUUID(),title,description,severity,status:"open",reporterId:userId,createdAt:now,updatedAt:now};memory.unshift(i);return i;}
 const {rows}=await pool.query(`insert into incidents(organization_id,reporter_id,title,description,severity) values($1,$2,$3,$4,$5) returning id,title,description,severity,status,reporter_id as "reporterId",assigned_to as "assignedTo",scope_type as "scopeType",scope_id as "scopeId",created_at as "createdAt",updated_at as "updatedAt",resolved_at as "resolvedAt"`,[organizationId,userId,title,description,severity]);return rows[0];
}
export async function updateIncident(organizationId:string,userId:string,id:string,status:IncidentStatus,assignedTo?:string,clientOperationId?:string){
 if(!pool){const i=memory.find(x=>x.id===id);if(!i)return null;i.status=status;i.assignedTo=assignedTo??i.assignedTo;i.updatedAt=new Date().toISOString();if(status==="resolved")i.resolvedAt=i.updatedAt;return i;}
 const client=await pool.connect();
 try{await client.query("begin");if(clientOperationId){const existing=await client.query("select id from incident_events where client_operation_id=$1",[clientOperationId]);if(existing.rowCount){const {rows}=await client.query(`select id,title,description,severity,status,reporter_id as "reporterId",assigned_to as "assignedTo",scope_type as "scopeType",scope_id as "scopeId",created_at as "createdAt",updated_at as "updatedAt",resolved_at as "resolvedAt" from incidents where id=$1`,[id]);await client.query("commit");return rows[0]??null;}}const {rows}=await client.query(`update incidents set status=$2,assigned_to=coalesce($3,assigned_to),updated_at=now(),resolved_at=case when $2='resolved' then now() else resolved_at end where id=$1 and organization_id=$4 returning id,title,description,severity,status,reporter_id as "reporterId",assigned_to as "assignedTo",scope_type as "scopeType",scope_id as "scopeId",created_at as "createdAt",updated_at as "updatedAt",resolved_at as "resolvedAt"`,[id,status,assignedTo??null,organizationId]);if(!rows[0]){await client.query("rollback");return null;}await client.query("insert into incident_events(incident_id,actor_id,event_type,payload,client_operation_id) values($1,$2,$3,$4,$5)",[id,userId,"status_changed",JSON.stringify({status,assignedTo}),clientOperationId??null]);await client.query("commit");return rows[0];}catch(e){await client.query("rollback");throw e}finally{client.release()}
}
