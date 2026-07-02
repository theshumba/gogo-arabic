import { chromium } from '@playwright/test';
const URL = (process.env.GOGO_BASE_URL || 'http://localhost:3000') + '/world-sandbox.html';
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
pg.on('console', (m) => { if (m.type() === 'error') console.log('[err]', m.text()); });
pg.on('pageerror', (e) => console.log('[pageerror]', e.message));
await pg.goto(URL, { waitUntil: 'networkidle' });
await pg.waitForTimeout(2500);                     // let assets load + render
await pg.screenshot({ path: 'docs/world-shots/_sandbox_1_spawn.png' });
// walk up into the village
await pg.keyboard.down('ArrowUp');
await pg.waitForTimeout(1400);
await pg.keyboard.up('ArrowUp');
await pg.waitForTimeout(400);
await pg.screenshot({ path: 'docs/world-shots/_sandbox_2_walked.png' });
console.log('done');
await b.close();
