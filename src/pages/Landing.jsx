import { useState } from 'react';
import {
  ShieldCheck, ScanLine, ClipboardCheck, BadgeCheck, Check, ArrowRight,
  Mail, Globe, Sparkles, Lock, Gauge, FileText
} from 'lucide-react';
import { createLead } from '../leadService.js';

const PLANS = [
  {
    key: 'free-consult',
    icon: ScanLine,
    name: 'Free Consultation',
    price: 'Free',
    priceNote: 'No card required',
    tagline: 'Most popular',
    featured: true,
    cta: 'Book free consultation',
    blurb: 'A no-cost conversation plus an initial electronic scan of your website to show where you stand today.',
    features: [
      'Initial automated accessibility scan',
      'High-level summary of risk areas',
      '15-minute strategy call',
      'Clear recommendation on next steps'
    ]
  },
  {
    key: 'diy',
    icon: ClipboardCheck,
    name: 'DIY Audit Kit',
    price: '$99',
    oldPrice: '$149',
    priceNote: 'Limited-time promo',
    tagline: 'Self-Guided',
    featured: false,
    cta: 'Get the DIY kit',
    blurb: 'The complete AccessEnabled ADA checklist so your team can run an unofficial, self-guided audit at your own pace.',
    features: [
      'Full ADA / WCAG self-audit checklist',
      'Plain-language guidance for each item',
      'Pass / fail / needs-review tracking',
      'Prioritized fix list you can act on',
      'Email support during your audit'
    ]
  },
  {
    key: 'full-audit',
    icon: BadgeCheck,
    name: 'Full Certified Audit',
    price: 'Custom',
    priceNote: 'Scoped to your site',
    tagline: 'Done for you',
    featured: false,
    cta: 'Request a quote',
    blurb: 'A complete, expert-led audit ending in the “AccessEnabled Certified ADA Accessible” badge for your website.',
    features: [
      'Comprehensive manual + automated audit',
      'Detailed remediation report',
      'AccessEnabled Certified ADA Accessible badge',
      'Re-test after fixes are applied',
      'Tailored pricing based on your site’s scope'
    ]
  }
];

export default function Landing() {
  const [form, setForm] = useState({ name: '', email: '', website: '', plan: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const scrollToForm = (plan) => {
    if (plan) setForm((f) => ({ ...f, plan }));
    document.getElementById('lp-contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus('sending');
    try {
      await createLead(form);
      setStatus('done');
      setForm({ name: '', email: '', website: '', plan: form.plan, message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="lp">
      {/* ---------- nav ---------- */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a className="lp-brand" href="#top">
            <ShieldCheck size={26} strokeWidth={2.2} />
            <span>AccessEnabled</span>
          </a>
          <nav className="lp-nav-links">
            <a href="#services">Services</a>
            <a href="#pricing">Pricing</a>
            <a href="#why">Why ADA</a>
            <a className="lp-nav-cta" href="#lp-contact" onClick={(e) => { e.preventDefault(); scrollToForm(); }}>
              Free consultation
            </a>
          </nav>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="lp-hero" id="top">
        <div className="lp-hero-glow" aria-hidden="true" />
        <div className="lp-hero-inner">
          <span className="lp-eyebrow"><Sparkles size={15} /> ADA &amp; WCAG Accessibility Consulting</span>
          <h1>
            Make your website <span className="lp-accent">accessible</span> —<br />
            and provably compliant.
          </h1>
          <p className="lp-sub">
            AccessEnabled helps businesses meet ADA Title III and WCAG standards, reduce legal risk,
            and welcome every visitor. Start with a free scan of your site today.
          </p>
          <div className="lp-hero-actions">
            <button className="lp-btn lp-btn-primary" onClick={() => scrollToForm('free-consult')}>
              Get your free scan <ArrowRight size={18} />
            </button>
            <a className="lp-btn lp-btn-ghost" href="#pricing">See packages</a>
          </div>
          <div className="lp-hero-badges">
            <span><Check size={15} /> WCAG 2.1 / 2.2</span>
            <span><Check size={15} /> ADA Title III</span>
            <span><Check size={15} /> Section 508</span>
          </div>
        </div>
      </section>

      {/* ---------- why ---------- */}
      <section className="lp-why" id="why">
        <div className="lp-section-head">
          <h2>Why accessibility matters</h2>
          <p>Inaccessible sites lose customers and invite lawsuits. We help you fix both.</p>
        </div>
        <div className="lp-why-grid">
          <div className="lp-why-card">
            <Lock size={22} />
            <h3>Reduce legal risk</h3>
            <p>Thousands of ADA web lawsuits are filed every year. A documented audit shows good-faith compliance.</p>
          </div>
          <div className="lp-why-card">
            <Gauge size={22} />
            <h3>Reach more customers</h3>
            <p>1 in 4 U.S. adults lives with a disability. Accessible design opens your business to all of them.</p>
          </div>
          <div className="lp-why-card">
            <FileText size={22} />
            <h3>Better SEO &amp; UX</h3>
            <p>The same fixes that help screen readers also improve search rankings and overall usability.</p>
          </div>
        </div>
      </section>

      {/* ---------- pricing / services ---------- */}
      <section className="lp-pricing" id="pricing">
        <div className="lp-section-head" id="services">
          <h2>Choose your path to compliance</h2>
          <p>From a free starting scan to a fully certified audit — pick what fits your business.</p>
        </div>
        <div className="lp-plans">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.key} className={`lp-plan${plan.featured ? ' lp-plan-featured' : ''}`}>
                {plan.tagline && <span className="lp-plan-tag">{plan.tagline}</span>}
                <div className="lp-plan-icon"><Icon size={26} /></div>
                <h3>{plan.name}</h3>
                <div className="lp-plan-price">
                  {plan.oldPrice && <span className="lp-price-old">{plan.oldPrice}</span>}
                  <span className="lp-price-now">{plan.price}</span>
                </div>
                <span className="lp-plan-pricenote">{plan.priceNote}</span>
                <p className="lp-plan-blurb">{plan.blurb}</p>
                <ul className="lp-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}><Check size={16} /> {f}</li>
                  ))}
                </ul>
                <button
                  className={`lp-btn ${plan.featured ? 'lp-btn-primary' : 'lp-btn-outline'} lp-plan-cta`}
                  onClick={() => scrollToForm(plan.key)}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
        <p className="lp-pricing-note">
          <BadgeCheck size={16} /> Full audit pricing is tailored to the size and complexity of your website,
          so you only pay for what your project actually needs.
        </p>
      </section>

      {/* ---------- contact ---------- */}
      <section className="lp-contact" id="lp-contact">
        <div className="lp-contact-inner">
          <div className="lp-contact-copy">
            <h2>Start with a free consultation</h2>
            <p>
              Tell us about your site and we’ll run an initial electronic scan, then follow up
              with your results and the best next step. No cost, no obligation.
            </p>
            <ul className="lp-contact-points">
              <li><Check size={16} /> Initial electronic scan included</li>
              <li><Check size={16} /> Response within one business day</li>
              <li><Check size={16} /> Honest, jargon-free guidance</li>
            </ul>
          </div>

          <form className="lp-form" onSubmit={handleSubmit}>
            {status === 'done' ? (
              <div className="lp-form-success">
                <div className="lp-success-icon"><Check size={28} /></div>
                <h3>Request received</h3>
                <p>Thanks! We’ll review your site and get back to you within one business day.</p>
                <button type="button" className="lp-btn lp-btn-outline" onClick={() => setStatus('idle')}>
                  Send another request
                </button>
              </div>
            ) : (
              <>
                <h3>Request your free scan</h3>
                <label className="lp-field">
                  <span>Name</span>
                  <input type="text" value={form.name} onChange={update('name')} placeholder="Jane Doe" required />
                </label>
                <label className="lp-field">
                  <span>Email</span>
                  <div className="lp-input-icon">
                    <Mail size={16} />
                    <input type="email" value={form.email} onChange={update('email')} placeholder="jane@business.com" required />
                  </div>
                </label>
                <label className="lp-field">
                  <span>Website</span>
                  <div className="lp-input-icon">
                    <Globe size={16} />
                    <input type="text" inputMode="url" value={form.website} onChange={update('website')} placeholder="https://yourbusiness.com" />
                  </div>
                </label>
                <label className="lp-field">
                  <span>I’m interested in</span>
                  <select value={form.plan} onChange={update('plan')} required>
                    <option value="" disabled>Please select your interest</option>
                    <option value="free-consult">Free consultation + scan</option>
                    <option value="diy">DIY Audit Kit ($99)</option>
                    <option value="full-audit">Full Certified Audit</option>
                  </select>
                </label>
                <label className="lp-field">
                  <span>Anything else? (optional)</span>
                  <textarea rows={3} value={form.message} onChange={update('message')} placeholder="Tell us about your site or goals…" />
                </label>
                {status === 'error' && <p className="lp-form-error">Something went wrong. Please try again.</p>}
                <button className="lp-btn lp-btn-primary lp-form-submit" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Submit'} <ArrowRight size={18} />
                </button>
                <p className="lp-form-fine">We’ll only use your details to follow up about your accessibility audit.</p>
              </>
            )}
          </form>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <a className="lp-brand" href="#top">
            <ShieldCheck size={22} strokeWidth={2.2} />
            <span>AccessEnabled</span>
          </a>
          <p>ADA &amp; WCAG Accessibility Consulting for modern businesses.</p>
          <span className="lp-footer-copy">© {new Date().getFullYear()} AccessEnabled. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
