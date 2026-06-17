import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

initializeApp();
const db = getFirestore();

// Headless Chromium + axe-core need a generous timeout and memory ceiling.
setGlobalOptions({ region: 'us-central1', memory: '2GiB', timeoutSeconds: 120, maxInstances: 10 });

function normalizeUrl(raw) {
  let url = (raw || '').trim();
  if (!url) throw new HttpsError('invalid-argument', 'A URL is required.');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) throw new Error('bad protocol');
    return u.toString();
  } catch {
    throw new HttpsError('invalid-argument', `"${raw}" is not a valid URL.`);
  }
}

// Detectors for items axe cannot determine on its own.
async function runDetectors(page) {
  return page.evaluate(() => {
    const html = document.documentElement.outerHTML.toLowerCase();
    const links = Array.from(document.querySelectorAll('a[href]'));

    const statementLink = links.find((a) => {
      const t = ((a.textContent || '') + ' ' + (a.getAttribute('href') || '')).toLowerCase();
      return /accessibility\s*(statement|policy|commitment)|\/accessibility/.test(t);
    });

    const overlayVendors = [
      'accessibe', 'userway', 'audioeye', 'equalweb', 'accessiway',
      'adally', 'maxaccess', 'truabilities', 'allyable', 'accessily',
      'recite-me', 'reciteme', 'mk-accessibility-widget'
    ];
    const overlayFound = overlayVendors.filter((v) => html.includes(v));

    return {
      accessibilityStatement: { found: !!statementLink, href: statementLink ? statementLink.href : null },
      overlayReliance: { found: overlayFound.length > 0, vendors: overlayFound }
    };
  });
}

export const scanUrl = onCall(async (request) => {
  // Single-user mode: no auth required.
  const url = normalizeUrl(request.data?.url);
  const startedAt = Date.now();

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1280, height: 1024 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 1 });
    await page.setUserAgent('Mozilla/5.0 (AccessEnabled audit bot) Chrome');

    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    const finalUrl = page.url();
    const statusCode = response ? response.status() : null;
    const pageTitle = await page.title();

    // Inject axe and run against WCAG 2.1/2.2 A & AA rule sets.
    await page.evaluate(axeSource);
    const axeResults = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      return await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
        resultTypes: ['violations', 'passes', 'incomplete']
      });
    });

    const detectors = await runDetectors(page);

    await browser.close();
    browser = null;

    return {
      ok: true,
      url: finalUrl,
      requestedUrl: url,
      statusCode,
      pageTitle,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      axeVersion: axeResults.testEngine?.version || null,
      violations: axeResults.violations.map(simplifyRule),
      passes: axeResults.passes.map((r) => r.id),
      incomplete: axeResults.incomplete.map(simplifyRule),
      detectors
    };
  } catch (err) {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
    if (err instanceof HttpsError) throw err;
    throw new HttpsError('internal', `Scan failed: ${err.message}`);
  }
});

function simplifyRule(r) {
  return {
    id: r.id,
    impact: r.impact,
    help: r.help,
    helpUrl: r.helpUrl,
    tags: r.tags,
    nodes: (r.nodes || []).slice(0, 25).map((n) => ({
      target: n.target,
      html: (n.html || '').slice(0, 400),
      failureSummary: n.failureSummary || ''
    })),
    nodeCount: (r.nodes || []).length
  };
}

// Optional helper kept server-side so audit deletes cascade cleanly later.
export const ping = onCall(async () => ({ pong: true, at: FieldValue.serverTimestamp ? 'ok' : 'ok' }));
