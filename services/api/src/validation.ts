import type {TaskStatus} from "@fieldos/types";

const statuses=new Set<TaskStatus>(["assigned","in_progress","completed","cancelled"]);
export function validStatus(value:unknown):value is TaskStatus{return typeof value==="string"&&statuses.has(value as TaskStatus);}
export function requiredText(value:unknown,max=240){return typeof value==="string"&&value.trim().length>0&&value.length<=max;}
