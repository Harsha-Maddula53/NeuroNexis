import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { sendPasswordResetEmail } from "../src/lib/mail";

function loadEnvFile(file: string) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env"));
delete process.env.RESEND_API_KEY;

const ARTIFACT_DIR = path.join(process.cwd(), "artifacts");
const LAST_SEND_FILE = path.join(process.cwd(), "latest-ethereal.json");
const ACCOUNT_FILE = path.join(process.cwd(), ".ethereal-account.json");
const STALE_URL =
  "https://ethereal.email/message/ap-97KpIpkHSGxPaap-98PNVsWIVelEsAAAAAWH9K.gd7Ln6NzbrslZRaL4";

async function fetchStatus(url: string) {
  const res = await fetch(url, { redirect: "manual" });
  const body = await res.text();
  return {
    url,
    status: res.status,
    titleMatch: (body.match(/<title>([^<]+)<\/title>/i) || [])[1] || null,
    has404: /Error 404|This message does not exist/i.test(body),
    hasResetSubject: /Reset your NeuroNexis password/i.test(body),
    hasResetLink: /Reset your password/i.test(body),
    snippet: body.replace(/\s+/g, " ").slice(0, 800),
  };
}

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const staleUnauth = await fetchStatus(STALE_URL);
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug2-stale-url-fetch.json"),
    JSON.stringify(staleUnauth, null, 2),
  );
  console.log("STALE_UNAUTH", JSON.stringify(staleUnauth, null, 2));

  const resetUrl = `http://localhost:3000/reset-password?token=verify-ethereal-${Date.now()}`;

  const send1 = await sendPasswordResetEmail("smoke-1788853710389@test.com", resetUrl);
  const last1 = readJson(LAST_SEND_FILE);
  const account1 = readJson(ACCOUNT_FILE);

  const send2 = await sendPasswordResetEmail(
    "smoke-1788853710389@test.com",
    resetUrl + "-second",
  );
  const last2 = readJson(LAST_SEND_FILE);
  const account2 = readJson(ACCOUNT_FILE);

  const lastSendMeta = {
    send1,
    send2,
    user1: last1.user,
    user2: last2.user,
    accountUser1: account1.user,
    accountUser2: account2.user,
    sameAccountAcrossTwoSends: last1.user === last2.user && last1.user === account1.user,
    previewUrl1: last1.previewUrl,
    previewUrl2: last2.previewUrl,
    response1: last1.response,
    response2: last2.response,
    sentAt1: last1.sentAt,
    sentAt2: last2.sentAt,
  };
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug2-last-send.json"),
    JSON.stringify(lastSendMeta, null, 2),
  );
  console.log("LAST_SEND_META", JSON.stringify(lastSendMeta, null, 2));

  const freshUnauth = await fetchStatus(last2.previewUrl);
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug2-fresh-url-unauth-fetch.json"),
    JSON.stringify(freshUnauth, null, 2),
  );
  console.log("FRESH_UNAUTH", JSON.stringify(freshUnauth, null, 2));

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(STALE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "bug2-stale-url-404.png"),
    fullPage: true,
  });

  await page.goto("https://ethereal.email/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("input[name='address'], input[type='email'], #address");
  const emailInput = page.locator("input[name='address'], input[type='email'], #address").first();
  const passInput = page.locator("input[name='password'], input[type='password']").first();
  await emailInput.fill(last2.user);
  await passInput.fill(last2.pass);
  await Promise.all([
    page.waitForURL(/ethereal\.email\/(messages|message)/, { timeout: 20000 }).catch(() => null),
    page.locator("button[type='submit'], input[type='submit']").first().click(),
  ]);
  await page.waitForTimeout(2000);

  if (!/\/messages|\/message/.test(page.url())) {
    await page.goto("https://ethereal.email/messages", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
  }

  const afterLogin = {
    url: page.url(),
    loggedInChrome: await page.locator("text=/Log out|Logout|Messages/i").count(),
    bodyText: (await page.locator("body").innerText()).slice(0, 2500),
  };
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug2-ethereal-login.json"),
    JSON.stringify(afterLogin, null, 2),
  );
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "ethereal-inbox-logged-in.png"),
    fullPage: true,
  });

  await page.goto(last2.previewUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const iframeHtml = await page
    .locator("iframe")
    .first()
    .evaluate((el: HTMLIFrameElement) => el.contentDocument?.documentElement.innerHTML || "")
    .catch(() => "");

  const authedTrace = {
    finalUrl: page.url(),
    title: await page.title(),
    has404: /Error 404|This message does not exist/i.test(await page.content()),
    h1: await page.locator("h1").first().innerText().catch(() => null),
    visibleText: await page.locator("body").innerText(),
    iframeHtml: iframeHtml.slice(0, 2000),
    resetLinkHref:
      (await page
        .locator("iframe")
        .first()
        .evaluate((el: HTMLIFrameElement) => {
          const a = el.contentDocument?.querySelector("a");
          return a?.getAttribute("href") || null;
        })
        .catch(() => null)) ||
      (await page.locator('a:has-text("Reset your password")').first().getAttribute("href").catch(() => null)),
    etherealUser: last2.user,
    to: last2.to,
  };
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "bug2-authed-message-trace.json"),
    JSON.stringify(authedTrace, null, 2),
  );
  console.log("AUTHED_TRACE", JSON.stringify(authedTrace, null, 2));

  const screenshotPath = path.join(ARTIFACT_DIR, "password-reset-email-body.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("SCREENSHOT", screenshotPath);

  if (authedTrace.has404 || !/Reset your password/i.test(authedTrace.visibleText + authedTrace.iframeHtml)) {
    await browser.close();
    throw new Error("Ethereal message body was not actually visible after login.");
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
