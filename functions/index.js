import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

initializeApp();
const db = getFirestore();

const ADMIN_NOTIFICATION_EMAIL =
  process.env.CONTACT_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM =
  process.env.SMTP_FROM ||
  `no-reply@${process.env.SMTP_FROM_DOMAIN || "example.com"}`;

function createMailTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_NOTIFICATION_EMAIL) {
    throw new Error(
      "Missing SMTP_HOST, SMTP_USER, SMTP_PASS, or CONTACT_NOTIFICATION_EMAIL environment variables.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function formatLeadEmail({ name, email, website, plan, message, createdAt }) {
  const createdAtText =
    createdAt instanceof Date ? createdAt.toISOString() : `${createdAt}`;
  return {
    subject: `New AccessEnabled lead from ${name || email || "unknown prospect"}`,
    text: [
      "A new landing page request has been submitted.",
      `Name: ${name || "—"}`,
      `Email: ${email || "—"}`,
      `Website: ${website || "—"}`,
      `Interest: ${plan || "—"}`,
      `Message: ${message || "—"}`,
      `Submitted: ${createdAtText}`,
    ].join("\n"),
    html: `
      <p>A new landing page request has been submitted.</p>
      <ul>
        <li><strong>Name:</strong> ${name || "—"}</li>
        <li><strong>Email:</strong> ${email || "—"}</li>
        <li><strong>Website:</strong> ${website || "—"}</li>
        <li><strong>Interest:</strong> ${plan || "—"}</li>
        <li><strong>Message:</strong> ${message || "—"}</li>
        <li><strong>Submitted:</strong> ${createdAtText}</li>
      </ul>
    `,
  };
}

// Headless Chromium + axe-core need a generous timeout and memory ceiling.
// Whole-site scans (up to SITE_MAX_PAGES) need more headroom than a single page.
setGlobalOptions({
  region: "us-central1",
  memory: "2GiB",
  timeoutSeconds: 300,
  maxInstances: 10,
});

// Whole-site crawl limits.
const SITE_MAX_PAGES = 10;
const SITE_TIME_BUDGET_MS = 270000; // stop crawling before the 300s function timeout
const AXE_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

function normalizeUrl(raw) {
  let url = (raw || "").trim();
  if (!url) throw new HttpsError("invalid-argument", "A URL is required.");
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const u = new URL(url);
    if (!["http:", "https:"].includes(u.protocol))
      throw new Error("bad protocol");
    return u.toString();
  } catch {
    throw new HttpsError("invalid-argument", `"${raw}" is not a valid URL.`);
  }
}

// Detectors for items axe cannot determine on its own.
async function runDetectors(page) {
  return page.evaluate(() => {
    const html = document.documentElement.outerHTML.toLowerCase();
    const links = Array.from(document.querySelectorAll("a[href]"));

    const statementLink = links.find((a) => {
      const t = (
        (a.textContent || "") +
        " " +
        (a.getAttribute("href") || "")
      ).toLowerCase();
      return /accessibility\s*(statement|policy|commitment)|\/accessibility/.test(
        t,
      );
    });

    const overlayVendors = [
      "accessibe",
      "userway",
      "audioeye",
      "equalweb",
      "accessiway",
      "adally",
      "maxaccess",
      "truabilities",
      "allyable",
      "accessily",
      "recite-me",
      "reciteme",
      "mk-accessibility-widget",
    ];
    const overlayFound = overlayVendors.filter((v) => html.includes(v));

    return {
      accessibilityStatement: {
        found: !!statementLink,
        href: statementLink ? statementLink.href : null,
      },
      overlayReliance: {
        found: overlayFound.length > 0,
        vendors: overlayFound,
      },
    };
  });
}

export const scanUrl = onCall(async (request) => {
  // Single-user mode: no auth required.
  const url = normalizeUrl(request.data?.url);
  const scope = request.data?.scope === "site" ? "site" : "page";
  const maxPages =
    scope === "site"
      ? Math.min(
          SITE_MAX_PAGES,
          Math.max(1, Number(request.data?.maxPages) || SITE_MAX_PAGES),
        )
      : 1;
  const startedAt = Date.now();
  const origin = new URL(url).origin;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      defaultViewport: { width: 1280, height: 1024 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024, deviceScaleFactor: 1 });
    await page.setUserAgent("Mozilla/5.0 (AccessEnabled audit bot) Chrome");

    // Aggregation across pages. A rule failing on ANY page = a violation.
    const violAgg = {};
    const incAgg = {};
    const passSet = new Set();
    const detectorsAgg = {
      accessibilityStatement: { found: false, href: null },
      overlayReliance: { found: false, vendors: [] },
    };

    const visited = new Set();
    const queue = [url];
    const pages = [];
    let firstMeta = null;

    while (queue.length && visited.size < maxPages) {
      if (visited.size > 0 && Date.now() - startedAt > SITE_TIME_BUDGET_MS)
        break;
      const target = queue.shift().split("#")[0];
      if (visited.has(target)) continue;
      visited.add(target);

      const pageStart = Date.now();
      let response;
      try {
        response = await page.goto(target, {
          waitUntil: "networkidle2",
          timeout: scope === "site" ? 45000 : 60000,
        });
      } catch (navErr) {
        pages.push({ url: target, statusCode: null, error: navErr.message });
        continue;
      }

      const finalUrl = page.url();
      const statusCode = response ? response.status() : null;
      const pageTitle = await page.title();
      const pagePath = (() => {
        try {
          return new URL(finalUrl).pathname || "/";
        } catch {
          return finalUrl;
        }
      })();

      // Inject axe and run against WCAG 2.1/2.2 A & AA rule sets.
      await page.evaluate(axeSource);
      const axeResults = await page.evaluate(async (tags) => {
        // eslint-disable-next-line no-undef
        return await axe.run(document, {
          runOnly: { type: "tag", values: tags },
          resultTypes: ["violations", "passes", "incomplete"],
        });
      }, AXE_TAGS);

      const detectors = await runDetectors(page);

      axeResults.violations.forEach((r) =>
        mergeRule(violAgg, r, pagePath, scope),
      );
      axeResults.incomplete.forEach((r) =>
        mergeRule(incAgg, r, pagePath, scope),
      );
      axeResults.passes.forEach((r) => passSet.add(r.id));

      if (
        detectors.accessibilityStatement.found &&
        !detectorsAgg.accessibilityStatement.found
      ) {
        detectorsAgg.accessibilityStatement = {
          found: true,
          href: detectors.accessibilityStatement.href,
        };
      }
      if (detectors.overlayReliance.found) {
        detectorsAgg.overlayReliance.found = true;
        detectors.overlayReliance.vendors.forEach((v) => {
          if (!detectorsAgg.overlayReliance.vendors.includes(v))
            detectorsAgg.overlayReliance.vendors.push(v);
        });
      }

      if (!firstMeta) {
        firstMeta = {
          url: finalUrl,
          statusCode,
          pageTitle,
          axeVersion: axeResults.testEngine?.version || null,
        };
      }

      pages.push({
        url: finalUrl,
        statusCode,
        pageTitle,
        violationCount: axeResults.violations.length,
        durationMs: Date.now() - pageStart,
      });

      // Discover more same-origin links to crawl (whole-site only).
      if (scope === "site" && visited.size < maxPages) {
        const links = await extractLinks(page, origin);
        for (const link of links) {
          const clean = link.split("#")[0];
          if (!visited.has(clean) && !queue.includes(clean)) queue.push(clean);
        }
      }
    }

    await browser.close();
    browser = null;

    return {
      ok: true,
      url: firstMeta?.url || url,
      requestedUrl: url,
      statusCode: firstMeta ? firstMeta.statusCode : null,
      pageTitle: firstMeta?.pageTitle || "",
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      axeVersion: firstMeta?.axeVersion || null,
      scope,
      pagesScanned: pages.filter((p) => !p.error).length,
      pages,
      violations: Object.values(violAgg).map(finalizeRule),
      passes: Array.from(passSet),
      incomplete: Object.values(incAgg).map(finalizeRule),
      detectors: detectorsAgg,
    };
  } catch (err) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore */
      }
    }
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", `Scan failed: ${err.message}`);
  }
});

export const notifyLeadCreated = onDocumentCreated(
  "leads/{leadId}",
  async (event) => {
    if (!event?.data) {
      console.warn("notifyLeadCreated called without event data.");
      return;
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_NOTIFICATION_EMAIL) {
      console.warn(
        "Email notification skipped; required SMTP / admin email env vars are not configured.",
      );
      return;
    }
    const snapshot = event.data;
    const lead = snapshot.data?.();
    if (!lead) {
      console.warn("notifyLeadCreated called with empty document snapshot.");
      return;
    }
    const createdAt =
      lead.createdAt?.toDate?.() || lead.createdAt || new Date();
    const { subject, text, html } = formatLeadEmail({
      name: lead.name,
      email: lead.email,
      website: lead.website,
      plan: lead.plan,
      message: lead.message,
      createdAt,
    });

    const transporter = createMailTransport();
    await transporter.sendMail({
      from: SMTP_FROM,
      to: ADMIN_NOTIFICATION_EMAIL,
      replyTo: lead.email,
      subject,
      text,
      html,
    });
  },
);

// Collect same-origin, crawlable links from the current page.
async function extractLinks(page, origin) {
  return page.evaluate((origin) => {
    const out = new Set();
    document.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      try {
        const u = new URL(href, document.baseURI);
        if (u.origin !== origin) return;
        if (!["http:", "https:"].includes(u.protocol)) return;
        u.hash = "";
        if (
          /\.(pdf|jpe?g|png|gif|svg|webp|ico|zip|gz|mp4|mp3|mov|avi|docx?|xlsx?|pptx?|csv|css|js|json|xml|rss)$/i.test(
            u.pathname,
          )
        )
          return;
        out.add(u.toString());
      } catch {
        /* ignore malformed hrefs */
      }
    });
    return Array.from(out);
  }, origin);
}

// Merge an axe rule result into the cross-page aggregate keyed by rule id.
function mergeRule(agg, r, pagePath, scope) {
  const nodes = (r.nodes || []).map((n) => ({
    target: n.target,
    html: (n.html || "").slice(0, 400),
    failureSummary:
      scope === "site"
        ? `[${pagePath}] ${n.failureSummary || ""}`.trim()
        : n.failureSummary || "",
    page: pagePath,
  }));
  const existing = agg[r.id];
  if (!existing) {
    agg[r.id] = {
      id: r.id,
      impact: r.impact,
      help: r.help,
      helpUrl: r.helpUrl,
      tags: r.tags,
      _nodes: nodes,
      _pages: new Set([pagePath]),
    };
  } else {
    existing._nodes.push(...nodes);
    existing._pages.add(pagePath);
  }
}

// Finalize an aggregated rule into the client-facing shape.
function finalizeRule(r) {
  return {
    id: r.id,
    impact: r.impact,
    help: r.help,
    helpUrl: r.helpUrl,
    tags: r.tags,
    nodes: r._nodes.slice(0, 100),
    nodeCount: r._nodes.length,
    pageCount: r._pages ? r._pages.size : 1,
  };
}

// Optional helper kept server-side so audit deletes cascade cleanly later.
export const ping = onCall(async () => ({
  pong: true,
  at: FieldValue.serverTimestamp ? "ok" : "ok",
}));
