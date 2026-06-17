import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, FileDown, Loader2, CheckCircle2 } from 'lucide-react';
import { getAudit, saveAudit, runScan } from '../auditService.js';
import { CHECKLIST, summarize } from '../checklist.js';
import { applyScanToResults } from '../scanMapper.js';
import ChecklistSection from '../components/ChecklistSection.jsx';
import ScoreBadge from '../components/ScoreBadge.jsx';
import { exportAuditPdf } from '../exportPdf.js';

export default function AuditView() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  const [audit, setAudit] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const a = await getAudit(id);
      if (!a) { navigate('/'); return; }
      setAudit(a);
      setResults(a.results || {});
      setLoading(false);
      if (params.get('autoscan') === '1') {
        params.delete('autoscan');
        setParams(params, { replace: true });
        doScan(a.url);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  // Debounced autosave whenever results change.
  const queueSave = useCallback((nextResults, patch = {}) => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveAudit(id, { results: nextResults, ...patch });
      setSaved(true);
    }, 800);
  }, [id]);

  const updateItem = (ref, change) => {
    setResults((prev) => {
      const next = { ...prev, [ref]: { ...prev[ref], ...change } };
      queueSave(next);
      return next;
    });
  };

  const doScan = async (overrideUrl) => {
    const url = overrideUrl || audit?.url;
    if (!url) { setScanError('Add a URL first.'); return; }
    setScanning(true);
    setScanError('');
    try {
      const scan = await runScan(url);
      setResults((prev) => {
        const merged = applyScanToResults(scan, prev);
        const meta = {
          scannedAt: scan.scannedAt,
          finalUrl: scan.url,
          statusCode: scan.statusCode,
          pageTitle: scan.pageTitle,
          axeVersion: scan.axeVersion,
          durationMs: scan.durationMs,
          violationCount: (scan.violations || []).length
        };
        saveAudit(id, { results: merged, scanMeta: meta, status: 'scanned' }).then(() => setSaved(true));
        setAudit((a) => ({ ...a, scanMeta: meta, status: 'scanned' }));
        return merged;
      });
    } catch (e) {
      console.error(e);
      setScanError(e.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  if (loading || !results) {
    return <div className="centered-screen"><div className="spinner" aria-label="Loading" /></div>;
  }

  const s = summarize(results);

  return (
    <div className="audit-view">
      <div className="audit-header">
        <button className="btn btn-ghost" onClick={() => navigate('/')}><ArrowLeft size={18} /> Back</button>
        <div className="audit-header-info">
          <h1>{audit.client || audit.url}</h1>
          <a href={audit.url} target="_blank" rel="noreferrer" className="audit-url">{audit.url}</a>
        </div>
        <div className="audit-header-actions">
          <button className="btn btn-primary" onClick={() => doScan()} disabled={scanning}>
            {scanning ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
            {scanning ? 'Scanning…' : audit.scanMeta ? 'Re-scan' : 'Run scan'}
          </button>
          <button className="btn btn-secondary" onClick={() => exportAuditPdf(audit, results)}>
            <FileDown size={18} /> Export
          </button>
        </div>
      </div>

      {scanError && <div className="banner banner-error">{scanError}</div>}

      <div className="audit-summary">
        <ScoreBadge score={s.score} />
        <div className="summary-chips">
          <span className="chip chip-pass">{s.pass} passed</span>
          <span className="chip chip-fail">{s.fail} failed</span>
          <span className="chip chip-manual">{s.manual} manual review</span>
          <span className="chip chip-na">{s.na} N/A</span>
          <span className="chip">{s.untested} untested</span>
        </div>
        <div className="save-state">
          {saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Saving…</>}
        </div>
      </div>

      {audit.scanMeta && (
        <p className="scan-meta">
          Last scanned {new Date(audit.scanMeta.scannedAt).toLocaleString()} ·
          HTTP {audit.scanMeta.statusCode} · axe-core {audit.scanMeta.axeVersion} ·
          {audit.scanMeta.violationCount} rule violations
        </p>
      )}

      {CHECKLIST.map((section) => (
        <ChecklistSection
          key={section.id}
          section={section}
          results={results}
          onUpdate={updateItem}
        />
      ))}
    </div>
  );
}
