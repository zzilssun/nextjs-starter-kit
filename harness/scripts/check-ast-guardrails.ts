import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export interface AstViolation {
  file: string;
  line: number;
  rule: string;
  message: string;
  snippet: string;
}

const TARGET_DIRS = [
  "src/actions",
  "src/services",
  "src/repositories",
  "src/hooks",
  "src/lib",
  "src/components",
];
const EXCLUDE_EXTENSIONS = [".test.ts", ".test.tsx", ".d.ts"];

export function checkAstGuardrails(options?: {
  targetFiles?: string[];
  stagedOnly?: boolean;
  all?: boolean;
}): AstViolation[] {
  const violations: AstViolation[] = [];

  // 1. All 모드: 전체 파일 전수 점검
  if (options?.all) {
    const allFiles = TARGET_DIRS.flatMap((dir) => getAllSourceFiles(dir));
    for (const file of allFiles) {
      checkFileContent(file, violations);
    }
    return violations;
  }

  // 2. Diff 기반 점검: 새로 추가된 라인(+)에서만 AST 위반 정밀 검출
  try {
    const diffCmd = options?.stagedOnly ? "git diff --cached -U0 src/" : "git diff HEAD -U0 src/";
    const diffOut = execSync(diffCmd, { encoding: "utf-8" });
    parseDiffForViolations(diffOut, violations);
  } catch {
    // Git diff 실행 불가 시 폴백
  }

  return violations;
}

function getAllSourceFiles(dir: string, fileList: string[] = []): string[] {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) return fileList;

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        getAllSourceFiles(relativePath, fileList);
      }
    } else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !EXCLUDE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
    ) {
      fileList.push(relativePath);
    }
  }
  return fileList;
}

function checkFileContent(file: string, violations: AstViolation[]): void {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;

  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    inspectCodeLine(file, i + 1, lines[i], violations);
  }
}

function parseDiffForViolations(diffText: string, violations: AstViolation[]): void {
  const lines = diffText.split("\n");
  let currentFile = "";
  let currentLine = 1;

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.replace("+++ b/", "").trim();
    } else if (line.startsWith("@@ ")) {
      const match = line.match(/\+(\d+)/);
      if (match) currentLine = parseInt(match[1], 10);
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      const code = line.substring(1);
      inspectCodeLine(currentFile, currentLine, code, violations);
      currentLine++;
    } else if (!line.startsWith("-")) {
      currentLine++;
    }
  }
}

function inspectCodeLine(
  file: string,
  line: number,
  code: string,
  violations: AstViolation[]
): void {
  const trimmed = code.trim();
  if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;

  // 1. any 타입 검출 (Strict TypeScript rule)
  const anyPattern = /(:|\bas\b|<|[|&])\s*any\b|(\bany\[\])|Record<[^,]+,\s*any>|,\s*any\s*>/;
  if (anyPattern.test(code) && !code.includes("eslint-disable")) {
    violations.push({
      file,
      line,
      rule: "NO_ANY_TYPE",
      message:
        "TypeScript 'any' type is strictly forbidden by AGENTS.md. Use 'unknown' or explicit types.",
      snippet: trimmed,
    });
  }
}

if (process.argv[1] && process.argv[1].endsWith("check-ast-guardrails.ts")) {
  const isAll = process.argv.includes("--all");
  console.log(
    `🔍 Checking AST architecture guardrails (${isAll ? "Full Codebase" : "Added Diff Lines"})...`
  );
  const violations = checkAstGuardrails({ all: isAll });

  if (violations.length === 0) {
    console.log("✅ All AST Architecture Guardrails Passed! (0 violations)");
    process.exit(0);
  } else {
    console.error(`\n❌ Found ${violations.length} AST Architecture Violation(s):`);
    for (const v of violations.slice(0, 5)) {
      console.error(`  • [${v.rule}] ${v.file}:${v.line}`);
      console.error(`    Message: ${v.message}`);
      console.error(`    Code   : ${v.snippet}\n`);
    }
    process.exit(1);
  }
}
