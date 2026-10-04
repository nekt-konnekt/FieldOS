import * as SQLite from "expo-sqlite";

export type LocalTask={id:string;title:string;description?:string;status:string;updatedAt:string};

let dbPromise:ReturnType<typeof SQLite.openDatabaseAsync>|undefined;
export function db(){dbPromise??=SQLite.openDatabaseAsync("fieldos.db");return dbPromise}

export async function initDb(){
 const database=await db();
 await database.execAsync(`create table if not exists tasks(id text primary key,title text not null,description text,status text not null,updated_at text not null);
 create table if not exists sync_queue(id integer primary key autoincrement,operation_id text not null unique,task_id text not null,status text not null,created_at text not null);`);
}

export async function saveTasks(tasks:LocalTask[]){
 const database=await db();
 for(const task of tasks) await database.runAsync("insert or replace into tasks(id,title,description,status,updated_at) values(?,?,?,?,?)",task.id,task.title,task.description??null,task.status,task.updatedAt);
}

export async function readTasks():Promise<LocalTask[]>{
 const database=await db();
 return database.getAllAsync<LocalTask>("select id,title,description,status,updated_at as updatedAt from tasks order by updated_at desc");
}

export async function queueStatusChange(taskId:string,status:string){
 const database=await db();
 const operationId=crypto.randomUUID();
 await database.runAsync("insert into sync_queue(operation_id,task_id,status,created_at) values(?,?,?,?)",operationId,taskId,status,new Date().toISOString());
 await database.runAsync("update tasks set status=?,updated_at=? where id=?",status,new Date().toISOString(),taskId);
 return operationId;
}

export async function pendingChanges(){
 const database=await db();
 return database.getAllAsync<{id:number;operation_id:string;task_id:string;status:string}>("select id,operation_id,task_id,status from sync_queue order by id");
}

export async function removeChange(id:number){
 const database=await db();
 await database.runAsync("delete from sync_queue where id=?",id);
}
