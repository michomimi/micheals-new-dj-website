/* =====================================================================
   PLANNERS — the music plan and the extras list

   Two standalone sheets the guest fills in after the planning call, each
   on its own page, each ending in a PDF they can save and a one-click
   copy sent to the DJ.

   Deliberately separate from the booking agreement. The agreement is the
   contract and should not change once signed; these two are working
   documents that get revised right up to the week of the event, and
   nobody wants to re-sign a contract because a song changed.

   Every option lives in the arrays below, and the tick boxes on the page
   are built from them. The label a guest reads, the description under
   it, and the line that lands in the DJ's inbox therefore cannot drift
   apart, which is exactly what happens when the same list is typed out
   once in the HTML and again in the script.
   ===================================================================== */
(function planners() {
  const page = document.body.dataset.page;
  if (page !== "music" && page !== "extras") return;

  const q  = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const val = (id) => { const el = q("#" + id); return el ? el.value.trim() : ""; };
  const isOn = (id) => { const el = q("#" + id); return !!(el && el.checked); };

  const longDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString("en-CA",
      { day: "numeric", month: "long", year: "numeric" });
  };

  /* ===================================================================
     EXTRAS
     `desc` is written for someone who has never booked lighting and does
     not know what a moving head is. `approval` marks the effects a venue
     has to sign off, which is the single most common reason an extra
     gets cancelled on the day.
     =================================================================== */
  const EXTRAS = [
    { id: "xBeams", group: "Lighting", label: "Moving head beams",
      desc: "Motorised lights that tilt and sweep in time with the music, throwing moving beams across the room. This is what makes a dance floor feel like a club rather than a lit hall." },
    { id: "xBars", group: "Lighting", label: "LED light bars",
      desc: "Bars of colour that wash over the dance floor and pulse on the beat. The workhorse of dance floor lighting and the one most events start with." },
    { id: "xLaser", group: "Lighting", label: "Laser show",
      desc: "Thin, sharp beams that fan out across the room. The biggest visual impact of the lot, and the effect venues most often want to approve first.",
      approval: true },
    { id: "xUplight", group: "Lighting", label: "Uplighting",
      desc: "Lights stood around the walls, colour matched to your event. Changes the mood of the whole room rather than just the dance floor, and it shows in every photograph." },
    { id: "xMono", group: "Lighting", label: "Monogram projection",
      desc: "Your names, initials or a date projected onto a wall or the dance floor." },
    { id: "xBall", group: "Lighting", label: "Mirror ball",
      desc: "The classic rotating ball. A slow, wide sparkle over the whole room, and it suits a first dance better than anything modern." },

    { id: "xSpark", group: "Effects", label: "Cold spark fountains",
      desc: "Fountains that shoot a jet of sparks two to four metres up. They look like fireworks, but the spark is cold to the touch and safe indoors. Used for entrances and first dances.",
      approval: true },
    { id: "xDryIce", group: "Effects", label: "Dry ice low fog",
      desc: "Thick white fog that hugs the floor instead of rising, so you appear to dance on a cloud. It photographs beautifully for a first dance. Needs ventilation and clears in a few minutes.",
      approval: true },
    { id: "xHaze", group: "Effects", label: "Haze",
      desc: "A fine, nearly invisible mist that hangs in the air so light beams and lasers can actually be seen. Without haze, beams and lasers barely show up at all.",
      approval: true },

    { id: "xSub", group: "Sound", label: "Extra subwoofer",
      desc: "Adds low end for larger rooms or crowds over about 150. If you want the bass felt and not just heard, this is the part that does it." },
    { id: "xMic", group: "Sound", label: "Extra wireless microphone",
      desc: "A second handheld, so speeches can be passed between people without anyone walking a microphone across the room." },
    { id: "xCeremony", group: "Sound", label: "Separate ceremony system",
      desc: "A small independent speaker and microphone at the ceremony, for vows and readings, so the main system can stay set up where the dancing happens." },
  ];

  /* ===================================================================
     MUSIC
     The set-piece songs are separate fields rather than one big list.
     A must-play list with "first dance somewhere in here" buried in it
     is how the wrong song gets played at the moment that matters most.
     =================================================================== */
  const MOMENTS = [
    { id: "mEntrance", label: "Grand entrance",  hint: "Played as you walk in" },
    { id: "mFirst",    label: "First dance",     hint: "The one that has to be right" },
    { id: "mParent",   label: "Parent dances",   hint: "Mother/son, father/daughter" },
    { id: "mCake",     label: "Cake cutting",    hint: "Short, usually a minute or two" },
    { id: "mBouquet",  label: "Bouquet or garter", hint: "Leave blank if not doing one" },
    { id: "mLast",     label: "Last song",       hint: "How the night closes" },
  ];

  const GENRES = [
    "Arabic", "Dabke", "Khaleeji", "Hip-Hop", "R&B", "House",
    "Afrobeats", "Top 40", "Latin", "Rock", "80s and 90s", "Country",
  ];

  /* ---------- build the tick boxes from the arrays ---------- */
  function renderExtras() {
    const host = q("#extrasList");
    if (!host) return;
    const groups = [...new Set(EXTRAS.map((x) => x.group))];
    host.innerHTML = groups.map((g) => `
      <div class="form-group" role="group" aria-labelledby="lg-${esc(g)}">
        <p class="form-legend" id="lg-${esc(g)}">${esc(g)}</p>
        <div class="opt-list">
          ${EXTRAS.filter((x) => x.group === g).map((x) => `
            <label class="opt" for="${x.id}">
              <input id="${x.id}" type="checkbox">
              <span class="opt-body">
                <span class="opt-label">${esc(x.label)}${
                  x.approval ? ' <em class="opt-flag">venue approval needed</em>' : ""}</span>
                <span class="opt-desc">${esc(x.desc)}</span>
              </span>
            </label>`).join("")}
        </div>
      </div>`).join("");
  }

  function renderGenres() {
    const host = q("#genreList");
    if (!host) return;
    host.innerHTML = GENRES.map((g, i) => `
      <label class="check" for="g${i}">
        <input id="g${i}" type="checkbox" data-genre="${esc(g)}"><span>${esc(g)}</span>
      </label>`).join("");
  }

  function renderMoments() {
    const host = q("#momentList");
    if (!host) return;
    host.innerHTML = MOMENTS.map((m) => `
      <div class="field">
        <label for="${m.id}">${esc(m.label)} <span class="doc-opt">(${esc(m.hint)})</span></label>
        <input id="${m.id}" type="text" placeholder="Song and artist">
      </div>`).join("");
  }

  /* ---------- the printable sheet ---------- */
  const row = (label, value) => value
    ? `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>` : "";

  const block = (title, text) => text
    ? `<h3>${esc(title)}</h3><p style="white-space:pre-wrap">${esc(text)}</p>` : "";

  function header(kind) {
    return `
      <div class="doc-head">
        <div>
          <h2>${kind}</h2>
          <p class="doc-sub">${esc(CONFIG.name)} &middot; ${esc(CONFIG.city)}</p>
        </div>
        <div class="doc-brand">
          <span>${esc(CONFIG.email)}</span>
          <span>${esc(CONFIG.phone)}</span>
        </div>
      </div>
      <table class="doc-items doc-meta">
        <tbody>
          ${row("Client", val("client"))}
          ${row("Event date", longDate(val("eventDate")))}
          ${row("Venue", val("venue"))}
          ${row("Prepared", longDate(new Date().toISOString().slice(0, 10)))}
        </tbody>
      </table>`;
  }

  function musicDoc() {
    const moments = MOMENTS.map((m) => row(m.label, val(m.id))).join("");
    const genres = qa("#genreList input:checked").map((el) => el.dataset.genre);
    return `
      ${header("Music plan")}
      ${moments ? `<h3>Set pieces</h3><table class="doc-items doc-meta">${"<tbody>"}${moments}</tbody></table>` : ""}
      ${genres.length ? `<h3>Lean on these</h3><p>${esc(genres.join(", "))}</p>` : ""}
      ${block("Must play", val("mustPlay"))}
      ${block("Do not play", val("noPlay"))}
      ${block("Notes", val("musicNotes"))}
      <p class="doc-foot">This sheet is a plan, not part of the signed agreement, and can be
        updated any time before the event. The final running order is always read live from
        the floor.</p>`;
  }

  function extrasDoc() {
    const picked = EXTRAS.filter((x) => isOn(x.id));
    const needsApproval = picked.filter((x) => x.approval);
    const groups = [...new Set(picked.map((x) => x.group))];
    return `
      ${header("Extras and effects")}
      ${picked.length
        ? groups.map((g) => `
            <h3>${esc(g)}</h3>
            <ul class="doc-terms">
              ${picked.filter((x) => x.group === g)
                .map((x) => `<li><strong>${esc(x.label)}</strong> &mdash; ${esc(x.desc)}</li>`)
                .join("")}
            </ul>`).join("")
        : "<h3>Extras</h3><p>None selected.</p>"}
      ${needsApproval.length ? `
        <h3>Venue approval required</h3>
        <p>The following need the venue's written approval before the day:
          ${esc(needsApproval.map((x) => x.label).join(", "))}.
          If a venue refuses on the day, that effect cannot run and the rest of the
          booking is unaffected.</p>` : ""}
      ${block("Notes", val("extrasNotes"))}
      <p class="doc-foot">Prices for extras are confirmed separately and are not included in
        this sheet unless already written into your agreement.</p>`;
  }

  /* ---------- send a copy ---------- */
  async function sendCopy(kind, payload, status, btn) {
    status.textContent = "Sending…";
    status.className = "form-status";

    if (CONFIG.web3formsKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            ...payload,
            access_key: CONFIG.web3formsKey,
            subject: `${kind} from ${payload.client || "a guest"}`,
            from_name: `${CONFIG.name} website`,
            replyto: payload.email || "",
          }),
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === false) throw new Error();
        status.textContent = `Sent to ${CONFIG.email}. Download your own PDF below.`;
        status.className = "form-status ok";
        return;
      } catch {
        /* fall through to the manual route */
      }
    }

    /* The send failed, or no form service is configured.

       This used to redirect straight to the visitor's mail app, which was
       worse than useless: the page said "opening your email app", nothing
       arrived, and there was no sign anything had gone wrong. A silent
       redirect also loses people who have no mail app set up at all.

       So say plainly that it did not send, and give a link they choose to
       press. The sheet is pre-filled into the message either way. */
    const body = Object.entries(payload)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")
      .slice(0, 1500);
    const href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(kind)}` +
                 `&body=${encodeURIComponent(body)}`;
    status.innerHTML =
      `Couldn't send automatically, an ad blocker or your connection may have stopped it. ` +
      `<a href="${href}" style="color:var(--red);text-decoration:underline">Email it to me instead</a>, ` +
      `or download the PDF below and send it to ${esc(CONFIG.email)}.`;
    status.className = "form-status err";
  }

  /* ---------- wire the page ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderExtras();
    renderGenres();
    renderMoments();

    const form = q("#plannerForm");
    if (!form) return;
    const stage = q("#planStage");
    const out   = q("#planDoc");
    const kind  = page === "music" ? "Music plan" : "Extras and effects";

    const buildPayload = () => {
      const base = {
        client: val("client"),
        email: val("email"),
        eventDate: val("eventDate"),
        venue: val("venue"),
      };
      return page === "music"
        ? {
            ...base,
            ...Object.fromEntries(MOMENTS.map((m) => [m.label, val(m.id)])),
            genres: qa("#genreList input:checked").map((el) => el.dataset.genre).join(", "),
            mustPlay: val("mustPlay"),
            doNotPlay: val("noPlay"),
            notes: val("musicNotes"),
          }
        : {
            ...base,
            extras: EXTRAS.filter((x) => isOn(x.id)).map((x) => x.label).join(", "),
            needsVenueApproval: EXTRAS.filter((x) => isOn(x.id) && x.approval)
              .map((x) => x.label).join(", "),
            notes: val("extrasNotes"),
          };
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      out.innerHTML = page === "music" ? musicDoc() : extrasDoc();
      stage.hidden = false;
      /* re-run the reveal sweep: the sheet appears below the fold and its
         own reveal state would otherwise never be triggered */
      if (typeof window.refreshReveal === "function") window.refreshReveal();
      stage.scrollIntoView({ behavior: "smooth", block: "start" });

      /* Sent automatically. Relying on the guest to press a second button
         after they have already seen their finished sheet is how these
         arrive half the time; pressing Build is the moment they consider
         the job done. */
      sendCopy(kind, buildPayload(), q("#planStatus"), null);
    });

    const printBtn = q("#printPlan");
    if (printBtn) printBtn.addEventListener("click", () => window.print());

    const sendBtn = q("#sendPlan");
    if (sendBtn) {
      sendBtn.addEventListener("click", () =>
        sendCopy(kind, buildPayload(), q("#planStatus"), null));
    }
  });
})();
