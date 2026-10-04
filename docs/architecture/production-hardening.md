# Production hardening

## Current slice

The field loop now persists tasks to PostgreSQL when DATABASE_URL is configured and uses SQLite on the mobile device for offline work.

## Required before live deployment

1. Replace developmentContext with verified authentication middleware.
2. Derive organizationId and userId from the authenticated session, never request input.
3. Apply organization predicates to every database query.
4. Apply geographic scope checks before reading or mutating field tasks.
5. Keep clientOperationId unique per device mutation and retain task_events as the audit trail.
6. Add encrypted mobile storage and secure token storage before production rollout.
7. Add connectivity-aware background sync and retry backoff.
8. Add API and mobile integration tests covering duplicate sync operations and offline replay.
9. Add migration execution to CI/CD and require DATABASE_URL and secrets through the deployment environment.
10. Enable structured audit logging and error monitoring.

## Security boundary

FieldOS should manage operational workforce data. The MVP must not collect NIN, BVN, voter identifiers, or individualized political preference data merely to operate tasks and communications.
