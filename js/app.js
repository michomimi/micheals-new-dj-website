/* =====================================================================
   APP.JS — single source of truth for this site
   Everything you are likely to change lives in CONFIG below. The header,
   footer and social links are built from it on every page, so editing it
   once updates the whole site.
   ===================================================================== */

const CONFIG = {
  /* ---- YOUR DETAILS — edit these ---------------------------------- */
  name:       "DJ MISHOO",          // full name — titles, footer, email subjects
  brandLead:  "DJ",                 // logo: the white part
  brandAccent:"MISHOO",             // logo: the red part (leave "" for all white)
  tagline:    "Open-format DJ · Calgary, AB",
  email:      "info@djmishoo.ca",
  phone:      "+1 403 437 6153",    // blank hides it
  whatsapp:   "https://wa.me/14034376153",   // built from the phone number above
  city:       "Calgary, AB",

  /* ---- SOCIALS — profiles people follow, not ways to reach you.
     WhatsApp deliberately lives above with the phone and email instead:
     it belongs with the contact methods, not under "Follow".
     ------------------------------------------------------------------ */
  social: {
    instagram:  "https://www.instagram.com/dj_mishoo",
    tiktok:     "https://www.tiktok.com/@dj.micheal21",
    soundcloud: "",   // optional
    youtube:    "",   // optional
  },

  /* ---- PACKAGES & DEPOSITS ----------------------------------------
     `price` here is the single source of truth — the booking page reads
     it, so you never edit a price in two places.

     The deposit is worked out as price × depositRate and shown to the
     guest. IMPORTANT: that figure is only a label. The amount actually
     charged is whatever the Stripe link is set to, so each link must be
     created for exactly the deposit shown beside it, and re-made if you
     ever change a price. A mismatch means the guest is quoted one number
     and billed another.

     Leave `deposit` empty and the button says "not set up yet" rather
     than linking nowhere. A hosted checkout URL is public and safe to
     commit — never put a secret API key here.
     ------------------------------------------------------------------ */
  depositRate: 0.5,                 // half the package price

  /* ---- DEPOSITS BY INTERAC e-TRANSFER ------------------------------
     The free route: no processor, no percentage taken, money lands in
     your bank directly.

     There is no such thing as a clickable e-transfer link. The guest
     always starts the transfer from their own banking app, so the most a
     website can do is state the amount, the address and the reference
     clearly, and make the address one tap to copy. That is what this
     builds.

     `address` must be the address you registered for Autodeposit at your
     bank, otherwise the guest gets asked to invent a security question
     and you have to chase them for the answer.
     ------------------------------------------------------------------ */
  etransfer: {
    enabled:     true,
    /* Deliberately NOT the same as CONFIG.email above. That address is
       what the site shows publicly and where enquiries land; this is
       where money is sent, and the two are allowed to differ. */
    address:     "michel.jabour52@gmail.com",
    autodeposit: true,              // set false if Autodeposit is not registered yet
  },

  packages: [
    { id: "essential", name: "Essential", price: 800,  deposit: "" },  // ← $400 Stripe link
    { id: "signature", name: "Signature", price: 1500, deposit: "" },  // ← $750 Stripe link
    { id: "headline",  name: "Headline",  price: 2000, deposit: "" },  // ← $1,000 Stripe link
  ],

  /* ---- FORMS ------------------------------------------------------
     THIS SITE HAS NO SERVER. It is plain files on GitHub Pages, and a
     page cannot send email by itself: sending requires a mail server,
     and any password put in this file would be public. So enquiries go
     through a form service, which receives the submission and emails it
     to you. Both options below are free.

     EASIEST — Web3Forms, no account needed:
       1. Go to https://web3forms.com
       2. Type in info@djmishoo.ca and press Create Access Key
       3. They email you a key that looks like
          "a1b2c3d4-0000-0000-0000-abcdef123456"
       4. Paste it between the quotes below and save.
     That is the whole job. Every form on the site then emails you.

     ALTERNATIVE — Formspree: sign up, create a form, paste the URL it
     gives you into formEndpoint instead.

     With neither filled in, forms fall back to opening the visitor's own
     email app, so an enquiry is never silently lost, but the visitor has
     to press send themselves and many will not bother.
     ------------------------------------------------------------------ */
  /* This key is meant to be public: it only says "deliver to the address
     this key was created for". It cannot read anything, and it is safe to
     commit. Delivery goes to info@djmishoo.ca. */
  web3formsKey: "92606942-7ab7-45ef-806f-8116b040c408",
  formEndpoint: "",                 // ← or a Formspree/Basin URL instead

  /* ---- ANALYTICS --------------------------------------------------
     Deliberately empty. While it is empty nothing third party loads and
     privacy.html stays accurate, because that page currently promises
     in writing that this site runs no analytics and sets no cookies.

     To switch it on, sign up somewhere cookieless (Plausible, Umami and
     GoatCounter all qualify) and paste the two values their setup page
     gives you. Then update privacy.html in the same commit, or the
     policy becomes a false statement the moment this deploys. */
  analytics: {
    src:    "",     // e.g. "https://plausible.io/js/script.js"
    domain: "",     // e.g. "djmishoo.ca"
  },

  /* ---- GALLERY ----------------------------------------------------
     Name your photos 01.jpg, 02.jpg ... up to `count`, and drop them in
     the folder below. A slot with no file yet shows a labelled
     placeholder rather than a broken image, so you can upload in
     batches. Change `count` to add or remove slots.

     Captions are optional. Add them by slot number, for example
     3: "Wedding · The Fairmont". Slots with no caption show none.
     ------------------------------------------------------------------ */
  gallery: {
    thumbs: "images/gallery/thumb/",   // 700px, shown in the grid
    full:   "images/gallery/full/",    // 1600px, loaded only in the lightbox
    ext:    ".jpg",
    count:  11,
    captions: {
      // 1: "Wedding · Calgary",
      // 2: "Corporate · Downtown",
    },
  },

  /* ---- VIDEOS -----------------------------------------------------
     Same idea as the gallery. Name clips 01.mp4, 02.mp4 and so on, put
     them in videos/, then set `count` to how many there are.

     A poster is the still frame shown before play. Drop a matching
     01.jpg in videos/posters/ for each clip. Without one the player
     shows a black frame until it is played, which still works but
     looks worse.

     Keep clips short and compressed. A phone video can be 100MB per
     minute, which is far too heavy for a web page. 1080p and under
     about 10MB per clip is a sensible ceiling.
     ------------------------------------------------------------------ */
  videos: {
    path:    "videos/",
    posters: "videos/posters/",
    ext:     ".mp4",
    count:   5,
    captions: {
      // 1: "Wedding · first dance",
    },
  },

  /* ---- REVIEWS ----------------------------------------------------
     Guests submit reviews through the form on reviews.html, which sends
     them to you (form endpoint, or your email as a fallback). Nothing
     appears on the site until you paste it in here — so nobody can post
     to your site directly. Add newest first.
     ------------------------------------------------------------------ */
  reviews: [
    // { name: "Sarah & Tom", event: "Wedding · Calgary", stars: 5,
    //   text: "The floor did not empty once all night." },
  ],
};

/* ---------- helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (m) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

const PAGES = [
  { id: "home",    label: "Home",    href: "index.html"   },
  { id: "about",   label: "About",   href: "about.html"   },
  { id: "gallery", label: "Gallery", href: "gallery.html" },
  { id: "reviews", label: "Reviews", href: "reviews.html" },
  { id: "booking", label: "Booking", href: "booking.html" },
  { id: "contact", label: "Contact", href: "contact.html" },
];

/* Legal pages live in the footer only, deliberately kept out of PAGES so
   they never appear in the main navigation. */
const LEGAL = [
  { id: "contract", label: "Booking Agreement",    href: "contract.html" },
  { id: "terms",    label: "Terms and Conditions", href: "terms.html"    },
  { id: "privacy",  label: "Privacy Policy",       href: "privacy.html"  },
];

const ICONS = {
  instagram:  '<svg viewBox="0 0 24 24" class="ic"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
  tiktok:     '<svg viewBox="0 0 24 24" class="ic"><path d="M15 4v8.5a3.5 3.5 0 11-3.5-3.5"/><path d="M15 4c.6 2.2 2 3.4 4 3.6"/></svg>',
  soundcloud: '<svg viewBox="0 0 24 24" class="ic"><path d="M3 15v-3M6 16v-5M9 16V9M12 16V7a5 5 0 019 3v6z"/></svg>',
  youtube:    '<svg viewBox="0 0 24 24" class="ic"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.5l5 2.5-5 2.5z"/></svg>',
};

/* only render socials that actually have a URL filled in */
function socialLinks() {
  return Object.entries(CONFIG.social)
    .filter(([, url]) => url && url.trim())
    .map(([k, url]) =>
      `<a class="social" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${k}">${ICONS[k] || ""}</a>`)
    .join("");
}

/* beamed pair of eighth notes, sitting after the name in the logo */
const NOTE_MARK = `
  <svg class="brand-note" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path class="stem" d="M9 17.4V5.1l10-2.2v12.3"/>
    <circle class="head" cx="6.5" cy="18" r="2.7"/>
    <circle class="head" cx="16.5" cy="15.7" r="2.7"/>
  </svg>`;

function brandMark() {
  const lead   = CONFIG.brandLead || CONFIG.name;
  const accent = CONFIG.brandAccent ? ` <em>${esc(CONFIG.brandAccent)}</em>` : "";
  return `<span class="brand-mark">${esc(lead)}${accent}${NOTE_MARK}</span>`;
}

/* =====================================================================
   THEME
   The theme is applied by a tiny inline script in each <head>, before
   the stylesheet paints, so the page never flashes the wrong colour.
   Everything here is only about the button and the later switching.

   localStorage holds an explicit choice and nothing else. While it is
   empty the site follows the OS, including live changes; the first press
   of the button is what pins it. That is why the media query listener
   below checks for a stored value before reacting.
   ===================================================================== */
const THEME_KEY = "theme";

/* A sliding switch rather than an icon button. role="switch" plus
   aria-checked is what tells a screen reader this is a two-state control;
   the visual knob alone carries no meaning. */
const THEME_TOGGLE = `
  <button class="theme-switch" id="themeToggle" type="button" role="switch"
          aria-checked="false" aria-label="Switch theme" title="Switch theme">
    <svg class="ts-ic ts-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.6"/>
      <path d="M12 1.6v2.6M12 19.8v2.6M3.6 3.6l1.9 1.9M18.5 18.5l1.9 1.9M1.6 12h2.6M19.8 12h2.6M3.6 20.4l1.9-1.9M18.5 5.5l1.9-1.9"/>
    </svg>
    <svg class="ts-ic ts-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 14.2A8.4 8.4 0 019.8 3.5a8.4 8.4 0 1010.7 10.7z"/>
    </svg>
    <span class="ts-knob" aria-hidden="true"></span>
  </button>`;

function systemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/* Private-mode Safari throws on localStorage rather than returning null,
   so every access is guarded. A failure here must not take the page down. */
function storedTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}

function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement;

  /* The colour transition is opt-in per switch. Leaving it always on
     would animate the whole page on first paint too, which reads as a
     slow load rather than a deliberate change. */
  if (animate) {
    root.classList.add("theme-anim");
    clearTimeout(applyTheme._t);
    applyTheme._t = setTimeout(() => root.classList.remove("theme-anim"), 320);
  }

  root.dataset.theme = theme;

  /* Keeps the mobile browser chrome in step with the page. */
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#F7F8FA" : "#000000");

  const btn = $("#themeToggle");
  if (btn) {
    const next = theme === "light" ? "dark" : "light";
    const label = `Switch to ${next} mode`;
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
    /* checked = the light state, so the knob's position and the value a
       screen reader announces describe the same thing. */
    btn.setAttribute("aria-checked", String(theme === "light"));
  }
}

function initTheme() {
  /* The inline head script already set this; read it back rather than
     recomputing, so the two can never disagree. */
  applyTheme(document.documentElement.dataset.theme || storedTheme() || systemTheme());

  const btn = $("#themeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
      applyTheme(next, { animate: true });
    });
  }

  /* Follow the OS only until the visitor makes their own choice. */
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = (e) => {
      if (!storedTheme()) applyTheme(e.matches ? "light" : "dark", { animate: true });
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
}

/* =====================================================================
   DATE FIELDS — move on once the date is complete

   A date input is one control made of three segments the browser draws
   itself. Moving between those segments as you type is the browser's own
   behaviour and cannot be scripted: they live in shadow DOM that pages
   cannot reach. Chrome and Firefox advance year to month to day on their
   own; Safari is the one that makes you press Right or Tab.

   What a page CAN do is take over once the whole date is filled, which
   removes the Tab press that actually costs time: the one out of the date
   and on to the next question.

   Only fires on the empty-to-filled transition. Firing on every complete
   value would yank focus away mid-correction the moment someone edited a
   digit of a date they had already typed.
   ===================================================================== */
function initDateAdvance() {
  $$('input[type="date"]').forEach((el) => {
    /* A partially typed date reports value "", so a non-empty value here
       means every segment is filled and the date is valid. */
    el.dataset.wasFilled = el.value ? "1" : "";

    el.addEventListener("input", () => {
      const filled = !!el.value;
      const wasFilled = el.dataset.wasFilled === "1";
      el.dataset.wasFilled = filled ? "1" : "";
      if (!filled || wasFilled) return;

      const scope = el.form || document;
      const fields = $$(
        'input:not([type="hidden"]):not([disabled]), select, textarea, button[type="submit"]',
        scope
      ).filter((f) => f.offsetParent !== null);      // skip anything hidden
      const next = fields[fields.indexOf(el) + 1];
      if (next) next.focus();
    });
  });
}

/* =====================================================================
   BACK BUTTON

   Injected into the page header of every inner page. The home page has a
   hero rather than a .page-head, so it is skipped automatically, which is
   right: there is nowhere above home to go back to.

   history.back() alone is not enough. Someone arriving from a search
   result, a shared link or a bookmark has no previous page on this site,
   and going back would throw them off it entirely, or do nothing at all
   if the tab is new. So the previous page is only used when it is one of
   ours, and home is the fallback.
   ===================================================================== */
function initBackButton() {
  const head = $(".page-head .wrap");
  if (!head) return;                       // home, or a page without a header

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "back-btn reveal";
  btn.id = "backBtn";
  btn.innerHTML =
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
       <path d="M15 5l-7 7 7 7"/>
     </svg><span>Back</span>`;
  head.insertBefore(btn, head.firstChild);

  const cameFromThisSite = () => {
    if (!document.referrer) return false;
    try { return new URL(document.referrer).origin === location.origin; }
    catch { return false; }
  };

  btn.addEventListener("click", () => {
    /* history.length is 1 on a fresh tab, so there is genuinely nothing
       behind us even if a referrer exists. */
    if (cameFromThisSite() && window.history.length > 1) {
      window.history.back();
      return;
    }
    document.documentElement.classList.add("is-leaving");
    setTimeout(() => { window.location.href = "index.html"; }, 210);
  });
}

/* =====================================================================
   BACK TO TOP
   Appears once the visitor is near the foot of the page, where there is
   nothing left to read and the way back is a long scroll.
   ===================================================================== */
function initToTop() {
  const btn = $("#toTop");
  if (!btn) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Scroll fires far more often than the screen refreshes, so the read is
     deferred to the next frame. Reading scrollHeight in the handler
     itself would force a layout on every one of those events. */
  let queued = false;
  let settle;
  const update = () => {
    queued = false;
    clearTimeout(settle);
    const total = Math.max(
      document.documentElement.scrollHeight, document.body.scrollHeight);
    const reachedEnd = total - (window.scrollY + window.innerHeight) < 420;
    /* On a page barely taller than the window there is no scroll worth
       undoing, so the button would just be clutter. */
    const worthIt = total > window.innerHeight * 1.6;
    btn.classList.toggle("show", reachedEnd && worthIt);
  };
  const onScroll = () => {
    /* A trailing timer as well as the frame callback. requestAnimationFrame
       is the right primitive while the page is actually painting, but it
       is throttled or suspended in background tabs and other low-activity
       states, and if it never fires the button is stuck in whatever state
       it was last left in. The timer guarantees the state settles. */
    clearTimeout(settle);
    settle = setTimeout(update, 120);
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    /* Send keyboard focus back to the top too, otherwise the next Tab
       would resume from the footer the visitor just left. preventScroll
       stops the focus call from jumping the page and cancelling the
       smooth scroll that has only just started. */
    const first = $(".site-header .brand");
    if (first) first.focus({ preventScroll: true });
    btn.classList.remove("show");
  });
}

/* =====================================================================
   HEADER + FOOTER — injected so there is one copy, not six
   ===================================================================== */
function injectShell() {
  const current = document.body.dataset.page || "home";

  const navLinks = PAGES.map((p) =>
    `<a class="nav-link${p.id === current ? " is-active" : ""}" href="${p.href}">${p.label}</a>`
  ).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="site-header" id="siteHeader">
      <div class="wrap header-inner">
        <a class="brand" href="index.html" aria-label="${esc(CONFIG.name)} home">${brandMark()}</a>
        <nav class="nav" aria-label="Main">${navLinks}</nav>
        <div class="header-actions">
          <button class="lang-toggle" id="langToggle" type="button" aria-label="Switch language"><span data-lg="en">En</span><i aria-hidden="true">/</i><span data-lg="ar">Ar</span></button>
          ${THEME_TOGGLE}
          <a class="btn btn-primary" href="booking.html">Book Me</a>
          <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false" aria-controls="mobileNav">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
    <nav class="mobile-nav" id="mobileNav" aria-label="Mobile">
      ${PAGES.map((p) =>
        `<a class="${p.id === current ? "is-active" : ""}"${
          p.id === current ? ' aria-current="page"' : ""
        } href="${p.href}">${p.label}</a>`).join("")}
    </nav>
    <button class="to-top" id="toTop" type="button" aria-label="Back to top" title="Back to top">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>
    </button>
  `);

  /* Each contact row is a labelled pair rather than a bare link, so the
     column reads as information instead of a second navigation list.
     Anything not filled in on CONFIG is simply left out. */
  const contactRow = (label, href, value, attrs = "") =>
    `<li><span>${label}</span><a href="${href}"${attrs}>${esc(value)}</a></li>`;

  const contactRows = [
    CONFIG.email && contactRow("Email", `mailto:${esc(CONFIG.email)}`, CONFIG.email),
    CONFIG.phone && contactRow("Phone", `tel:${CONFIG.phone.replace(/[^\d+]/g, "")}`, CONFIG.phone),
    CONFIG.whatsapp && contactRow("WhatsApp", esc(CONFIG.whatsapp),
      "Message me", ' target="_blank" rel="noopener"'),
  ].filter(Boolean).join("");

  /* Pages that already show social icons in their own content (contact,
     reviews, booking) leave them out of the footer, so the same two
     icons are not printed twice on one page. */
  const socialsInPage = !!$("#page [data-socials]");
  const footerSocials = socialsInPage
    ? ""
    : `<div class="socials" style="margin-top:1.4rem">${socialLinks()}</div>`;

  /* Same idea for the footer's booking button, on the two pages where it
     has nothing left to offer.

     On booking it points at the page the visitor is already reading, so
     it was a button that goes nowhere. On contact, the page is one long
     answer to "how do I reach you" and already sends people to the
     booking page twice in its own content, so a third prompt in the
     footer was repetition.

     Everywhere else it stays: there the footer is the only booking
     prompt at the bottom of the page. */
  const footerCta = (current === "contact" || current === "booking")
    ? ""
    : `<a class="btn btn-primary" href="booking.html">Book a date</a>`;

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            ${brandMark()}
            <p style="margin-top:.8rem;max-width:34ch">${esc(CONFIG.tagline)}</p>
            ${footerSocials}
          </div>
          <nav class="footer-nav" aria-label="Footer">
            <h4>Explore</h4>
            ${PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("")}
          </nav>
          <div>
            <h4>Get in touch</h4>
            <ul class="footer-contact">${contactRows}</ul>
            ${footerCta}
          </div>
        </div>
        <div class="footer-bottom">
          <!-- "All rights reserved" is its own span so it can be translated
               on its own: the sentence around it holds the year, which
               changes, and would make an unstable translation key. -->
          <span>&copy; <span id="year"></span> ${esc(CONFIG.name)}. <span>All rights reserved.</span></span>
          <nav class="footer-legal" aria-label="Legal">
            ${LEGAL.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
          </nav>
          <span>${esc(CONFIG.city)}</span>
        </div>
      </div>
    </footer>
  `);

  $("#year").textContent = new Date().getFullYear();
}

/* ---------- header behaviour ---------- */
function initHeader() {
  const header = $("#siteHeader");
  const burger = $("#hamburger");
  const mnav   = $("#mobileNav");

  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* One place that opens and closes the panel, so the button state, the
     page scroll lock and the panel itself can never drift apart. */
  const setMenu = (open) => {
    mnav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-open", open);
  };
  const isOpen = () => mnav.classList.contains("open");

  burger.addEventListener("click", (e) => {
    e.stopPropagation();          // don't immediately re-close via document
    setMenu(!isOpen());
  });

  $$("a", mnav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) setMenu(false);
  });

  /* tapping anywhere off the panel closes it */
  document.addEventListener("click", (e) => {
    if (isOpen() && !mnav.contains(e.target)) setMenu(false);
  });

  /* rotating to landscape or resizing past the desktop breakpoint would
     otherwise leave the panel open with the scroll lock still applied */
  window.addEventListener("resize", () => {
    if (isOpen() && window.innerWidth > 900) setMenu(false);
  }, { passive: true });
}

/* =====================================================================
   PRICES + DEPOSIT
   Package prices come from CONFIG.packages so they live in one place.
   The deposit widget lets a guest pick their package, shows half the
   price, and points the button at that package's own checkout link —
   a payment link has its amount baked in, so there is one per package.
   ===================================================================== */
const money = (n) => "$" + Math.round(n).toLocaleString("en-CA");

const depositFor = (pkg) => Math.round(pkg.price * CONFIG.depositRate);

/* fill the price on each package card from CONFIG */
function renderPrices() {
  $$("[data-price]").forEach((el) => {
    const pkg = CONFIG.packages.find((p) => p.id === el.dataset.price);
    if (pkg) el.textContent = money(pkg.price);
  });
}

function initDeposit() {
  const select = $("#depositPackage");
  const amount = $("#depositAmount");
  /* The card payment button was removed: deposits are e-transfer only.
     It is no longer required for this section to work, so it must not be
     part of the guard, or removing it would silently disable the whole
     deposit card. */
  const btn    = $("#depositBtn");
  if (!select || !amount) return;

  select.innerHTML = CONFIG.packages
    .map((p) => `<option value="${p.id}">${esc(p.name)} (${money(p.price)})</option>`)
    .join("");

  const update = () => {
    const pkg = CONFIG.packages.find((p) => p.id === select.value);
    if (!pkg) return;
    const due = depositFor(pkg);
    amount.textContent = money(due);

    /* Card payment is gone from the markup. The handling stays, guarded,
       so dropping a Stripe link into CONFIG.packages and putting the
       button back is all it would take to re-enable it. */
    if (btn) {
      if (pkg.deposit && pkg.deposit.trim()) {
        btn.hidden = false;
        btn.href = pkg.deposit;
        btn.target = "_blank";
        btn.rel = "noopener";
        btn.textContent = `Pay ${money(due)} by card`;
      } else {
        btn.hidden = true;
        btn.removeAttribute("href");
      }
    }

    /* Interac e-transfer instructions */
    const et = CONFIG.etransfer || {};
    const panel = $("#etransfer");
    if (panel) {
      const usable = et.enabled && et.address && et.address.trim();
      panel.hidden = !usable;
      if (usable) {
        $("#etAmount").textContent = money(due);
        $("#etAddress").textContent = et.address;
        /* The reference is the only thing tying a payment to a booking.
           Without it you get an amount in your account and no idea whose
           wedding it belongs to. */
        $("#etRef").textContent = `${pkg.name} deposit, your name and event date`;
        $("#etNote").textContent = et.autodeposit
          ? "Autodeposit is on, so there is no security question to set and it lands straight in the account."
          : "You will be asked to set a security question. Use the event date in YYYY-MM-DD form and tell me what you chose.";
      }
    }
  };

  select.addEventListener("change", update);
  update();

  /* Copy the address. Typing an email by hand into a banking app is where
     e-transfers go astray, and a wrong address either bounces or pays a
     stranger. The clipboard API needs a secure context, so there is a
     select-the-text fallback for plain http and older browsers. */
  const copyBtn = $("#etCopy");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const address = (CONFIG.etransfer && CONFIG.etransfer.address) || "";
      if (!address) return;
      const done = () => {
        const previous = copyBtn.textContent;
        copyBtn.textContent = "Copied";
        copyBtn.classList.add("is-copied");
        setTimeout(() => {
          copyBtn.textContent = previous;
          copyBtn.classList.remove("is-copied");
        }, 1600);
      };
      /* Three levels, because the button must never do nothing visible.
         The clipboard API needs a secure context AND a focused document,
         so it fails more often than you would expect; the old fallback
         could itself throw when there was no selection object, leaving
         the guest with a button that appeared broken. */
      try {
        await navigator.clipboard.writeText(address);
        done();
        return;
      } catch { /* fall through */ }

      try {
        const range = document.createRange();
        range.selectNodeContents($("#etAddress"));
        const sel = window.getSelection();
        if (!sel) throw new Error("no selection");
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = "Selected, copy it";
        setTimeout(() => { copyBtn.textContent = "Copy"; }, 2600);
        return;
      } catch { /* fall through */ }

      /* Nothing worked: the address is on screen anyway, so say so
         rather than leaving the press unacknowledged. */
      copyBtn.textContent = "Copy it above";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 2600);
    });
  }
}

/* =====================================================================
   BUTTON FEEDBACK
   The ripple has to start where the button was actually pressed, and CSS
   alone cannot know that, so the coordinates are handed to the animation
   as custom properties. Everything else is done in the stylesheet.

   Delegated from the document because buttons are injected into the
   header and footer after this file's other work runs.
   ===================================================================== */
function initButtonFX() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  document.addEventListener("pointerdown", (e) => {
    if (!e.target.closest) return;
    const btn = e.target.closest(".btn");
    if (!btn || btn.getAttribute("aria-disabled") === "true") return;

    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--bx", `${e.clientX - r.left}px`);
    btn.style.setProperty("--by", `${e.clientY - r.top}px`);

    /* restart cleanly if the same button is pressed again mid-animation */
    btn.classList.remove("is-hit");
    void btn.offsetWidth;                       // force reflow
    btn.classList.add("is-hit");
  });

  document.addEventListener("animationend", (e) => {
    if (e.animationName === "coneRing") e.target.classList.remove("is-hit");
  });
}

/* =====================================================================
   PACKAGE BUTTONS
   The package cards quote "starting" prices, so they open the enquiry
   form rather than a checkout — the real number depends on venue and
   hours. Clicking one preselects that package in the form so the visitor
   doesn't have to pick it twice.
   ===================================================================== */
function initPackagePicker() {
  const enquiry = $("#b-package");     // package dropdown on the enquiry form
  const deposit = $("#depositPackage"); // package dropdown on the deposit card
  if (!enquiry && !deposit) return;

  $$("[data-package]").forEach((el) => {
    el.addEventListener("click", () => {
      const wanted = el.dataset.package;      // display name, e.g. "Signature"

      /* Enquiry form: matched on the visible name. */
      if (enquiry) {
        const match = [...enquiry.options].find((o) => o.value === wanted);
        if (match) enquiry.value = wanted;
      }

      /* Deposit card: its options are keyed by package id, not name, so
         the name is resolved through CONFIG rather than compared directly.
         Selecting it in code does not fire `change`, so the event is
         dispatched by hand, which is what recalculates the half-price
         deposit and rewrites the e-transfer instructions. */
      if (deposit) {
        const pkg = CONFIG.packages.find((p) => p.name === wanted);
        if (pkg) {
          deposit.value = pkg.id;
          deposit.dispatchEvent(new Event("change"));
        }
      }
    });
  });
}

/* =====================================================================
   FORMS — post to CONFIG.formEndpoint, else fall back to mailto:
   ===================================================================== */
/* Honeypot. A published email address attracts bots that fill in every
   field they can find and submit. This one is invisible and off the tab
   order, so a person can neither see nor reach it; anything that fills it
   in is automated. Added from JS so the markup stays clean and there is
   nothing in the HTML for a bot to learn to skip.

   On window because the agreement, invoice and planner pages send their
   own documents through the same endpoint and need the same trap. One
   definition, so the field name cannot drift between the two.

   Worth being honest about the limit: the Web3Forms key is public, as it
   has to be, so anything determined can post straight past this. It stops
   the indiscriminate form-fillers, not a targeted nuisance. */
function armBotTrap(form) {
  if (!form || form.querySelector('input[name="company_website"]')) return;
  const trap = document.createElement("input");
  trap.type = "text";
  trap.name = "company_website";      // plausible enough that bots fill it
  trap.tabIndex = -1;
  trap.autocomplete = "off";
  trap.setAttribute("aria-hidden", "true");
  trap.style.cssText =
    "position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none";
  form.appendChild(trap);
}
/* True when the invisible field came back filled in. */
function botTrapTripped(form) {
  const t = form && form.querySelector('input[name="company_website"]');
  return !!(t && t.value);
}
window.armBotTrap = armBotTrap;
window.botTrapTripped = botTrapTripped;

function initForms() {
  $$("form[data-form]").forEach((form) => {
    const status = $(".form-status", form);

    armBotTrap(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      /* Report success to the bot and send nothing. Telling it the truth
         only teaches it to try again with the field left blank. */
      if (data.company_website) {
        form.reset();
        status.textContent = "Thanks, I will get back to you shortly.";
        status.className = "form-status ok";
        return;
      }
      delete data.company_website;

      if (!data.name || !data.email) {
        status.textContent = "Please add your name and email.";
        status.className = "form-status err";
        return;
      }

      /* Web3Forms takes the whole form plus an access key and emails it
         on. Sent as JSON so the payload is explicit: a readable subject,
         and reply-to set to the guest, which means hitting Reply in the
         inbox writes straight back to them instead of to the robot. */
      if (CONFIG.web3formsKey) {
        status.textContent = "Sending…";
        status.className = "form-status";
        const label = form.dataset.form || "website";
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            /* The guest's answers go in FIRST so the fields set below win.
               Spreading them last let a form that happens to have its own
               "subject" box overwrite the subject line, and the email
               arrived with no sign of which form it came from. */
            body: JSON.stringify({
              ...data,
              access_key: CONFIG.web3formsKey,
              subject: data.subject
                ? `${data.subject} — ${label} form`
                : `${label} enquiry from ${data.name}`,
              from_name: `${CONFIG.name} website`,
              replyto: data.email,
            }),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || out.success === false) throw new Error(out.message || res.status);
          form.reset();
          status.textContent = "Thanks, I will get back to you shortly.";
          status.className = "form-status ok";
        } catch {
          status.textContent =
            "Couldn't send just now. Please try again, or message me on Instagram or WhatsApp.";
          status.className = "form-status err";
        }
        return;
      }

      if (!CONFIG.formEndpoint) {
        if (!CONFIG.email) {
          status.textContent = "Contact details are not set up yet, please check back soon.";
          status.className = "form-status err";
          return;
        }
        const subject = encodeURIComponent(`${form.dataset.form} enquiry from ${data.name}`);
        const body = encodeURIComponent(
          Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n"));
        window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
        status.textContent = "Opening your email app…";
        status.className = "form-status ok";
        return;
      }

      status.textContent = "Sending…";
      status.className = "form-status";
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        status.textContent = "Thanks, I will get back to you shortly.";
        status.className = "form-status ok";
      } catch {
        status.textContent = "Couldn't send just now. Please try again or message me on Instagram.";
        status.className = "form-status err";
      }
    });
  });
}

/* =====================================================================
   GALLERY
   Tiles are generated from CONFIG.gallery so 30 photos do not mean 30
   blocks of copy-pasted markup. Every image is lazy loaded, which is
   what keeps a long gallery usable on mobile data.
   ===================================================================== */
function renderGallery() {
  const host = $("[data-gallery]");
  if (!host) return;

  const g = CONFIG.gallery;
  const slots = [];

  for (let i = 1; i <= g.count; i++) {
    const n   = String(i).padStart(2, "0");
    const cap = g.captions[i] || "";
    const alt = cap || `DJ Mishoo event photo ${n}`;
    slots.push(`
      <figure class="shot tile-in" style="--i:${i % 6}" data-slot="${n}"
              tabindex="0" role="button" aria-label="Open photo ${n}">
        <img src="${g.thumbs}${n}${g.ext}" data-full="${g.full}${n}${g.ext}"
             alt="${esc(alt)}" loading="lazy" decoding="async">
        ${cap ? `<figcaption class="shot-cap">${esc(cap)}</figcaption>` : ""}
      </figure>`);
  }
  host.innerHTML = slots.join("");

  /* An empty slot would otherwise render as a broken image icon. Catch
     the load failure and turn that tile back into a labelled placeholder
     so photos can be uploaded a few at a time. */
  $$("img", host).forEach((img) => {
    img.addEventListener("error", () => {
      const fig = img.closest(".shot");
      if (!fig) return;
      fig.classList.add("empty");
      fig.removeAttribute("tabindex");
      fig.removeAttribute("role");
      fig.innerHTML = `<span>${fig.dataset.slot}${esc(CONFIG.gallery.ext)}</span>`;
    });
  });

  if (window.revealItems) window.revealItems($$(".shot", host));
}

/* =====================================================================
   VIDEOS
   preload="none" matters here: without it a browser starts fetching
   every clip on the page at once, which is far heavier than images.
   Nothing downloads until a visitor presses play.
   ===================================================================== */
function renderVideos() {
  const host = $("[data-videos]");
  if (!host) return;

  const v = CONFIG.videos;

  if (!v.count) {
    host.innerHTML = `<p class="reviews-empty">
      <b>Videos coming soon</b>
      <span>Clips from recent nights are on the way.</span>
    </p>`;
    return;
  }

  /* The grid shows poster frames, not players. Clicking one opens the
     clip centred in the lightbox, which is why no <video> is created
     here: nine players on a page is a lot of idle machinery. */
  const cards = [];
  for (let i = 1; i <= v.count; i++) {
    const n   = String(i).padStart(2, "0");
    const cap = v.captions[i] || "";
    const label = cap || `DJ Mishoo clip ${n}`;
    cards.push(`
      <figure class="video-card tile-in" style="--i:${i % 6}" data-slot="${n}"
              data-src="${v.path}${n}${v.ext}" data-poster="${v.posters}${n}.jpg"
              tabindex="0" role="button" aria-label="Play ${esc(label)}">
        <img src="${v.posters}${n}.jpg" alt="${esc(label)}" loading="lazy" decoding="async">
        <span class="video-play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>
        </span>
        ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}
      </figure>`);
  }
  host.innerHTML = cards.join("");

  /* a slot with no poster yet becomes a labelled placeholder, so clips
     can be uploaded a few at a time without the page looking broken */
  $$("img", host).forEach((img) => {
    img.addEventListener("error", () => {
      const fig = img.closest(".video-card");
      if (!fig) return;
      fig.classList.add("empty");
      fig.removeAttribute("tabindex");
      fig.removeAttribute("role");
      fig.innerHTML = `<span>${fig.dataset.slot}${esc(CONFIG.videos.ext)}</span>`;
    });
  });

  if (window.revealItems) window.revealItems($$(".video-card", host));
}

/* =====================================================================
   REVIEWS
   Any [data-reviews] element is filled from CONFIG.reviews. Add
   data-limit="3" to show only the newest few (used on the home page).
   ===================================================================== */
function stars(n) {
  const filled = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
  return `<span class="stars" aria-label="${filled} out of 5 stars">` +
    "★".repeat(filled) + `<i>${"★".repeat(5 - filled)}</i></span>`;
}

function renderReviews() {
  $$("[data-reviews]").forEach((el) => {
    const limit = parseInt(el.dataset.limit, 10);
    const list = Number.isFinite(limit) ? CONFIG.reviews.slice(0, limit) : CONFIG.reviews;

    if (!list.length) {
      el.innerHTML = `<p class="reviews-empty">
        <b>No reviews published yet</b>
        <span>Yours could be the first.</span>
      </p>`;
      return;
    }

    /* no .reveal here on purpose: motion.js has already collected the
       reveal elements by the time this runs, so anything injected now
       would never be un-hidden. Put .reveal on the container instead. */
    el.innerHTML = list.map((r) => `
      <figure class="review">
        ${stars(r.stars)}
        <blockquote>${esc(r.text)}</blockquote>
        <figcaption>
          <strong>${esc(r.name)}</strong>
          ${r.event ? `<span>${esc(r.event)}</span>` : ""}
        </figcaption>
      </figure>`).join("");
  });
}

/* ---------- fill [data-*] placeholders from CONFIG ---------- */
function fillBrandText() {
  $$("[data-brand]").forEach((el) => { el.textContent = CONFIG.name; });
  $$("[data-tagline]").forEach((el) => { el.textContent = CONFIG.tagline; });
  const links = socialLinks();
  $$("[data-socials]").forEach((el) => {
    el.innerHTML = links;
    /* With no profile URLs set yet, hide the whole "Follow" block rather
       than leaving a heading above an empty row. */
    if (!links) {
      const block = el.closest("[data-social-block]");
      if (block) block.classList.add("hide");
    }
  });
  $$("[data-whatsapp]").forEach((el) => {
    if (CONFIG.whatsapp) {
      el.href = CONFIG.whatsapp;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.removeAttribute("href");
      el.textContent = "WhatsApp coming soon";
    }
  });
  /* Two shapes of element carry these attributes: a plain link whose text
     IS the address, and a card built of an icon and several spans. Writing
     textContent into the second kind destroys the card and leaves a bare
     address where the whole layout used to be, so the text is only filled
     in when there is no element markup to lose. */
  const fillContact = (el, value, fallback, href) => {
    if (!el.firstElementChild) el.textContent = value || fallback;
    if (el.tagName === "A" && value) el.href = href;
  };

  $$("[data-email]").forEach((el) =>
    fillContact(el, CONFIG.email, "Email coming soon", `mailto:${CONFIG.email}`));

  $$("[data-phone]").forEach((el) =>
    fillContact(el, CONFIG.phone, "Phone coming soon",
      `tel:${String(CONFIG.phone).replace(/[^\d+]/g, "")}`));
}

/* Loads the analytics tag only once CONFIG.analytics.src is filled in, so
   an empty config means not one third-party request leaves the page.
   Deferred and async: measurement must never delay the site rendering. */
function initAnalytics() {
  const a = CONFIG.analytics;
  if (!a || !a.src) return;
  const s = document.createElement("script");
  s.defer = true;
  s.src = a.src;
  if (a.domain) s.dataset.domain = a.domain;
  document.head.appendChild(s);
}

document.addEventListener("DOMContentLoaded", () => {
  injectShell();
  initAnalytics();
  initTheme();          // after injectShell, the button has to exist first
  initLang();
  initHeader();
  fillBrandText();
  renderGallery();
  renderVideos();
  renderReviews();
  renderPrices();
  initDeposit();
  initPackagePicker();
  initButtonFX();
  initForms();
  initDateAdvance();
  initBackButton();
  initToTop();
  /* Reviews, prices and package options are rendered above from CONFIG,
     so they miss the first translation pass and need a second one. */
  retranslate();
});
