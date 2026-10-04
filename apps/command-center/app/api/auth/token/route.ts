import {auth} from "../../../../lib/auth-server";

export const dynamic="force-dynamic";

export async function GET(){
  const result=await auth.token();
  if(result.error||!result.data?.token){
    return Response.json({error:result.error?.message??"Authentication required"},{status:401});
  }
  return Response.json({token:result.data.token});
}
