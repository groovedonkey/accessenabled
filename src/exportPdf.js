// Generates a printable audit report and opens the browser print dialog
// (Save as PDF). This works reliably on iPad/Chrome with no extra deps.

import { CHECKLIST, summarize } from './checklist';

const STATUS_LABEL = { pass: 'PASS', fail: 'FAIL', manual: 'MANUAL', na: 'N/A', untested: '—' };

export function exportAuditPdf(audit, results) {
  const s = summarize(results);
  const win = window.open('', '_blank');
  if (!win) { alert('Allow pop-ups to export the report.'); return; }

  const rows = CHECKLIST.map((section) => {
    const items = section.items.map((it) => {
      const r = results[it.ref] || { status: 'untested', note: '' };
      const findings = (r.findings || [])
        .map((f) => `${f.ruleId || f.type || ''}${f.nodeCount ? ` (${f.nodeCount})` : ''}`)
        .filter(Boolean).join(', ');
      return `<tr class="st-${r.status}">
        <td class="ref">${it.ref}<br><small>${it.level}</small></td>
        <td><strong>${esc(it.title)}</strong><div class="proc">${esc(it.procedure)}</div>
          ${findings ? `<div class="find">Findings: ${esc(findings)}</div>` : ''}
          ${r.note ? `<div class="note">Note: ${esc(r.note)}</div>` : ''}
        </td>
        <td class="status">${STATUS_LABEL[r.status] || '—'}</td>
      </tr>`;
    }).join('');
    return `<tr class="section-row"><td colspan="3">${section.number}. ${esc(section.title.toUpperCase())}</td></tr>${items}`;
  }).join('');

  win.document.write(`<!doctype html><html><head><meta charset="utf-8">
  <title>Accessibility Audit — ${esc(audit.client || audit.url)}</title>
  <style>
    body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;margin:32px;}
    h1{margin:0 0 4px;font-size:22px;}
    .url{color:#0b5cab;margin:0 0 16px;font-size:13px;word-break:break-all;}
    .meta{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;font-size:12px;color:#475569;}
    .score{font-size:34px;font-weight:800;}
    table{width:100%;border-collapse:collapse;font-size:11.5px;}
    td{border-bottom:1px solid #e2e8f0;padding:7px 8px;vertical-align:top;}
    .ref{width:48px;color:#475569;font-weight:600;}
    .status{width:64px;text-align:center;font-weight:700;}
    .section-row td{background:#0b5cab;color:#fff;font-weight:700;padding:8px;font-size:12px;}
    .proc{color:#64748b;margin-top:2px;}
    .find{color:#b91c1c;margin-top:3px;}
    .note{color:#0f172a;margin-top:3px;font-style:italic;}
    .st-pass .status{color:#15803d;} .st-fail .status{color:#b91c1c;}
    .st-manual .status{color:#b45309;} .st-na .status{color:#64748b;}
    .legend{margin-top:12px;font-size:11px;color:#64748b;}
    @media print{body{margin:12mm;} .section-row td{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  </style></head><body>
    <h1>Website Accessibility Audit</h1>
    <p class="url">${esc(audit.url || '')}</p>
    <div class="meta">
      <div><span class="score">${s.score ?? '—'}${s.score != null ? '%' : ''}</span><br>compliance score</div>
      <div><strong>Client:</strong> ${esc(audit.client || '—')}</div>
      <div><strong>Passed:</strong> ${s.pass} &nbsp; <strong>Failed:</strong> ${s.fail} &nbsp;
           <strong>Manual:</strong> ${s.manual} &nbsp; <strong>N/A:</strong> ${s.na}</div>
      ${audit.scanMeta ? `<div><strong>Scanned:</strong> ${new Date(audit.scanMeta.scannedAt).toLocaleString()} · axe-core ${audit.scanMeta.axeVersion}</div>` : ''}
      <div><strong>Report date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
    <table><tbody>${rows}</tbody></table>
    <p class="legend">Standards: WCAG 2.1 / 2.2 (A &amp; AA), ADA Title III, Section 508, EAA, ACA.
    Automated checks powered by axe-core; manual-review items require auditor verification.</p>
    <script>window.onload=()=>setTimeout(()=>window.print(),350);</script>
  </body></html>`);
  win.document.close();
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
