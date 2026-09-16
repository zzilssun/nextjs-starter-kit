import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { stitch, Project, Screen, type DesignSystem } from "@google/stitch-sdk";
import { captureFullPage } from "./capture-fullpage";
import { extractComponentJsxSkeleton } from "./stitch-skeleton";

dotenv.config();

export interface StitchRegistryEntry {
  screenId: string;
  updatedAt: string;
  sourceType: "uploaded" | "generated" | "edited";
  pageName: string;
  title?: string;
  version?: string;
}

function getRegistryPath(): string {
  return path.resolve(process.cwd(), "docs/stitch/registry.json");
}

function getRegistry(): Record<string, StitchRegistryEntry> {
  const regPath = getRegistryPath();
  if (!fs.existsSync(regPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(regPath, "utf-8"));
  } catch {
    return {};
  }
}

function updateRegistry(pageName: string, entry: StitchRegistryEntry): void {
  const regPath = getRegistryPath();
  fs.mkdirSync(path.dirname(regPath), { recursive: true });
  const data = getRegistry();
  data[pageName] = entry;
  fs.writeFileSync(regPath, JSON.stringify(data, null, 2), "utf-8");
}

function getEnvProjectId(): string | undefined {
  return process.env.STITCH_PROJECT_ID?.trim() || undefined;
}

function getActiveProject(projectIdArg?: string): Project {
  const projectId = projectIdArg?.trim() || getEnvProjectId();
  if (!projectId) {
    throw new Error(
      "No Stitch Project ID specified. Provide one as argument or run 'npm run stitch init-project' first."
    );
  }
  return stitch.project(projectId);
}

function readDesignMd(): string {
  const designMdPath = path.resolve(process.cwd(), "DESIGN.md");
  if (!fs.existsSync(designMdPath)) {
    throw new Error(`DESIGN.md not found at ${designMdPath}`);
  }
  return fs.readFileSync(designMdPath, "utf-8");
}

async function statusCommand(): Promise<void> {
  console.log("=== Google Stitch Connection Status ===");
  const hasKey = Boolean(process.env.STITCH_API_KEY?.trim());
  console.log(`- API Key Configured: ${hasKey ? "✅ Yes" : "❌ Missing STITCH_API_KEY"}`);

  const activeId = getEnvProjectId();
  console.log(`- Active Project ID: ${activeId ? activeId : "(None configured in .env)"}`);

  if (!hasKey) {
    console.log("\nPlease configure STITCH_API_KEY in .env before proceeding.");
    return;
  }

  console.log("\nFetching projects from Stitch Cloud...");
  const projects = await stitch.projects();
  console.log(`Total Projects: ${projects.length}`);

  for (const p of projects) {
    const title = (p.data as { title?: string })?.title || "(Untitled)";
    const isCurrent = p.id === activeId ? " [ACTIVE]" : "";
    console.log(`  • [${p.id}] ${title}${isCurrent}`);
  }
}

async function initProjectCommand(titleArg?: string): Promise<void> {
  const title = titleArg?.trim() || "Enterprise Web Platform";
  console.log(`Creating new Stitch Project: "${title}"...`);
  const project = await stitch.createProject(title);
  console.log(`✅ Project created successfully! ID: ${project.id}`);

  // 동기화
  await syncDesignCommand(project.id);
}

async function syncDesignCommand(projectIdArg?: string): Promise<DesignSystem> {
  const project = getActiveProject(projectIdArg);
  const designMdContent = readDesignMd();

  console.log(`Syncing DESIGN.md to project ${project.id}...`);
  const ds = await project.createDesignSystem({
    displayName: "Enterprise Design System",
    theme: {
      colorMode: "LIGHT",
      headlineFont: "INTER",
      bodyFont: "INTER",
      roundness: "ROUND_EIGHT",
      customColor: "#2563EB",
      overridePrimaryColor: "#2563EB",
      overrideSecondaryColor: "#047857",
      overrideTertiaryColor: "#B45309",
      overrideNeutralColor: "#111827",
      designMd: designMdContent,
    },
  });
  console.log(`✅ Design System synced successfully!`);
  return ds;
}

async function captureCommand(pageNameArg?: string, targetUrlArg?: string): Promise<string> {
  const pageName = pageNameArg?.trim() || "dashboard";
  const targetUrl = targetUrlArg?.trim() || "http://localhost:3000";
  console.log(`📸 Capturing full-page for ${pageName} from ${targetUrl}...`);
  return captureFullPage(pageName, { targetUrl });
}

async function flowCommand(pageNameArg?: string, targetUrlArg?: string): Promise<void> {
  const pageName = pageNameArg?.trim() || "dashboard";
  const targetUrl = targetUrlArg?.trim() || "http://localhost:3000";
  const project = getActiveProject();

  console.log(`🚀 [Stitch Flow] Starting 3-Pillar Hybrid Lifecycle for "${pageName}"...`);

  // 1. Base Screen 캡처
  const screenshotPath = await captureCommand(pageName, targetUrl);

  // 2. Base Screen 업로드
  console.log(`☁️ Uploading Base Screen to Stitch Cloud...`);
  const screens = await project.upload(screenshotPath);
  const baseScreen = screens[0];
  console.log(`✅ Base Screen Uploaded (ID: ${baseScreen.id})`);

  // 3. 3기둥 컨텍스트 주입 및 리팩토링
  const specPath = path.resolve(process.cwd(), `docs/designs/pages/${pageName}/index.md`);
  const specContent = fs.existsSync(specPath) ? fs.readFileSync(specPath, "utf-8") : "";
  const { skeleton } = extractComponentJsxSkeleton(pageName);

  const hybridPrompt = `
[3-PILLAR HYBRID REFACTORING REQUEST]
Page: ${pageName}

=== PILLAR 1: VISUAL GROUND TRUTH ===
Refer to the uploaded Base Screen. Preserve 100% of the UI layout, tables, and actions.

=== PILLAR 2: DOMAIN LIVING SPECIFICATION ===
${specContent}

=== PILLAR 3: SANITIZED COMPONENT JSX SKELETON ===
${skeleton}

INSTRUCTIONS:
1. Polish visuals and Tailwind styles strictly following DESIGN.md tokens.
2. 100% preserve existing business workflows, filters, data columns, and responsive layouts.
3. Zero hallucination of non-existent elements.
`.trim();

  console.log(`🤖 Requesting Stitch AI screen.edit() with 3-Pillar Multimodal Context...`);
  const editedScreen = await baseScreen.edit(hybridPrompt);
  console.log(`🎉 Stitch Refactoring Completed! (ID: ${editedScreen.id})`);

  updateRegistry(pageName, {
    screenId: editedScreen.id,
    updatedAt: new Date().toISOString(),
    sourceType: "edited",
    pageName,
    title: pageName,
  });

  // 산출물 저장
  const exportDir = path.resolve(process.cwd(), `docs/stitch/exports/${pageName}`);
  fs.mkdirSync(exportDir, { recursive: true });
  const htmlContent = (editedScreen.data as { html?: string })?.html || "<!-- No HTML returned -->";
  fs.writeFileSync(path.join(exportDir, "code.html"), htmlContent, "utf-8");
  console.log(`📁 Downloaded HTML to: ${exportDir}/code.html\n`);
}

async function syncBackCommand(pageNameArg?: string, targetUrlArg?: string): Promise<void> {
  const pageName = pageNameArg?.trim() || "dashboard";
  const targetUrl = targetUrlArg?.trim() || "http://localhost:3000";
  console.log(`🔄 [Sync-Back] Re-capturing local updated screen for "${pageName}"...`);
  const screenshotPath = await captureCommand(pageName, targetUrl);

  const project = getActiveProject();
  console.log(`☁️ Syncing back screenshot to Stitch Cloud...`);
  await project.upload(screenshotPath);
  console.log(`✅ [Sync-Back] Successfully synchronized local UI to Stitch Cloud SSOT!`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "status";

  try {
    switch (command) {
      case "status":
        await statusCommand();
        break;
      case "init-project":
        await initProjectCommand(args[1]);
        break;
      case "sync-design":
        await syncDesignCommand(args[1]);
        break;
      case "capture":
        await captureCommand(args[1], args[2]);
        break;
      case "flow":
        await flowCommand(args[1], args[2]);
        break;
      case "sync-back":
        await syncBackCommand(args[1], args[2]);
        break;
      default:
        console.log(`Unknown command: ${command}`);
        console.log(
          "Available commands: status, init-project, sync-design, capture, flow, sync-back"
        );
    }
  } catch (err: unknown) {
    console.error(`\n❌ Error:`, err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("stitch-bridge.mts")) {
  main();
}
