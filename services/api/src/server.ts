import Fastify from "fastify";
import cors from "@fastify/cors";
import type {ApiHealth,Task} from "@fieldos/types";
import {closeDb,createTask,listTasks,updateTaskStatus} from "./db.js";

const app=Fastify({logger:true});
await app.register(cors,{origin:true});
app.get("/health",async():Promise<ApiHealth & {databaseConfigured:boolean}>=>({ok:true,service:"fieldos-api",version:"0.2.0",databaseConfigured:Boolean(process.env.DATABASE_URL)}));
app.get("/api/v1/tasks",async()=>listTasks());
app.post<{Body:Pick<Task,"title"|"description"|"assigneeId"|"scopeType"|"scopeId"|"dueAt">}>("/api/v1/tasks",async(req,reply)=>reply.code(201).send(await createTask(req.body)));
app.patch<{Params:{id:string};Body:{status:Task["status"];clientOperationId?:string}}>("/api/v1/tasks/:id",async(req,reply)=>{const task=await updateTaskStatus(req.params.id,req.body.status,req.body.clientOperationId);return task?reply.send(task):reply.code(404).send({error:"Task not found"});});
const shutdown=async()=>{await app.close();await closeDb();process.exit(0)};
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
await app.listen({port:Number(process.env.PORT??4000),host:"0.0.0.0"});
