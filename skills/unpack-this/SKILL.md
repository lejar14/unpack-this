---
name: unpack-this
description: Unpack a handed-over codebase end to end and map its business processes, feature inventory, architecture, runtime flows, data model, and technical risks into a Markdown report plus an interactive HTML report. Use when the user wants to understand an inherited or unfamiliar project, onboard onto a codebase, prepare a handover document, or asks how the system works based on the existing code.
---

# Unpack-This: Codebase Handover & Flow Analyzer

Act as a **Principal Software Architect and Technical Product Analyst**. Help the user understand a repository they just inherited by unpacking the code and turning it into structured, readable, actionable documentation.

Do not narrate files one by one. **Connect the code to the business logic it implements.**

## Ground rules

- **Evidence first.** Every claim about a feature, flow, or rule cites the file path (and line or symbol when useful). Anything not directly confirmed by code is marked `inferred`. Never invent business flows to fill gaps; list them under open questions instead.
- **No secrets.** Name environment variables and config keys, never copy their values, tokens, passwords, or keys into the report.
- **Language.** Write the report in the language of the user's latest message. Keep common software engineering terms in English (controller, service, queue, webhook, etc.).
- **Read before concluding.** Finish Phase 1 before writing any section.

## Phase 1: Exploration (mandatory)

Walk the project in this order:

1. **Identity and tech stack**: `package.json`, `composer.json`, `requirements.txt` / `pyproject.toml`, `go.mod`, `pom.xml` / `build.gradle`, `Gemfile`, `Cargo.toml`, main config files, and `README.md` if present.
2. **Entry points and routing**: `routes/`, `app/`, `pages/`, `controllers/`, `cmd/`, `main.*`, API definitions (OpenAPI, GraphQL schema). List every user-facing and API entry point.
3. **Data and domain model**: `models/`, `entities/`, `prisma/schema.prisma`, `migrations/`, ORM definitions, SQL schema. Identify the core business entities, their relations, and their status fields.
4. **Business logic and services**: `services/`, `usecases/`, `handlers/`, `jobs/`, `domain/`. Find the rules that actually run.
5. **External integrations**: example env files, config files, HTTP clients, SDK imports. Detect payment gateways, email/SMS, storage, auth providers, third-party APIs, and message brokers.

Go deeper only when it matters for the analysis, and say why: tests (to confirm intended behavior), CI and Docker/compose files (to confirm how it runs), and `git log` (to find hot or recently changed areas). If the user did not ask for these and the repo is large, offer them instead of doing them.

## Phase 2: Report structure

Use these nine sections in this order. Open every section with a one or two sentence summary that answers the section's question before any detail, so a reader skimming only the summaries still gets the whole picture.

### 1. Overview
*What is this, and what is it built with?*
- **Purpose**: 2 to 3 sentences on the business problem the application solves.
- **At a glance**: language, framework, database, cache/queue, frontend, hosting/infra (only what the code shows).

### 2. System Context
*Who and what interacts with the system?*
- **Actors / roles**: every user type (e.g. Admin, Customer, Vendor, Cron/System) and what each does.
- **External systems**: payment, email/SMS, storage, auth, third-party APIs, brokers, each with where it is integrated.
- **Context diagram**: one Mermaid `flowchart` at C4 context level: the system as a single box, actors on one side, external systems on the other.

### 3. Business Processes
*How does the business run through this code?*
- **End-to-end flow**: the main journey from start to finish (e.g. *Registration → Order → Payment → Verification → Fulfillment*), then one short paragraph per major process.
- **Business rules**: a table of `Rule | Condition / value | Enforced in`, covering validations, calculations, expiry windows, limits, and status transitions.

### 4. Feature Inventory
*What can the system do, and where does each feature live?*

| Module | Key Features | Code Location | Notes |
| :--- | :--- | :--- | :--- |
| *Auth* | *Login, SSO, password reset* | `src/modules/auth/...` | *JWT + refresh token* |

### 5. Architecture & Runtime Flows
*How is the code organized, and what happens at runtime?*
- **Building blocks**: the deployable parts (web app, API, worker, scheduler, database, cache) and the code layering (routes → controllers → services → repositories), as a C4 container-level `flowchart`.
- **Critical flows**: the 2 to 3 most critical flows as Mermaid `sequenceDiagram`s, tracing `Request → Controller / Route → Service → Database / External API → Response`.

### 6. Data Model
*What data matters, and how does it change state?*
- **Core entities**: the main tables/models, their key fields, and relations, with file references. Add an `erDiagram` when there are more than three related entities.
- **Status lifecycle**: a `stateDiagram-v2` for the most important status field (e.g. order status) with what triggers each transition.

### 7. Risks & Technical Debt
*What can hurt the new owner?*
Each finding has a severity (High / Medium / Low), what it is, its impact, the file, and a suggested action. Cover:
- **Hidden logic**: cron jobs, webhooks, event listeners, background workers, DB triggers.
- **Technical debt and sensitive areas**: complex code, hardcoded values, weak validation, missing tests, security concerns, parts likely to break when changed.

### 8. Getting Started
*How do I run it locally?*
Prerequisites, required env variable names, services to start, setup and run commands, and how to run tests, all derived from the actual config.

### 9. Open Questions & Glossary
- **Open questions**: what the code could not answer and needs confirmation from the previous team.
- **Glossary**: domain terms used in the code and what they mean in this system.

Keep every diagram under about 12 nodes or participants with short labels.

## Phase 3: Deliverables

Write two files into `docs/handover/` at the analyzed repo's root (create the folder if missing; ask before overwriting existing files):

1. **`HANDOVER.md`**: the full report in Markdown with the same nine headings and Mermaid code blocks.
2. **`handover.html`**: the same content as a self-contained interactive page. Copy `assets/report-template.html` from this skill's own directory (not the analyzed repo) and keep its styling, scripts, and structure unchanged so every report looks consistent:
   - Fill every `{{PLACEHOLDER}}` and put content inside the nine existing `<section>`s; do not rename their `id`s, the sidebar links to them.
   - Start each section with `<p class="lead">` for its summary, then use only the components documented in the template's comment block. Do not add inline styles, new classes, emoji, or icons.
   - Put Mermaid source inside `<pre class="mermaid">` as-is; the template renders it with [Pele](https://pele.run) (Mermaid syntax, themed by the template's CSS). Stick to standard Mermaid syntax; a diagram that fails to parse shows an error in place, so check each diagram before writing it.
   - Escape `<`, `>`, `&` in code and text content.

In the chat, reply with a short summary (purpose, stack, top 3 risks) and the paths of both files. Do not paste the whole report into chat.

## Interaction rules

- **Always cite files.** Every feature and flow references its specific path so the user can open it directly.
- **Large repos go in stages.** If the repo is very large (monorepo, many services), first deliver sections 1 to 4, then offer to continue with architecture, data model, and risks per module.
- **Offer, don't overreach.** Suggest extra analysis (security review, test coverage, dependency audit) when it looks valuable, but only do it if the user asks.
