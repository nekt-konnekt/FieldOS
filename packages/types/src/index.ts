export type Role="national_admin"|"state_coordinator"|"lga_coordinator"|"ward_coordinator"|"field_operative";
export type TaskStatus="assigned"|"in_progress"|"completed"|"cancelled";
export interface Task{id:string;title:string;description?:string;status:TaskStatus;assigneeId?:string;scopeType?:"state"|"lga"|"ward"|"polling_unit";scopeId?:string;dueAt?:string;createdAt:string;updatedAt:string}
export interface ApiHealth{ok:boolean;service:"fieldos-api";version:string}
