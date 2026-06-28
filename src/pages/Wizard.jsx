import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, X, MinusCircle, CheckCircle2, Save,
  Wrench, ExternalLink, ClipboardCheck, ListChecks
} from 'lucide-react';
import { getAudit, saveAudit } from '../auditService.js';
import { CHECKLIST, summarize } from '../checklist.js';
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

export default function Wizard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [audit, setAudit] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const a = await getAudit(id);
      if (!a) { navigate('/'); return; }
      setAudit(a);
      setResults(a.results || {});
      // Resume at the first untested item, if any.
      const r = a.results || {};
      const firstUntested = STEPS.findIndex((s) => (r[s.item.ref]?.status || 'untested') === 'untested');
      setStep(firstUntested === -1 ? 0 : firstUntested);
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

  const current = STEPS[step];
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
    if (step >= STEPS.length - 1) { setFinished(true); return; }
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    if (finished) { setFinished(false); return; }
    setStep((s) => Math.max(0, s - 1));
  };

  const s = useMemo(() => summarize(results || {}), [results]);

  if (loading || !results) {
    return <div className="centered-screen"><div className="spinner" aria-label="Loading" /></div>;
  }

  if (finished) {
    return <Summary audit={audit} results={results} summary={s} onReview={() => { setFinished(false); setStep(0); }} onExit={() => navigate('/')} />;
  }

  const { item } = current;
  const rem = getRemediation(item.ref);
  const answered = currentResult.status && currentResult.status !== 'untested';
  const progressPct = Math.round(((step) / STEPS.length) * 100);

  return (
    <div className="wizard">
      <div className="wizard-topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')}><ArrowLeft size={18} /> Exit</button>
        <div className="wizard-progress">
          <div className="wizard-progress-track"><div className="wizard-progress-fill" style={{ width: `${progressPct}%` }} /></div>
          <span className="wizard-progress-label">Item {step + 1} of {STEPS.length}</span>
        </div>
        <div className="save-state">{saved ? <><CheckCircle2 size={16} /> Saved</> : <><Save size={16} /> Saving…</>}</div>
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
        <button className="btn btn-secondary" onClick={goPrev} disabled={step === 0}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary" onClick={goNext} disabled={!answered} title={answered ? '' : 'Select Pass, Fail, or N/A to continue'}>
          {step >= STEPS.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={18} />
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
