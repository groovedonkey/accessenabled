# Brew Haven — Accessibility Audit Practice Site

A small, fictional 3-page coffee-shop website built **for local use only**. It contains
**deliberate ADA / WCAG accessibility defects** so you can practice running an audit
checklist. Nothing here is meant to be deployed publicly.

## Pages

- `index.html` — Home (hero, cards, newsletter signup, hours)
- `menu.html` — Menu (item grid, image zoom, pastry list)
- `contact.html` — Contact (form, map, address)

## Run it locally

Pick one option from inside the `a11y-practice-site` folder.

**Option A — Python (no install needed on most Macs):**

```
python3 -m http.server 8000
```

Then open http://localhost:8000

**Option B — Just open the files:**
Double-click `index.html`. (Note: the local web server in Option A more closely
mimics a real environment, which is better for auditing.)

---

## Answer Key (intentional defects)

> Try the audit first, then check yourself against this list. Issues are grouped by
> WCAG-style category. This is not exhaustive — there may be smaller issues too.

### Global / all pages

- **Missing `lang` attribute** on `<html>` (WCAG 3.1.1).
- **Generic, identical page titles** — every page is just "Brew Haven" (WCAG 2.4.2).
- **No skip-to-content link** (WCAG 2.4.1).
- **Focus outline removed globally** via `*:focus { outline: none }` (WCAG 2.4.7).
- **No semantic landmarks** — page uses `<div>` for header, nav, main, footer instead
  of `<header>`, `<nav>`, `<main>`, `<footer>` (WCAG 1.3.1).
- **Low-contrast nav links** (`#c9b8ad` on `#4a3328`) (WCAG 1.4.3).
- **Low-contrast footer text** (`#6b5a4e` on `#2e211a`) (WCAG 1.4.3).
- **Fake buttons** — `.nav-btn`, `.submit-btn` are `<div onclick>`: not keyboard
  focusable, no role, no Enter/Space support (WCAG 2.1.1, 4.1.2).

### index.html (Home)

- **Hero image has no `alt`** (WCAG 1.1.1).
- **Two of three card images missing/poor `alt`** (one has `alt="coffee"`, vague).
- **Heading order skips** — `<h1>` then `<h4>` in the hero, and section uses `<h3>`
  with `<h5>` cards (WCAG 1.3.1, 2.4.6).
- **"click here" link text** — non-descriptive link (WCAG 2.4.4).
- **`<marquee>` moving text** that can't be paused (WCAG 2.2.2) and is deprecated.
- **Banner contrast** — yellow text on yellow background (WCAG 1.4.3).
- **Banner close "x"** is a mouse-only `<span onclick>` (WCAG 2.1.1).
- **Newsletter inputs have no `<label>`** — placeholder used as the only label
  (WCAG 1.3.1, 3.3.2, 4.1.2).
- **Hours table has no `<th>`/headers/caption** — data table marked up as layout
  (WCAG 1.3.1).
- **Empty link** in footer (`<a href="#"></a>`) with no text (WCAG 2.4.4, 4.1.2).

### menu.html (Menu)

- **Heading jump** — `<h2>` straight to `<h5>` category headings (WCAG 1.3.1).
- **Menu item images have no `alt`** (WCAG 1.1.1).
- **Image zoom is mouse-only** — `onclick` on `<img>`, not keyboard operable, no
  focus management, and overlay can't be closed via keyboard (WCAG 2.1.1, 2.1.2).
- **Allergen info by color only** — nut items shown only in red text (WCAG 1.4.1).

### contact.html (Contact)

- **Inputs not associated with labels** — "Name" and "Message" are plain text next to
  the field; the "Email" `<label>` has no `for` (WCAG 1.3.1, 3.3.2, 4.1.2).
- **Checkbox not labeled** — adjacent `<span>` not tied to the input (WCAG 1.3.1).
- **No visible required-field indicator on fields**, and the "all fields required"
  note is **very low contrast** gray (`#bbb`) (WCAG 1.4.3, 3.3.2).
- **Submit is a fake `<div>` button** (WCAG 2.1.1, 4.1.2).
- **Map image has no `alt`** (WCAG 1.1.1).
- **No form error handling / validation feedback** (WCAG 3.3.1).

---

## Suggested checklist to practice with

- Images & non-text content (alt text)
- Color contrast (text, UI)
- Information conveyed by color alone
- Keyboard operability (Tab, Enter, Space, Esc)
- Visible focus indicator
- Heading structure & landmarks
- Form labels, grouping, errors, required state
- Link purpose / link text
- Page titles & `lang`
- Moving/auto-updating content
- Data tables (headers, captions)
