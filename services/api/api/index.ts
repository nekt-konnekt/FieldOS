import {app} from "../src/app.js";

let ready:Promise<void>|undefined;

export default async function handler(req:any,res:any){
  ready ??= app.ready();
  await ready;
  app.server.emit("request",req,res);
}
