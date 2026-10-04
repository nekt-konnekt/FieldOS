import type {Role} from "@fieldos/types";

export interface RequestContext{
 organizationId:string;
 userId:string;
 role:Role;
}

const roles=new Set<Role>(["national_admin","state_coordinator","lga_coordinator","ward_coordinator","field_operative"]);

export function developmentContext():RequestContext{
 return {
  organizationId:process.env.DEV_ORGANIZATION_ID??"00000000-0000-0000-0000-000000000001",
  userId:process.env.DEV_USER_ID??"00000000-0000-0000-0000-000000000101",
  role:"field_operative"
 };
}

/**
 * Production identity must come from a trusted authentication layer.
 * Client-supplied copies of these headers must be stripped by that layer.
 */
export function contextFromTrustedHeaders(headers:Record<string,unknown>):RequestContext{
 const organizationId=String(headers["x-fieldos-organization-id"]??"");
 const userId=String(headers["x-fieldos-user-id"]??"");
 const role=String(headers["x-fieldos-role"]??"") as Role;
 if(!organizationId||!userId||!roles.has(role))throw new Error("Invalid authenticated context");
 return {organizationId,userId,role};
}

export function getRequestContext(headers:Record<string,unknown>):RequestContext{
 if(process.env.NODE_ENV!=="production")return developmentContext();
 return contextFromTrustedHeaders(headers);
}

export function requireRole(context:RequestContext,allowed:Role[]){
 if(!allowed.includes(context.role))throw new Error("Forbidden");
}
