"use client";
import {useEffect,useState} from "react";
type Task={id:string;title:string;description?:string;status:"assigned"|"in_progress"|"completed"|"cancelled";assigneeId?:string;createdAt:string};
const API=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000";

export default function CommandCenter(){
 const [tasks,setTasks]=useState<Task[]>([]);
 const [title,setTitle]=useState("");
 const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{const r=await fetch(API+"/api/v1/tasks",{cache:"no-store"});setTasks(await r.json())}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 const create=async()=>{if(!title.trim())return;await fetch(API+"/api/v1/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:title.trim()})});setTitle("");await load()};
 const update=async(id:string,status:Task["status"])=>{await fetch(API+"/api/v1/tasks/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status,clientOperationId:crypto.randomUUID()})});await load()};
 const count=(s:Task["status"])=>tasks.filter(t=>t.status===s).length;
 return <main style={{maxWidth:1100,margin:"0 auto",padding:32,fontFamily:"system-ui"}}>
  <header><p style={{fontSize:12,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase"}}>FieldOS</p><h1>Command Center</h1><p style={{color:"#667085"}}>Coordinate field work and see execution status.</p></header>
  <section style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,margin:"24px 0"}}>{[["Assigned",count("assigned")],["In progress",count("in_progress")],["Completed",count("completed")],["Cancelled",count("cancelled")]].map(([label,value])=><article key={label as string} style={{border:"1px solid #ddd",borderRadius:10,padding:16}}><small>{label}</small><strong style={{display:"block",fontSize:28}}>{value}</strong></article>)}</section>
  <section style={{border:"1px solid #ddd",borderRadius:10,padding:20}}><h2>Create task</h2><div style={{display:"flex",gap:8}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Confirm ward coordinator check-in" style={{flex:1,padding:10}}/><button onClick={create}>Assign</button></div></section>
  <section style={{marginTop:20}}><h2>Field tasks</h2>{loading?<p>Loading...</p>:tasks.length===0?<p style={{color:"#667085"}}>No tasks yet.</p>:tasks.map(t=><article key={t.id} style={{border:"1px solid #ddd",borderRadius:10,padding:16,marginBottom:10}}><strong>{t.title}</strong><p style={{margin:"6px 0",color:"#667085"}}>{t.status}</p>{t.status==="assigned"&&<button onClick={()=>update(t.id,"in_progress")}>Start</button>}{t.status==="in_progress"&&<button onClick={()=>update(t.id,"completed")}>Complete</button>}</article>)}</section>
 </main>
}
