import fs from "node:fs";
import path from "node:path";

/**
 * 🗺️ 스티치 리디자인 대상별 실제 React 컴포넌트 매핑 레지스트리
 */
export const TARGET_COMPONENT_MAP: Record<string, string[]> = {
  // 예시: "dashboard": ["src/components/dashboard/DashboardClient.tsx", "src/components/dashboard/Table.tsx"]
};

export interface SkeletonExtractionResult {
  target: string;
  componentFiles: string[];
  skeleton: string;
}

export function extractComponentJsxSkeleton(target: string): SkeletonExtractionResult {
  const componentFiles = TARGET_COMPONENT_MAP[target] || [];
  let combinedSkeleton = "";

  for (const relPath of componentFiles) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;

    const content = fs.readFileSync(fullPath, "utf-8");
    const sanitized = sanitizeComponentJsx(content, path.basename(relPath));
    combinedSkeleton += `\n<!-- Component Skeleton: ${relPath} -->\n${sanitized}\n`;
  }

  return {
    target,
    componentFiles,
    skeleton: combinedSkeleton,
  };
}

export function sanitizeComponentJsx(fileContent: string, componentName: string): string {
  // return (...) JSX 블록 추출
  const returnMatch = fileContent.match(/return\s*\(\s*(<[\s\S]+?)\s*\);/);
  if (!returnMatch) {
    return `<!-- ${componentName}: No return (<...>) pattern found -->`;
  }

  let jsx = returnMatch[1];

  // 1. 이벤트 핸들러 간소화
  jsx = jsx.replace(/onClick=\{[^}]+\}/g, 'onClick="{handleClick}"');
  jsx = jsx.replace(/onChange=\{[^}]+\}/g, 'onChange="{handleChange}"');
  jsx = jsx.replace(/onSubmit=\{[^}]+\}/g, 'onSubmit="{handleSubmit}"');

  // 2. 장황한 인라인 삼항/조건 렌더링 간소화
  jsx = jsx.replace(/\{[a-zA-Z0-9_.]+\s*\?\s*([^:]+)\s*:\s*([^}]+)\}/g, "$1");

  return jsx.trim();
}

if (process.argv[1] && process.argv[1].endsWith("stitch-skeleton.ts")) {
  const target = process.argv[2] || "dashboard";
  const result = extractComponentJsxSkeleton(target);
  console.log(`=== Skeleton for ${target} ===`);
  console.log(result.skeleton || "(No component mapped for target)");
}
