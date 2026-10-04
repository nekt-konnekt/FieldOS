import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import {getRequestContext} from "./auth.js";

const PUBLIC=["/health"];

export async function registerAuth(app:FastifyInstance){
 app.addHook("onRequest",async(request:FastifyRequest,reply:FastifyReply)=>{
  if(PUBLIC.includes(request.url.split("?")[0]))return;
  try{
   request.context=getRequestContext(request.headers as Record<string,unknown>);
  }catch{
   return reply.code(401).send({error:"Authentication required"});
  }
 });
}
