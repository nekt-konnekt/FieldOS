import type {Role} from "./index.js";
export type BroadcastStatus="draft"|"published"|"cancelled";
export type DeliveryStatus="queued"|"delivered"|"acknowledged"|"failed";
export interface Broadcast{id:string;title:string;body:string;audienceRole?:Role;status:BroadcastStatus;createdAt:string;publishedAt?:string}
export interface MessageDelivery{id:string;broadcastId:string;userId:string;status:DeliveryStatus;deliveredAt?:string;acknowledgedAt?:string}
