# TransitOps

TransitOps is an enterprise-grade smart fleet and transport operations platform designed for the Odoo Hackathon 2026. The repository now contains a cleaned architecture foundation for authentication, fleet operations, trip workflows, maintenance, fuel tracking, expense handling, and reporting.

## Project Overview

TransitOps focuses on helping fleet operators manage vehicles, drivers, trips, maintenance, fuel usage, expenses, and operational reporting from a single scalable platform. The current repository is intentionally prepared for the next implementation phase rather than shipping business features.

## Team

- Ankush Kumar Singh
- Amardeep Kumar Yadav
- Md Jasim Ansari
- Md Nasim Ansari

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod
- dotenv

### Tooling
- npm
- ESLint
- Jest
- Vitest

## Features in Scope

- Authentication and RBAC-ready structure
- Dashboard module foundation
- Vehicle registry foundation
- Driver management foundation
- Trip management foundation
- Maintenance tracking foundation
- Fuel management foundation
- Expense management foundation
- Reports and analytics foundation

## Repository Structure

```text
TransitOps/
├── .github/workflows/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── constants
│       ├── hooks
│       ├── layouts
│       ├── pages
│       ├── routes
│       ├── services
│       ├── store
│       ├── styles
│       ├── utils
│       └── App.jsx
├── backend/
│   └── src/
│       ├── config
│       ├── controllers
│       ├── middleware
│       ├── models
│       ├── routes
│       ├── services
│       ├── utils
│       └── validations
├── database/
├── datasets/
├── docs/
├── scripts/
├── tests/
├── README.md
└── .gitignore
```

## Installation

1. Clone the repository.
2. Install frontend dependencies:
   - npm install --prefix frontend
3. Install backend dependencies:
   - npm install --prefix backend

## Environment Variables

### Frontend
- Create a copy of frontend/.env.example and adjust values as needed.

### Backend
- Create a copy of backend/.env.example and set:
  - PORT
  - NODE_ENV
  - MONGO_URI
  - JWT_SECRET
  - JWT_EXPIRES_IN
  - BCRYPT_SALT_ROUNDS
  - CORS_ORIGIN

## Running Locally

### Frontend
- npm run dev --prefix frontend

### Backend
- npm run dev --prefix backend

## Future Improvements

- Build complete authentication and authorization flows
- Implement CRUD for fleet and operations modules
- Connect the application to MongoDB Atlas or a local MongoDB instance
- Add analytics dashboards and reporting exports
- Add automated tests and deployment automation

## Coding Standards

- Keep controllers thin and delegate to services.
- Keep business logic in services.
- Keep validation logic in the validation layer.
- Keep routes focused on routing.
- Use descriptive naming and consistent folder structure.
- Prefer reusable components and utilities.
