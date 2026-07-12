# TransitOps MongoDB Model Outline

This document defines the scalable MongoDB model structure intended for the next implementation phase of TransitOps.

## Core collections

- users
- roles
- vehicles
- drivers
- trips
- maintenance_logs
- fuel_logs
- expenses

## Relationship strategy

- Use ObjectId references for relational ownership between collections.
- Keep indexes on frequently queried fields such as status, role, dates, and lookup keys.
- Store audit-friendly timestamps on every operational collection.
- Use soft-delete semantics where historical visibility is required.

## Model notes

- User: authentication identity and role assignment.
- Role: reusable permission grouping for RBAC.
- Vehicle: fleet assets and operational state.
- Driver: driver profiles and license metadata.
- Trip: route execution and assignment marker.
- MaintenanceLog: vehicle maintenance events.
- FuelLog: trip-based fuel entries.
- Expense: operating cost entries linked to vehicles and trips.
