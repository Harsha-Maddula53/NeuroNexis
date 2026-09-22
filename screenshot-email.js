const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://ethereal.email/message/ap-97KpIpkHSGxPaap-98PNVsWIVelEsAAAAAWH9K.gd7Ln6NzbrslZRaL4');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'C:/Users/Harsha Vardhan/.gemini/antigravity/brain/6789203e-dffe-4037-822c-e21f6a0c9a0f/password-reset-email.png', fullPage: true });
  console.log('Saved password reset email screenshot.');
  await browser.close();
})();
