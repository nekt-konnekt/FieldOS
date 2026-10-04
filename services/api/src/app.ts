import Fastify from "fastify";
import cors from "@fastify/cors";
import type {ApiHealth,Task,Role} from "@fieldos/types";
import {closeDb,createTask,listTasks,updateTaskStatus,checkDatabase} from "./db.js";
import {requiredText,validStatus} from "./validation.js";
import {acknowledgeDelivery,createBroadcast,listBroadcasts,listMyDeliveries,publishBroadcast} from "./communications.js";
import {createIncident,listIncidents,updateIncident} from "./incidents.js";
import {registerAuth} from "./auth-middleware.js";
import {getContext} from "./request-context.js";
import type {IncidentSeverity,IncidentStatus} from "@fieldos/types";

export const app=Fastify({logger:true});
const allowedOrigins=process.env.CORS_ORIGINS?.split(",").map(v=>v.trim()).filter(Boolean);
await app.register(cors,{origin:process.env.NODE_ENV==="production"?(allowedOrigins??[]):true});
await registerAuth(app);

app.get("/health",async():Promise<ApiHealth & {databaseConfigured:boolean;databaseHealthy:boolean}>=>{
 const configured=Boolean(process.env.DATABASE_URL);
 const healthy=configured?await checkDatabase():false;
 return {ok:healthy,service:"fieldos-api",version:"0.3.0",databaseConfigured:configured,databaseHealthy:healthy};
});
app.get("/api/v1/tasks",async(request)=>listTasks(getContext(request).organizationId));
app.get("/api/v1/incidents",async(request)=>listIncidents(getContext(request).organizationId));
app.post<{Body:{title:string;description:string;severity:IncidentSeverity}}>("/api/v1/incidents",async(req,reply)=>{if(!requiredText(req.body.title,160)||!requiredText(req.body.description,4000)||!["low","medium","high","critical"].includes(req.body.severity))return reply.code(400).send({error:"invalid incident"});const ctx=getContext(req);return reply.code(201).send(await createIncident(ctx.organizationId,ctx.userId,req.body.title,req.body.description,req.body.severity));});
app.patch<{Params:{id:string};Body:{status:IncidentStatus;assignedTo?:string;clientOperationId?:string}}>("/api/v1/incidents/:id",async(req,reply)=>{if(!["open","acknowledged","investigating","resolved","dismissed"].includes(req.body.status))return reply.code(400).send({error:"invalid incident status"});const ctx=getContext(req);const incident=await updateIncident(ctx.organizationId,ctx.userId,req.params.id,req.body.status,req.body.assignedTo,req.body.clientOperationId);return incident?reply.send(incident):reply.code(404).send({error:"Incident not found"});});
app.post<{Body:Pick<Task,"title"|"description"|"assigneeId"|"scopeType"|"scopeId"|"dueAt">}>("/api/v1/tasks",async(req,reply)=>{if(!requiredText(req.body.title))return reply.code(400).send({error:"title is required"});if(req.body.description&&!requiredText(req.body.description,2000))return reply.code(400).send({error:"description is invalid"});const ctx=getContext(req);return reply.code(201).send(await createTask(ctx.organizationId,req.body));});
app.get("/api/v1/broadcasts",async(request)=>listBroadcasts(getContext(request).organizationId));
app.post<{Body:{title:string;body:string;audienceRole?:Role}}>("/api/v1/broadcasts",async(req,reply)=>{if(!requiredText(req.body.title,160)||!requiredText(req.body.body,4000))return reply.code(400).send({error:"title and body are required"});const ctx=getContext(req);return reply.code(201).send(await createBroadcast(ctx.organizationId,ctx.userId,req.body.title,req.body.body,req.body.audienceRole));});
app.post<{Params:{id:string}}>("/api/v1/broadcasts/:id/publish",async(req,reply)=>{const b=await publishBroadcast(getContext(req).organizationId,req.params.id);return b?reply.send(b):reply.code(404).send({error:"Broadcast not found"});});
app.get("/api/v1/me/deliveries",async(request)=>listMyDeliveries(getContext(request).userId));
app.post<{Params:{id:string}}>("/api/v1/deliveries/:id/acknowledge",async(req,reply)=>{const d=await acknowledgeDelivery(req.params.id,getContext(req).userId);return d?reply.send(d):reply.code(404).send({error:"Delivery not found"});});
app.patch<{Params:{id:string};Body:{status:Task["status"];clientOperationId?:string}}>("/api/v1/tasks/:id",async(req,reply)=>{if(!validStatus(req.body.status))return reply.code(400).send({error:"invalid status"});const ctx=getContext(req);const task=await updateTaskStatus(ctx.organizationId,req.params.id,req.body.status,req.body.clientOperationId);return task?reply.send(task):reply.code(404).send({error:"Task not found"});});
