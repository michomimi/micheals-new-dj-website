/* =====================================================================
   MOTION.JS — scroll reveals, marquee duplication, gallery lightbox.
   Short, understated motion to match the reference site's feel.
   ===================================================================== */
(function motion() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q  = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- reveal on scroll ---------- */
  const items = qa(".reveal");
  if (reduce) {
    items.forEach((el) => el.classList.add("in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);          // reveal once, then stop watching
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));

    /* The observer deliberately ignores the bottom 8% of the viewport so
       content does not animate while it is still half off screen. On
       first paint that leaves anything in that band invisible until the
       visitor scrolls, which reads as text failing to load.

       The sweep below reveals whatever is genuinely on screen and leaves
       the rest to the observer. It queries the DOM fresh every time
       rather than closing over the initial list, so it also covers the
       gallery and video tiles that app.js injects later. */
    const sweepVisible = () => {
      qa(".reveal:not(.in), .tile-in:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;         // not laid out / hidden
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      });
    };
    window.addEventListener("load", sweepVisible, { once: true });
    setTimeout(sweepVisible, 1200);

    /* Resizing to a narrow width reflows the whole page: blocks that were
       side by side stack, everything gets taller, and content that had
       been far below the fold can land on screen without the visitor
       scrolling a single pixel. A resize alone is not a reliable trigger
       for the observer, so without this the newly exposed copy stays at
       opacity 0 until something else nudges it, which is why shrinking
       the window made text vanish until a refresh.

       Debounced, because a dragged window edge fires this continuously. */
    let resizeTimer;
    const onViewportChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(sweepVisible, 120);
    };
    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("orientationchange", onViewportChange, { passive: true });
    /* Back/forward cache restores skip load, so sweep again on show. */
    window.addEventListener("pageshow", sweepVisible);

    /* Exposed so app.js can sweep after it renders, and for testing. */
    window.sweepReveal = sweepVisible;

    /* Called after anything rewrites chunks of the page, which for this
       site means switching language: restoring the saved English HTML
       re-inserts the original markup, so nested elements come back
       WITHOUT their revealed state and, being new nodes, are no longer
       watched by the observer. Left alone they would stay invisible for
       the rest of the visit.

       Anything the visitor has already reached (on screen, or scrolled
       past, so top is above the fold) is shown immediately rather than
       re-animated. Everything still below the fold goes back under the
       observer so it animates in on scroll as normal. */
    window.refreshReveal = () => {
      qa(".reveal:not(.in), .tile-in:not(.in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.top < window.innerHeight) el.classList.add("in");
        else io.observe(el);
      });
    };
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  /* When there is no observer (reduced motion, or an old browser) the
     reveal is not staged at all, so the fallback simply shows anything
     still hidden. Defined unconditionally so callers never have to test
     for it. */
  if (!window.sweepReveal) {
    window.sweepReveal = () =>
      qa(".reveal:not(.in), .tile-in:not(.in)").forEach((el) => el.classList.add("in"));
  }
  if (!window.refreshReveal) window.refreshReveal = window.sweepReveal;

  /* =====================================================================
     PAGE TRANSITIONS

     Hold the navigation just long enough to play the exit animation, then
     follow the link. The matching entry animation is pure CSS on the next
     page, so nothing has to survive the document swap.

     Almost all of the work here is deciding what NOT to touch. Getting
     this wrong breaks the browser in ways people notice immediately:
     open-in-new-tab, downloads, mailto and tel handoffs, and in-page
     anchors that should smooth-scroll rather than reload.
     ===================================================================== */
  const root = document.documentElement;

  /* A restore from the back/forward cache replays neither load nor the
     entry animation, so a page frozen mid-exit would come back invisible.
     Clearing the class on pageshow is what stops "go back and the page is
     blank" — the single most likely way this feature could break. */
  window.addEventListener("pageshow", () => root.classList.remove("is-leaving"));

  /* The entry animation starts the content at opacity 0. If it never runs
     to completion the page would sit there blank, which is the same
     failure the scroll reveal had. Check shortly after load and, if the
     content is still invisible and we are not mid-navigation, drop the
     animations altogether. */
  window.addEventListener("load", () => {
    setTimeout(() => {
      if (root.classList.contains("is-leaving")) return;
      const pg = q("#page");
      if (pg && getComputedStyle(pg).opacity === "0") root.classList.add("anim-failsafe");
    }, 900);
  });

  const navTarget = (a, e) => {
    if (e.defaultPrevented) return null;              // lightbox et al. got it
    if (e.button !== 0) return null;                  // middle/right click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
    if (!a || !a.getAttribute("href")) return null;
    if (a.hasAttribute("download")) return null;
    if (a.target && a.target !== "_self") return null;
    if (a.getAttribute("rel") === "external") return null;

    let url;
    try { url = new URL(a.href, location.href); } catch { return null; }

    if (url.origin !== location.origin) return null;  // off-site
    if (url.protocol !== "http:" && url.protocol !== "https:") return null; // mailto:, tel:
    /* Same document: this is an in-page anchor such as #enquiry. Leave it
       to the browser, which already smooth-scrolls via scroll-behavior. */
    if (url.pathname === location.pathname && url.search === location.search) return null;
    return url;
  };

  if (!reduce) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      const url = navTarget(a, e);
      if (!url) return;

      e.preventDefault();
      root.classList.add("is-leaving");

      /* Navigate when the exit finishes. A timer rather than animationend
         because an interrupted or skipped animation would never fire the
         event and the click would be silently swallowed. */
      let gone = false;
      const go = () => { if (!gone) { gone = true; location.href = url.href; } };
      setTimeout(go, 210);

      /* If the browser blocks or defers the navigation, do not leave the
         visitor staring at a faded-out page. */
      setTimeout(() => root.classList.remove("is-leaving"), 2500);
    });
  }

  /* ---------- marquee: duplicate the track so the loop is seamless ----
     The CSS animates to -50%, which only lines up if the content is
     present exactly twice. Duplicating here keeps the HTML readable. */
  qa(".marquee-track").forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* =====================================================================
     LIGHTBOX — photos and video, centred, growing out of the tile that
     was clicked.

     The grow is a FLIP: the media is placed at its final centred size,
     then transformed back onto the tile's position and animated to
     nothing. Animating a transform is cheap; animating width and left
     is not, and would judder on a phone.
     ===================================================================== */
  const lb = q("#lightbox");
  if (lb) {
    const lbImg   = q("img", lb);
    const lbVideo = q("video", lb);

    /* Grow the opened media out of the tile it came from. Runs after the
       media has laid out, so the destination rect is real. */
    const growFrom = (originEl, target) => {
      if (reduce || !originEl || !target.animate) return;
      const from = originEl.getBoundingClientRect();
      const to   = target.getBoundingClientRect();
      if (!to.width || !to.height) return;

      const dx = (from.left + from.width  / 2) - (to.left + to.width  / 2);
      const dy = (from.top  + from.height / 2) - (to.top  + to.height / 2);
      const sx = from.width  / to.width;
      const sy = from.height / to.height;

      target.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 0.35 },
        { transform: "none", opacity: 1 },
      ], { duration: 420, easing: "cubic-bezier(.22,.61,.36,1)" });
    };

    const show = (el) => { el.hidden = false; };
    const hide = (el) => { el.hidden = true; };

    const openImage = (src, alt, originEl) => {
      hide(lbVideo);
      show(lbImg);
      lbImg.alt = alt || "";
      lb.classList.add("open");
      document.body.classList.add("nav-open");     // lock the page behind

      /* wait for the full size file before measuring, or the grow would
         animate from a zero-height box */
      const run = () => growFrom(originEl, lbImg);
      if (lbImg.src === src && lbImg.complete) { run(); return; }
      lbImg.onload = run;
      lbImg.src = src;
    };

    const openVideo = (src, poster, originEl) => {
      hide(lbImg);
      show(lbVideo);
      lbVideo.poster = poster || "";
      lbVideo.src = src;
      lb.classList.add("open");
      document.body.classList.add("nav-open");
      /* muted is set in the markup as well; both matter, because a
         browser will refuse to autoplay anything with sound */
      lbVideo.muted = true;
      lbVideo.currentTime = 0;
      const p = lbVideo.play();
      if (p && p.catch) p.catch(() => {});          // autoplay may be blocked
      growFrom(originEl, lbVideo);
    };

    const close = () => {
      lb.classList.remove("open");
      document.body.classList.remove("nav-open");
      lbVideo.pause();
      /* drop the source so a closed clip stops using bandwidth */
      lbVideo.removeAttribute("src");
      lbVideo.load();
    };

    /* Delegated on purpose. Tiles are generated by app.js after this file
       runs, so binding to each one here would attach to nothing. */
    const openFrom = (el) => {
      if (!el || el.classList.contains("empty")) return;

      if (el.classList.contains("shot")) {
        const img = q("img", el);
        /* the grid holds a small thumbnail; the full size version is
           only fetched when a photo is actually opened */
        if (img) openImage(img.dataset.full || img.currentSrc || img.src, img.alt, el);
        return;
      }
      if (el.classList.contains("video-card")) {
        openVideo(el.dataset.src, el.dataset.poster, el);
      }
    };

    document.addEventListener("click", (e) => {
      if (!e.target.closest) return;
      openFrom(e.target.closest(".shot, .video-card"));
    });

    /* tiles are focusable, so Enter and Space should open them too */
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = document.activeElement;
      if (!el || !el.classList) return;
      if (!el.classList.contains("shot") && !el.classList.contains("video-card")) return;
      e.preventDefault();
      openFrom(el);
    });

    /* clicking the backdrop closes; clicking the media itself does not */
    lb.addEventListener("click", (e) => {
      if (e.target !== lbImg && e.target !== lbVideo) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lb.classList.contains("open")) close();
    });
  }

  /* Reveal helper for content injected after this file runs, such as the
     gallery tiles and video cards. app.js calls it once it has rendered. */
  window.revealItems = (els) => {
    if (!els || !els.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- count-up on the stat strip ---------- */
  const stats = qa("[data-count]");
  if (stats.length && !reduce && "IntersectionObserver" in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dur = 1100;
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        io2.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach((el) => io2.observe(el));
  }
})();
