# TransitOps Database Design Specification

## 1. Purpose

This document defines the enterprise database blueprint for TransitOps, a smart fleet and transport management system. It is intended to guide future PostgreSQL schema implementation, Prisma model generation, and backend module design without introducing implementation code or SQL.

This specification assumes a normalized relational design following PostgreSQL best practices and 3NF principles.

## 2. Design Principles

- Use PostgreSQL-native data types and constraints.
- Use snake_case for all database identifiers.
- Use plural table names.
- Use surrogate primary keys for stability, with semantic identifiers preserved where useful.
- Store audit fields on operational tables.
- Use soft delete only for tables where historical traceability is important.
- Enforce business rules through constraints and application-level validation.
- Preserve referential integrity through foreign keys.
- Optimize for fleet operations, trip scheduling, maintenance tracking, expense monitoring, and role-based access.

## 3. Core Design Assumptions

The system is designed around the following entities:
- Users and roles
- Vehicles and vehicle status
- Drivers and licensing
- Trips and trip states
- Maintenance events
- Fuel logs
- Expenses
- Notifications

These entities form the operational backbone of fleet management and must support both transactional workflows and reporting.

## 4. Suggested PostgreSQL Enumerations

### 4.1 vehicle_status
Suggested values:
- available
- in_transit
- under_maintenance
- retired
- inactive

### 4.2 trip_status
Suggested values:
- planned
- in_progress
- completed
- cancelled
- delayed

### 4.3 maintenance_status
Suggested values:
- scheduled
- in_progress
- completed
- cancelled

### 4.4 fuel_type
Suggested values:
- diesel
- petrol
- cng
- electric
- hybrid

### 4.5 expense_type
Suggested values:
- toll
- parking
- repair
- insurance
- permit
- salary
- misc

### 4.6 user_role
Suggested values:
- admin
- fleet_manager
- dispatcher
- driver
- accountant
- viewer

### 4.7 notification_type
Suggested values:
- trip_assignment
- trip_delay
- maintenance_due
- license_expiring
- vehicle_alert
- expense_approval
- system_notice

## 5. Table Inventory

The proposed core tables are:
- users
- user_roles
- vehicles
- drivers
- trips
- trip_assignments
- maintenance_records
- fuel_logs
- expenses
- notifications
- audit_logs

## 6. Detailed Table Specifications

### 6.1 users

#### Table Purpose
Stores application users and authentication principals for the platform.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---:|---|---|---|
| user_id | BIGSERIAL | No | N/A | 1001 | Primary key. |
| username | VARCHAR(100) | No | N/A | jdoe | Unique login name. |
| email | VARCHAR(255) | No | N/A | jdoe@transitops.com | Unique email address. |
| password_hash | VARCHAR(255) | No | N/A | $2b$12$abc... | Hashed password. |
| full_name | VARCHAR(255) | No | N/A | John Doe | Display name. |
| role | user_role | No | user | driver | User role. |
| is_active | BOOLEAN | No | true | true | Account active status. |
| last_login_at | TIMESTAMPTZ | Yes | NULL | 2026-07-12T10:00:00Z | Last successful login time. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| deleted_at | TIMESTAMPTZ | Yes | NULL | NULL | Soft delete marker. |

#### Primary Key
- user_id

#### Foreign Keys
- None

#### Unique Constraints
- username
- email

#### Check Constraints
- email should be in a valid email format.
- role must be one of the defined enum values.

#### Indexes
- Primary: user_id
- Secondary: email, username, role, is_active

#### Business Rules
- A user must have a valid role.
- Disabled users cannot authenticate.

#### Relationships
- Users may be linked to drivers, notifications, and audit entries.

#### Sample Record
- A fleet manager account for operations oversight.

#### Backend Modules using this table
- Authentication module
- User profile module
- Authorization module
- Notification module

---

### 6.2 drivers

#### Table Purpose
Stores driver profiles and licensing information.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| driver_id | BIGSERIAL | No | N/A | 2001 | Primary key. |
| user_id | BIGINT | Yes | NULL | 1001 | Optional link to system user account. |
| employee_number | VARCHAR(50) | No | N/A | D-1001 | Internal employee identifier. |
| full_name | VARCHAR(255) | No | N/A | Alice Brown | Driver name. |
| license_number | VARCHAR(100) | No | N/A | LIC-998877 | Unique license number. |
| license_expiry_date | DATE | No | N/A | 2027-12-31 | License expiry date. |
| phone_number | VARCHAR(30) | Yes | NULL | +1-555-0100 | Driver contact. |
| address | TEXT | Yes | NULL | 10 Fleet Road | Address. |
| is_active | BOOLEAN | No | true | true | Whether the driver is active. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| deleted_at | TIMESTAMPTZ | Yes | NULL | NULL | Soft delete marker. |

#### Primary Key
- driver_id

#### Foreign Keys
- user_id -> users.user_id

#### Unique Constraints
- license_number
- employee_number

#### Check Constraints
- license_expiry_date must be a valid date.

#### Indexes
- Primary: driver_id
- Secondary: user_id, license_number, is_active, license_expiry_date

#### Business Rules
- Driver license number must be unique.
- Driver with expired license cannot start a trip.
- A driver cannot have two active trips simultaneously.

#### Relationships
- One driver can be assigned to many trips.
- One driver may have many notifications.

#### Sample Record
- A licensed driver assigned to scheduled routes.

#### Backend Modules using this table
- Driver management module
- Trip assignment module
- Authorization and dispatch module

---

### 6.3 vehicles

#### Table Purpose
Stores fleet vehicles and their operational availability.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| vehicle_id | BIGSERIAL | No | N/A | 3001 | Primary key. |
| registration_number | VARCHAR(50) | No | N/A | DL-01-AB-1234 | Unique registration number. |
| vehicle_type | VARCHAR(100) | No | N/A | Bus | Vehicle classification. |
| make | VARCHAR(100) | No | N/A | Volvo | Manufacturer. |
| model | VARCHAR(100) | No | N/A | 9700 | Model. |
| year_of_manufacture | INTEGER | Yes | NULL | 2022 | Production year. |
| capacity_weight_kg | NUMERIC(10,2) | No | N/A | 12000.00 | Payload capacity. |
| status | vehicle_status | No | available | available | Current vehicle status. |
| is_active | BOOLEAN | No | true | true | Availability flag. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| deleted_at | TIMESTAMPTZ | Yes | NULL | NULL | Soft delete marker. |

#### Primary Key
- vehicle_id

#### Foreign Keys
- None

#### Unique Constraints
- registration_number

#### Check Constraints
- capacity_weight_kg must be positive.
- year_of_manufacture must be a valid four-digit year.

#### Indexes
- Primary: vehicle_id
- Secondary: registration_number, status, is_active

#### Business Rules
- Vehicle registration number must be unique.
- Vehicle cannot have two active trips.
- Vehicle under maintenance cannot be assigned.
- Vehicle retired cannot be assigned.

#### Relationships
- One vehicle can be assigned to many trips.
- One vehicle can have many maintenance records, fuel logs, and expenses.

#### Sample Record
- A bus available for route operation.

#### Backend Modules using this table
- Vehicle fleet module
- Dispatch module
- Maintenance module

---

### 6.4 trips

#### Table Purpose
Stores trip records for transport assignments and route movement.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| trip_id | BIGSERIAL | No | N/A | 4001 | Primary key. |
| vehicle_id | BIGINT | No | N/A | 3001 | Assigned vehicle. |
| driver_id | BIGINT | No | N/A | 2001 | Assigned driver. |
| route_name | VARCHAR(255) | No | N/A | North Corridor | Route label. |
| origin | VARCHAR(255) | No | N/A | Hub A | Start location. |
| destination | VARCHAR(255) | No | N/A | Hub B | End location. |
| scheduled_start_at | TIMESTAMPTZ | No | N/A | 2026-07-12T08:00:00Z | Planned start. |
| scheduled_end_at | TIMESTAMPTZ | No | N/A | 2026-07-12T12:00:00Z | Planned end. |
| actual_start_at | TIMESTAMPTZ | Yes | NULL | 2026-07-12T08:10:00Z | Actual start. |
| actual_end_at | TIMESTAMPTZ | Yes | NULL | 2026-07-12T12:05:00Z | Actual end. |
| cargo_weight_kg | NUMERIC(10,2) | No | 0.00 | 9000.00 | Cargo weight. |
| revenue_amount | NUMERIC(12,2) | No | 0.00 | 1500.00 | Trip revenue. |
| status | trip_status | No | planned | planned | Trip lifecycle status. |
| notes | TEXT | Yes | NULL | NULL | Additional notes. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| created_by | BIGINT | Yes | NULL | 1001 | User who created the trip. |
| updated_by | BIGINT | Yes | NULL | 1001 | User who last updated the trip. |

#### Primary Key
- trip_id

#### Foreign Keys
- vehicle_id -> vehicles.vehicle_id
- driver_id -> drivers.driver_id
- created_by -> users.user_id
- updated_by -> users.user_id

#### Unique Constraints
- None at the table level; business rules enforce uniqueness of active assignments.

#### Check Constraints
- cargo_weight_kg must be non-negative.
- revenue_amount must be non-negative.
- scheduled_end_at must be greater than or equal to scheduled_start_at.

#### Indexes
- Primary: trip_id
- Secondary: vehicle_id, driver_id, status, scheduled_start_at

#### Composite Indexes
- (vehicle_id, status, scheduled_start_at)
- (driver_id, status, scheduled_start_at)

#### Business Rules
- Trips must always reference existing vehicles and drivers.
- Vehicle cannot have two active trips.
- Driver cannot have two active trips.
- Trip cargo weight cannot exceed vehicle capacity.
- Trip revenue cannot be negative.

#### Relationships
- A trip belongs to one vehicle and one driver.
- A trip can generate multiple fuel logs and expenses.

#### Sample Record
- A scheduled inter-city route assigned to a vehicle and driver.

#### Backend Modules using this table
- Dispatch module
- Trip management module
- Billing and reporting module

---

### 6.5 trip_assignments

#### Table Purpose
Tracks assignment history for trips and operational personnel.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| trip_assignment_id | BIGSERIAL | No | N/A | 5001 | Primary key. |
| trip_id | BIGINT | No | N/A | 4001 | Trip reference. |
| driver_id | BIGINT | No | N/A | 2001 | Driver reference. |
| assigned_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T08:00:00Z | Assignment timestamp. |
| assigned_by | BIGINT | Yes | NULL | 1001 | User who assigned the driver. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |

#### Primary Key
- trip_assignment_id

#### Foreign Keys
- trip_id -> trips.trip_id
- driver_id -> drivers.driver_id
- assigned_by -> users.user_id

#### Unique Constraints
- None required beyond primary key.

#### Check Constraints
- None beyond standard validity.

#### Indexes
- Primary: trip_assignment_id
- Secondary: trip_id, driver_id

#### Business Rules
- Assignment history should preserve driver changes over time.

#### Relationships
- One trip may have several driver assignments over time.

#### Sample Record
- A historical record showing the driver that was assigned to a trip.

#### Backend Modules using this table
- Dispatch history module
- Audit and reporting module

---

### 6.6 maintenance_records

#### Table Purpose
Stores maintenance events for vehicles.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| maintenance_id | BIGSERIAL | No | N/A | 6001 | Primary key. |
| vehicle_id | BIGINT | No | N/A | 3001 | Vehicle under maintenance. |
| maintenance_date | DATE | No | N/A | 2026-07-10 | Maintenance date. |
| maintenance_type | VARCHAR(100) | No | N/A | service | Maintenance category. |
| description | TEXT | Yes | NULL | Oil change and brake inspection | Details. |
| cost_amount | NUMERIC(12,2) | No | 0.00 | 350.00 | Maintenance cost. |
| status | maintenance_status | No | scheduled | scheduled | Status of maintenance. |
| notes | TEXT | Yes | NULL | NULL | Additional notes. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| created_by | BIGINT | Yes | NULL | 1001 | User who logged the maintenance. |
| updated_by | BIGINT | Yes | NULL | 1001 | User who updated the maintenance. |

#### Primary Key
- maintenance_id

#### Foreign Keys
- vehicle_id -> vehicles.vehicle_id
- created_by -> users.user_id
- updated_by -> users.user_id

#### Unique Constraints
- None

#### Check Constraints
- cost_amount must be non-negative.

#### Indexes
- Primary: maintenance_id
- Secondary: vehicle_id, status, maintenance_date

#### Business Rules
- Maintenance must always reference an existing vehicle.
- Maintenance cost cannot be negative.
- A vehicle under maintenance cannot be assigned.

#### Relationships
- One vehicle can have many maintenance records.

#### Sample Record
- Scheduled brake service for a vehicle.

#### Backend Modules using this table
- Maintenance module
- Fleet operations module

---

### 6.7 fuel_logs

#### Table Purpose
Records fuel consumption for completed or active trips.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| fuel_log_id | BIGSERIAL | No | N/A | 7001 | Primary key. |
| trip_id | BIGINT | No | N/A | 4001 | Associated trip. |
| fuel_date | DATE | No | N/A | 2026-07-12 | Fuel entry date. |
| fuel_type | fuel_type | No | diesel | diesel | Fuel type. |
| quantity_liters | NUMERIC(8,2) | No | 0.00 | 80.50 | Quantity consumed. |
| cost_amount | NUMERIC(12,2) | No | 0.00 | 120.00 | Fuel cost. |
| odometer_reading | BIGINT | Yes | NULL | 125000 | Odometer reading. |
| notes | TEXT | Yes | NULL | NULL | Notes. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| created_by | BIGINT | Yes | NULL | 1001 | User who logged the reading. |
| updated_by | BIGINT | Yes | NULL | 1001 | User who updated the reading. |

#### Primary Key
- fuel_log_id

#### Foreign Keys
- trip_id -> trips.trip_id
- created_by -> users.user_id
- updated_by -> users.user_id

#### Unique Constraints
- None

#### Check Constraints
- quantity_liters must be positive.
- cost_amount must be non-negative.

#### Indexes
- Primary: fuel_log_id
- Secondary: trip_id, fuel_date

#### Business Rules
- Fuel logs must always reference an existing trip.
- Fuel cost cannot be negative.

#### Relationships
- Each fuel log belongs to one trip.

#### Sample Record
- Diesel re-fuel entry for a completed route.

#### Backend Modules using this table
- Fuel management module
- Trip operations module

---

### 6.8 expenses

#### Table Purpose
Stores operational expenses associated with vehicles and trips.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| expense_id | BIGSERIAL | No | N/A | 8001 | Primary key. |
| vehicle_id | BIGINT | No | N/A | 3001 | Associated vehicle. |
| trip_id | BIGINT | Yes | NULL | 4001 | Optional associated trip. |
| expense_type | expense_type | No | misc | toll | Expense category. |
| expense_date | DATE | No | N/A | 2026-07-12 | Expense date. |
| amount | NUMERIC(12,2) | No | 0.00 | 25.50 | Expense amount. |
| description | TEXT | Yes | NULL | Toll fee | Description. |
| notes | TEXT | Yes | NULL | NULL | Notes. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |
| created_by | BIGINT | Yes | NULL | 1001 | User who recorded the expense. |
| updated_by | BIGINT | Yes | NULL | 1001 | User who updated the expense. |

#### Primary Key
- expense_id

#### Foreign Keys
- vehicle_id -> vehicles.vehicle_id
- trip_id -> trips.trip_id
- created_by -> users.user_id
- updated_by -> users.user_id

#### Unique Constraints
- None

#### Check Constraints
- amount must be non-negative.

#### Indexes
- Primary: expense_id
- Secondary: vehicle_id, trip_id, expense_date

#### Business Rules
- Expenses must always reference an existing vehicle.
- Expense amount cannot be negative.

#### Relationships
- One vehicle can have many expense entries.
- An expense may optionally belong to a trip.

#### Sample Record
- A toll expense incurred during a route.

#### Backend Modules using this table
- Finance module
- Fleet operations module

---

### 6.9 notifications

#### Table Purpose
Stores notifications for operational events and user alerts.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| notification_id | BIGSERIAL | No | N/A | 9001 | Primary key. |
| user_id | BIGINT | No | N/A | 1001 | Target user. |
| notification_type | notification_type | No | system_notice | trip_assignment | Notification category. |
| title | VARCHAR(255) | No | N/A | Trip Assigned | Notification title. |
| message | TEXT | No | N/A | Trip 4001 assigned to you | Notification body. |
| is_read | BOOLEAN | No | false | false | Read status. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |
| updated_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit update time. |

#### Primary Key
- notification_id

#### Foreign Keys
- user_id -> users.user_id

#### Unique Constraints
- None

#### Check Constraints
- title and message must be non-empty.

#### Indexes
- Primary: notification_id
- Secondary: user_id, is_read, created_at

#### Business Rules
- Notifications should be directed to existing users.

#### Relationships
- One user can receive many notifications.

#### Sample Record
- A message alerting a driver about a new trip assignment.

#### Backend Modules using this table
- Notification module
- User engagement module

---

### 6.10 audit_logs

#### Table Purpose
Stores important system events for traceability and security review.

#### Columns

| Column Name | PostgreSQL Data Type | Nullable | Default Value | Example Value | Description |
|---|---|---|---|---|---|
| audit_log_id | BIGSERIAL | No | N/A | 10001 | Primary key. |
| entity_type | VARCHAR(100) | No | N/A | trips | Name of the entity changed. |
| entity_id | BIGINT | No | N/A | 4001 | Identifier of the entity. |
| action | VARCHAR(50) | No | N/A | updated | Operation performed. |
| performed_by | BIGINT | Yes | NULL | 1001 | User who initiated the action. |
| details | JSONB | Yes | NULL | {"status":"completed"} | Context payload. |
| created_at | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | 2026-07-12T09:00:00Z | Audit creation time. |

#### Primary Key
- audit_log_id

#### Foreign Keys
- performed_by -> users.user_id

#### Unique Constraints
- None

#### Check Constraints
- action must be one of a finite set of operations.

#### Indexes
- Primary: audit_log_id
- Secondary: entity_type, entity_id, performed_by, created_at

#### Business Rules
- Audit logs should support traceability for compliance and debugging.

#### Relationships
- May reference users and any business entity.

#### Sample Record
- A trip status update recorded for operations review.

#### Backend Modules using this table
- Audit and compliance module
- Administrative monitoring module

## 7. Relationship Explanation

### 7.1 users -> drivers
A user account may be linked to a driver profile, enabling authentication and role-based workflow integration.

### 7.2 vehicles -> trips
A vehicle can be associated with many trips, but only one active trip at a time.

### 7.3 drivers -> trips
A driver can be associated with many trips, but only one active trip at a time.

### 7.4 trips -> fuel_logs
A trip may generate multiple fuel entries over its lifecycle.

### 7.5 vehicles -> maintenance_records
A vehicle can have many maintenance events over time.

### 7.6 vehicles -> expenses
A vehicle can have many expense records, such as tolls, parking, and repairs.

### 7.7 trips -> expenses
An expense may optionally relate to a trip when it is incurred as part of a trip.

### 7.8 users -> notifications
A notification is directed to a specific user.

### 7.9 users -> audit_logs
A user may be associated with many audit actions.

## 8. Indexing Strategy

### Primary Indexes
- Primary keys on all tables.
- These ensure uniqueness and fast row lookups.

### Secondary Indexes
- Indexes on foreign keys and frequently filtered columns such as:
  - users.email
  - users.role
  - users.is_active
  - drivers.license_number
  - drivers.is_active
  - vehicles.status
  - trips.status
  - trips.scheduled_start_at
  - maintenance_records.vehicle_id
  - fuel_logs.trip_id
  - expenses.vehicle_id
  - notifications.user_id

### Composite Indexes
- (vehicles.status, is_active)
- (drivers.is_active, license_expiry_date)
- (trips.vehicle_id, status, scheduled_start_at)
- (trips.driver_id, status, scheduled_start_at)
- (maintenance_records.vehicle_id, status, maintenance_date)
- (expenses.vehicle_id, expense_date)
- (notifications.user_id, is_read, created_at)

### Why These Are Required
- They improve filtering and reporting performance.
- They accelerate dispatch and assignment workflows.
- They improve maintenance monitoring and expense analysis.
- They support operational dashboards and audit queries.

## 9. Business Rules Summary

- Vehicle registration number must be unique.
- Driver license number must be unique.
- Vehicle cannot have two active trips.
- Driver cannot have two active trips.
- Vehicle under maintenance cannot be assigned.
- Vehicle retired cannot be assigned.
- Driver with expired license cannot start a trip.
- Trip cargo weight cannot exceed vehicle capacity.
- Maintenance cost cannot be negative.
- Fuel cost cannot be negative.
- Trip revenue cannot be negative.
- Trips must always reference existing vehicles and drivers.
- Fuel logs must always reference an existing trip.
- Maintenance must always reference an existing vehicle.
- Expenses must always reference an existing vehicle.

## 10. Suggested Future Scalability Extensions

These tables can be added later without changing the core design:
- route_segments
- stops
- geofences
- trip_events
- driver_attendance
- vehicle_inspections
- invoices
- payment_transactions
- dispatch_rules
- service_packages
- incident_reports
- document_uploads
- weather_alerts
- shift_schedules

## 11. Recommended Module Mapping

The following backend modules are the natural consumers of the proposed schema:
- Authentication and authorization
- User management
- Driver management
- Vehicle fleet management
- Dispatch and trip planning
- Maintenance management
- Fuel management
- Expense management
- Notification services
- Audit and compliance

## 12. Final Notes

This specification provides a detailed architectural blueprint for the database design of TransitOps. It is sufficient to guide later PostgreSQL schema creation and Prisma model definition without requiring additional clarification.
