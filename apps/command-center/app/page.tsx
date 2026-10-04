"use client";
import {useEffect,useState} from "react";
type Task={id:string;title:string;description?:string;status:"assigned"|"in_progress"|"completed"|"cancelled";assigneeId?:string;createdAt:string};
type Broadcast={id:string;title:string;body:string;audienceRole?:string;status:"draft"|"published"|"cancelled";createdAt:string;publishedAt?:string};
type Incident={id:string;title:string;description:string;severity:"low"|"medium"|"high"|"critical";status:"open"|"acknowledged"|"investigating"|"resolved"|"dismissed";createdAt:string};
const API=process.env.NEXT_PUBLIC_API_URL??"http://localhost:4000";

export default function CommandCenter(){
 const [tasks,setTasks]=useState<Task[]>([]);
 const [broadcasts,setBroadcasts]=useState<Broadcast[]>([]);
 const [incidents,setIncidents]=useState<Incident[]>([]);
 const [messageTitle,setMessageTitle]=useState("");
 const [messageBody,setMessageBody]=useState("");
 const [incidentTitle,setIncidentTitle]=useState("");
 const [incidentDescription,setIncidentDescription]=useState("");
 const [incidentSeverity,setIncidentSeverity]=useState("medium");
 const [audienceRole,setAudienceRole]=useState("");
 const [title,setTitle]=useState("");
 const [loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);try{const [tr,br]=await Promise.all([fetch(API+"/api/v1/tasks",{cache:"no-store"}),fetch(API+"/api/v1/broadcasts",{cache:"no-store"}),fetch(API+"/api/v1/incidents",{cache:"no-store"})]);setTasks(await tr.json());setBroadcasts(await br.json());setIncidents(await ir.json())}finally{setLoading(false)}};
 const createIncident=async()=>{if(!incidentTitle.trim()||!incidentDescription.trim())return;await fetch(API+"/api/v1/incidents",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:incidentTitle.trim(),description:incidentDescription.trim(),severity:incidentSeverity})});setIncidentTitle("");setIncidentDescription("");await load()};
 const updateIncident=async(id:string,status:Incident["status"])=>{await fetch(API+"/api/v1/incidents/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status,clientOperationId:crypto.randomUUID()})});await load()};
 const createBroadcast=async()=>{if(!messageTitle.trim()||!messageBody.trim())return;await fetch(API+"/api/v1/broadcasts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:messageTitle.trim(),body:messageBody.trim(),audienceRole:audienceRole||undefined})});setMessageTitle("");setMessageBody("");setAudienceRole("");await load()};
 const publish=async(id:string)=>{await fetch(API+"/api/v1/broadcasts/"+id+"/publish",{method:"POST"});await load()};
 useEffect(()=>{void load()},[]);
 const create=async()=>{if(!title.trim())return;await fetch(API+"/api/v1/tasks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:title.trim()})});setTitle("");await load()};
 const update=async(id:string,status:Task["status"])=>{await fetch(API+"/api/v1/tasks/"+id,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({status,clientOperationId:crypto.randomUUID()})});await load()};
 const count=(s:Task["status"])=>tasks.filter(t=>t.status===s).length;
 return <main style={{maxWidth:1100,margin:"0 auto",padding:32,fontFamily:"system-ui"}}>
  <header><p style={{fontSize:12,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase"}}>FieldOS</p><h1>Command Center</h1><p style={{color:"#667085"}}>Coordinate field work and see execution status.</p></header>
  <section style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,margin:"24px 0"}}>{[["Assigned",count("assigned")],["In progress",count("in_progress")],["Completed",count("completed")],["Cancelled",count("cancelled")]].map(([label,value])=><article key={label as string} style={{border:"1px solid #ddd",borderRadius:10,padding:16}}><small>{label}</small><strong style={{display:"block",fontSize:28}}>{value}</strong></article>)}</section>
  <section style={{border:"1px solid #ddd",borderRadius:10,padding:20}}><h2>Create task</h2><div style={{display:"flex",gap:8}}><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Confirm ward coordinator check-in" style={{flex:1,padding:10}}/><button onClick={create}>Assign</button></div></section>
  <section style={{border:"1px solid #ddd",borderRadius:10,padding:20,marginTop:20}}><h2>Broadcast</h2><input value={messageTitle} onChange={e=>setMessageTitle(e.target.value)} placeholder="Message title" style={{width:"100%",padding:10,boxSizing:"border-box",marginBottom:8}}/><textarea value={messageBody} onChange={e=>setMessageBody(e.target.value)} placeholder="Operational message" rows={3} style={{width:"100%",padding:10,boxSizing:"border-box",marginBottom:8}}/><div style={{display:"flex",gap:8}}><select value={audienceRole} onChange={e=>setAudienceRole(e.target.value)} style={{flex:1,padding:10}}><option value="">All active users</option><option value="state_coordinator">State Coordinators</option><option value="lga_coordinator">LGA Coordinators</option><option value="ward_coordinator">Ward Coordinators</option><option value="field_operative">Field Operatives</option></select><button onClick={createBroadcast}>Create</button></div></section>
  <section style={{marginTop:20}}><h2>Field tasks</h2>{loading?<p>Loading...</p>:tasks.length===0?<p style={{color:"#667085"}}>No tasks yet.</p>:tasks.map(t=><article key={t.id} style={{border:"1px solid #ddd",borderRadius:10,padding:16,marginBottom:10}}><strong>{t.title}</strong><p style={{margin:"6px 0",color:"#667085"}}>{t.status}</p>{t.status==="assigned"&&<button onClick={()=>update(t.id,"in_progress")}>Start</button>}{t.status==="in_progress"&&<button onClick={()=>update(t.id,"completed")}>Complete</button>}</article>)}</section>
  <section style={{marginTop:20}}><h2>Communications</h2>{broadcasts.map(b=><article key={b.id} style={{border:"1px solid #ddd",borderRadius:10,padding:16,marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between"}}><strong>{b.title}</strong><small>{b.status}</small></div><p style={{whiteSpace:"pre-wrap"}}>{b.body}</p><small>Audience: {b.audienceRole??"All active users"}</small>{b.status==="draft"&&<div style={{marginTop:10}}><button onClick={()=>publish(b.id)}>Publish</button></div>}</article>)}</section>
 </main>
}
