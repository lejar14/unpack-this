# unpack-this

An agent skill that unpacks a handed-over codebase into a handover report. It writes both `docs/handover/HANDOVER.md` and an interactive, docs-style `docs/handover/handover.html`.

The report follows a lightweight [arc42](https://arc42.org) outline with [C4](https://c4model.com) diagrams, ordered by the questions a new owner asks:

1. **Overview**: what it is and what it is built with
2. **System Context**: actors and external systems
3. **Business Processes**: end-to-end flow and business rules
4. **Feature Inventory**: modules, features, code locations
5. **Architecture & Runtime Flows**: building blocks and critical sequences
6. **Data Model**: core entities and status lifecycle
7. **Risks & Technical Debt**: findings by severity
8. **Getting Started**: running it locally
9. **Open Questions & Glossary**

Every claim cites a file path; anything not confirmed by code is marked `inferred`.

## Install

```bash
npx skills add lejar14/unpack-this
```

Works with any agent supported by the [skills CLI](https://github.com/vercel-labs/skills) (Claude Code, Codex, Cursor, OpenCode, pi, and others). Add `-g` to install globally instead of per project.

## Usage

Open the inherited repo in your agent and ask, for example:

- "Unpack this repo, I just took it over."
- "Explain the business flow of this project."
- "Bantu onboarding codebase ini." (the report follows your language)

## Output

| File | What it is |
| :--- | :--- |
| `docs/handover/HANDOVER.md` | Full report in Markdown with Mermaid diagrams |
| `docs/handover/handover.html` | Same report as a self-contained page: sidebar nav, filterable tables, rendered diagrams, light/dark mode |

Diagrams use Mermaid syntax and are rendered by [Pele](https://pele.run) (pinned `1.13.0`, loaded from jsDelivr). Offline, each diagram falls back to showing its Mermaid source. `HANDOVER.md` keeps plain Mermaid blocks, so GitHub renders them natively.

## License

MIT
