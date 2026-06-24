# LUCIAN.md - Template

> This file is the source of truth for any AI coding assistant (Lucian Code, Claude Code, Copilot, etc.) working on this project.
> Read this file in full before analyzing, editing, or generating any code.

---

## 1. Project Identity

**Name**: <!-- e.g. my-saas-api -->
**Type**: <!-- e.g. REST API / CLI tool / frontend app / monorepo -->
**Status**: <!-- e.g. Early development / Active / Maintenance -->
**Primary language**: <!-- e.g. TypeScript -->
**Runtime**: <!-- e.g. Node.js 20 -->

**What this project does**:
<!-- One short paragraph. What problem does it solve? Who uses it? -->

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Language | <!-- TypeScript --> |
| Framework | <!-- Express / Fastify / NestJS --> |
| Database | <!-- PostgreSQL / MongoDB / SQLite --> |
| ORM | <!-- Prisma / Drizzle / Mongoose --> |
| Auth | <!-- JWT / OAuth2 / Clerk --> |
| Testing | <!-- Vitest / Jest --> |
| Package manager | <!-- pnpm / npm / yarn --> |
| Deployment | <!-- Docker / Railway / Vercel --> |

---

## 3. Project Structure

<!-- Describe the directory layout. The AI must follow this when placing new files. -->

```
src/
├── routes/         # Route definitions only — no logic here
├── controllers/    # Parse request, call service, return response
├── services/       # All business logic lives here
├── repositories/   # Database access — only place that touches the ORM
├── models/         # Types, interfaces, DTOs
├── middleware/     # Express/Fastify middleware
└── utils/          # Pure helper functions, no side effects
```

**Rule**: when creating a new feature, always follow this structure. Never mix layers.

---

## 4. Code Style

- **Modules**: ES Modules only (`import`/`export`). Never use `require`.
- **Async**: Always `async/await`. Never raw `.then()` chains.
- **Quotes**: Single quotes.
- **Indentation**: 2 spaces.
- **Semicolons**: Yes.
- **Naming**:
  - Files and folders: `kebab-case`
  - Classes: `PascalCase`
  - Functions and variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Comments**: JSDoc on every exported function. Inline comments only for non-obvious logic.
- **Error handling**: Always use try/catch. Throw errors with descriptive messages. Never silently swallow errors.

---

## 5. Behavioral Rules for AI Assistants

These rules apply to every AI working on this codebase.

### Always do
- Read existing files before editing them.
- Follow the project structure in section 3 when placing new files.
- Match the code style of the surrounding file.
- Ask before installing new dependencies.
- After making changes, summarize what was done and why.

### Never do
- Output code in chat instead of using tools to write files (in agentic mode).
- Modify files inside `dist/`, `build/`, or `.lucian/` — those are generated.
- Edit `.env` directly — suggest changes as comments only.
- Refactor working code that was not part of the requested task.
- Make assumptions about business logic — ask if uncertain.
- Leave `TODO` or `FIXME` comments without explaining them.

### Logging
- Never use `console.log` for logging.
- Use the project logger: `import { Logger } from '@/utils/logger'`.
- Log levels: `Logger.info`, `Logger.warn`, `Logger.error`.

---

## 6. Persistent Memory

<!-- 
  This section is updated over time to reflect important decisions, 
  lessons learned, and context the AI should always carry.
  Add entries chronologically. Never delete old entries.
-->

### Architecture decisions

<!-- Example:
- 2024-03-10: Chose Prisma over Drizzle because the team is more familiar with it.
- 2024-04-02: Authentication is handled exclusively in middleware — never inside services or controllers.
-->

### Known issues and workarounds

<!-- Example:
- The `user.find()` method has a known N+1 problem on large datasets. Always use `user.findWithPosts()` instead.
- Avoid using `Date.now()` directly — use the `timestamp()` util so tests can mock time.
-->

### Patterns established in this project

<!-- Example:
- All API responses follow the envelope pattern: `{ data, error, meta }`.
- Pagination always uses cursor-based pagination, never offset.
- All new routes must be registered in `src/routes/index.ts`.
-->

---

## 7. Out of Scope

Things the AI must NOT do unless explicitly asked:

- Change the database schema without a migration plan.
- Switch libraries or frameworks.
- Add authentication/authorization logic outside the designated middleware.
- Generate frontend code (this is a backend-only project).
