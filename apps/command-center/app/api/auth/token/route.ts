import {auth} from "../../../../lib/auth-server";

export const dynamic="force-dynamic";

export async function GET(){
  const result:any=await (auth.token as unknown as ()=>Promise<any>)();
  if(result.error||!result.data?.token){
    return Response.json({error:result.error?.message??"Authentication required"},{status:401});
  }
  return Response.json({token:result.data.token});
}
