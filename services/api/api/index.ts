import type {VercelRequest,VercelResponse} from "@vercel/node";
import {app} from "../src/app.js";

let ready:Promise<void>|undefined;

export default async function handler(req:VercelRequest,res:VercelResponse){
  ready ??= app.ready();
  await ready;
  app.server.emit("request",req,res);
}
