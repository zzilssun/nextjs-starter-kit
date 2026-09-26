import fs from "fs";
import path from "path";

export interface FileSizeReport {
  filePath: string;
  sizeBytes: number;
  sizeKb: number;
  lines: number;
  status: "OK" | "WARN" | "FAIL";
  message: string;
}

const AGENTS_MD_PATH = path.join(process.cwd(), "AGENTS.md");
const RULES_DIR = path.join(process.cwd(), "docs/rules");

// Thresholds (Bytes)
const AGENTS_SAFE_LIMIT = 28 * 1024; // 28KB (Safe target)
const AGENTS_WARN_LIMIT = 32 * 1024; // 32KB (Warning threshold)
const AGENTS_HARD_LIMIT = 40 * 1024; // 40KB (Hard ceiling - well below system prompt truncation)
const MODULE_HARD_LIMIT = 30 * 1024; // 30KB per modular rule file

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

export function checkAgentsSize(): { isSuccess: boolean; reports: FileSizeReport[] } {
  const reports: FileSizeReport[] = [];
  let isSuccess = true;

  // 1. Check AGENTS.md
  if (fs.existsSync(AGENTS_MD_PATH)) {
    const stats = fs.statSync(AGENTS_MD_PATH);
    const content = fs.readFileSync(AGENTS_MD_PATH, "utf-8");
    const lines = content.split("\n").length;
    const sizeBytes = stats.size;
    const sizeKb = Number((sizeBytes / 1024).toFixed(2));

    let status: FileSizeReport["status"] = "OK";
    let message = "Well within budget (< 28KB)";

    if (sizeBytes > AGENTS_HARD_LIMIT) {
      status = "FAIL";
      message = `Exceeded hard limit of 40KB (${sizeKb}KB). Context truncation risk! Modularize into docs/rules/.`;
      isSuccess = false;
    } else if (sizeBytes > AGENTS_WARN_LIMIT) {
      status = "WARN";
      message = `Approaching limit (${sizeKb}KB > 32KB). Consider offloading rules to docs/rules/.`;
    }

    reports.push({
      filePath: "AGENTS.md",
      sizeBytes,
      sizeKb,
      lines,
      status,
      message,
    });
  } else {
    reports.push({
      filePath: "AGENTS.md",
      sizeBytes: 0,
      sizeKb: 0,
      lines: 0,
      status: "FAIL",
      message: "AGENTS.md not found in workspace root!",
    });
    isSuccess = false;
  }

  // 2. Check modular rules under docs/rules/*.md
  if (fs.existsSync(RULES_DIR)) {
    const ruleFiles = fs
      .readdirSync(RULES_DIR)
      .filter((file) => file.endsWith(".md"))
      .sort();

    for (const ruleFile of ruleFiles) {
      const fullPath = path.join(RULES_DIR, ruleFile);
      const stats = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n").length;
      const sizeBytes = stats.size;
      const sizeKb = Number((sizeBytes / 1024).toFixed(2));

      let status: FileSizeReport["status"] = "OK";
      let message = "Within modular budget (< 30KB)";

      if (sizeBytes > MODULE_HARD_LIMIT) {
        status = "FAIL";
        message = `Module exceeded 30KB (${sizeKb}KB). Split into smaller specialized submodules.`;
        isSuccess = false;
      }

      reports.push({
        filePath: `docs/rules/${ruleFile}`,
        sizeBytes,
        sizeKb,
        lines,
        status,
        message,
      });
    }
  }

  return { isSuccess, reports };
}

// CLI Execution Entrypoint
if (
  process.argv[1]?.endsWith("check-agents-size.ts") ||
  process.argv[1]?.endsWith("check-agents-size.js")
) {
  console.log(`\n${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}${BOLD}║ 📏 AGENTS.md & MODULAR RULES SIZE BUDGET AUDIT               ║${RESET}`);
  console.log(`${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${RESET}\n`);

  const { isSuccess, reports } = checkAgentsSize();

  for (const report of reports) {
    const color = report.status === "OK" ? GREEN : report.status === "WARN" ? YELLOW : RED;
    const badge =
      report.status === "OK" ? "✅ PASS" : report.status === "WARN" ? "⚠️ WARN" : "❌ FAIL";
    console.log(
      `${color}${BOLD}[${badge}]${RESET} ${BOLD}${report.filePath.padEnd(35)}${RESET} | ${report.sizeKb
        .toString()
        .padStart(6)} KB | ${report.lines.toString().padStart(4)} lines | ${color}${report.message}${RESET}`
    );
  }

  console.log("\n--------------------------------------------------------------------------------");
  if (isSuccess) {
    console.log(
      `${GREEN}${BOLD}✨ All agent documentation files are within safe size limits (Zero Truncation Guarantee)!${RESET}\n`
    );
    process.exit(0);
  } else {
    console.error(
      `${RED}${BOLD}🚨 Size budget check FAILED! Please reduce file size before committing.${RESET}\n`
    );
    process.exit(1);
  }
}
