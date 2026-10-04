import {createRemoteJWKSet,jwtVerify} from "jose";
import type {FastifyInstance,FastifyReply,FastifyRequest} from "fastify";
import {findFieldUser} from "./db.js";

const PUBLIC=["/health"];
const roles=new Set(["national_admin","state_coordinator","lga_coordinator","ward_coordinator","field_operative"]);
let jwks:ReturnType<typeof createRemoteJWKSet>|null=null;

function getJwks(){
 const url=process.env.NEON_AUTH_JWKS_URL;
 if(!url)throw new Error("NEON_AUTH_JWKS_URL is not configured");
 if(!jwks)jwks=createRemoteJWKSet(new URL(url));
 return jwks;
}
export async function registerAuth(app:FastifyInstance){
 app.addHook("onRequest",async(request:FastifyRequest,reply:FastifyReply)=>{
  if(PUBLIC.includes(request.url.split("?")[0]))return;
  try{
   if(process.env.NODE_ENV!=="production"){
    const {getRequestContext}=await import("./auth.js");
    request.context=getRequestContext(request.headers as Record<string,unknown>);
    return;
   }
   const authorization=request.headers.authorization;
   if(!authorization?.startsWith("Bearer "))throw new Error("Missing bearer token");
   const issuer=process.env.NEON_AUTH_ISSUER;
   const {payload}=await jwtVerify(authorization.slice(7),getJwks(),issuer?{issuer}:{});
   if(typeof payload.sub!=="string")throw new Error("Token subject missing");
   const user=await findFieldUser(payload.sub);
   if(!user||!user.active||!roles.has(user.role))throw new Error("User is not provisioned");
   request.context={userId:user.id,organizationId:user.organizationId,role:user.role};
  }catch(error){
   request.log.warn({error},"authentication failed");
   return reply.code(401).send({error:"Authentication required"});
  }
 });
}
