import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import {developmentContext} from "./auth.js";

const PUBLIC=["/health"];
export async function registerAuth(app:FastifyInstance){
 app.addHook("onRequest",async(request:FastifyRequest,reply:FastifyReply)=>{
  if(PUBLIC.includes(request.url.split("?")[0]))return;
  if(process.env.NODE_ENV==="production"&&!request.headers.authorization){return reply.code(401).send({error:"Authentication required"});}
  request.context=developmentContext();
 });
}
