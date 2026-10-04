import {Pool,type PoolClient} from "pg";
import type {Task,TaskStatus} from "@fieldos/types";

const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==="true"?{rejectUnauthorized:false}:undefined}):null;
const memory:Task[]=[];

const selectTask=`select id,title,description,status,assignee_id as "assigneeId",scope_type as "scopeType",scope_id as "scopeId",due_at as "dueAt",created_at as "createdAt",updated_at as "updatedAt" from tasks`;

export async function listTasks(){
 if(!pool)return memory;
 const {rows}=await pool.query<Task>(selectTask+" order by created_at desc");
 return rows;
}
export async function createTask(input:Pick<Task,"title"|"description"|"assigneeId"|"scopeType"|"scopeId"|"dueAt">){
 if(!pool){const now=new Date().toISOString();const task:Task={id:crypto.randomUUID(),title:input.title,description:input.description,status:"assigned",assigneeId:input.assigneeId,scopeType:input.scopeType,scopeId:input.scopeId,dueAt:input.dueAt,createdAt:now,updatedAt:now};memory.unshift(task);return task;}
 const org=process.env.DEV_ORGANIZATION_ID;
 if(!org)throw new Error("DEV_ORGANIZATION_ID is required with DATABASE_URL");
 const {rows}=await pool.query<Task>(selectTask+` where id=(insert into tasks(organization_id,title,description,assignee_id,scope_type,scope_id,due_at) values($1,$2,$3,$4,$5,$6,$7) returning id)`,[org,input.title,input.description??null,input.assigneeId??null,input.scopeType??null,input.scopeId??null,input.dueAt??null]);
 return rows[0];
}
export async function updateTaskStatus(id:string,status:TaskStatus,clientOperationId?:string){
 if(!pool){const task=memory.find(t=>t.id===id);if(!task)return null;task.status=status;task.updatedAt=new Date().toISOString();return task;}
 const client:PoolClient=await pool.connect();
 try{
  await client.query("begin");
  if(clientOperationId){const existing=await client.query("select id from task_events where client_operation_id=$1",[clientOperationId]);if(existing.rowCount){const {rows}=await client.query<Task>(selectTask+" where id=$1",[id]);await client.query("commit");return rows[0]??null;}}
  const {rows}=await client.query<Task>(selectTask+" where id=$1 for update",[id]);
  if(!rows[0]){await client.query("rollback");return null;}
  const updated=await client.query<Task>(selectTask+" where id=$1",[id]);
  await client.query("update tasks set status=$2,updated_at=now() where id=$1",[id,status]);
  await client.query("insert into task_events(task_id,event_type,payload,client_operation_id) values($1,'status_changed',$2,$3)",[id,JSON.stringify({status}),clientOperationId??null]);
  const result=await client.query<Task>(selectTask+" where id=$1",[id]);
  await client.query("commit");
  return result.rows[0]??updated.rows[0];
 }catch(error){await client.query("rollback");throw error;}finally{client.release();}
}
export async function closeDb(){await pool?.end();}
