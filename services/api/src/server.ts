import {app} from "./app.js";
import {closeDb} from "./db.js";
const shutdown=async()=>{await app.close();await closeDb();process.exit(0)};
process.on("SIGINT",shutdown);process.on("SIGTERM",shutdown);
await app.listen({port:Number(process.env.PORT??4000),host:"0.0.0.0"});
