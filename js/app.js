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
  email:      "michel.jabour52@gmail.com",
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

  packages: [
    { id: "essential", name: "Essential", price: 800,  deposit: "" },  // ← $400 Stripe link
    { id: "signature", name: "Signature", price: 1500, deposit: "" },  // ← $750 Stripe link
    { id: "headline",  name: "Headline",  price: 2000, deposit: "" },  // ← $1,000 Stripe link
  ],

  /* ---- FORMS ------------------------------------------------------
     A static site cannot email you on its own. Create a free form
     endpoint (Formspree, Web3Forms, Basin) and paste the URL here.
     Until then, forms fall back to opening the visitor's email app so
     an enquiry is never silently lost.
     ------------------------------------------------------------------ */
  formEndpoint: "",

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
    count:   9,
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
  { id: "terms",   label: "Terms and Conditions", href: "terms.html"   },
  { id: "privacy", label: "Privacy Policy",       href: "privacy.html" },
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
            <a class="btn btn-primary" href="booking.html">Book a date</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; <span id="year"></span> ${esc(CONFIG.name)}. All rights reserved.</span>
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
  const btn    = $("#depositBtn");
  if (!select || !amount || !btn) return;

  select.innerHTML = CONFIG.packages
    .map((p) => `<option value="${p.id}">${esc(p.name)} (${money(p.price)})</option>`)
    .join("");

  const update = () => {
    const pkg = CONFIG.packages.find((p) => p.id === select.value);
    if (!pkg) return;
    const due = depositFor(pkg);
    amount.textContent = money(due);

    if (pkg.deposit && pkg.deposit.trim()) {
      btn.href = pkg.deposit;
      btn.target = "_blank";
      btn.rel = "noopener";
      btn.removeAttribute("aria-disabled");
      btn.style.opacity = "";
      btn.style.cursor = "";
      btn.title = "";
      btn.textContent = `Pay ${money(due)} deposit`;
    } else {
      /* no link for this package yet — stay visible but clearly dead,
         so a half-configured site never takes a real payment wrongly */
      btn.removeAttribute("href");
      btn.setAttribute("aria-disabled", "true");
      btn.style.opacity = ".55";
      btn.style.cursor = "not-allowed";
      btn.title = `Add the ${pkg.name} deposit link in js/app.js`;
      btn.textContent = "Payment link coming soon";
    }
  };

  select.addEventListener("change", update);
  update();
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
  const select = $("#b-package");
  if (!select) return;

  $$("[data-package]").forEach((el) => {
    el.addEventListener("click", () => {
      const wanted = el.dataset.package;
      const match = [...select.options].find((o) => o.value === wanted);
      if (match) select.value = wanted;
    });
  });
}

/* =====================================================================
   FORMS — post to CONFIG.formEndpoint, else fall back to mailto:
   ===================================================================== */
function initForms() {
  $$("form[data-form]").forEach((form) => {
    const status = $(".form-status", form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.email) {
        status.textContent = "Please add your name and email.";
        status.className = "form-status err";
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
  $$("[data-email]").forEach((el) => {
    el.textContent = CONFIG.email || "Email coming soon";
    if (el.tagName === "A" && CONFIG.email) el.href = `mailto:${CONFIG.email}`;
  });
  $$("[data-phone]").forEach((el) => {
    el.textContent = CONFIG.phone || "Phone coming soon";
    if (el.tagName === "A" && CONFIG.phone) {
      el.href = `tel:${CONFIG.phone.replace(/[^\d+]/g, "")}`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectShell();
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
});
