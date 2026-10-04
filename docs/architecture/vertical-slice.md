# First Vertical Slice

The first FieldOS milestone proves the complete operating loop: command center creates a task, assigns it to a field operative, the mobile client persists it locally, the operative can complete it offline, a queued mutation synchronizes later, the API applies it idempotently, and the command center reflects the result.

## Sync contract
Every client mutation receives a unique client operation ID. The server must treat repeated IDs as the same operation and never apply the same mutation twice.

## Security boundary
Use organization isolation, role-based permissions, geographic scope, encrypted transport, protected device storage, and audit logs. The MVP does not collect NIN, BVN, voter identification numbers, or individualized political preference data.
