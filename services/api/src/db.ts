import {Pool,type PoolClient} from "pg";
import type {Task,TaskStatus} from "@fieldos/types";

const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL,max:Number(process.env.DB_POOL_MAX??10),ssl:process.env.DATABASE_SSL==="true"?{rejectUnauthorized:false}:undefined}):null;
const memory:Task[]=[];
const appliedOperations=new Set<string>();
const selectTask=`select id,title,description,status,assignee_id as "assigneeId",scope_type as "scopeType",scope_id as "scopeId",due_at as "dueAt",created_at as "createdAt",updated_at as "updatedAt" from tasks`;

function ensureDb(){if(!pool && process.env.NODE_ENV==="production")throw new Error("Database is not configured");return pool;}
export async function checkDatabase(){if(!pool)return false;try{await pool.query("select 1");return true}catch{return false}}
export async function findFieldUser(authUserId:string){const db=ensureDb();if(!db)return null;const {rows}=await db.query(`select id,organization_id as "organizationId",role,active from users where auth_user_id=$1 limit 1`,[authUserId]);return rows[0]??null;}
export async function listTasks(organizationId:string){const db=ensureDb();if(!db)return memory;const {rows}=await db.query<Task>(selectTask+" where organization_id=$1 order by created_at desc",[organizationId]);return rows;}
export async function createTask(organizationId:string,input:Pick<Task,"title"|"description"|"assigneeId"|"scopeType"|"scopeId"|"dueAt">){
 const db=ensureDb();
 if(!db){const now=new Date().toISOString();const task:Task={id:crypto.randomUUID(),title:input.title,description:input.description,status:"assigned",assigneeId:input.assigneeId,scopeType:input.scopeType,scopeId:input.scopeId,dueAt:input.dueAt,createdAt:now,updatedAt:now};memory.unshift(task);return task;}
 const {rows}=await db.query<Task>(`with inserted as (insert into tasks(organization_id,title,description,assignee_id,scope_type,scope_id,due_at) values($1,$2,$3,$4,$5,$6,$7) returning *) ${selectTask.replace(" from tasks"," from inserted")}`,[organizationId,input.title,input.description??null,input.assigneeId??null,input.scopeType??null,input.scopeId??null,input.dueAt??null]);return rows[0];
}
export async function updateTaskStatus(organizationId:string,id:string,status:TaskStatus,clientOperationId?:string){
 const db=ensureDb();
 if(!db){if(clientOperationId&&appliedOperations.has(clientOperationId))return memory.find(t=>t.id===id)??null;const task=memory.find(t=>t.id===id);if(!task)return null;task.status=status;task.updatedAt=new Date().toISOString();if(clientOperationId)appliedOperations.add(clientOperationId);return task;}
 const client:PoolClient=await db.connect();
 try{
  await client.query("begin");
  if(clientOperationId){const existing=await client.query("select te.task_id from task_events te join tasks t on t.id=te.task_id where te.client_operation_id=$1 and t.organization_id=$2",[clientOperationId,organizationId]);if(existing.rowCount){const {rows}=await client.query<Task>(selectTask+" where id=$1 and organization_id=$2",[id,organizationId]);await client.query("commit");return rows[0]??null;}}
  const {rows}=await client.query<Task>(selectTask+" where id=$1 and organization_id=$2 for update",[id,organizationId]);if(!rows[0]){await client.query("rollback");return null;}
  await client.query("update tasks set status=$3,updated_at=now() where id=$1 and organization_id=$2",[id,organizationId,status]);
  await client.query("insert into task_events(task_id,event_type,payload,client_operation_id) values($1,'status_changed',$2,$3)",[id,JSON.stringify({status}),clientOperationId??null]);
  const result=await client.query<Task>(selectTask+" where id=$1 and organization_id=$2",[id,organizationId]);await client.query("commit");return result.rows[0]??null;
 }catch(error){await client.query("rollback");throw error}finally{client.release()}
}
export async function closeDb(){await pool?.end()}
