import { readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import { parseTranscript } from "./parseTranscript.js";
import { classifySessionMock, classifySessionWithSdk } from "./classifier.js";
import { aggregate } from "./aggregate.js";
import { generateSuggestions } from "./suggest.js";
import { renderReport } from "./report.js";
import { computeLongHorizonSignal } from "./longHorizon.js";
import { buildDatasetRows, writeDatasetJsonl } from "./datasetExport.js";
import type { Session, SessionAnalysis } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadTranscripts(dir: string): Session[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((f) => parseTranscript(join(dir, f)));
}

async function main() {
  const useMock = process.argv.includes("--mock");

  // Load .env manually (no extra dependency) if present.
  const envPath = join(ROOT, ".env");
  if (existsSync(envPath)) {
    const dotenv = await import("node:fs").then((fs) => fs.readFileSync(envPath, "utf-8"));
    for (const line of dotenv.split("\n")) {
      const match = line.match(/^([\w.-]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  }

  const synthetic = loadTranscripts(join(ROOT, "data", "synthetic"));
  const real = loadTranscripts(join(ROOT, "data", "real"));
  const sessions = [...real, ...synthetic];

  if (sessions.length === 0) {
    console.error("No transcripts found in data/synthetic or data/real. Nothing to analyze.");
    process.exit(1);
  }

  console.log(`Loaded ${sessions.length} session(s) (${real.length} real, ${synthetic.length} synthetic).`);
  console.log(`Classifier mode: ${useMock ? "mock (offline heuristic)" : "sdk (Cursor agent)"}\n`);

  const analyses: SessionAnalysis[] = [];

  for (const session of sessions) {
    process.stdout.write(`  analyzing ${session.id}... `);
    try {
      const analysis = useMock
        ? classifySessionMock(session)
        : await classifySessionWithSdk(session, ROOT);
      analyses.push(analysis);
      console.log(`${analysis.tags.length} tag(s)`);
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${(err as Error).message}`);
    }
  }

  if (analyses.length === 0) {
    console.error("\nNo sessions were successfully analyzed. Exiting.");
    process.exit(1);
  }

  const agg = aggregate(analyses);
  const suggestions = generateSuggestions(agg);
  const longHorizon = computeLongHorizonSignal(sessions, analyses);
  const report = renderReport(agg, suggestions, longHorizon, useMock ? "mock" : "sdk");

  const outDir = join(ROOT, "output");
  mkdirSync(outDir, { recursive: true });

  const reportPath = join(outDir, "report.md");
  writeFileSync(reportPath, report, "utf-8");

  const datasetRows = buildDatasetRows(sessions, analyses, useMock ? "mock" : "sdk");
  const datasetPath = join(outDir, "dataset.jsonl");
  writeDatasetJsonl(datasetRows, datasetPath);

  console.log(`\nReport written to ${reportPath}`);
  console.log(`Dataset (${datasetRows.length} labeled rows) written to ${datasetPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
