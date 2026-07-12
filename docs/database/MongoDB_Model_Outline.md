# TransitOps MongoDB Model Outline

This document refines the existing MongoDB database design foundation for TransitOps without changing the application architecture. It is intended as the implementation-ready database blueprint for the next phase.

## Design Principles

- Use MongoDB collections with clear ownership boundaries.
- Use ObjectId references for relationships between collections.
- Avoid embedding large or frequently updated arrays inside parent documents.
- Keep operational collections auditable with timestamps and actor references.
- Use soft delete only where historical traceability is important.
- Enforce business rules through validation and application-level constraints.

## Core Collections

- roles
- users
- vehicle_types
- vehicles
- drivers
- trips
- fuel_logs
- maintenance_logs
- expenses
- notifications
- audit_logs
- trip_status_history

## Relationship Strategy

- Use ObjectId references for parent-child and many-to-one relationships.
- Keep references to the most frequently queried entities, especially vehicle, driver, and trip.
- Avoid circular references between collections.
- Keep lookup data such as roles and vehicle types separate for reuse.

---

## 1. roles

### Purpose
Stores reusable role definitions for RBAC and permission grouping.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| name | String | Yes | None | Unique, trimmed, non-empty | Role name such as admin or dispatcher. |
| permissions | Array<String> | Yes | [] | Unique values | Permission list associated with the role. |
| description | String | No | '' | Max length reasonable | Human-readable summary. |
| isActive | Boolean | No | true | Boolean | Whether the role is enabled. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- unique index on name
- index on isActive

### Referenced Collections
- None

### Business Rules
- Roles must be unique.
- Roles should remain reusable for users and authorization checks.

### Future Scalability Notes
- Can expand to support permission groups and tenant-scoped RBAC later.

---

## 2. users

### Purpose
Stores application users and their authentication identity.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| fullName | String | Yes | None | Trimmed, non-empty | User display name. |
| email | String | Yes | None | Unique, valid email format | Primary email address. |
| passwordHash | String | Yes | None | Non-empty | Hashed password. |
| roleId | ObjectId | Yes | None | Must reference roles | Reference to the assigned role. |
| phoneNumber | String | No | '' | Valid phone pattern if present | Contact number. |
| isActive | Boolean | No | true | Boolean | Account enabled status. |
| lastLoginAt | Date | No | null | ISO date | Last successful login. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |
| deletedAt | Date | No | null | ISO date | Soft-delete marker. |

### Indexes
- unique index on email
- index on roleId
- index on isActive
- index on createdAt

### Referenced Collections
- roles

### Business Rules
- Email must be unique.
- A user must have a valid role reference.
- Disabled users cannot be used for active operations.

### Future Scalability Notes
- Can later support multi-tenant access and profile preferences.

---

## 3. vehicle_types

### Purpose
Stores reusable vehicle classification values such as bus, truck, or van.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| name | String | Yes | None | Unique, trimmed, non-empty | Vehicle category name. |
| description | String | No | '' | String | Category description. |
| isActive | Boolean | No | true | Boolean | Flag for active categories. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- unique index on name
- index on isActive

### Referenced Collections
- None

### Business Rules
- Vehicle type names must be unique.

### Future Scalability Notes
- Can later support type-specific configuration rules.

---

## 4. vehicles

### Purpose
Stores fleet vehicles and their operational availability.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| registrationNumber | String | Yes | None | Unique, trimmed, non-empty | Unique fleet registration number. |
| vehicleTypeId | ObjectId | Yes | None | Must reference vehicle_types | Category reference. |
| make | String | Yes | None | Trimmed, non-empty | Manufacturer name. |
| model | String | Yes | None | Trimmed, non-empty | Vehicle model. |
| yearOfManufacture | Number | No | null | Integer and plausible range | Manufacture year. |
| capacityWeightKg | Number | Yes | None | Positive number | Maximum payload capacity. |
| status | String | No | available | Enum-like string | Operational status. |
| isActive | Boolean | No | true | Boolean | Vehicle active flag. |
| currentTripId | ObjectId | No | null | Must reference trips if present | Currently assigned trip reference. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |
| deletedAt | Date | No | null | ISO date | Soft-delete marker. |

### Indexes
- unique index on registrationNumber
- index on vehicleTypeId
- index on status
- index on isActive
- index on currentTripId
- compound index on status + isActive

### Referenced Collections
- vehicle_types
- trips

### Business Rules
- Registration number must be unique.
- A vehicle cannot have more than one active trip.
- A vehicle under maintenance cannot be assigned.
- A retired vehicle cannot be assigned.
- Trip cargo cannot exceed vehicle capacity.

### Future Scalability Notes
- Can later support telematics, fuel efficiency profiles, and inspection history.

---

## 5. drivers

### Purpose
Stores driver profiles and licensing details.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| userId | ObjectId | No | null | Must reference users if present | Optional linked user account. |
| employeeNumber | String | Yes | None | Unique, trimmed, non-empty | Internal employee number. |
| fullName | String | Yes | None | Trimmed, non-empty | Driver full name. |
| licenseNumber | String | Yes | None | Unique, trimmed, non-empty | Driver license number. |
| licenseExpiryDate | Date | Yes | None | Must be a future or valid date | Driver license expiry. |
| phoneNumber | String | No | '' | Valid phone pattern if present | Driver contact number. |
| address | String | No | '' | String | Driver address. |
| isActive | Boolean | No | true | Boolean | Driver active flag. |
| currentTripId | ObjectId | No | null | Must reference trips if present | Currently assigned trip reference. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |
| deletedAt | Date | No | null | ISO date | Soft-delete marker. |

### Indexes
- unique index on employeeNumber
- unique index on licenseNumber
- index on userId
- index on isActive
- index on licenseExpiryDate
- compound index on isActive + licenseExpiryDate

### Referenced Collections
- users
- trips

### Business Rules
- License number must be unique.
- A driver cannot have more than one active trip.
- A driver with an expired license cannot be assigned.

### Future Scalability Notes
- Can later support driver shift schedules and performance records.

---

## 6. trips

### Purpose
Stores trip records for route assignments and operations.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| vehicleId | ObjectId | Yes | None | Must reference vehicles | Assigned vehicle. |
| driverId | ObjectId | Yes | None | Must reference drivers | Assigned driver. |
| routeName | String | Yes | None | Trimmed, non-empty | Route name. |
| origin | String | Yes | None | Trimmed, non-empty | Start location. |
| destination | String | Yes | None | Trimmed, non-empty | End location. |
| scheduledStartAt | Date | Yes | None | ISO date | Planned start time. |
| scheduledEndAt | Date | Yes | None | ISO date | Planned end time. |
| actualStartAt | Date | No | null | ISO date | Actual start time. |
| actualEndAt | Date | No | null | ISO date | Actual end time. |
| cargoWeightKg | Number | No | 0 | Non-negative number | Cargo weight. |
| revenueAmount | Number | No | 0 | Non-negative number | Trip revenue. |
| status | String | No | planned | Enum-like string | Trip lifecycle status. |
| notes | String | No | '' | String | Operational notes. |
| createdBy | ObjectId | No | null | Must reference users if present | User who created the trip. |
| updatedBy | ObjectId | No | null | Must reference users if present | User who last updated the trip. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- index on vehicleId
- index on driverId
- index on status
- index on scheduledStartAt
- compound index on vehicleId + status + scheduledStartAt
- compound index on driverId + status + scheduledStartAt

### Referenced Collections
- vehicles
- drivers
- users

### Business Rules
- Trips must always reference valid vehicle and driver documents.
- Vehicle and driver cannot be assigned to more than one active trip at a time.
- Cargo weight cannot exceed assigned vehicle capacity.
- Revenue cannot be negative.

### Future Scalability Notes
- Can later support geofencing, stop points, and event logs.

---

## 7. fuel_logs

### Purpose
Stores fuel entries associated with trips.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| tripId | ObjectId | Yes | None | Must reference trips | Related trip. |
| fuelDate | Date | Yes | None | ISO date | Fuel entry date. |
| fuelType | String | No | diesel | Enum-like string | Fuel type. |
| quantityLiters | Number | Yes | None | Positive number | Fuel quantity. |
| costAmount | Number | No | 0 | Non-negative number | Fuel cost. |
| odometerReading | Number | No | null | Non-negative number | Odometer reading. |
| notes | String | No | '' | String | Additional notes. |
| createdBy | ObjectId | No | null | Must reference users if present | Entry creator. |
| updatedBy | ObjectId | No | null | Must reference users if present | Last updater. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- index on tripId
- index on fuelDate
- compound index on tripId + fuelDate

### Referenced Collections
- trips
- users

### Business Rules
- Fuel logs must reference an existing trip.
- Fuel cost cannot be negative.

### Future Scalability Notes
- Can later support vendor and station metadata.

---

## 8. maintenance_logs

### Purpose
Stores maintenance events for vehicles.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| vehicleId | ObjectId | Yes | None | Must reference vehicles | Related vehicle. |
| maintenanceDate | Date | Yes | None | ISO date | Maintenance date. |
| maintenanceType | String | Yes | None | Trimmed, non-empty | Maintenance category. |
| description | String | No | '' | String | Detail of work done. |
| costAmount | Number | No | 0 | Non-negative number | Maintenance cost. |
| status | String | No | scheduled | Enum-like string | Maintenance lifecycle. |
| notes | String | No | '' | String | Additional notes. |
| createdBy | ObjectId | No | null | Must reference users if present | Entry creator. |
| updatedBy | ObjectId | No | null | Must reference users if present | Last updater. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- index on vehicleId
- index on status
- index on maintenanceDate
- compound index on vehicleId + status + maintenanceDate

### Referenced Collections
- vehicles
- users

### Business Rules
- Maintenance records must reference an existing vehicle.
- Maintenance cost cannot be negative.
- A vehicle under maintenance cannot be assigned to a trip.

### Future Scalability Notes
- Can later store parts inventory and service schedules.

---

## 9. expenses

### Purpose
Stores operational expenses associated with vehicles and trips.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| vehicleId | ObjectId | Yes | None | Must reference vehicles | Related vehicle. |
| tripId | ObjectId | No | null | Must reference trips if present | Optional trip relation. |
| expenseType | String | No | misc | Enum-like string | Expense category. |
| expenseDate | Date | Yes | None | ISO date | Expense date. |
| amount | Number | Yes | None | Non-negative number | Expense amount. |
| description | String | No | '' | String | Expense summary. |
| notes | String | No | '' | String | Additional notes. |
| createdBy | ObjectId | No | null | Must reference users if present | Entry creator. |
| updatedBy | ObjectId | No | null | Must reference users if present | Last updater. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- index on vehicleId
- index on tripId
- index on expenseDate
- compound index on vehicleId + expenseDate

### Referenced Collections
- vehicles
- trips
- users

### Business Rules
- Every expense must reference a vehicle.
- Amount cannot be negative.

### Future Scalability Notes
- Can later support invoice attachment and approval workflow references.

---

## 10. notifications

### Purpose
Stores user-facing notifications for fleet events.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| userId | ObjectId | Yes | None | Must reference users | Notification recipient. |
| type | String | No | system_notice | Enum-like string | Notification category. |
| title | String | Yes | None | Trimmed, non-empty | Notification title. |
| message | String | Yes | None | Trimmed, non-empty | Notification body. |
| isRead | Boolean | No | false | Boolean | Read status. |
| metadata | Object | No | {} | JSON object | Optional structured payload. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |
| updatedAt | Date | No | now | ISO date | Update timestamp. |

### Indexes
- index on userId
- index on isRead
- index on createdAt
- compound index on userId + isRead + createdAt

### Referenced Collections
- users

### Business Rules
- Notifications should target existing users.

### Future Scalability Notes
- Can later support delivery channels and scheduled reminders.

---

## 11. audit_logs

### Purpose
Stores traceable records for system changes and compliance review.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| entityType | String | Yes | None | Trimmed, non-empty | Entity being changed. |
| entityId | ObjectId | Yes | None | Valid ObjectId | Entity identifier. |
| action | String | Yes | None | Trimmed, non-empty | Change action. |
| performedBy | ObjectId | No | null | Must reference users if present | Actor performing the change. |
| details | Object | No | {} | JSON object | Change payload. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |

### Indexes
- index on entityType
- index on entityId
- index on performedBy
- compound index on entityType + entityId + createdAt

### Referenced Collections
- users

### Business Rules
- Audit records should support operations review and troubleshooting.

### Future Scalability Notes
- Can later be archived or partitioned for scale.

---

## 12. trip_status_history

### Purpose
Tracks the lifecycle of a trip by recording status transitions over time.

### Fields

| Field | Data Type | Required | Default | Validation Rules | Description |
|---|---|---|---|---|---|
| _id | ObjectId | Yes | Auto | N/A | Primary key. |
| tripId | ObjectId | Yes | None | Must reference trips | Parent trip. |
| status | String | Yes | None | Enum-like string | Status at this transition. |
| changedAt | Date | No | now | ISO date | Transition time. |
| changedBy | ObjectId | No | null | Must reference users if present | User responsible for change. |
| notes | String | No | '' | String | Optional transition detail. |
| createdAt | Date | No | now | ISO date | Creation timestamp. |

### Indexes
- index on tripId
- index on status
- compound index on tripId + changedAt

### Referenced Collections
- trips
- users

### Business Rules
- Each change should preserve history for auditing and operational reporting.

### Future Scalability Notes
- Can later support workflow transitions and automation rules.

---

## Indexing Summary

### Primary Indexes
- Unique indexes on email, registrationNumber, employeeNumber, licenseNumber, role name, and vehicle type name.

### Recommended Secondary Indexes
- status, isActive, createdAt, scheduledStartAt, licenseExpiryDate, maintenanceDate, expenseDate.

### Composite Indexes
- vehicles: status + isActive
- drivers: isActive + licenseExpiryDate
- trips: vehicleId + status + scheduledStartAt
- trips: driverId + status + scheduledStartAt
- maintenance_logs: vehicleId + status + maintenanceDate
- notifications: userId + isRead + createdAt
- audit_logs: entityType + entityId + createdAt

### Why These Indexes Matter
- They improve lookups for active fleet visibility, dispatch filtering, maintenance scheduling, and audit queries.
- They help support dashboards and operational search without scanning the full collection.

---

## Business Rule Summary

- Vehicle registration numbers must be unique.
- Driver license numbers must be unique.
- A vehicle cannot have multiple active trips.
- A driver cannot have multiple active trips.
- A vehicle under maintenance cannot be assigned.
- A trip cargo weight cannot exceed assigned vehicle capacity.
- Driver license must remain valid for assignment.
- Revenue cannot be negative.
- Fuel cost cannot be negative.
- Maintenance cost cannot be negative.

## Improvements Made

- Added explicit collection coverage for roles, vehicle_types, notifications, audit_logs, and trip_status_history.
- Added field-level validation guidance and defaults for each collection.
- Added ObjectId-based relationship notes for every collection.
- Added index recommendations and compound index guidance.
- Clarified business rules and future scalability notes for each collection.

## Summary of Improvements

### New fields added
- Added currentTripId to vehicles and drivers to reflect active assignment state.
- Added status history support through trip_status_history.
- Added metadata to notifications for structured event payloads.
- Added deletedAt soft-delete support for users, vehicles, and drivers.

### Validation improvements
- Standardized validation rules around non-empty strings, unique identifiers, positive numeric values, and ISO dates.
- Defined explicit rules for registration number, license number, trip cargo, revenue, fuel cost, and maintenance cost.

### New indexes
- Added unique indexes for registration numbers, employee numbers, license numbers, and role names.
- Added composite indexes for active trip and maintenance lookups.
- Added indexes for notifications and audit history queries.

### Relationship improvements
- Clarified ObjectId references between users, roles, vehicles, drivers, trips, fuel logs, maintenance logs, expenses, notifications, and audit logs.
- Ensured references follow a parent-child direction to reduce circularity.

### Business rule improvements
- Explicitly captured rules for active trip exclusivity, maintenance assignment restrictions, cargo capacity, valid driver license status, and non-negative operational costs.
