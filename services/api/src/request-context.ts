import type {Role} from "@fieldos/types";
import type {FastifyRequest} from "fastify";

export interface RequestContext{organizationId:string;userId:string;role:Role;authUserId?:string}

declare module "fastify"{interface FastifyRequest{context?:RequestContext;authUserId?:string}}

export function getContext(request:FastifyRequest):RequestContext{
 if(!request.context)throw new Error("Unauthenticated request");
 return request.context;
}

export function requireRole(context:RequestContext,allowed:Role[]){
 if(!allowed.includes(context.role))throw new Error("Forbidden");
}
