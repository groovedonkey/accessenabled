import { useState } from "react";
import {
  Check,
  X,
  CircleHelp,
  MinusCircle,
  ChevronDown,
  Zap,
  Hand,
} from "lucide-react";

const STATUS_META = {
  pass: { label: "Passed", cls: "pass", Icon: Check },
  fail: { label: "Failed", cls: "fail", Icon: X },
  manual: { label: "Manual", cls: "manual", Icon: CircleHelp },
  na: { label: "N/A", cls: "na", Icon: MinusCircle },
};

export default function ChecklistItem({ item, result, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const status = result.status || "untested";
  const findings = result.findings || [];

  const setStatus = (next) => {
    // Toggle off if clicking the active status -> back to untested.
    onUpdate({ status: status === next ? "untested" : next });
  };

  return (
    <div className={`check-item status-${status}`}>
      <div className="check-item-row">
        <div
          className="check-boxes"
          role="group"
          aria-label={`Result for ${item.ref}`}
        >
          <StatusBox
            active={status === "pass"}
            meta={STATUS_META.pass}
            onClick={() => setStatus("pass")}
          />
          <StatusBox
            active={status === "fail"}
            meta={STATUS_META.fail}
            onClick={() => setStatus("fail")}
          />
          <StatusBox
            active={status === "manual"}
            meta={STATUS_META.manual}
            onClick={() => setStatus("manual")}
          />
          <StatusBox
            active={status === "na"}
            meta={STATUS_META.na}
            onClick={() => setStatus("na")}
          />
        </div>

        <button
          className="check-item-main"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="check-item-titleline">
            <span className="ref-pill">{item.ref}</span>
            <span className="level-pill">{item.level}</span>
            <span className="item-title">{item.title}</span>
            {item.mode === "auto" && (
              <span className="mode-tag auto" title="Auto-tested by scan">
                <Zap size={12} /> auto
              </span>
            )}
            {item.mode === "semi" && (
              <span
                className="mode-tag semi"
                title="Scan-assisted, confirm manually"
              >
                <Zap size={12} /> assist
              </span>
            )}
            {item.mode === "manual" && (
              <span
                className="mode-tag manual"
                title="Manual verification required"
              >
                <Hand size={12} /> manual
              </span>
            )}
            {findings.length > 0 && (
              <span className="finding-count">
                {findings.length} finding{findings.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`item-caret ${expanded ? "open" : ""}`}
          />
        </button>
      </div>

      {expanded && (
        <div className="check-item-detail">
          <p className="procedure">{item.procedure}</p>
          <div className="legal-row">
            {(item.legal || []).map((l) => (
              <span key={l} className="legal-pill">
                {l}
              </span>
            ))}
          </div>

          {findings.length > 0 && (
            <div className="findings">
              <h4>Scan findings</h4>
              {findings.map((f, i) => (
                <div key={i} className={`finding finding-${f.type}`}>
                  <div className="finding-head">
                    {f.ruleId && <code>{f.ruleId}</code>}
                    {f.impact && (
                      <span className={`impact impact-${f.impact}`}>
                        {f.impact}
                      </span>
                    )}
                    {f.nodeCount > 0 && (
                      <span className="node-count">
                        {f.nodeCount} element{f.nodeCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {f.help && (
                    <p className="finding-help">
                      {f.help}{" "}
                      {f.helpUrl && (
                        <a href={f.helpUrl} target="_blank" rel="noreferrer">
                          Learn more
                        </a>
                      )}
                    </p>
                  )}
                  {f.summary && <p className="finding-help">{f.summary}</p>}
                  {(f.nodes || []).slice(0, 5).map((n, j) => (
                    <pre key={j} className="finding-node">
                      {Array.isArray(n.target) ? n.target.join(" ") : ""}
                      {n.html ? `\n${n.html}` : ""}
                    </pre>
                  ))}
                </div>
              ))}
            </div>
          )}

          <label className="note-label">
            Auditor notes
            <textarea
              value={result.note || ""}
              placeholder="Add observations, remediation steps, or evidence…"
              onChange={(e) => onUpdate({ note: e.target.value })}
              rows={2}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function StatusBox({ active, meta, onClick }) {
  const { label, cls, Icon } = meta;
  return (
    <button
      type="button"
      className={`status-box box-${cls} ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      title={label}
    >
      <span className="box-icon">
        {active ? <Icon size={16} strokeWidth={3} /> : null}
      </span>
      <span className="box-label">{label}</span>
    </button>
  );
}
