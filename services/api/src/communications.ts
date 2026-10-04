import type {Broadcast,MessageDelivery,Role} from "@fieldos/types";
import {Pool} from "pg";

const pool=process.env.DATABASE_URL?new Pool({connectionString:process.env.DATABASE_URL}):null;
const broadcasts:Broadcast[]=[];
const deliveries:MessageDelivery[]=[];

export async function listBroadcasts(){
 if(!pool)return broadcasts;
 const {rows}=await pool.query(`select id,title,body,audience_role as "audienceRole",status,created_at as "createdAt",published_at as "publishedAt" from broadcasts where organization_id=$1 order by created_at desc`,[process.env.DEV_ORGANIZATION_ID]);
 return rows;
}
export async function createBroadcast(title:string,body:string,audienceRole?:Role){
 const now=new Date().toISOString();
 if(!pool){const b:Broadcast={id:crypto.randomUUID(),title,body,audienceRole,status:"draft",createdAt:now};broadcasts.unshift(b);return b;}
 const {rows}=await pool.query(`insert into broadcasts(organization_id,created_by,title,body,audience_role) values($1,$2,$3,$4,$5) returning id,title,body,audience_role as "audienceRole",status,created_at as "createdAt",published_at as "publishedAt"`,[process.env.DEV_ORGANIZATION_ID,process.env.DEV_USER_ID,title,body,audienceRole??null]);
 return rows[0];
}
export async function publishBroadcast(id:string){
 const now=new Date().toISOString();
 if(!pool){
  const b=broadcasts.find(x=>x.id===id);if(!b)return null;b.status="published";b.publishedAt=now;
  const targets=broadcasts.length?[]:[]; void targets;
  return b;
 }
 const client=await pool.connect();
 try{
  await client.query("begin");
  const b=await client.query(`update broadcasts set status='published',published_at=now() where id=$1 and organization_id=$2 returning id,title,body,audience_role as "audienceRole",status,created_at as "createdAt",published_at as "publishedAt"`,[id,process.env.DEV_ORGANIZATION_ID]);
  if(!b.rows[0]){await client.query("rollback");return null;}
  await client.query(`insert into message_deliveries(broadcast_id,user_id) select $1,id from users where organization_id=$2 and active=true and ($3::role_key is null or role=$3::role_key) on conflict do nothing`,[id,process.env.DEV_ORGANIZATION_ID,b.rows[0].audienceRole??null]);
  await client.query("commit");
  return b.rows[0];
 }catch(e){await client.query("rollback");throw e}finally{client.release()}
}
export async function listMyDeliveries(userId:string){
 if(!pool)return deliveries.filter(x=>x.userId===userId);
 const {rows}=await pool.query(`select id,broadcast_id as "broadcastId",user_id as "userId",status,delivered_at as "deliveredAt",acknowledged_at as "acknowledgedAt" from message_deliveries where user_id=$1 order by created_at desc`,[userId]);
 return rows;
}
export async function acknowledgeDelivery(id:string,userId:string){
 if(!pool){const d=deliveries.find(x=>x.id===id&&x.userId===userId);if(!d)return null;d.status="acknowledged";d.acknowledgedAt=new Date().toISOString();return d;}
 const {rows}=await pool.query(`update message_deliveries set status='acknowledged',acknowledged_at=now() where id=$1 and user_id=$2 returning id,broadcast_id as "broadcastId",user_id as "userId",status,delivered_at as "deliveredAt",acknowledged_at as "acknowledgedAt"`,[id,userId]);
 return rows[0]??null;
}
