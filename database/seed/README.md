# Seed System

The database seed system is organized as modular scripts so that it is easy to maintain and understand.

## Seed Order
1. roles
2. vehicle_types
3. users
4. vehicles
5. drivers
6. trips
7. fuel_logs
8. maintenance_logs
9. expenses
10. notifications

## Execution
Run the main seed script:

```bash
node database/seed/seedDatabase.js
```

The script connects to MongoDB using the backend environment configuration and seeds the database in dependency order.
