export type RequestContext={organizationId:string;userId:string;role:"national_admin"|"state_coordinator"|"lga_coordinator"|"ward_coordinator"|"field_operative"};

export function developmentContext():RequestContext{
 return {
  organizationId:process.env.DEV_ORGANIZATION_ID??"00000000-0000-0000-0000-000000000001",
  userId:process.env.DEV_USER_ID??"00000000-0000-0000-0000-000000000101",
  role:"field_operative"
 };
}
