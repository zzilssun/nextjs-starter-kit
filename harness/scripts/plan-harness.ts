import fs from "fs";
import path from "path";

export interface PlanAnalysisResult {
  planFile: string;
  hasFunctionalSpec: boolean;
  hasTechnicalPlan: boolean;
  score: number;
}

export function analyzeImplementationPlan(planPath?: string): PlanAnalysisResult {
  const workspacePlanPath = path.resolve(process.cwd(), "implementation_plan.md");
  const scratchPlanPath = path.resolve(process.cwd(), "scratch/implementation_plan.md");

  const targetPlanPath =
    planPath ||
    (fs.existsSync(workspacePlanPath) ? workspacePlanPath : "") ||
    (fs.existsSync(scratchPlanPath) ? scratchPlanPath : "") ||
    "";

  if (!targetPlanPath || !fs.existsSync(targetPlanPath)) {
    console.log("ℹ️ No implementation_plan.md found in workspace root. Skipping plan check.");
    return {
      planFile: "",
      hasFunctionalSpec: false,
      hasTechnicalPlan: false,
      score: 0,
    };
  }

  const content = fs.readFileSync(targetPlanPath, "utf-8");

  const hasFunctionalSpec =
    content.includes("Functional Specification") ||
    content.includes("기능 명세서") ||
    content.includes("기능 명세");

  const hasTechnicalPlan =
    content.includes("Technical Implementation Plan") ||
    content.includes("기술 구현 계획서") ||
    content.includes("기술 구현 계획") ||
    content.includes("구현 계획서");

  let score = 0;
  if (hasFunctionalSpec) score += 50;
  if (hasTechnicalPlan) score += 50;

  console.log(
    `📋 [Plan Harness] Auditing ${path.basename(targetPlanPath)}: Score ${score}/100 points`
  );
  console.log(
    `  - Functional Specification (기능 명세서): ${hasFunctionalSpec ? "✅ Passed (+50)" : "❌ Missing (0)"}`
  );
  console.log(
    `  - Technical Implementation Plan (기술 구현 계획서): ${hasTechnicalPlan ? "✅ Passed (+50)" : "❌ Missing (0)"}`
  );

  if (score < 100) {
    console.error(
      "\n❌ Plan Harness Violation: implementation_plan.md must contain both Functional Specification and Technical Implementation Plan sections."
    );
    process.exit(1);
  }

  console.log(
    "✅ Plan Harness Passed! implementation_plan.md is fully compliant with AGENTS.md.\n"
  );
  return {
    planFile: targetPlanPath,
    hasFunctionalSpec,
    hasTechnicalPlan,
    score,
  };
}

if (process.argv[1] && process.argv[1].endsWith("plan-harness.ts")) {
  analyzeImplementationPlan();
}
