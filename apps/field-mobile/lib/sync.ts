import {pendingChanges,removeChange,saveTasks} from "./db";
const API=process.env.EXPO_PUBLIC_API_URL??"http://localhost:4000";

export async function pullTasks(){
 const response=await fetch(API+"/api/v1/tasks");
 if(!response.ok)throw new Error("Task pull failed");
 const tasks=await response.json();
 await saveTasks(tasks);
 return tasks;
}

export async function syncPending(){
 const pending=await pendingChanges();
 let synced=0;
 for(const change of pending){
  const response=await fetch(API+"/api/v1/tasks/"+change.task_id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status:change.status,clientOperationId:change.operation_id})});
  if(!response.ok)break;
  await removeChange(change.id);
  synced++;
 }
 return synced;
}
