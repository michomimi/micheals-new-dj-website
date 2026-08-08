/* =====================================================================
   APP.JS — single source of truth for this site
   Everything you are likely to change lives in CONFIG below. The header,
   footer and social links are built from it on every page, so editing it
   once updates the whole site.
   ===================================================================== */

const CONFIG = {
  /* ---- YOUR DETAILS — edit these ---------------------------------- */
  name:       "MICHEAL",            // stage name, shown big
  nameAccent: "",                   // optional 2nd word in red, e.g. "DJ"
  tagline:    "DJ · Producer · Calgary",
  email:      "",                   // ← your booking email
  phone:      "",                   // ← e.g. "+1 403 000 0000" (blank hides it)
  city:       "Calgary, AB",

  /* ---- SOCIALS — paste your real profile URLs --------------------- */
  social: {
    instagram:  "",   // ← your Instagram URL
    tiktok:     "",   // ← your TikTok URL
    whatsapp:   "",   // ← https://wa.me/1403XXXXXXX  (digits only, no spaces)
    soundcloud: "",   // optional
    youtube:    "",   // optional
  },

  /* ---- PAYMENTS ---------------------------------------------------
     Paste one hosted checkout URL per item (Stripe Payment Link, PayPal
     or Square). Leave "" and the button shows "coming soon" rather than
     linking nowhere. Never put an API secret key in this file — a hosted
     checkout link is a plain public URL and is safe to commit.
     ------------------------------------------------------------------ */
  pay: {
    deposit:   "",   // booking deposit
    essential: "",   // package 1
    signature: "",   // package 2
    headline:  "",   // package 3
  },

  /* ---- FORMS ------------------------------------------------------
     A static site cannot email you on its own. Create a free form
     endpoint (Formspree, Web3Forms, Basin) and paste the URL here.
     Until then, forms fall back to opening the visitor's email app so
     an enquiry is never silently lost.
     ------------------------------------------------------------------ */
  formEndpoint: "",
};

/* ---------- helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (m) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

const PAGES = [
  { id: "home",    label: "Home",    href: "index.html"   },
  { id: "about",   label: "About",   href: "about.html"   },
  { id: "music",   label: "Music",   href: "music.html"   },
  { id: "gallery", label: "Gallery", href: "gallery.html" },
  { id: "booking", label: "Booking", href: "booking.html" },
  { id: "contact", label: "Contact", href: "contact.html" },
];

const ICONS = {
  instagram:  '<svg viewBox="0 0 24 24" class="ic"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>',
  tiktok:     '<svg viewBox="0 0 24 24" class="ic"><path d="M15 4v8.5a3.5 3.5 0 11-3.5-3.5"/><path d="M15 4c.6 2.2 2 3.4 4 3.6"/></svg>',
  whatsapp:   '<svg viewBox="0 0 24 24" class="ic"><path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3z"/><path d="M8.6 8.5c.2-.4.4-.4.6-.4h.4c.2 0 .4 0 .5.4l.6 1.4c.1.2 0 .3 0 .4l-.4.5c-.1.2-.2.3 0 .5a5.5 5.5 0 002.5 2.2c.3.1.4.1.5-.1l.5-.6c.2-.2.3-.1.5 0l1.3.7c.2.1.3.2.3.4"/></svg>',
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

function brandMark() {
  const accent = CONFIG.nameAccent ? `<em>${esc(CONFIG.nameAccent)}</em>` : "";
  return `<span class="brand-mark">${esc(CONFIG.name)}${accent}</span>`;
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
        <a class="brand" href="index.html" aria-label="${esc(CONFIG.name)} — home">${brandMark()}</a>
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
      ${PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("")}
    </nav>
  `);

  const mailLink = CONFIG.email
    ? `<a href="mailto:${esc(CONFIG.email)}">${esc(CONFIG.email)}</a>` : "";
  const telLink = CONFIG.phone
    ? `<a href="tel:${CONFIG.phone.replace(/[^\d+]/g, "")}">${esc(CONFIG.phone)}</a>` : "";

  document.body.insertAdjacentHTML("beforeend", `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            ${brandMark()}
            <p style="margin-top:.8rem;max-width:34ch">${esc(CONFIG.tagline)}</p>
            <div class="socials" style="margin-top:1.4rem">${socialLinks()}</div>
          </div>
          <div>
            <h4>Explore</h4>
            ${PAGES.map((p) => `<a href="${p.href}">${p.label}</a>`).join("")}
          </div>
          <div>
            <h4>Get in touch</h4>
            ${mailLink}${telLink}
            <a href="booking.html">Book a date</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="year"></span> ${esc(CONFIG.name)}. All rights reserved.</span>
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

  burger.addEventListener("click", () => {
    const open = mnav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", mnav).forEach((a) => a.addEventListener("click", () => {
    mnav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mnav.classList.contains("open")) {
      mnav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

/* =====================================================================
   PAYMENT BUTTONS
   Any [data-pay="key"] element is wired to CONFIG.pay[key]. With no URL
   set it stays visible but is clearly disabled, so a half-configured
   site never sends a paying customer to a dead link.
   ===================================================================== */
function initPayButtons() {
  $$("[data-pay]").forEach((el) => {
    const url = CONFIG.pay[el.dataset.pay];
    if (url && url.trim()) {
      el.href = url;
      el.target = "_blank";
      el.rel = "noopener";
    } else {
      el.setAttribute("aria-disabled", "true");
      el.removeAttribute("href");
      el.style.opacity = ".55";
      el.style.cursor = "not-allowed";
      el.title = "Payment link not set up yet";
      el.textContent = "Payment coming soon";
    }
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
          status.textContent = "Contact details aren't set up yet — check back soon.";
          status.className = "form-status err";
          return;
        }
        const subject = encodeURIComponent(`${form.dataset.form} enquiry — ${data.name}`);
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
        status.textContent = "Thanks — I'll get back to you shortly.";
        status.className = "form-status ok";
      } catch {
        status.textContent = "Couldn't send just now. Please try again or message me on Instagram.";
        status.className = "form-status err";
      }
    });
  });
}

/* ---------- fill [data-*] placeholders from CONFIG ---------- */
function fillBrandText() {
  $$("[data-brand]").forEach((el) => { el.textContent = CONFIG.name; });
  $$("[data-tagline]").forEach((el) => { el.textContent = CONFIG.tagline; });
  $$("[data-socials]").forEach((el) => { el.innerHTML = socialLinks(); });
  $$("[data-email]").forEach((el) => {
    el.textContent = CONFIG.email || "Email coming soon";
    if (el.tagName === "A" && CONFIG.email) el.href = `mailto:${CONFIG.email}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  injectShell();
  initHeader();
  fillBrandText();
  initPayButtons();
  initForms();
});
