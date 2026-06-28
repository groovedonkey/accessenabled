import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Globe, Trash2, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { listAudits, createAudit, removeAudit } from '../auditService.js';
import { summarize } from '../checklist.js';
import ScoreBadge from '../components/ScoreBadge.jsx';

export default function WizardStart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [client, setClient] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setAudits(await listAudits(user.uid));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user.uid]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    try {
      const id = await createAudit(user.uid, { url: url.trim(), client: client.trim() });
      navigate(`/audit/${id}`);
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this audit permanently?')) return;
    await removeAudit(id);
    load();
  };

  return (
    <div className="dashboard">
      <section className="new-audit-card">
        <h2><ClipboardCheck size={20} /> New guided audit</h2>
        <form onSubmit={handleCreate} className="new-audit-form">
          <input
            type="text"
            inputMode="url"
            placeholder="https://client-website.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Website URL"
            required
          />
          <input
            type="text"
            placeholder="Client / project name (optional)"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            aria-label="Client name"
          />
          <button className="btn btn-primary" type="submit" disabled={creating}>
            <Plus size={18} /> {creating ? 'Creating…' : 'Start guided audit'}
          </button>
        </form>
        <p className="hint">
          Enter the project URL and name, then run an initial automated scan (single or multi-page).
          The wizard guides you through each failed item with fix steps, then the items needing manual review.
        </p>
      </section>

      <section className="audit-list">
        <h2>Your audits</h2>
        {loading ? (
          <div className="spinner" aria-label="Loading audits" />
        ) : audits.length === 0 ? (
          <p className="empty">No audits yet. Start one above to begin.</p>
        ) : (
          <ul>
            {audits.map((a) => {
              const s = summarize(a.results);
              return (
                <li key={a.id} className="audit-row" onClick={() => navigate(`/audit/${a.id}`)}>
                  <div className="audit-row-main">
                    <div className="audit-row-title">{a.client || a.url || 'Untitled audit'}</div>
                    <div className="audit-row-sub"><Globe size={13} /> {a.url}</div>
                  </div>
                  <div className="audit-row-meta">
                    <ScoreBadge score={s.score} />
                    <span className="chip chip-pass">{s.pass} pass</span>
                    <span className="chip chip-fail">{s.fail} fail</span>
                    <span className="chip">{s.untested} left</span>
                  </div>
                  <button className="btn btn-ghost danger" onClick={(e) => handleDelete(e, a.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} className="row-chevron" />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
