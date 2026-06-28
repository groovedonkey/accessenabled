import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, MinusCircle, CheckCircle2, Save,
  Wrench, ExternalLink, ClipboardCheck, ListChecks, Play, Loader2, ScanLine
} from 'lucide-react';
import { getAudit, saveAudit, runScan } from '../auditService.js';
import { CHECKLIST, summarize } from '../checklist.js';
import { applyScanToResults } from '../scanMapper.js';
import { getRemediation } from '../remediation.js';
import ScoreBadge from '../components/ScoreBadge.jsx';

// Flatten the checklist into a single ordered list of steps.
const STEPS = CHECKLIST.flatMap((section) =>
  section.items.map((item) => ({
    sectionId: section.id,
    sectionNumber: section.number,
    sectionTitle: section.title,
    item
  }))
);

const STATUS_OPTIONS = [
  { value: 'pass', label: 'Pass', icon: Check, cls: 'wz-pass' },
  { value: 'fail', label: 'Fail', icon: X, cls: 'wz-fail' },
  { value: 'na', label: 'N/A', icon: MinusCircle, cls: 'wz-na' }
];

const GROUP_LABEL = {
  fail: 'Failed items — walk through the fix',
  manual: 'Manual review',
  all: 'Reviewing all items'
};

// Build the review queue: failed items first, then anything needing manual
// review (manual/incomplete/untested). Passed & N/A items are skipped here but
// remain reachable via "Review all items".
function buildReviewQueue(results) {
  const fails = [];
  const manual = [];
  STEPS.forEach((s, i) => {
    const st = results[s.item.ref]?.status || 'untested';
    if (st === 'fail') fails.push({ idx: i, group: 'fail' });
    else if (st !== 'pass' && st !== 'na') manual.push({ idx: i, group: 'manual' });
  });
  return [...fails, ...manual];
}

function buildAllQueue() {
  return STEPS.map((s, i) => ({ idx: i, group: 'all' }));
}

export default function Wizard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [audit, setAudit] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('scan'); // 'scan' | 'review'
  const [queue, setQueue] = useState([]);
  const [qPos, setQPos] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(true);
  const [scanScope, setScanScope] = useState('page');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const a = await getAudit(id);
      if (!a) { navigate('/'); return; }
      setAudit(a);
      setResults(a.results || {});
      // If a scan has already run, jump straight into review.
      if (a.scanMeta) {
        const q = buildReviewQueue(a.results || {});
        setQueue(q.length ? q : buildAllQueue());
        setPhase('review');
      } else {
        setPhase('scan');
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [id]);

  const queueSave = useCallback((nextResults) => {
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const counts = summarize(nextResults);
      const status = counts.untested === 0 ? 'completed' : 'in-progress';
      await saveAudit(id, { results: nextResults, status });
      setSaved(true);
    }, 700);
  }, [id]);

  const doScan = async () => {
    const url = audit?.url;
    if (!url) { setScanError('This project has no URL. Add one before scanning.'); return; }
    setScanning(true);
    setScanError('');
    try {
      const scan = await runScan(url, scanScope);
      const merged = applyScanToResults(scan, results);
      const meta = {
        scannedAt: scan.scannedAt,
        finalUrl: scan.url,
        statusCode: scan.statusCode,
        pageTitle: scan.pageTitle,
        axeVersion: scan.axeVersion,
        durationMs: scan.durationMs,
        violationCount: (scan.violations || []).length,
        scope: scan.scope || 'page',
        pagesScanned: scan.pagesScanned || 1,
        pages: scan.pages || []
      };
      await saveAudit(id, { results: merged, scanMeta: meta, status: 'in-progress' });
      setResults(merged);
      setAudit((a) => ({ ...a, scanMeta: meta }));
      const q = buildReviewQueue(merged);
      setQueue(q.length ? q : buildAllQueue());
      setQPos(0);
      setFinished(false);
      setPhase('review');
    } catch (e) {
      console.error(e);
      setScanError(e.message || 'Scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const skipScan = () => {
    setQueue(buildAllQueue());
    setQPos(0);
    setFinished(false);
    setPhase('review');
  };

  const reviewAll = () => {
    setQueue(buildAllQueue());
    setQPos(0);
    setFinished(false);
    setPhase('review');
  };

  const current = queue[qPos] ? STEPS[queue[qPos].idx] : null;
  const currentRef = current?.item.ref;
  const currentResult = (currentRef && results?.[currentRef]) || { status: 'untested', note: '' };

  const setStatus = (value) => {
    setResults((prev) => {
      const next = { ...prev, [currentRef]: { ...prev[currentRef], status: value } };
      queueSave(next);
      return next;
    });
  };

  const setNote = (note) => {
    setResults((prev) => {
      const next = { ...prev, [currentRef]: { ...prev[currentRef], note } };
      queueSave(next);
      return next;
    });
  };

  const goNext = () => {
    if (qPos >= queue.length - 1) { setFinished(true); return; }
    setQPos((p) => p + 1);
  };
  const goPrev = () => {
    if (finished) { setFinished(false); return; }
    setQPos((p) => Math.max(0, p - 1));
  };

  const s = useMemo(() => summarize(results || {}), [results]);

  if (loading || !results) {
    return <div className="centered-screen"><div className="spinner" aria-label="Loading" /></div>;
  }

  if (phase === 'scan') {
    return (
      <ScanPhase
        audit={audit}
        scanScope={scanScope}
        setScanScope={setScanScope}
        scanning={scanning}
        scanError={scanError}
        onScan={doScan}
        onSkip={skipScan}
        onExit={() => navigate('/')}
      />
    );
  }

  if (finished || !current) {
    return <Summary audit={audit} results={results} summary={s} onReview={reviewAll} onExit={() => navigate('/')} />;
  }

  const { item } = current;
  const group = queue[qPos].group;
  const rem = getRemediation(item.ref);
  const answered = currentResult.status && currentResult.status !== 'untested';
  const progressPct = Math.round((qPos / queue.length) * 100);
  const groupCount = queue.filter((q) => q.group === group).length;
  const groupPos = queue.slice(0, qPos + 1).filter((q) => q.group === group).length;

  return (
    <div className="wizard">
      <div className="wizard-topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}><ArrowLeft size={18} /> Exit</button>
        <div className="wizard-progress">
          <div className="wizard-progress-track"><div className="wizard-progress-fill" style={{ width: `${progressPct}%` }} /></div>
          <span className="wizard-progress-label">Item {qPos + 1} of {queue.length}</span>
        </div>
        <div className="save-state">{saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Saving…</>}</div>
      </div>

      <div className={`wizard-phase-banner ${group === 'fail' ? 'is-fail' : ''}`}>
        {group === 'fail' ? <Wrench size={15} /> : group === 'manual' ? <ListChecks size={15} /> : <ClipboardCheck size={15} />}
        {GROUP_LABEL[group]} {group !== 'all' && <span className="wizard-phase-count">({groupPos} of {groupCount})</span>}
      </div>

      <div className="wizard-card">
        <div className="wizard-section-tag">
          Section {current.sectionNumber} · {current.sectionTitle}
        </div>
        <div className="wizard-item-head">
          <span className="ref-pill">{item.ref}</span>
          <span className="level-pill">Level {item.level}</span>
          {(item.legal || []).map((l) => <span key={l} className="legal-pill">{l}</span>)}
        </div>
        <h1 className="wizard-title">{item.title}</h1>

        <div className="wizard-block">
          <h2><ListChecks size={16} /> How to test</h2>
          <p>{item.procedure}</p>
        </div>

        {currentResult.findings && currentResult.findings.length > 0 && (
          <div className="wizard-scan-findings">
            <h2><ScanLine size={16} /> What the scan found</h2>
            {currentResult.findings.slice(0, 6).map((f, i) => (
              <div key={i} className="wizard-finding">
                {f.ruleId && <code>{f.ruleId}</code>}
                <span>{f.help || f.summary || f.failureSummary || 'Issue detected'}</span>
                {f.nodeCount > 0 && <span className="node-count">{f.nodeCount} instance{f.nodeCount === 1 ? '' : 's'}</span>}
              </div>
            ))}
          </div>
        )}

        <div className="wizard-status" role="radiogroup" aria-label="Result for this item">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = currentResult.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                className={`wz-status-btn ${opt.cls} ${active ? 'active' : ''}`}
                onClick={() => setStatus(opt.value)}
              >
                <Icon size={18} /> {opt.label}
              </button>
            );
          })}
        </div>

        {currentResult.status === 'fail' && rem && (
          <div className="wizard-fix">
            <h2><Wrench size={16} /> How to fix it</h2>
            <p className="wizard-fix-summary">{rem.summary}</p>
            <ol className="wizard-fix-steps">
              {rem.steps.map((stp, i) => <li key={i}>{stp}</li>)}
            </ol>
            {rem.example && (
              <pre className="wizard-fix-example"><code>{rem.example}</code></pre>
            )}
            {rem.reference && (
              <a className="wizard-fix-link" href={rem.reference} target="_blank" rel="noreferrer">
                Reference & techniques <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        <div className="wizard-notes">
          <label htmlFor="wz-note">Auditor notes {currentResult.status === 'fail' ? '(document the issue & location)' : '(optional)'}</label>
          <textarea
            id="wz-note"
            rows={3}
            value={currentResult.note || ''}
            onChange={(e) => setNote(e.target.value)}
            placeholder={currentResult.status === 'fail' ? 'e.g. Hero image on /home has no alt text; newsletter inputs unlabeled.' : 'Add any observations…'}
          />
        </div>
      </div>

      <div className="wizard-nav">
        <button className="btn btn-secondary" onClick={goPrev} disabled={qPos === 0}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={goNext} disabled={!answered} title={answered ? '' : 'Select Pass, Fail, or N/A to continue'}>
          {qPos >= queue.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ScanPhase({ audit, scanScope, setScanScope, scanning, scanError, onScan, onSkip, onExit }) {
  return (
    <div className="wizard">
      <div className="wizard-topbar">
        <button className="btn btn-ghost" onClick={onExit}><ArrowLeft size={18} /> Exit</button>
        <h2 className="wizard-summary-h"><ScanLine size={18} /> Initial scan</h2>
        <span />
      </div>

      <div className="wizard-card">
        <div className="wizard-section-tag">Step 1 · Automated baseline</div>
        <h1 className="wizard-title">Run the initial scan</h1>
        <p className="wizard-scan-intro">
          We’ll scan <strong>{audit.url || 'this site'}</strong> with axe-core to auto-detect failures and
          pre-fill your checklist. You’ll then be guided through each failed item with fix steps,
          followed by the items that need manual review.
        </p>

        <div className="wizard-block">
          <h2><ListChecks size={16} /> Scan scope</h2>
          <div className="scan-scope" role="radiogroup" aria-label="Scan scope">
            <label className={scanScope === 'page' ? 'active' : ''}>
              <input type="radio" name="scan-scope" value="page" checked={scanScope === 'page'} onChange={() => setScanScope('page')} disabled={scanning} />
              This page only
            </label>
            <label className={scanScope === 'site' ? 'active' : ''}>
              <input type="radio" name="scan-scope" value="site" checked={scanScope === 'site'} onChange={() => setScanScope('site')} disabled={scanning} />
              Whole site (up to 10 pages)
            </label>
          </div>
        </div>

        {scanError && <div className="banner banner-error">{scanError}</div>}
        {scanning && (
          <p className="wizard-scan-status">
            <Loader2 size={16} className="spin" /> Scanning{scanScope === 'site' ? ' up to 10 pages' : ''}… this can take a minute.
          </p>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-secondary" onClick={onSkip} disabled={scanning}>Skip scan — audit manually</button>
        <button className="btn btn-primary" onClick={onScan} disabled={scanning}>
          {scanning ? <Loader2 size={18} className="spin" /> : <Play size={18} />} {scanning ? 'Scanning…' : 'Run scan & continue'}
        </button>
      </div>
    </div>
  );
}

function Summary({ audit, results, summary, onReview, onExit }) {
  const failed = STEPS.filter((s) => results[s.item.ref]?.status === 'fail');
  const untested = summary.untested;

  return (
    <div className="wizard">
      <div className="wizard-topbar">
        <button className="btn btn-ghost" onClick={onExit}><ArrowLeft size={18} /> Exit</button>
        <h2 className="wizard-summary-h"><ClipboardCheck size={18} /> Audit summary</h2>
        <span />
      </div>

      <div className="wizard-card">
        <div className="audit-summary">
          <ScoreBadge score={summary.score} />
          <div className="summary-chips">
            <span className="chip chip-pass">{summary.pass} passed</span>
            <span className="chip chip-fail">{summary.fail} failed</span>
            <span className="chip chip-na">{summary.na} N/A</span>
            <span className="chip">{untested} untested</span>
          </div>
        </div>
        <p className="wizard-summary-meta">
          {audit.client || audit.url}{audit.url ? ` · ${audit.url}` : ''}
        </p>

        {untested > 0 && (
          <p className="wizard-summary-warn">{untested} item{untested === 1 ? '' : 's'} still untested. Use “Review all items” to complete them.</p>
        )}

        <h2 className="wizard-fixlist-h"><Wrench size={16} /> Remediation report ({failed.length} issue{failed.length === 1 ? '' : 's'})</h2>
        {failed.length === 0 ? (
          <p className="empty">No failed items. Nice work.</p>
        ) : (
          <ul className="wizard-fixlist">
            {failed.map(({ item }) => {
              const rem = getRemediation(item.ref);
              const note = results[item.ref]?.note;
              return (
                <li key={item.ref} className="wizard-fixlist-item">
                  <div className="wizard-fixlist-head">
                    <span className="ref-pill">{item.ref}</span>
                    <strong>{item.title}</strong>
                  </div>
                  {note && <p className="wizard-fixlist-note">Note: {note}</p>}
                  {rem && (
                    <>
                      <p className="wizard-fix-summary">{rem.summary}</p>
                      <ol className="wizard-fix-steps">
                        {rem.steps.map((stp, i) => <li key={i}>{stp}</li>)}
                      </ol>
                      {rem.reference && (
                        <a className="wizard-fix-link" href={rem.reference} target="_blank" rel="noreferrer">
                          Reference <ExternalLink size={14} />
                        </a>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="wizard-nav">
        <button className="btn btn-secondary" onClick={onReview}><ListChecks size={18} /> Review all items</button>
        <button className="btn btn-primary" onClick={onExit}>Done</button>
      </div>
    </div>
  );
}
