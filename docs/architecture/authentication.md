# Authentication and authorization

FieldOS separates identity, organization membership, role, and geographic scope.

## Request flow

1. Authentication verifies the user's identity.
2. The authenticated identity resolves to a FieldOS user.
3. Membership establishes the organization.
4. Role establishes the allowed operation class.
5. user_scopes establishes the geographic boundary.
6. Repository queries must apply organization and scope predicates.

## Production requirement

The current API middleware intentionally fails closed for unauthenticated production requests, but it does not yet validate a JWT or session token. The next implementation must integrate the chosen identity provider and derive RequestContext from verified claims or a server-side session.

Do not accept organizationId, userId, or role from client request bodies.

## Roles

- national_admin
- state_coordinator
- lga_coordinator
- ward_coordinator
- field_operative

## Scope

Scope is represented separately from role so that two users with the same role can operate over different geographic assignments.
