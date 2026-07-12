# TransitOps

TransitOps is an enterprise-grade smart fleet and transport management platform initialized as a scalable full-stack application foundation.

## Project Scope

This repository currently contains only professional project initialization artifacts and architecture scaffolding. No application implementation, APIs, frontend pages, database schema, or Prisma models are included.

## Repository Structure

```text
TransitOps/
├── .github/
│   └── workflows/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── utils/
│       └── App.jsx
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── shared/
│   │   ├── utils/
│   │   ├── validations/
│   │   └── server.js
│   ├── prisma/
│   └── package.json
├── database/
│   ├── prisma/
│   ├── migrations/
│   ├── seed/
│   ├── schema/
│   └── scripts/
├── datasets/
├── docs/
│   ├── architecture/
│   ├── database/
│   ├── api/
│   ├── deployment/
│   └── reports/
├── scripts/
├── tests/
├── README.md
└── .gitignore
```

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

### Data & Auth
- PostgreSQL
- Prisma
- JWT
- bcrypt
- Zod
- dotenv

### Package Manager
- npm

## Initial Folder Responsibilities

### frontend/
- Holds the React application shell, routing, UI features, shared components, and client-side state organization.
- Uses feature-based organization for scalability.

### backend/
- Hosts server configuration, application bootstrap, feature modules, shared services, middleware, and validation.
- Keeps business logic isolated by domain and feature.

### database/
- Prepared for migrations, seed scripts, and database-related operational artifacts.

### docs/
- Stores architecture decisions, workflow guidance, standards, and onboarding documentation.

### datasets/
- Intended for raw ingestion files and reference data during project execution.

### scripts/
- Reserved for automation scripts, environment bootstrapping, and maintenance tasks.

### tests/
- Reserved for automated tests and future end-to-end test coverage.

## Recommended Dependency Set

### Frontend
- react
- react-dom
- react-router-dom
- axios
- tailwindcss
- postcss
- autoprefixer
- vite
- @vitejs/plugin-react
- vitest
- eslint
- eslint-plugin-react
- eslint-plugin-react-hooks

### Backend
- express
- cors
- helmet
- morgan
- dotenv
- jsonwebtoken
- bcrypt
- zod
- prisma
- pg
- axios
- nodemon
- jest
- supertest

## Development Scripts

### Frontend
- npm run dev
- npm run build
- npm run preview
- npm run lint
- npm run test

### Backend
- npm run dev
- npm run start
- npm run lint
- npm run test

## Environment Templates

- Frontend: frontend/.env.example
- Backend: backend/.env.example

## Project Workflow

1. Create feature branches from main.
2. Keep changes scoped to a single domain or concern.
3. Document architectural decisions in docs/architecture.
4. Validate code quality before merging.
5. Use pull requests for review and integration.

## Coding Standards

- Use clear, descriptive names.
- Keep modules focused and modular.
- Prefer dependency injection and service boundaries.
- Write readable, maintainable code.
- Add comments only when they improve clarity.
- Keep configuration externalized.

## Naming Conventions

- Use camelCase for variables and functions.
- Use PascalCase for React components and classes.
- Use kebab-case for file and folder names.
- Use UPPER_SNAKE_CASE for environment variables.
- Use feature-based folder names where domain context is clear.

## Git Branching Strategy

- main: production-ready baseline
- develop: integration branch for next release
- feature/*: new features and enhancements
- bugfix/*: defect fixes
- hotfix/*: urgent production corrections
- chore/*: maintenance and internal tooling

## Current Deliverables

- Standardized enterprise project structure
- Database design specification blueprint in docs/database/Database_Design_Specification.md
- Architecture and documentation foundation for future implementation

## Next Step

The repository is now prepared for database implementation planning and subsequent schema generation work.
