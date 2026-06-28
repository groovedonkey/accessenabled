// Remediation guidance for the manual audit wizard.
// Keyed by the same `ref` used in checklist.js. When an auditor marks an item
// "Fail", the wizard walks them through `summary`, ordered `steps`, an optional
// `example` code snippet, and a `reference` link to the W3C Understanding doc.

const U = 'https://www.w3.org/WAI/WCAG22/Understanding';

export const REMEDIATION = {
  '1.1.1': {
    summary: 'Every meaningful image needs a text alternative; decorative images must be hidden from assistive tech.',
    steps: [
      'Add concise, descriptive alt text to informative images that conveys their purpose, not just their appearance.',
      'Give purely decorative images an empty alt attribute (alt="") so screen readers skip them.',
      'For icon buttons and linked images, describe the action/destination, not the icon (e.g., alt="Search").',
      'Provide text equivalents for complex images (charts, infographics) via adjacent text or a longer description.'
    ],
    example: '<img src="team.jpg" alt="The AccessEnabled team at the 2024 conference">\n<img src="divider.png" alt="">',
    reference: `${U}/non-text-content.html`
  },
  '1.2.1': {
    summary: 'Prerecorded audio-only and video-only content needs an equivalent text or audio alternative.',
    steps: [
      'For audio-only (podcasts, recordings): publish a full text transcript near the player.',
      'For video-only (silent footage): provide a text description or an audio track describing the visuals.',
      'Link the alternative clearly and place it adjacent to the media.'
    ],
    reference: `${U}/audio-only-and-video-only-prerecorded.html`
  },
  '1.2.2': {
    summary: 'Prerecorded video with sound must have synchronized, accurate captions.',
    steps: [
      'Add a synchronized caption track (e.g., WebVTT via <track kind="captions">) to every video with dialogue/meaningful sound.',
      'Caption speech, speaker changes, and important non-speech sounds.',
      'Correct auto-generated captions for accuracy, punctuation, and timing.'
    ],
    example: '<video controls>\n  <source src="intro.mp4" type="video/mp4">\n  <track kind="captions" src="intro.en.vtt" srclang="en" label="English" default>\n</video>',
    reference: `${U}/captions-prerecorded.html`
  },
  '1.2.3': {
    summary: 'Provide an audio description or full text alternative for prerecorded video.',
    steps: [
      'Add an audio description track that narrates key visual information during natural pauses.',
      'Alternatively, provide a full text transcript that includes visual context (settings, actions, on-screen text).',
      'Ensure the alternative captures information not available from the dialogue alone.'
    ],
    reference: `${U}/audio-description-or-media-alternative-prerecorded.html`
  },
  '1.3.1': {
    summary: 'Use semantic HTML so structure and relationships are programmatically available.',
    steps: [
      'Use headings (h1–h6) in a logical, non-skipping hierarchy that reflects the content outline.',
      'Mark up lists with <ul>/<ol>/<li> and data tables with <th> (plus scope) and <caption>.',
      'Associate form fields with <label>; group related controls with <fieldset>/<legend>.',
      'Avoid faking structure with styled <div>/<span>; use the correct element or ARIA role.'
    ],
    example: '<table>\n  <caption>Opening hours</caption>\n  <tr><th scope="col">Day</th><th scope="col">Hours</th></tr>\n  <tr><td>Monday</td><td>6am–8pm</td></tr>\n</table>',
    reference: `${U}/info-and-relationships.html`
  },
  '1.3.2': {
    summary: 'The DOM order must produce a meaningful reading sequence.',
    steps: [
      'Ensure the source/DOM order matches the intended reading order (test with CSS disabled).',
      'Avoid using CSS (float, flex/grid order, absolute positioning) to visually reorder content in a way that breaks meaning.',
      'Verify screen-reader reading order matches the visual flow.'
    ],
    reference: `${U}/meaningful-sequence.html`
  },
  '1.3.3': {
    summary: 'Instructions must not rely on sensory characteristics alone.',
    steps: [
      'Reference elements by visible text label or name, not only by shape, size, or position.',
      'Avoid "click the round button on the right" — say "select the Submit button".',
      'Pair any sensory cue with a text-based one.'
    ],
    reference: `${U}/sensory-characteristics.html`
  },
  '1.3.5': {
    summary: 'Use HTML autocomplete tokens on inputs that collect known user data.',
    steps: [
      'Add the correct autocomplete attribute to personal-data fields (name, email, address, tel, etc.).',
      'Use standard tokens such as autocomplete="email", "given-name", "tel", "postal-code".',
      'Confirm input type also matches (type="email", type="tel").'
    ],
    example: '<input type="email" name="email" autocomplete="email">\n<input type="text" name="fname" autocomplete="given-name">',
    reference: `${U}/identify-input-purpose.html`
  },
  '1.4.1': {
    summary: 'Color must not be the only way information is conveyed.',
    steps: [
      'Pair color with text, icons, underlines, or patterns (e.g., error fields get an icon + message, not just red).',
      'Ensure links in body text are distinguishable by more than color (underline them).',
      'For charts/legends, add labels or textures in addition to color.'
    ],
    reference: `${U}/use-of-color.html`
  },
  '1.4.3': {
    summary: 'Text must meet minimum contrast against its background.',
    steps: [
      'Achieve at least 4.5:1 for normal text and 3:1 for large text (≥18pt, or ≥14pt bold).',
      'Use a contrast checker to test foreground/background pairs, including text over images/gradients.',
      'Adjust the text or background color token rather than adding overlays.'
    ],
    example: '/* Fails: #999 on #fff ≈ 2.8:1. Fix: */\ncolor: #595959; /* ≈ 7:1 on #fff */',
    reference: `${U}/contrast-minimum.html`
  },
  '1.4.4': {
    summary: 'Text must remain usable when zoomed to 200%.',
    steps: [
      'Use relative units (rem/em/%) for font sizes and containers instead of fixed px where possible.',
      'Do not disable zoom (remove user-scalable=no / maximum-scale from the viewport meta).',
      'Test at 200% browser zoom for clipping, overlap, or lost content.'
    ],
    example: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    reference: `${U}/resize-text.html`
  },
  '1.4.10': {
    summary: 'Content must reflow to a 320px-wide viewport without two-dimensional scrolling.',
    steps: [
      'Use responsive, fluid layouts (flex/grid with wrapping, max-width: 100%) instead of fixed widths.',
      'Avoid forcing horizontal scrolling at 320px CSS width (≈400% zoom on a 1280px screen).',
      'Allow long content/tables to scroll only in one dimension where unavoidable.'
    ],
    reference: `${U}/reflow.html`
  },
  '1.4.11': {
    summary: 'UI components and meaningful graphics need 3:1 contrast.',
    steps: [
      'Ensure form field borders, focus indicators, and custom control states meet 3:1 against adjacent colors.',
      'Ensure meaningful icons/graphics (not decorative) meet 3:1 against their background.',
      'Strengthen subtle borders/placeholders that fall below the threshold.'
    ],
    reference: `${U}/non-text-contrast.html`
  },
  '2.1.1': {
    summary: 'All functionality must be operable by keyboard alone.',
    steps: [
      'Use native interactive elements (<a>, <button>, <input>) which are focusable and operable by default.',
      'For custom widgets, add tabindex="0", a role, and key handlers (Enter/Space/Arrows).',
      'Replace mouse-only handlers (onclick on <div>/<span>) with real controls.',
      'Tab through the whole page and confirm every control is reachable and operable.'
    ],
    example: '<!-- Replace -->\n<div onclick="submit()">Sign Up</div>\n<!-- With -->\n<button type="submit">Sign Up</button>',
    reference: `${U}/keyboard.html`
  },
  '2.1.2': {
    summary: 'Keyboard focus must never be trapped.',
    steps: [
      'Ensure focus can move into and out of every component using Tab/Shift+Tab.',
      'For modals, trap focus only while open and restore it on close; allow Esc to dismiss.',
      'Test custom widgets (date pickers, carousels) for exit paths.'
    ],
    reference: `${U}/no-keyboard-trap.html`
  },
  '2.1.4': {
    summary: 'Single-character key shortcuts must be controllable.',
    steps: [
      'Provide a way to turn off single-key shortcuts, or',
      'Allow remapping to include a modifier (Ctrl/Alt), or',
      'Activate the shortcut only when the relevant component has focus.'
    ],
    reference: `${U}/character-key-shortcuts.html`
  },
  '2.3.1': {
    summary: 'Nothing should flash more than three times per second.',
    steps: [
      'Remove or slow content that flashes more than 3 times in any 1-second window.',
      'Avoid rapid strobing/blinking effects entirely; keep large flashes below threshold.',
      'Replace deprecated <blink>/<marquee> with controllable, pausable animation.'
    ],
    reference: `${U}/three-flashes-or-below-threshold.html`
  },
  '2.4.1': {
    summary: 'Provide a keyboard-accessible way to skip repeated blocks.',
    steps: [
      'Add a "Skip to main content" link as the first focusable element.',
      'Point it to the id of your <main> region; make it visible on focus.',
      'Use landmark regions (<header>, <nav>, <main>, <footer>) to aid bypassing.'
    ],
    example: '<a class="skip-link" href="#main">Skip to content</a>\n...\n<main id="main">…</main>',
    reference: `${U}/bypass-blocks.html`
  },
  '2.4.2': {
    summary: 'Each page needs a unique, descriptive title.',
    steps: [
      'Set a <title> that describes the page and site (e.g., "Menu — Brew Haven").',
      'Make titles unique per page/view; update them on route changes in SPAs.',
      'Put the most specific information first.'
    ],
    example: '<title>Contact Us — Brew Haven</title>',
    reference: `${U}/page-titled.html`
  },
  '2.4.3': {
    summary: 'Focus order must be logical and meaningful.',
    steps: [
      'Match DOM order to the visual reading order so Tab moves predictably.',
      'Avoid positive tabindex values (tabindex="1"+) that override natural order.',
      'When inserting dynamic content (modals/menus), move focus appropriately.'
    ],
    reference: `${U}/focus-order.html`
  },
  '2.4.4': {
    summary: 'Link text must describe its destination in context.',
    steps: [
      'Write descriptive link text ("View pricing") instead of "click here" / "read more".',
      'If generic text is unavoidable, add context via aria-label or visually-hidden text.',
      'Ensure linked images have meaningful alt text describing the destination.'
    ],
    example: '<a href="/pricing">See our pricing</a>\n<!-- or -->\n<a href="/post/1">Read more<span class="sr-only"> about ADA compliance</span></a>',
    reference: `${U}/link-purpose-in-context.html`
  },
  '2.4.7': {
    summary: 'Keyboard focus must be clearly visible.',
    steps: [
      'Never remove outlines globally (avoid *:focus { outline: none }).',
      'Provide a high-contrast, visible focus style (outline or box-shadow) on all interactive elements.',
      'Use :focus-visible to tailor focus rings for keyboard users.'
    ],
    example: ':focus-visible {\n  outline: 3px solid #1a73e8;\n  outline-offset: 2px;\n}',
    reference: `${U}/focus-visible.html`
  },
  '2.5.3': {
    summary: "An element's accessible name must include its visible label text.",
    steps: [
      'Ensure the accessible name (aria-label/aria-labelledby) starts with or contains the visible text verbatim.',
      'Prefer visible text as the accessible name; only extend it, do not replace it.',
      'This lets speech-input users activate controls by their visible name.'
    ],
    example: '<!-- Visible text "Search" must be in the name -->\n<button aria-label="Search">Search</button>',
    reference: `${U}/label-in-name.html`
  },
  '2.5.7': {
    summary: 'Dragging actions need a single-pointer alternative.',
    steps: [
      'Provide buttons or inputs that achieve the same result without dragging (e.g., reorder up/down buttons).',
      'For sliders, allow clicking the track or typing a value.',
      'Keep the drag interaction, but add the alternative alongside it.'
    ],
    reference: `${U}/dragging-movements.html`
  },
  '2.5.8': {
    summary: 'Interactive targets should be at least 24×24 CSS pixels.',
    steps: [
      'Increase the clickable size (padding/min-width/min-height) of small icons and links to ≥24×24px.',
      'Or ensure at least 24px of spacing between small adjacent targets.',
      'Pay attention to icon-only buttons, close (x) controls, and inline links.'
    ],
    example: '.icon-btn { min-width: 24px; min-height: 24px; padding: 8px; }',
    reference: `${U}/target-size-minimum.html`
  },
  '3.1.1': {
    summary: 'Declare the page language programmatically.',
    steps: [
      'Add a valid lang attribute to the <html> element (e.g., lang="en").',
      'Use the correct BCP-47 code for the primary language of the page.',
      'Mark inline passages in another language with their own lang attribute.'
    ],
    example: '<html lang="en">',
    reference: `${U}/language-of-page.html`
  },
  '3.2.1': {
    summary: 'Moving focus must not cause an unexpected change of context.',
    steps: [
      'Do not auto-submit, navigate, or open popups simply because an element received focus.',
      'Trigger context changes on explicit activation (click/Enter), not on focus.',
      'Warn users in advance if a change is intentional.'
    ],
    reference: `${U}/on-focus.html`
  },
  '3.2.2': {
    summary: 'Changing a setting must not unexpectedly change context.',
    steps: [
      'Do not auto-submit forms or navigate when a field value or checkbox changes.',
      'Require an explicit submit action, or clearly warn the user beforehand.',
      'Keep input behavior predictable.'
    ],
    reference: `${U}/on-input.html`
  },
  '3.2.3': {
    summary: 'Repeated navigation must stay in a consistent order across pages.',
    steps: [
      'Keep nav, search, and utility links in the same relative order site-wide.',
      'Reuse a shared header/nav component rather than re-ordering per page.',
      'Consistency may change only when the user initiates it.'
    ],
    reference: `${U}/consistent-navigation.html`
  },
  '3.3.1': {
    summary: 'Input errors must be identified in accessible text.',
    steps: [
      'On validation failure, identify the specific field and describe the error in text.',
      'Associate the message with the field (aria-describedby) and set aria-invalid="true".',
      'Do not rely on color alone; move focus or announce via a live region.'
    ],
    example: '<input id="email" aria-invalid="true" aria-describedby="email-err">\n<p id="email-err">Enter a valid email address.</p>',
    reference: `${U}/error-identification.html`
  },
  '3.3.2': {
    summary: 'All inputs need visible labels or instructions.',
    steps: [
      'Provide a persistent visible <label> associated via for/id for every field.',
      'Do not use placeholder text as the only label (it disappears on input).',
      'Add format hints/examples (e.g., MM/DD/YYYY) where needed.'
    ],
    example: '<label for="dob">Date of birth (MM/DD/YYYY)</label>\n<input id="dob" name="dob">',
    reference: `${U}/labels-or-instructions.html`
  },
  '3.3.3': {
    summary: 'When you know the fix, suggest how to correct an error.',
    steps: [
      'Provide actionable correction text (e.g., "Password must be at least 8 characters").',
      'Suggest valid formats or nearest valid values where possible.',
      'Keep suggestions specific to the field that failed.'
    ],
    reference: `${U}/error-suggestion.html`
  },
  '3.3.7': {
    summary: 'Avoid forcing users to re-enter information they already provided.',
    steps: [
      'Auto-populate or offer previously entered data in multi-step flows (e.g., billing = shipping).',
      'Provide a "same as" option or remembered selections.',
      'Exceptions: re-entry essential for security (e.g., password confirmation).'
    ],
    reference: `${U}/redundant-entry.html`
  },
  '4.1.2': {
    summary: 'Custom components must expose name, role, and value to assistive tech.',
    steps: [
      'Give every control an accessible name (visible label, aria-label, or aria-labelledby).',
      'Use the correct role (native element preferred, otherwise ARIA role).',
      'Expose and update state/value (aria-expanded, aria-checked, aria-selected) as it changes.'
    ],
    example: '<button aria-expanded="false" aria-controls="menu">Menu</button>',
    reference: `${U}/name-role-value.html`
  },
  '4.1.3': {
    summary: 'Status updates must be announced without moving focus.',
    steps: [
      'Wrap dynamic status messages in a live region (role="status" or aria-live="polite").',
      'Use role="alert" / aria-live="assertive" for urgent errors only.',
      'Ensure the region exists in the DOM before its content updates.'
    ],
    example: '<div role="status" aria-live="polite">Your changes were saved.</div>',
    reference: `${U}/status-messages.html`
  },
  'ADMIN-1': {
    summary: 'Publish a dedicated, reachable Accessibility Statement.',
    steps: [
      'Create an Accessibility Statement page describing your conformance target (e.g., WCAG 2.2 AA).',
      'Include a contact method (email/phone) for accessibility issues and known limitations.',
      'Link it from the global footer so it is reachable from every page.'
    ],
    reference: 'https://www.w3.org/WAI/planning/statements/'
  },
  'ADMIN-2': {
    summary: 'Offer an accessible feedback/complaint channel.',
    steps: [
      'Provide an accessible form or multiple contact options (email, phone) to report barriers.',
      'Ensure the channel itself is fully accessible and clearly labeled.',
      'Commit to a response process and timeframe.'
    ],
    reference: 'https://www.ada.gov/resources/web-guidance/'
  },
  'ADMIN-3': {
    summary: 'Produce a VPAT/ACR for procurement and B2B/public-sector needs.',
    steps: [
      'Complete the appropriate VPAT edition (WCAG/508/EN 301 549) honestly per criterion.',
      'Base conformance claims on actual audit results.',
      'Publish or supply the resulting Accessibility Conformance Report (ACR) on request.'
    ],
    reference: 'https://www.itic.org/policy/accessibility/vpat'
  },
  'ADMIN-4': {
    summary: 'Do not treat accessibility overlays as a compliance solution.',
    steps: [
      'Fix accessibility issues in the native DOM/code, not via a third-party overlay widget.',
      'Remove reliance on overlays as a "safe harbor"; they do not ensure ADA compliance.',
      'If an overlay exists, confirm underlying code is independently conformant.'
    ],
    reference: 'https://www.ada.gov/resources/web-guidance/'
  }
};

export function getRemediation(ref) {
  return REMEDIATION[ref] || null;
}
