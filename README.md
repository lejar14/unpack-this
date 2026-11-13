# unpack-this

An agent skill that unpacks a handed-over codebase into a handover report: business processes, feature inventory, system workflows (Mermaid), architecture, and technical gotchas. It writes both `docs/handover/HANDOVER.md` and an interactive `docs/handover/handover.html`.

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

The HTML loads Mermaid from jsDelivr, so diagrams need an internet connection to render.

## License

MIT
