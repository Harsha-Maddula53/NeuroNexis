const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let errors = [];
  page.on('pageerror', error => errors.push(`Page Error: ${error.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console Error: ${msg.text()}`);
  });

  console.log('Loading landing page...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  console.log('Registering test user...');
  await page.goto('http://localhost:3000/register');
  await page.fill('input[name="firstName"]', 'Smoke');
  await page.fill('input[name="lastName"]', 'Test');
  const email = `smoke-${Date.now()}@test.com`;
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'Password123!');
  await page.fill('input[name="confirmPassword"]', 'Password123!');
  await page.fill('input[name="dob"]', '1990-01-01');
  await page.selectOption('select[name="gender"]', 'male');
  await page.click('input[name="terms"]');
  await page.click('button[type="submit"]');

  await page.waitForURL(/.*(\/login|\/setup\/identity|\/dashboard)/);
  if (page.url().includes('/login')) {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(\/dashboard|\/setup\/identity)/);
  }

  console.log('Loading dashboard...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');

  console.log('Loading society page...');
  await page.goto('http://localhost:3000/society');
  await page.waitForLoadState('networkidle');

  console.log('Checking for AI persona...');
  const link = await page.$('a[href^="/chat/"]');
  if (link) {
    console.log('Loading chat view...');
    await link.click();
    await page.waitForLoadState('networkidle');
  } else {
    console.log('No chat link found on society page. Cannot test chat view.');
  }

  console.log('\n--- Smoke Test Results ---');
  if (errors.length > 0) {
    console.log('Found errors during smoke pass:');
    errors.forEach(e => console.log(e));
  } else {
    console.log('No console errors detected! Navigation passed cleanly.');
  }

  await browser.close();
})();
