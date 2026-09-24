import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const OUT = process.env.SHOT_DIR ?? "shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--no-sandbox"],
});

async function shot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✓ ${name}`);
}

// ---------- Mobile storefront flow ----------
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const m = await mobile.newPage();

await m.goto(`${BASE}/`, { waitUntil: "networkidle" });
await shot(m, "01-mobile-home");

await m.goto(`${BASE}/katalogas`, { waitUntil: "networkidle" });
await shot(m, "02-mobile-catalog");

await m.goto(`${BASE}/produktas/zilga`, { waitUntil: "networkidle" });
await shot(m, "03-mobile-product");

// add to cart
await m.click("text=Į krepšelį");
await m.waitForTimeout(500);
await m.goto(`${BASE}/krepselis`, { waitUntil: "networkidle" });
await shot(m, "04-mobile-cart");

// checkout
await m.goto(`${BASE}/atsiskaitymas`, { waitUntil: "networkidle" });
await m.fill("#co-name", "Jonas Jonaitis");
await m.fill("#co-email", "jonas@example.com");
await m.fill("#co-phone", "+37060000000");
// pick Omniva terminal
await m.click('input[placeholder*="Ieškoti"]');
await m.fill('input[placeholder*="Ieškoti"]', "Kauno");
await m.waitForTimeout(800);
await m.click("li button >> text=Kauno AKROPOLIS");
await shot(m, "05-mobile-checkout");

await Promise.all([
  m.waitForURL(/uzsakymas/, { timeout: 30000 }),
  m.click('button[type="submit"]'),
]);
await m.waitForLoadState("networkidle");
await shot(m, "06-mobile-order-confirmation");
console.log("order url:", m.url());
await mobile.close();

// ---------- Desktop views ----------
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const d = await desktop.newPage();

await d.goto(`${BASE}/`, { waitUntil: "networkidle" });
await shot(d, "07-desktop-home");

await d.goto(`${BASE}/en/catalog?usage=WINE`, { waitUntil: "networkidle" });
await shot(d, "08-desktop-catalog-en-filtered");

await d.goto(`${BASE}/ru/product/marquette`, { waitUntil: "networkidle" });
await shot(d, "09-desktop-product-ru");

// ---------- Admin flow ----------
await d.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
await d.fill("#email", process.env.ADMIN_EMAIL || "admin@example.com");
await d.fill("#password", process.env.ADMIN_PASSWORD || "admin123");
await Promise.all([
  d.waitForURL(/\/admin$/, { timeout: 30000 }),
  d.click('button[type="submit"]'),
]);
await d.waitForLoadState("networkidle");
await shot(d, "10-admin-dashboard");

await d.goto(`${BASE}/admin/orders`, { waitUntil: "networkidle" });
await shot(d, "11-admin-orders");

// open the newest order and mark as PAID
await d.click("table a >> nth=0");
await d.waitForLoadState("networkidle");
await d.selectOption('select[aria-label="Užsakymo būsena"]', "PAID");
await d.waitForTimeout(1200);
await shot(d, "12-admin-order-paid");

await d.goto(`${BASE}/admin/products`, { waitUntil: "networkidle" });
await d.click("table a >> nth=0");
await d.waitForLoadState("networkidle");
await shot(d, "13-admin-product-edit");

await desktop.close();
await browser.close();
console.log("SMOKE OK");
