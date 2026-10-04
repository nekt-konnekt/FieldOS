"use client";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
import {authClient} from "../../../lib/auth-client";

export default function SignInPage(){
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError("");const result=await authClient.signIn.email({email,password});if(result.error){setError(result.error.message??"Sign in failed");setBusy(false);return}router.replace("/");router.refresh()};
 return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}><form onSubmit={submit} style={{width:"100%",maxWidth:420,background:"#fff",border:"1px solid #ddd",borderRadius:12,padding:28,boxSizing:"border-box"}}><p style={{fontSize:12,fontWeight:800,letterSpacing:1.2,textTransform:"uppercase"}}>FieldOS</p><h1>Command Center</h1><p style={{color:"#667085"}}>Sign in with your FieldOS account.</p><label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",boxSizing:"border-box",padding:10,margin:"6px 0 14px"}}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:"block",width:"100%",boxSizing:"border-box",padding:10,margin:"6px 0 14px"}}/></label>{error&&<p style={{color:"#b42318"}}>{error}</p>}<button disabled={busy} type="submit" style={{width:"100%",padding:11}}>{busy?"Signing in...":"Sign in"}</button></form></main>
}
