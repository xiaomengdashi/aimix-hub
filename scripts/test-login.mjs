import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("http://127.0.0.1:3000/login");
await page.fill('input[placeholder="用户名"]', "testlogin99");
await page.fill('input[placeholder="密码"]', "testpass123");
await page.click('button[type="submit"]');
await page.waitForTimeout(4000);
const cookies = await page.context().cookies();
console.log("URL:", page.url());
console.log(
  "Cookies:",
  cookies.map((c) => `${c.name}(${c.value.length})`).join(", "),
);
console.log("Body:", (await page.textContent("body")).slice(0, 300));
await browser.close();
