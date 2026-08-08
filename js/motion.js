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
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  /* ---------- marquee: duplicate the track so the loop is seamless ----
     The CSS animates to -50%, which only lines up if the content is
     present exactly twice. Duplicating here keeps the HTML readable. */
  qa(".marquee-track").forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- gallery lightbox ---------- */
  const lb = q("#lightbox");
  if (lb) {
    const lbImg = q("img", lb);
    const open = (src, alt) => {
      lbImg.src = src;
      lbImg.alt = alt || "";
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };

    qa(".shot:not(.empty)").forEach((shot) => {
      shot.addEventListener("click", () => {
        const img = q("img", shot);
        if (img) open(img.currentSrc || img.src, img.alt);
      });
    });
    lb.addEventListener("click", (e) => { if (e.target !== lbImg) close(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lb.classList.contains("open")) close();
    });
  }

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
