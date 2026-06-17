// AccessEnabled master checklist.
// Transcribed from the "Professional Website Accessibility Audit Checklist"
// (WCAG 2.1/2.2 A & AA, ADA Title III, Section 508, EAA, ACA + legal crosswalk).
//
// Each item carries:
//   ref        - WCAG success-criterion number (or admin key)
//   level      - A | AA | Admin
//   title      - short name
//   procedure  - the audit & testing procedure from the source document
//   legal      - applicable legal scopes
//   mode       - 'auto'   : fully determined by the automated scan
//                'semi'   : scan gives strong signal, auditor confirms
//                'manual' : auditor must verify by hand / on-site
//   axeRules   - axe-core rule ids that map to this criterion (used by the
//                Cloud Function scan engine to mark Passed / Failed)
//
// Per-item result states used throughout the app:
//   'untested' | 'pass' | 'fail' | 'manual' | 'na'

export const RESULT_STATES = ['untested', 'pass', 'fail', 'manual', 'na'];

export const CHECKLIST = [
  {
    id: 'perceivable',
    number: 1,
    title: 'Perceivable',
    blurb: 'Information & UI must be presentable to users in ways they can perceive.',
    items: [
      {
        ref: '1.1.1', level: 'A', title: 'Non-Text Content', mode: 'auto',
        procedure: 'Verify all meaningful images have descriptive alt text. Decorative images must use empty alt attributes (alt=""). Form inputs, icons, and charts need text equivalents.',
        legal: ['ADA/508', 'EAA/ACA'],
        axeRules: ['image-alt', 'input-image-alt', 'area-alt', 'svg-img-alt', 'role-img-alt', 'object-alt']
      },
      {
        ref: '1.2.1', level: 'A', title: 'Audio-only & Video-only (Prerecorded)', mode: 'manual',
        procedure: 'Provide a text transcript for prerecorded audio-only files (e.g., podcasts) and a text transcript or audio description for video-only files.',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '1.2.2', level: 'A', title: 'Captions (Prerecorded)', mode: 'semi',
        procedure: 'Confirm synchronized, accurate captions are provided for all prerecorded video content containing dialogue or meaningful sound effects.',
        legal: ['ADA/508', 'EAA'], axeRules: ['video-caption']
      },
      {
        ref: '1.2.3', level: 'A', title: 'Audio Description / Alternative', mode: 'manual',
        procedure: 'Provide a full text transcript or a secondary audio description track describing visual actions, settings, or events in prerecorded video.',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '1.3.1', level: 'A', title: 'Info and Relationships', mode: 'auto',
        procedure: 'Verify semantic HTML structures are used properly: headings (H1-H6) form a logical hierarchy; structural tables use <th> and <td>; lists use <ul>, <ol>, <li>.',
        legal: ['ADA/508', 'EAA/ACA'],
        axeRules: ['list', 'listitem', 'definition-list', 'dlitem', 'td-headers-attr', 'th-has-data-cells', 'table-fake-caption', 'p-as-heading', 'heading-order']
      },
      {
        ref: '1.3.2', level: 'A', title: 'Meaningful Sequence', mode: 'manual',
        procedure: 'Ensure that when content is read linearly (e.g., by a screen reader or with styles disabled), the DOM sequencing preserves reading order and logic.',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '1.3.3', level: 'A', title: 'Sensory Characteristics', mode: 'manual',
        procedure: 'Instructions must not rely solely on shape, size, visual location, or sound (e.g., do not say "Click the green circular button on the right to proceed").',
        legal: ['ADA'], axeRules: []
      },
      {
        ref: '1.3.5', level: 'AA', title: 'Identify Input Purpose', mode: 'auto',
        procedure: 'Ensure common profile/user inputs utilize correct HTML autocomplete attributes (e.g., autocomplete="email", autocomplete="given-name") to assist cognitive capabilities.',
        legal: ['ADA/508', 'EAA'], axeRules: ['autocomplete-valid']
      },
      {
        ref: '1.4.1', level: 'A', title: 'Use of Color', mode: 'manual',
        procedure: 'Color must not be the sole visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element (e.g., error links).',
        legal: ['ADA/508', 'EAA'], axeRules: ['link-in-text-block']
      },
      {
        ref: '1.4.3', level: 'AA', title: 'Contrast (Minimum)', mode: 'auto',
        procedure: 'Test color contrast ratios: Normal text (<18pt / <14pt bold) must be at least 4.5:1. Large text (>=18pt / >=14pt bold) must be at least 3:1. Excludes logos/pure decorations.',
        legal: ['ADA/508', 'EAA/ACA'], axeRules: ['color-contrast']
      },
      {
        ref: '1.4.4', level: 'AA', title: 'Resize Text', mode: 'semi',
        procedure: 'Confirm that text can be scaled up to 200% using browser zoom tools without loss of content, clipping, overlapping elements, or breaking horizontal layouts.',
        legal: ['ADA/508'], axeRules: ['meta-viewport']
      },
      {
        ref: '1.4.10', level: 'AA', title: 'Reflow', mode: 'semi',
        procedure: 'Test layout down to a width of 320px (CSS pixels) without requiring two-dimensional scrolling (horizontal and vertical simultaneously), except for map grids/data tables.',
        legal: ['ADA/508', 'EAA'], axeRules: ['meta-viewport']
      },
      {
        ref: '1.4.11', level: 'AA', title: 'Non-Text Contrast', mode: 'semi',
        procedure: 'Active visual UI components (borders of form fields, custom checkboxes) and meaningful graphics/icons must achieve a minimum contrast ratio of 3:1 against background colors.',
        legal: ['ADA/508', 'EAA'], axeRules: []
      }
    ]
  },
  {
    id: 'operable',
    number: 2,
    title: 'Operable',
    blurb: 'UI components & navigation must be operable without physical barriers.',
    items: [
      {
        ref: '2.1.1', level: 'A', title: 'Keyboard Accessibility', mode: 'manual',
        procedure: 'Manually test the entire page using ONLY the Tab, Shift+Tab, Enter, Space, and Arrow keys. All links, buttons, fields, and menus must be operational via keyboard.',
        legal: ['ADA/508', 'EAA/ACA'], axeRules: ['scrollable-region-focusable']
      },
      {
        ref: '2.1.2', level: 'A', title: 'No Keyboard Trap', mode: 'manual',
        procedure: 'Verify the keyboard focus cannot become permanently trapped within dynamic blocks (e.g., custom modals, calendar popups, autocompletes). Clear exit focus path must exist.',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '2.1.4', level: 'A', title: 'Character Key Shortcuts', mode: 'manual',
        procedure: "If single-character shortcuts are mapped (e.g., pressing 'm' to mute), provide mechanisms to turn them off, re-map them, or activate them only when elements are focused.",
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '2.3.1', level: 'A', title: 'Three Flashes or Below', mode: 'semi',
        procedure: 'Webpages must not contain components that flash more than three times within a single 1-second interval to prevent triggering photosensitive seizures.',
        legal: ['ADA/508', 'MN/TX State'], axeRules: ['blink', 'marquee']
      },
      {
        ref: '2.4.1', level: 'A', title: 'Bypass Blocks', mode: 'auto',
        procedure: 'Provide a "Skip to Content" link at the very top of the DOM page structure. It must be hidden initially but must become visible on the first keyboard Tab interaction.',
        legal: ['ADA/508'], axeRules: ['bypass', 'skip-link']
      },
      {
        ref: '2.4.2', level: 'A', title: 'Page Titled', mode: 'auto',
        procedure: 'Verify every individual page has an explicit, descriptive, and unique <title> element tag that changes dynamically depending on context or current view.',
        legal: ['ADA/508'], axeRules: ['document-title']
      },
      {
        ref: '2.4.3', level: 'A', title: 'Focus Order', mode: 'semi',
        procedure: 'Test navigation pathing. Interactive elements must receive keyboard focus in a logical, intuitive sequence that mirrors the visual layout reading flow.',
        legal: ['ADA/508'], axeRules: ['tabindex']
      },
      {
        ref: '2.4.4', level: 'A', title: 'Link Purpose (In Context)', mode: 'auto',
        procedure: 'Ensure link text clearly describes its specific destination. Avoid generic strings like "Click Here" or "Read More" unless wrapped within descriptive context.',
        legal: ['ADA/508'], axeRules: ['link-name']
      },
      {
        ref: '2.4.7', level: 'AA', title: 'Focus Visible', mode: 'manual',
        procedure: 'Ensure focused interactive objects have highly distinct, high-contrast outline rings (Never apply CSS styles like outline: none unless a clear alternative is built).',
        legal: ['ADA/508', 'EAA'], axeRules: []
      },
      {
        ref: '2.5.3', level: 'A', title: 'Label in Name', mode: 'auto',
        procedure: 'For interface elements with text labels, ensure the programmatic accessible name (aria-label/HTML text) matches or includes the visual text string verbatim.',
        legal: ['ADA/508'], axeRules: ['label-content-name-mismatch']
      },
      {
        ref: '2.5.7', level: 'AA', title: 'Dragging Movements', mode: 'manual',
        procedure: 'If a feature requires dragging movements (e.g., custom sliders, kanban boards), provide a single-pointer alternative interface option (e.g., up/down buttons).',
        legal: ['EAA/WCAG 2.2', 'Fed Rules'], axeRules: []
      },
      {
        ref: '2.5.8', level: 'AA', title: 'Target Size (Minimum)', mode: 'auto',
        procedure: 'Verify pointer target sizes for interactive icons/links are at least 24x24 CSS pixels, or have sufficient spacing/padding around them to satisfy the criteria.',
        legal: ['EAA/WCAG 2.2', 'Fed Rules'], axeRules: ['target-size']
      }
    ]
  },
  {
    id: 'understandable',
    number: 3,
    title: 'Understandable',
    blurb: 'Information & UI operation must be clear, readable, and predictable.',
    items: [
      {
        ref: '3.1.1', level: 'A', title: 'Language of Page', mode: 'auto',
        procedure: 'Verify the root HTML wrapper element includes a valid programmatic language property declaration (e.g., <html lang="en"> or <html lang="es">).',
        legal: ['ADA/508', 'EAA/ACA'],
        axeRules: ['html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch', 'valid-lang']
      },
      {
        ref: '3.2.1', level: 'A', title: 'On Focus', mode: 'manual',
        procedure: 'Focusing an interactive link or component must not automatically trigger a major change of context (such as opening unexpected pages, modals, or forms).',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '3.2.2', level: 'A', title: 'On Input', mode: 'manual',
        procedure: 'Changing form inputs or checking items must not trigger context shifts unless the interface explicitly warned the user of the behavior beforehand.',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '3.2.3', level: 'AA', title: 'Consistent Navigation', mode: 'manual',
        procedure: 'Navigation structures, sidebars, and utilities must display in the exact same repetitive visual/DOM sequence across multiple pages of the site ecosystem.',
        legal: ['ADA/508', 'ACA'], axeRules: []
      },
      {
        ref: '3.3.1', level: 'A', title: 'Error Identification', mode: 'manual',
        procedure: 'If an input validation error occurs, explicitly pinpoint the field item in text and alert the user via accessible text descriptions. Do not rely on color lines alone.',
        legal: ['ADA/508', 'EAA'], axeRules: []
      },
      {
        ref: '3.3.2', level: 'A', title: 'Labels or Instructions', mode: 'auto',
        procedure: 'Provide visible, distinct descriptive labels or clear formatting examples (e.g., MM/DD/YYYY) for all interactive fields. Text placeholders are insufficient.',
        legal: ['ADA/508', 'EAA/ACA'],
        axeRules: ['label', 'form-field-multiple-labels', 'select-name', 'aria-input-field-name']
      },
      {
        ref: '3.3.3', level: 'AA', title: 'Error Suggestion', mode: 'manual',
        procedure: 'If validation constraints fail and requirements are known, offer actionable textual suggestions on how the user can correct errors (e.g., "Password must be >8 chars").',
        legal: ['ADA/508'], axeRules: []
      },
      {
        ref: '3.3.7', level: 'AA', title: 'Redundant Entry', mode: 'manual',
        procedure: 'In multi-step workflows (e.g., checkout), fields previously entered must be auto-populated or available for selection to avoid repetitive manual re-entry.',
        legal: ['EAA/WCAG 2.2', 'Fed Rules'], axeRules: []
      }
    ]
  },
  {
    id: 'robust',
    number: 4,
    title: 'Robust',
    blurb: 'Maximize compatibility with current & future user agents and assistive tech.',
    items: [
      {
        ref: '4.1.2', level: 'A', title: 'Name, Role, Value', mode: 'auto',
        procedure: 'Ensure every custom component (accordions, tabs, toggle switches) has programmatic states accessible via ARIA (e.g., aria-expanded="true/false", role="button").',
        legal: ['ADA/508', 'EAA/ACA'],
        axeRules: ['button-name', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value', 'aria-allowed-attr', 'aria-roles', 'aria-command-name', 'aria-toggle-field-name', 'aria-tooltip-name', 'aria-meter-name', 'aria-progressbar-name', 'aria-required-children', 'aria-required-parent', 'aria-hidden-focus']
      },
      {
        ref: '4.1.3', level: 'AA', title: 'Status Messages', mode: 'semi',
        procedure: 'Asynchronous dynamic status changes or messaging blocks loaded on page without shifting focus must use live regions (e.g., role="status" or aria-live="polite").',
        legal: ['ADA/508', 'EAA'], axeRules: ['aria-allowed-role']
      }
    ]
  },
  {
    id: 'legal',
    number: 5,
    title: 'Broad Legal Crosswalk & Administrative Requirements',
    blurb: 'Operational checks for statutory compliance beyond specific code implementation.',
    items: [
      {
        ref: 'ADMIN-1', level: 'Admin', title: 'Accessibility Statement', mode: 'semi',
        procedure: 'Verify the site hosts a dedicated Accessibility Statement page outlining compliance targets, target fallback routes, and direct company coordinator contact emails.',
        legal: ['ADA Best Practice', 'EAA Mandatory'], axeRules: [], detector: 'accessibilityStatement'
      },
      {
        ref: 'ADMIN-2', level: 'Admin', title: 'Feedback & Complaint Route', mode: 'manual',
        procedure: 'Confirm presence of a frictionless, accessible, multi-channel form or endpoint for disabled consumers to lodge accessibility barriers directly with administrators.',
        legal: ['ADA Title III', 'ACA Section 5'], axeRules: []
      },
      {
        ref: 'ADMIN-3', level: 'Admin', title: 'VPAT / ACR Generation', mode: 'manual',
        procedure: 'For public sector B2B or educational deliverables, ensure a standard Voluntary Product Accessibility Template (VPAT) is completed to create an official ACR.',
        legal: ['Section 508', 'State Procure'], axeRules: []
      },
      {
        ref: 'ADMIN-4', level: 'Admin', title: 'Avoid Automated Overlay Reliance', mode: 'semi',
        procedure: 'Verify that dynamic "accessibility widgets/overlays" are not treated as full safe-harbor solutions. Native DOM code fixes must be executed to mitigate ADA litigation.',
        legal: ['DOJ Guidance 2024', 'US Case Law'], axeRules: [], detector: 'overlayReliance'
      }
    ]
  }
];

// Flat lookup of every item keyed by ref.
export const ITEM_BY_REF = CHECKLIST.reduce((acc, section) => {
  section.items.forEach((it) => { acc[it.ref] = { ...it, sectionId: section.id }; });
  return acc;
}, {});

// All axe rule ids referenced anywhere -> the WCAG ref(s) they belong to.
export const AXE_RULE_TO_REFS = CHECKLIST.reduce((acc, section) => {
  section.items.forEach((it) => {
    (it.axeRules || []).forEach((rule) => {
      (acc[rule] = acc[rule] || []).push(it.ref);
    });
  });
  return acc;
}, {});

export function blankResults() {
  const out = {};
  CHECKLIST.forEach((s) => s.items.forEach((it) => {
    out[it.ref] = { status: 'untested', note: '', findings: [] };
  }));
  return out;
}

export function summarize(results) {
  const counts = { pass: 0, fail: 0, manual: 0, na: 0, untested: 0, total: 0 };
  Object.values(results || {}).forEach((r) => {
    counts.total += 1;
    counts[r.status] = (counts[r.status] || 0) + 1;
  });
  const scored = counts.pass + counts.fail;
  counts.score = scored ? Math.round((counts.pass / scored) * 100) : null;
  return counts;
}
