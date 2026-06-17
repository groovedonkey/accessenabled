import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ChecklistItem from './ChecklistItem.jsx';
import { summarize } from '../checklist.js';

export default function ChecklistSection({ section, results, onUpdate }) {
  const [open, setOpen] = useState(true);

  const sectionResults = {};
  section.items.forEach((it) => { sectionResults[it.ref] = results[it.ref] || { status: 'untested' }; });
  const s = summarize(sectionResults);

  return (
    <section className="checklist-section">
      <button className="section-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ChevronDown size={20} className={`section-caret ${open ? 'open' : ''}`} />
        <span className="section-number">{section.number}</span>
        <span className="section-title">
          <strong>{section.title}</strong>
          <small>{section.blurb}</small>
        </span>
        <span className="section-mini">
          <span className="chip chip-pass">{s.pass}</span>
          <span className="chip chip-fail">{s.fail}</span>
          <span className="chip chip-manual">{s.manual}</span>
        </span>
      </button>
      {open && (
        <div className="section-body">
          {section.items.map((item) => (
            <ChecklistItem
              key={item.ref}
              item={item}
              result={results[item.ref] || { status: 'untested', note: '', findings: [] }}
              onUpdate={(change) => onUpdate(item.ref, change)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
