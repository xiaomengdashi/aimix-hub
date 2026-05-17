/**
 * 附件 E2E：上传 README.md 并发送，检查是否有 AI 回复。
 * 用法: node scripts/test-readme-attachment.mjs
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const readmePath = path.join(root, "README.md");
const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logs = [];
  page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => logs.push(`[pageerror] ${err.message}`));

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });

    if (page.url().includes("/login")) {
      console.log("SKIP: 需要登录，当前在", page.url());
      console.log("请在已登录浏览器中手动测试，或配置测试账号。");
      process.exit(0);
    }

    await page.waitForTimeout(2000);

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: "attached", timeout: 15_000 });
    await fileInput.setInputFiles(readmePath);

    await page.waitForTimeout(1500);

    const attachmentVisible = await page
      .locator(".aui-composer-attachments, .aui-claude-composer-attachments")
      .evaluate((el) => el.textContent?.trim().length > 0 || el.children.length > 0)
      .catch(() => false);

    console.log("附件区域有内容:", attachmentVisible);

    const prompt =
      "请用一句话说明这个 README 附件讲的是什么项目。";
    const textbox = page.getByRole("textbox").first();
    await textbox.fill(prompt);

    const sendBtn = page
      .locator('button[aria-label="Send message"], button:has(svg)')
      .filter({ has: page.locator("svg") })
      .last();

    const sendAlt = page.locator(
      'button:has([class*="ArrowUp"]), [class*="composer-send"]',
    );
    if (await sendAlt.count()) {
      await sendAlt.first().click({ timeout: 5000 }).catch(() => {});
    } else {
      await page.keyboard.press("Enter");
    }

    await page.waitForTimeout(500);

    const claudeSend = page.locator(
      'button:has(svg):near(textarea), form button[type="button"]',
    );
    const orangeSend = page.locator(
      'button.bg-\\[\\#c96442\\], button[class*="c96442"]',
    );
    if (await orangeSend.count()) {
      await orangeSend.first().click();
    }

    await page.waitForTimeout(25_000);

    const bodyText = await page.locator("body").innerText();
    const hasAssistant =
      bodyText.includes("Claude") ||
      bodyText.includes("clone") ||
      bodyText.includes("assistant-ui") ||
      bodyText.includes("项目");

    console.log("页面含回复关键词:", hasAssistant);
    console.log("当前 URL:", page.url());

    if (!attachmentVisible) {
      console.error("FAIL: 上传 README 后未看到附件预览");
      process.exit(1);
    }

    if (!hasAssistant) {
      console.error("FAIL: 发送后未见明显 AI 回复内容");
      console.log("--- console ---");
      logs.slice(-20).forEach((l) => console.log(l));
      process.exit(1);
    }

    console.log("PASS: README 附件上传并收到回复");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
