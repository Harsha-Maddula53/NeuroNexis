const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { chromium } = require("playwright");

(async () => {
    const prisma = new PrismaClient();
    const email = "screenshot@test.com";
    const password = "password";
    
    // Seed
    await prisma.user.deleteMany({ where: { email } });
    const hash = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: {
            name: "Screenshot User",
            email,
            password: hash,
            dateOfBirth: new Date("1990-01-01"),
            gender: "Other",
        }
    });

    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2
    });
    const page = await context.newPage();
    
    await page.goto("http://localhost:3000/login");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/.*(\/dashboard|\/setup\/identity)/);
    await page.goto("http://localhost:3000/settings");
    
    await page.waitForSelector('text=Account Details');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // We must copy it to the artifact directory so we can embed it
    const artifactPath = "C:\\Users\\Harsha Vardhan\\.gemini\\antigravity\\brain\\6789203e-dffe-4037-822c-e21f6a0c9a0f\\settings-mobile.png";
    await page.screenshot({ path: artifactPath, fullPage: true });

    await browser.close();
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
    console.log("Screenshot taken successfully");
})();
