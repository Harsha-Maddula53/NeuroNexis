import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  const testUserEmail = `testuser-${Date.now()}-${Math.floor(Math.random() * 1000)}@test.com`;
  const testUserPassword = "Password123!";

  test("should bounce unauthenticated user from protected route", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should register, login, and redirect to dashboard/setup", async ({ page }) => {
    // 1. Register
    await page.goto("http://localhost:3000/register");
    await page.fill('input[name="firstName"]', "E2E");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', testUserEmail);
    await page.fill('input[name="password"]', testUserPassword);
    await page.fill('input[name="confirmPassword"]', testUserPassword);
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.selectOption('select[name="gender"]', 'male');
    // Wait, the gender is a select? The UI had `select className="w-full...`
    
    // Check terms
    await page.click('input[name="terms"]');
    
    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to login or setup
    await page.waitForURL(/.*(\/login|\/setup\/identity|\/dashboard)/);

    // If redirected to login, login
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', testUserEmail);
      await page.fill('input[name="password"]', testUserPassword);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*(\/dashboard|\/setup\/identity)/);
    }
  });
});
