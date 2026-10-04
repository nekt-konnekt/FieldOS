import Fastify from "fastify";
import cors from "@fastify/cors";
import type {ApiHealth,Task} from "@fieldos/types";
import {databaseConfigured} from "./db.js";

const app=Fastify({logger:true});
await app.register(cors,{origin:true});

const tasks:Task[]=[];

app.get("/health",async():Promise<ApiHealth & {databaseConfigured:boolean}>=>({ok:true,service:"fieldos-api",version:"0.2.0",databaseConfigured}));
app.get("/api/v1/tasks",async()=>tasks);

app.post<{Body:Pick<Task,"title"|"description"|"assigneeId"|"scopeType"|"scopeId"|"dueAt">}>("/api/v1/tasks",async(req,reply)=>{
 const now=new Date().toISOString();
 const task:Task={id:crypto.randomUUID(),title:req.body.title,description:req.body.description,status:"assigned",assigneeId:req.body.assigneeId,scopeType:req.body.scopeType,scopeId:req.body.scopeId,dueAt:req.body.dueAt,createdAt:now,updatedAt:now};
 tasks.unshift(task);
 return reply.code(201).send(task);
});

app.patch<{Params:{id:string};Body:{status:Task["status"];clientOperationId?:string}}>("/api/v1/tasks/:id",async(req,reply)=>{
 const task=tasks.find(t=>t.id===req.params.id);
 if(!task)return reply.code(404).send({error:"Task not found"});
 task.status=req.body.status;
 task.updatedAt=new Date().toISOString();
 return task;
});

await app.listen({port:Number(process.env.PORT??4000),host:"0.0.0.0"});
