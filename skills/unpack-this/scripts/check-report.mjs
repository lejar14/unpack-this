#!/usr/bin/env node
// Validates an unpack-this report before it is handed over.
// Usage: node <skill-dir>/scripts/check-report.mjs [report-dir]   (default: docs/handover)
// Checks: leftover {{PLACEHOLDERS}} and template comments, all nine sections present, filled and opening
// with a lead, exact Markdown headings, no inline styles, diagram counts in sync, every Mermaid diagram
// parses, Pele script tag intact.
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SECTIONS = ["overview", "context", "business", "features", "architecture", "data-model", "risks", "getting-started", "questions"];
const MD_HEADINGS = ["Overview", "System Context", "Business Processes", "Feature Inventory", "Architecture & Runtime Flows", "Data Model", "Risks & Technical Debt", "Getting Started", "Open Questions & Glossary"];
const PELE_SRI = 'integrity="sha384-vDPV1LDXGIwjU5/gMUtHbn/WAmwRmOgkQpiq+Rm4d/BPTsdfpIUpvi2xVET6z85W"';

const dir = process.argv[2] ?? "docs/handover";
const mdPath = join(dir, "HANDOVER.md");
const htmlPath = join(dir, "handover.html");
const problems = [];

for (const p of [mdPath, htmlPath]) if (!existsSync(p)) problems.push(`${p}: file not found`);
if (problems.length) finish();

const md = readFileSync(mdPath, "utf8");
const html = readFileSync(htmlPath, "utf8");
// The template documents its components inside HTML comments; blank them (keeping line numbers) before content checks.
const htmlContent = html.replace(/<!--[\s\S]*?-->/g, c => c.replace(/[^\n]/g, ""));

// 1. Leftover placeholders
for (const [path, text] of [[mdPath, md], [htmlPath, htmlContent]]) {
  text.split("\n").forEach((line, i) => {
    if (/\{\{[A-Z_]+\}\}/.test(line)) problems.push(`${path}:${i + 1}: unfilled placeholder ${line.match(/\{\{[A-Z_]+\}\}/)[0]}`);
  });
}

// 2. Sections present, filled, opening with a lead; no inline styles
for (const id of SECTIONS) {
  const m = html.match(new RegExp(`<section id="${id}">([\\s\\S]*?)</section>`));
  if (!m) { problems.push(`${htmlPath}: section #${id} is missing`); continue; }
  if (/<!--[\s\S]*?-->/.test(m[1])) problems.push(`${htmlPath}: section #${id} still contains the template comment`);
  const body = m[1].replace(/<h2>[\s\S]*?<\/h2>/, "").replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!body) problems.push(`${htmlPath}: section #${id} is empty (write "N/A" with a one-sentence reason if it does not apply)`);
  else if (!body.startsWith('<p class="lead">')) problems.push(`${htmlPath}: section #${id} must start with <p class="lead">`);
}
htmlContent.split("\n").forEach((line, i) => {
  if (/\sstyle="/.test(line) && !/<script|<style/.test(line)) problems.push(`${htmlPath}:${i + 1}: inline style attribute; use the template's components`);
});
const mdHeadings = (md.replace(/^```[\s\S]*?^```/gm, "").match(/^## .+$/gm) ?? []).map(h => h.slice(3).trim());
if (mdHeadings.join("|") !== MD_HEADINGS.join("|")) {
  problems.push(`${mdPath}: "## " headings must be exactly, in order: ${MD_HEADINGS.join(", ")}\n      found: ${mdHeadings.join(", ") || "(none)"}`);
}

// 3. Pele script tag intact (CDN with SRI, or a local copy for offline use)
if (!html.includes(PELE_SRI) && !/<script src="(\.\/)?pele\.global\.js"><\/script>/.test(html)) {
  problems.push(`${htmlPath}: Pele <script> tag was changed; keep the template's tag (with integrity) or the documented local copy`);
}

// 4. Diagrams parse and match between MD and HTML
const decode = s => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&");
const mdDiagrams = [...md.matchAll(/^```mermaid[^\n]*\n([\s\S]*?)^```/gm)].map(m => m[1]);
const htmlDiagrams = [...htmlContent.matchAll(/<pre class="mermaid">([\s\S]*?)<\/pre>/g)].map(m => decode(m[1]));
if (mdDiagrams.length !== htmlDiagrams.length) problems.push(`diagram count differs: ${mdPath} has ${mdDiagrams.length}, ${htmlPath} has ${htmlDiagrams.length}`);

const here = dirname(fileURLToPath(import.meta.url));
vm.runInThisContext(readFileSync(join(here, "../assets/pele.global.js"), "utf8"));
for (const [path, list] of [[mdPath, mdDiagrams], [htmlPath, htmlDiagrams]]) {
  list.forEach((src, i) => {
    try { globalThis.pele.parse(src); }
    catch (e) { problems.push(`${path}: diagram ${i + 1} (${src.trim().split("\n")[0]}) does not parse: ${e.message.split("\n").slice(0, 3).join(" | ")}`); }
  });
}

finish();

function finish() {
  if (problems.length) {
    console.error(`FAIL: ${problems.length} problem(s)\n` + problems.map(p => `  - ${p}`).join("\n"));
    process.exit(1);
  }
  console.log(`OK: ${SECTIONS.length} sections filled, ${htmlDiagrams.length} diagrams parse, no placeholders, MD and HTML in sync`);
}
