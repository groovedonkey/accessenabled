// Translates the raw scan payload from the `scanUrl` Cloud Function into
// per-checklist-item results (pass / fail / manual / untested) with findings.

import { CHECKLIST, AXE_RULE_TO_REFS, blankResults } from './checklist';

// Build the merged result set for an audit given a scan payload.
export function applyScanToResults(scan, baseResults) {
  const results = baseResults ? structuredClone(baseResults) : blankResults();

  const violationById = {};
  (scan.violations || []).forEach((v) => { violationById[v.id] = v; });
  const incompleteById = {};
  (scan.incomplete || []).forEach((v) => { incompleteById[v.id] = v; });
  const passSet = new Set(scan.passes || []);

  CHECKLIST.forEach((section) => {
    section.items.forEach((item) => {
      const prev = results[item.ref] || { status: 'untested', note: '', findings: [] };

      // Detector-driven items (accessibility statement, overlay reliance).
      if (item.detector && scan.detectors && scan.detectors[item.detector]) {
        results[item.ref] = applyDetector(item, scan.detectors[item.detector], prev);
        return;
      }

      const rules = item.axeRules || [];
      if (rules.length === 0) {
        // Nothing the scanner can assert -> leave for manual review, keep notes.
        results[item.ref] = { ...prev, status: prev.status === 'untested' ? 'manual' : prev.status, auto: false };
        return;
      }

      const findings = [];
      let sawViolation = false;
      let sawPass = false;
      let sawIncomplete = false;

      rules.forEach((rule) => {
        if (violationById[rule]) { sawViolation = true; findings.push(toFinding('violation', violationById[rule])); }
        if (incompleteById[rule]) { sawIncomplete = true; findings.push(toFinding('incomplete', incompleteById[rule])); }
        if (passSet.has(rule)) sawPass = true;
      });

      let status;
      if (sawViolation) status = 'fail';
      else if (sawPass && !sawIncomplete) status = 'pass';
      else if (sawIncomplete) status = 'manual';
      else status = item.mode === 'auto' ? 'pass' : 'manual';

      // 'semi' items always invite auditor confirmation even when passing.
      if (item.mode === 'semi' && status === 'pass') status = 'manual';

      results[item.ref] = {
        status,
        note: prev.note || '',
        findings,
        auto: true,
        scannedRules: rules
      };
    });
  });

  return results;
}

function applyDetector(item, det, prev) {
  if (item.detector === 'accessibilityStatement') {
    return {
      status: det.found ? 'pass' : 'fail',
      note: prev.note || (det.found ? `Found: ${det.href}` : 'No accessibility statement link detected.'),
      findings: det.found ? [] : [{ type: 'detector', summary: 'No "Accessibility Statement" link found in page.' }],
      auto: true
    };
  }
  if (item.detector === 'overlayReliance') {
    const hasOverlay = det.found;
    return {
      // An overlay present is a litigation risk -> flag fail for auditor review.
      status: hasOverlay ? 'fail' : 'pass',
      note: hasOverlay
        ? `Overlay widget detected: ${det.vendors.join(', ')}. Confirm native fixes exist.`
        : (prev.note || 'No third-party accessibility overlay detected.'),
      findings: hasOverlay ? [{ type: 'detector', summary: `Overlay vendor(s): ${det.vendors.join(', ')}` }] : [],
      auto: true
    };
  }
  return prev;
}

function toFinding(kind, rule) {
  return {
    type: kind,
    ruleId: rule.id,
    impact: rule.impact,
    help: rule.help,
    helpUrl: rule.helpUrl,
    nodeCount: rule.nodeCount,
    // Keep every reported instance so the auditor can repair each individually.
    nodes: rule.nodes || []
  };
}

// Which axe rule ids actually mattered (for diagnostics / debugging).
export function mappedRuleCount() {
  return Object.keys(AXE_RULE_TO_REFS).length;
}
