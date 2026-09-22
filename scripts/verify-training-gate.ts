import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";

const ARTIFACT_DIR = path.join(process.cwd(), "artifacts");
const EMAIL = "smoke-1788853710389@test.com";
const PASSWORD = "Password123!";

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on("response", async (res) => {
    if (res.url().includes("/api/ai/train") && res.request().method() === "POST") {
      const body = await res.text().catch(() => "");
      const trace = {
        url: res.url(),
        status: res.status(),
        body,
      };
      fs.writeFileSync(
        path.join(ARTIFACT_DIR, "bug1-train-post-error.json"),
        JSON.stringify(trace, null, 2),
      );
      console.log("TRAIN_POST", JSON.stringify(trace, null, 2));
    }
  });

  await page.goto("http://localhost:3000/login");
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|setup\/identity|training)/, { timeout: 20000 });
  await page.goto("http://localhost:3000/training");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);

  const apiTrace = await page.evaluate(async () => {
    const getRes = await fetch("/api/ai/train");
    const getJson = await getRes.json().catch(() => null);
    const postRes = await fetch("/api/ai/train", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: getJson?.conversationId,
        userMessage: "Hello AI twin",
      }),
    });
    const postText = await postRes.text();
    return {
      getStatus: getRes.status,
      getJson,
      postStatus: postRes.status,
      postText,
    };
  });
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug1-train-api-trace.json"),
    JSON.stringify(apiTrace, null, 2),
  );
  console.log("API_TRACE", JSON.stringify(apiTrace, null, 2));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "training-sandbox-gate.png"),
    fullPage: true,
  });
  const bodyText = await page.locator("body").innerText();
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug1-training-page-text.txt"),
    bodyText,
  );
  console.log("PAGE_TEXT\n", bodyText);

  const input = page.locator('input[placeholder*="conversation"], input[placeholder*="onboarding"]');
  if (await input.count()) {
    const disabled = await input.last().isDisabled();
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "bug1-composer-disabled.json"),
      JSON.stringify({ disabled, placeholder: await input.last().getAttribute("placeholder") }, null, 2),
    );
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
