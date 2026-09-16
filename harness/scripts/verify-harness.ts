import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface DiagnosticItem {
  category: "TYPE" | "LINT" | "FORMAT" | "AST" | "RULE" | "TEST" | "BUILD";
  file: string;
  line?: number;
  code?: string;
  message: string;
}

export interface HarnessStep {
  name: string;
  durationMs: number;
  status: "passed" | "failed" | "skipped";
  diagnostics: DiagnosticItem[];
  output?: string;
}

const HARNESS_DIR = path.join(process.cwd(), ".harness");
const DIAGNOSTICS_FILE = path.join(HARNESS_DIR, "diagnostics.json");

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function ensureHarnessDir(): void {
  if (!fs.existsSync(HARNESS_DIR)) {
    fs.mkdirSync(HARNESS_DIR, { recursive: true });
  }
}

function pruneDiagnostics(rawLog: string, category: DiagnosticItem["category"]): DiagnosticItem[] {
  const items: DiagnosticItem[] = [];
  const lines = rawLog.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const tsMatch =
      trimmed.match(/^([a-zA-Z0-9_/.-]+)\((\d+),(\d+)\):\s*error\s*(TS\d+):\s*(.*)$/) ||
      trimmed.match(/^([a-zA-Z0-9_/.-]+):(\d+):(\d+)\s*-\s*error\s*(TS\d+):\s*(.*)$/);
    if (tsMatch) {
      items.push({
        category: "TYPE",
        file: tsMatch[1],
        line: parseInt(tsMatch[2], 10),
        code: tsMatch[4],
        message: tsMatch[5],
      });
      continue;
    }

    if (trimmed.includes("error") || trimmed.includes("Violation")) {
      items.push({
        category,
        file: "unknown",
        message: trimmed.substring(0, 150),
      });
    }
  }

  if (items.length === 0 && rawLog) {
    items.push({
      category,
      file: "system",
      message: rawLog.split("\n").slice(0, 3).join(" | ").substring(0, 200),
    });
  }

  return items.slice(0, 5); // AI 토큰 절약을 위한 5건 초압축
}

function runCommand(
  cmd: string,
  category: DiagnosticItem["category"]
): {
  success: boolean;
  durationMs: number;
  rawOutput: string;
  diagnostics: DiagnosticItem[];
} {
  const startTime = Date.now();
  try {
    const rawOutput = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    return { success: true, durationMs: Date.now() - startTime, rawOutput, diagnostics: [] };
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    const stderr = err && typeof err === "object" && "stderr" in err ? String(err.stderr) : "";
    const stdout = err && typeof err === "object" && "stdout" in err ? String(err.stdout) : "";
    const fullLog = `${stdout}\n${stderr}`.trim();
    return {
      success: false,
      durationMs,
      rawOutput: fullLog,
      diagnostics: pruneDiagnostics(fullLog, category),
    };
  }
}

export function executeFullHarness(options: { mode?: "full" | "quick" | "types" | "format" } = {}) {
  ensureHarnessDir();
  const mode = options.mode || "quick";
  const steps: HarnessStep[] = [];
  const allDiagnostics: DiagnosticItem[] = [];

  console.log(
    `\n${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}`
  );
  console.log(
    `${CYAN}${BOLD}║ 🛡️  FULL-LIFECYCLE VERIFICATION HARNESS (AUTONOMOUS DEVOPS) ║${RESET}`
  );
  console.log(
    `${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}\n`
  );

  // Step 1: Type Check
  if (mode !== "format") {
    process.stdout.write(`⏳ [Step 1] TypeScript Static Type Check (tsc --noEmit)... `);
    const res = runCommand("npx tsc --noEmit", "TYPE");
    if (res.success) {
      console.log(`${GREEN}PASSED ✅${RESET}`);
      steps.push({
        name: "Type Check",
        durationMs: res.durationMs,
        status: "passed",
        diagnostics: [],
      });
    } else {
      console.log(`${RED}FAILED ❌${RESET}`);
      steps.push({
        name: "Type Check",
        durationMs: res.durationMs,
        status: "failed",
        diagnostics: res.diagnostics,
      });
      allDiagnostics.push(...res.diagnostics);
    }
  }

  // Step 2: Format Check
  if ((allDiagnostics.length === 0 || mode !== "quick") && mode !== "types") {
    process.stdout.write(`⏳ [Step 2] Prettier Code Formatting Integrity (format:check)... `);
    const res = runCommand("npm run format:check", "FORMAT");
    if (res.success) {
      console.log(`${GREEN}PASSED ✅${RESET}`);
      steps.push({
        name: "Format Check",
        durationMs: res.durationMs,
        status: "passed",
        diagnostics: [],
      });
    } else {
      console.log(`${RED}FAILED ❌${RESET}`);
      steps.push({
        name: "Format Check",
        durationMs: res.durationMs,
        status: "failed",
        diagnostics: res.diagnostics,
      });
      allDiagnostics.push(...res.diagnostics);
    }
  }

  // Step 3: AST Guardrails
  if (allDiagnostics.length === 0 && mode !== "types" && mode !== "format") {
    process.stdout.write(`⏳ [Step 3] Lint & AST Architecture Guardrails Check... `);
    const res = runCommand(
      'npx jiti scripts/check-ast-guardrails.ts && npx eslint --quiet "src/**/*.{ts,tsx}"',
      "AST"
    );
    if (res.success) {
      console.log(`${GREEN}PASSED ✅${RESET}`);
      steps.push({
        name: "AST Guardrails",
        durationMs: res.durationMs,
        status: "passed",
        diagnostics: [],
      });
    } else {
      console.log(`${RED}FAILED ❌${RESET}`);
      steps.push({
        name: "AST Guardrails",
        durationMs: res.durationMs,
        status: "failed",
        diagnostics: res.diagnostics,
      });
      allDiagnostics.push(...res.diagnostics);
    }
  }

  // Step 4: Tests
  if (allDiagnostics.length === 0 && mode !== "types" && mode !== "format") {
    process.stdout.write(`⏳ [Step 4] Unit & Integration Tests (Vitest)... `);
    const res = runCommand("npm test", "TEST");
    if (res.success) {
      console.log(`${GREEN}PASSED ✅${RESET}`);
      steps.push({ name: "Tests", durationMs: res.durationMs, status: "passed", diagnostics: [] });
    } else {
      console.log(`${RED}FAILED ❌${RESET}`);
      steps.push({
        name: "Tests",
        durationMs: res.durationMs,
        status: "failed",
        diagnostics: res.diagnostics,
      });
      allDiagnostics.push(...res.diagnostics);
    }
  }

  // Step 5: Production Build
  if (allDiagnostics.length === 0 && mode !== "types" && mode !== "format") {
    process.stdout.write(`⏳ [Step 5] Next.js Production Build (next build)... `);
    const res = runCommand("npx next build", "BUILD");
    if (res.success) {
      console.log(`${GREEN}PASSED ✅${RESET}`);
      steps.push({
        name: "Production Build",
        durationMs: res.durationMs,
        status: "passed",
        diagnostics: [],
      });
    } else {
      console.log(`${RED}FAILED ❌${RESET}`);
      steps.push({
        name: "Production Build",
        durationMs: res.durationMs,
        status: "failed",
        diagnostics: res.diagnostics,
      });
      allDiagnostics.push(...res.diagnostics);
    }
  }

  fs.writeFileSync(
    DIAGNOSTICS_FILE,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        isSuccess: allDiagnostics.length === 0,
        diagnostics: allDiagnostics,
      },
      null,
      2
    ),
    "utf-8"
  );

  if (allDiagnostics.length > 0) {
    console.error(`\n❌ Harness Failed. Slim diagnostics saved to ${DIAGNOSTICS_FILE}`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ${GREEN}ALL HARNESS GATES PASSED! Ready to commit & deploy.${RESET}\n`);
    process.exit(0);
  }
}

if (process.argv[1] && process.argv[1].endsWith("verify-harness.ts")) {
  const isFull = process.argv.includes("--full");
  const isTypes = process.argv.includes("--types");
  const isFormat = process.argv.includes("--format");
  executeFullHarness({
    mode: isFull ? "full" : isTypes ? "types" : isFormat ? "format" : "quick",
  });
}
