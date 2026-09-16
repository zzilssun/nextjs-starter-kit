import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

export interface CaptureOptions {
  targetUrl: string;
  outputDir?: string;
  viewportWidth?: number;
  viewportHeight?: number;
}

/**
 * Playwright 기반의 Zero-Spinner 풀페이지 스크린샷 캡처
 */
export async function captureFullPage(pageName: string, options: CaptureOptions): Promise<string> {
  const outputDir = options.outputDir || path.resolve(process.cwd(), "docs/stitch/screens");
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, `${pageName}.png`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: {
      width: options.viewportWidth || 1440,
      height: options.viewportHeight || 900,
    },
  });

  console.log(`[Capture] Navigating to ${options.targetUrl}...`);
  await page.goto(options.targetUrl, { waitUntil: "networkidle" });

  // Zero-Spinner Safeguard: 로딩 스피너 및 펄스 스켈레톤 소멸 대기
  try {
    await page.waitForSelector(".animate-spin", { state: "detached", timeout: 5000 });
  } catch {
    // Spinner already detached or not present
  }

  // 바닥까지 스크롤하여 지연 로딩 이미지 및 동적 리스트 렌더링 강제
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 250;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });

  await page.waitForTimeout(1000);
  await page.screenshot({ path: outputFile, fullPage: true });
  await browser.close();

  console.log(`[Capture] ✅ Fullpage screenshot saved: ${outputFile}`);
  return outputFile;
}

if (process.argv[1] && process.argv[1].endsWith("capture-fullpage.ts")) {
  const pageName = process.argv[2] || "dashboard";
  const targetUrl = process.argv[3] || "http://localhost:3000";
  captureFullPage(pageName, { targetUrl }).catch((err) => {
    console.error("[Capture] Error:", err);
    process.exit(1);
  });
}
