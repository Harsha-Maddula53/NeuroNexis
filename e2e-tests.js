const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Registering user...");
  await page.goto("http://localhost:3000/register");
  const email = `smoke-${Date.now()}@test.com`;
  await page.fill('input[name="firstName"]', "Test");
  await page.fill('input[name="lastName"]', "User");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', "Password123!");
  await page.fill('input[name="confirmPassword"]', "Password123!");
  await page.fill('input[name="dob"]', "1990-01-01");
  await page.selectOption('select[name="gender"]', "male");
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  await page.waitForURL(/.*(\/login|\/setup\/identity|\/dashboard)/);
  if (page.url().includes("/login")) {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(\/dashboard|\/setup\/identity)/);
  }

  console.log("Testing training sandbox...");
  await page.goto("http://localhost:3000/training");
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(process.cwd(), "artifacts", "training-sandbox-gate.png"),
    fullPage: true,
  });

  console.log("Triggering password reset...");
  await page.goto("http://localhost:3000/forgot-password");
  await page.fill('input[name="email"]', email);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const lastSendPath = path.join(process.cwd(), "latest-ethereal.json");
  if (!fs.existsSync(lastSendPath)) {
    throw new Error("No latest-ethereal.json after forgot-password");
  }
  const lastSend = JSON.parse(fs.readFileSync(lastSendPath, "utf8"));
  console.log("Ethereal URL:", lastSend.previewUrl);
  console.log("Ethereal user:", lastSend.user);

  await page.goto("https://ethereal.email/login");
  await page.locator("input[name='address'], input[type='email'], #address").first().fill(lastSend.user);
  await page.locator("input[name='password'], input[type='password']").first().fill(lastSend.pass);
  await page.locator("button[type='submit'], input[type='submit']").first().click();
  await page.waitForTimeout(2500);
  await page.goto(lastSend.previewUrl);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: path.join(process.cwd(), "artifacts", "password-reset-email-body.png"),
    fullPage: true,
  });
  console.log("Saved password reset email screenshot.");

  await browser.close();
})();
