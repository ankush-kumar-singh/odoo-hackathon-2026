# Database Layer Notes

This folder contains the MongoDB-oriented database foundation for TransitOps.

## Contents
- seed/: seed data definitions and execution script
- schema/: reserved for future schema artifacts
- migrations/: reserved for versioned migration files
- prisma/: reserved for future Prisma-oriented helpers if needed

## Seed Workflow
Run the seeding script from the repository root:

```bash
node database/seed/run-seed.js
```

The script connects to MongoDB using the backend environment configuration and populates the initial TransitOps collections.
