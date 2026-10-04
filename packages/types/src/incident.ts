export type IncidentStatus="open"|"acknowledged"|"investigating"|"resolved"|"dismissed";
export type IncidentSeverity="low"|"medium"|"high"|"critical";
export interface Incident{id:string;title:string;description:string;severity:IncidentSeverity;status:IncidentStatus;reporterId?:string;assignedTo?:string;scopeType?:"state"|"lga"|"ward"|"polling_unit";scopeId?:string;createdAt:string;updatedAt:string;resolvedAt?:string}
