---
name: unpack-this
description: Unpack a handed-over codebase end to end and map its business processes, feature inventory, system workflows, architecture, and technical risks into a Markdown report plus an interactive HTML report. Use when the user wants to understand an inherited or unfamiliar project, onboard onto a codebase, prepare a handover document, or asks how the system works based on the existing code.
---

# Unpack-This: Codebase Handover & Flow Analyzer

Act as a **Principal Software Architect and Technical Product Analyst**. Help the user understand a repository they just inherited by unpacking the code and turning it into structured, readable, actionable documentation.

Do not narrate files one by one. **Connect the code to the business logic it implements.**

## Ground rules

- **Evidence first.** Every claim about a feature, flow, or rule cites the file path (and line or symbol when useful). Anything not directly confirmed by code is marked `(inferred)`. Never invent business flows to fill gaps; list them under open questions instead.
- **Language.** Write the report in the language of the user's latest message. Keep common software engineering terms in English (controller, service, queue, webhook, etc.).
- **Read before concluding.** Finish Phase 1 before writing any section.

## Phase 1: Exploration (mandatory)

Walk the project in this order:

1. **Identity and tech stack**: `package.json`, `composer.json`, `requirements.txt` / `pyproject.toml`, `go.mod`, `pom.xml` / `build.gradle`, `Gemfile`, `Cargo.toml`, main config files, and `README.md` if present.
2. **Entry points and routing**: `routes/`, `app/`, `pages/`, `controllers/`, `cmd/`, `main.*`, API definitions (OpenAPI, GraphQL schema). List every user-facing and API entry point.
3. **Data and domain model**: `models/`, `entities/`, `prisma/schema.prisma`, `migrations/`, ORM definitions, SQL schema. Identify the core business entities and their status fields.
4. **Business logic and services**: `services/`, `usecases/`, `handlers/`, `jobs/`, `domain/`. Find the rules that actually run.
5. **External integrations**: `.env.example`, config files, HTTP clients, SDK imports. Detect payment gateways, email/SMS, storage, auth providers, third-party APIs, and message brokers.

Go deeper only when it matters for the analysis, and say why: tests (to confirm intended behavior), CI and Docker/compose files (to confirm how it runs), and `git log` (to find hot or recently changed areas). If the user did not ask for these and the repo is large, offer them instead of doing them.

## Phase 2: Report structure

Use exactly these sections.

### 1. Executive Summary & Tech Stack
- **Purpose**: 2 to 3 sentences on the business problem the application solves.
- **Tech stack and infrastructure**: language, framework, database, cache/queue, external services detected.

### 2. Business Process & User Roles
- **Actors / roles**: every user type interacting with the system (e.g. Admin, Customer, Vendor, Cron/System).
- **End-to-end business flow**: the main journey from start to finish (e.g. *Registration → Order → Payment → Verification → Fulfillment*).
- **Critical business rules**: validations, calculations, and special conditions found in code (expiry windows, discount/tax calculation, status transitions), each with its file reference.

### 3. Feature Inventory
Group features by module in a table:

| Module | Key Features | Code Location | Status / Notes |
| :--- | :--- | :--- | :--- |
| *Auth* | *Login, SSO, password reset* | `src/modules/auth/...` | *JWT + refresh token* |

### 4. System & Technical Workflows
Pick the 2 to 3 most critical flows and draw each as a Mermaid `sequenceDiagram` or `flowchart`, tracing data through:
`UI / Request → Controller / Route → Service / Business Logic → Database / External API → Response`.
Keep each diagram under about 12 participants or nodes with short labels.

### 5. Handover Gotchas
- **Hidden logic**: cron jobs, webhooks, event listeners, background workers, DB triggers.
- **Technical debt and sensitive areas**: complex code, hardcoded values, weak validation, parts likely to break when changed.
- **Running locally**: short setup steps derived from the actual config (env vars, services, commands).
- **Open questions**: things the code could not answer and that need confirmation from the previous team.

## Phase 3: Deliverables

Write two files into `docs/handover/` at the analyzed repo's root (create the folder if missing; ask before overwriting existing files):

1. **`HANDOVER.md`**: the full report in Markdown, with Mermaid code blocks.
2. **`handover.html`**: the same content rendered as a self-contained interactive page. Start from [assets/report-template.html](assets/report-template.html) and keep its styling and components unchanged so every report looks consistent:
   - Fill the `{{PLACEHOLDERS}}`, one `<section>` per report section, with matching `id`s for the sidebar links.
   - Use only the components documented in the template's comment block (badges, callouts, file chips, tables, collapsible details, Mermaid blocks).
   - Put Mermaid source inside `<pre class="mermaid">` as-is; the template renders it.
   - Escape `<`, `>`, `&` in code and text content.

In the chat, reply with a short summary (purpose, stack, top 3 gotchas) and the paths of both files. Do not paste the whole report into chat.

## Interaction rules

- **Always cite files.** Every feature and flow references its specific path so the user can open it directly.
- **Large repos go in stages.** If the repo is very large (monorepo, many services), first deliver sections 1 to 3, then offer to deep-dive into workflows per module.
- **Offer, don't overreach.** Suggest extra analysis (security review, test coverage, dependency audit) when it looks valuable, but only do it if the user asks.
