// End-to-end QA against a running site (pnpm build && pnpm start, then pnpm qa).
// Uses an installed Edge or Chrome: QA_BROWSER=msedge|chrome (default msedge). QA_URL defaults to http://localhost:3100.
// Needs ADMIN_PASSWORD in the environment or .env.local for the admin checks.
//
// It submits one real enquiry ("QA Robot") and changes one price, then puts the price back.

import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = process.env.QA_URL ?? 'http://localhost:3100';
const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? envFile.match(/^ADMIN_PASSWORD=(.*)$/m)?.[1]?.trim();

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const PAGES = [
  '/', '/projects', '/projects/bikerdash', '/projects/smart-irrigation', '/projects/smart-ev-charging',
  '/sera-tech', '/agrisera', '/sera-energy', '/sera-home', '/sera-assistants', '/sera-front-desk',
  '/pricing', '/start', '/about', '/legal/privacy', '/legal/terms',
];

async function statusChecks() {
  for (const p of PAGES) {
    const r = await fetch(BASE + p, { redirect: 'manual' });
    check(`GET ${p} → 200`, r.status === 200, String(r.status));
  }
  for (const p of ['/no-such-page', '/projects/no-such-project', '/sera-nothing']) {
    const r = await fetch(BASE + p, { redirect: 'manual' });
    check(`GET ${p} → 404`, r.status === 404, String(r.status));
  }
  const admin = await fetch(BASE + '/admin', { redirect: 'manual' });
  check('GET /admin without a session redirects to login', admin.status >= 300 && admin.status < 400 && (admin.headers.get('location') ?? '').includes('/admin/login'), `${admin.status} ${admin.headers.get('location')}`);
  const forged = await fetch(BASE + '/admin', { redirect: 'manual', headers: { cookie: 'sera_admin=9999999999.forged' } });
  const forgedBody = forged.status === 200 ? await forged.text() : '';
  check('A forged admin cookie does not open the admin', forged.status !== 200 || !forgedBody.includes('Enquiries</h1>'), String(forged.status));
  for (const p of ['/sitemap.xml', '/robots.txt', '/opengraph-image.png', '/icon.png']) {
    const r = await fetch(BASE + p);
    check(`GET ${p} → 200`, r.status === 200, String(r.status));
  }
}

async function pageChecks(browser, width, height, label) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: width < 800, hasTouch: width < 800 });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
        await page.waitForTimeout(1200); // late layout (fonts, animations) can widen a page
    // clientWidth, not innerWidth: on phones the layout viewport grows to fit overflowing content.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const h1 = await page.locator('h1').count();
    check(`${label} ${p}: no console errors`, errors.length === 0, errors.slice(0, 2).join(' | '));
    check(`${label} ${p}: no horizontal overflow`, overflow <= 0, `${overflow}px`);
    check(`${label} ${p}: exactly one h1`, h1 === 1, String(h1));
    await page.close();
  }
  await ctx.close();
}

async function builderFlow(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/start?service=website&package=pro-website`, { waitUntil: 'networkidle' });
  check('Builder: a package link starts on step 2 with the package chosen', await page.getByRole('radio', { name: /Pro Website/ }).getAttribute('aria-checked') === 'true');
  await page.getByRole('radio', { name: 'Business website' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('checkbox', { name: /Online payments/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  const next = page.getByRole('button', { name: 'Next' });
  check('Builder: Next is disabled until a timeline is chosen', await next.isDisabled());
  await page.getByRole('radio', { name: /Flexible/ }).click();
  await next.click();
  await page.waitForTimeout(900);
  const estimateText = await page.locator('main').innerText();
  // Pro Website $180 + online payments $80 = $260; top of range $260 × 1.4 = $364 → $350
  check('Builder: estimate is package + features ($260 – $350)', estimateText.includes('$260') && estimateText.includes('$350'), estimateText.match(/\$[\d,]+\s*–\s*\$[\d,]+/)?.[0] ?? 'no range');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Start project', exact: true }).click();
  await page.waitForTimeout(800);
  check('Builder: empty form shows field errors', (await page.locator('[aria-invalid="true"]').count()) >= 2);
  await page.getByLabel(/^Name/).fill('QA Robot');
  await page.getByLabel(/^Email/).fill('qa.robot@example.com');
  await page.getByLabel(/^Phone/).fill('+263 77 000 0000');
  await page.getByLabel(/^Project description/).fill('Automated QA submission: a business website with online payments.');
  await page.getByRole('button', { name: 'Start project', exact: true }).click();
  const status = page.getByRole('status');
  await status.waitFor({ timeout: 15000 });
  const text = await status.innerText();
  check('Builder: submission succeeds with a reference', /SO-\d{5}/.test(text), text.match(/SO-\d{5}/)?.[0] ?? text.slice(0, 80));
  await ctx.close();
}

async function adminFlow(browser) {
  if (!ADMIN_PASSWORD) return check('Admin: ADMIN_PASSWORD available for QA', false, 'set it in .env.local');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('Admin: unauthenticated visit lands on the login page', page.url().includes('/admin/login'));
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  const refused = page.locator('#login-error');
  await refused.waitFor();
  check('Admin: a wrong password is refused', (await refused.innerText()).includes('not right'));
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/admin$/);
  check('Admin: the right password opens the enquiries list', await page.getByRole('heading', { name: 'Enquiries' }).isVisible());
  check('Admin: the QA enquiry is listed with its estimate', (await page.locator('main').innerText()).includes('QA Robot'));

  const setBasic = async (dollars) => {
    await page.goto(`${BASE}/admin/pricing`, { waitUntil: 'networkidle' });
    const field = page.locator('fieldset', { hasText: 'Basic Website' }).getByLabel('Price (USD)');
    await field.fill(String(dollars));
    await page.getByRole('button', { name: 'Save and publish' }).click();
    await page.getByText('Prices saved and published.').waitFor({ timeout: 10000 });
  };
  // The Basic Website card's own price, not any "$120" elsewhere on the page.
  const basicPrice = async () => {
    const html = await (await fetch(`${BASE}/pricing`)).text();
    return html.match(/id="plan-basic-website"[^>]*>Basic Website<\/h3>[\s\S]*?(\$[\d,]+)/)?.[1] ?? null;
  };
  check('Admin: the public Basic Website price starts at $100', (await basicPrice()) === '$100', String(await basicPrice()));
  await setBasic(120);
  check('Admin: a saved price appears on the public pricing page', (await basicPrice()) === '$120', String(await basicPrice()));
  await setBasic(100);
  check('Admin: the price is restored', (await basicPrice()) === '$100', String(await basicPrice()));
  await ctx.close();
}

async function motionAndKeyboard(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  // Headings reveal as they enter the viewport (instantly, with reduced motion), so walk the page like a reader.
  const H = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(800);
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll('h1, h2')].filter((h) => {
      const spans = h.querySelectorAll('span span');
      return [...spans].some((s) => getComputedStyle(s).transform !== 'none' && !getComputedStyle(s).transform.includes('matrix(1, 0, 0, 1, 0, 0)'));
    }).length,
  );
  check('Reduced motion: every heading is shown without its entrance animation', hidden === 0, `${hidden} offset`);
  await ctx.close();

  const kctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const k = await kctx.newPage();
  await k.goto(BASE + '/', { waitUntil: 'load' });
  await k.waitForTimeout(800);
  const node = k.getByRole('button', { name: /^AgriSera:/ });
  await node.focus();
  await k.keyboard.press('Enter');
  await k.waitForTimeout(1200); // the readout cross-fades (~0.7 s)
  const readout = await k.locator('[aria-live="polite"]').first().innerText();
  check('Keyboard: focusing an ecosystem node shows its description', /agrisera/i.test(readout), readout.slice(0, 60).replace(/\s+/g, ' '));
  await k.keyboard.press('Tab');
  check('Keyboard: focus moves on from the node', await k.evaluate(() => document.activeElement?.getAttribute('aria-label')?.startsWith('Sera Energy') ?? false));
  await kctx.close();

  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.goto(BASE + '/', { waitUntil: 'load' });
  await mp.waitForTimeout(800);
  await mp.getByRole('button', { name: 'Open menu' }).tap();
  await mp.getByRole('dialog').waitFor();
  check('Mobile: the menu opens with the main links', await mp.getByRole('dialog').getByRole('link', { name: /Pricing/ }).isVisible());
  await mp.getByRole('button', { name: 'Close menu' }).tap();
  await mp.waitForTimeout(500);
  check('Mobile: the menu closes', (await mp.getByRole('dialog').count()) === 0);
  await mp.evaluate(() => window.scrollTo(0, 2000));
  await mp.waitForTimeout(800);
  const bar = mp.locator('div[aria-hidden="false"] a', { hasText: 'Start a project' });
  check('Mobile: a sticky Start Project button appears after the hero', (await bar.count()) === 1 && (await bar.isVisible()));
  await m.close();
}

async function seraHome(browser) {
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 120)));
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));
    for (const p of ['/', '/sera-home']) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      await page.waitForTimeout(1200);
    }
    check(`Reduced motion ${reducedMotion}: no console or hydration errors on / and /sera-home`, errors.length === 0, errors.slice(0, 2).join(' | '));

    // Walk the page so every heading enters the viewport, then make sure none is stuck behind its mask.
    const H = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(150); }
    await page.waitForTimeout(1500);
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2')].filter((h) =>
        [...h.querySelectorAll(':scope > span > span')].some((s) => { const t = getComputedStyle(s).transform; return t !== 'none' && t !== 'matrix(1, 0, 0, 1, 0, 0)'; }),
      ).map((h) => h.textContent?.slice(0, 30)),
    );
    check(`Reduced motion ${reducedMotion}: /sera-home headings fully revealed`, stuck.length === 0, stuck.join(' | '));
    await ctx.close();
  }

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/sera-home', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const gallery = page.locator('#examples');
  const figures = gallery.locator('figure');
  const total = await figures.count();
  const credited = await gallery.locator('figure:has-text("Photo:")').count();
  const labelled = await gallery.locator('figure:has-text("Example")').count();
  check('Sera Home: every gallery photo is credited and labelled as an example', total >= 10 && credited === total && labelled === total, `${total} photos, ${credited} credited, ${labelled} labelled`);
  await gallery.getByRole('button', { name: 'Oil drums' }).click();
  await page.waitForTimeout(900);
  const drums = await figures.count();
  check('Sera Home: the gallery filter shows only that material', drums > 0 && drums < total, `${drums} of ${total}`);
  const firstTab = page.getByRole('tab', { name: 'Oil drum' }).first();
  await firstTab.click();
  await page.waitForTimeout(600);
  check('Sera Home: choosing a material switches the transformation diagram', (await firstTab.getAttribute('aria-selected')) === 'true' && (await page.locator('#up-panel').innerText()).includes('Handwashing stations'));
  await page.getByRole('button', { name: /03 In use/ }).first().click();
  await page.waitForTimeout(800);
  check('Sera Home: a stage can be chosen by hand', (await page.getByRole('button', { name: /03 In use/ }).first().getAttribute('aria-current')) === 'step');
  await ctx.close();
}

const browser = await chromium.launch({ channel: process.env.QA_BROWSER ?? 'msedge', headless: true });
try {
  await statusChecks();
  await pageChecks(browser, 1440, 900, 'desktop');
  await pageChecks(browser, 390, 844, 'phone');
  await builderFlow(browser);
  await adminFlow(browser);
  await motionAndKeyboard(browser);
  await seraHome(browser);
} finally {
  await browser.close();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
