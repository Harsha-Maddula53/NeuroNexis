const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 1. Admin test
  console.log('Logging in as Admin...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(\/dashboard|\/setup\/identity)/);

  console.log('Navigating to Admin Reports...');
  await page.goto('http://localhost:3000/admin/reports');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'C:/Users/Harsha Vardhan/.gemini/antigravity/brain/6789203e-dffe-4037-822c-e21f6a0c9a0f/admin-reports.png' });
  console.log('Admin screenshot saved.');

  // Logout
  await page.context().clearCookies();

  // 2. Normal user test
  console.log('Logging in as Normal User...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'normal@test.com');
  await page.fill('input[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*(\/dashboard|\/setup\/identity)/);

  console.log('Navigating to Admin Reports as Normal User...');
  await page.goto('http://localhost:3000/admin/reports');
  await page.waitForLoadState('networkidle');
  console.log('Normal user redirected to:', page.url());

  await browser.close();
})();
