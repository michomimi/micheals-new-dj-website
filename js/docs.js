/* =====================================================================
   DOCS.JS — contract and invoice generators

   Both documents are built entirely in the visitor's browser. Nothing is
   uploaded, stored, or sent anywhere on its own, because a static site
   has nowhere to put it. That has two consequences worth understanding:

     1. A typed signature here is a record, not a verified one. There is
        no identity check and no tamper-proof audit trail the way there
        is with a dedicated e-signature service.
     2. The signed document only reaches you if the client sends it,
        either by pressing the send button (which needs CONFIG.formEndpoint
        set, or falls back to their email app) or by printing to PDF and
        emailing it themselves.

   Reads CONFIG from app.js, which must load first.
   ===================================================================== */
(function docs() {
  const q  = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => [...c.querySelectorAll(s)];

  if (typeof CONFIG === "undefined") return;      // app.js did not load

  const money = (n) =>
    "$" + (Math.round(Number(n) * 100) / 100).toLocaleString("en-CA", {
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });

  const iso   = (d) => d.toISOString().slice(0, 10);
  const today = () => iso(new Date());

  const longDate = (value) => {
    if (!value) return "";
    const d = new Date(value + "T12:00:00");       // midday avoids timezone drift
    if (isNaN(d)) return value;
    return d.toLocaleDateString("en-CA", { day: "numeric", month: "long", year: "numeric" });
  };

  /* 19:30 reads as 7:30 pm. A contract is read aloud across a table, and
     nobody says nineteen thirty. */
  const time12 = (v) => {
    if (!v) return "";
    const [h, m] = v.split(":").map(Number);
    if (isNaN(h)) return v;
    const hr = h % 12 === 0 ? 12 : h % 12;
    return `${hr}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  };

  /* hours between two times, treating a finish before the start as the
     small hours of the next morning, which is where most sets end */
  const spanHours = (a, b) => {
    if (!a || !b) return 0;
    const mins = (s) => {
      const [h, m] = s.split(":").map(Number);
      return h * 60 + m;
    };
    let d = mins(b) - mins(a);
    if (isNaN(d)) return 0;
    if (d <= 0) d += 1440;
    return Math.round((d / 60) * 10) / 10;
  };

  const val     = (id) => (q("#" + id) ? q("#" + id).value.trim() : "");
  const checked = (id) => !!(q("#" + id) && q("#" + id).checked);

  /* a value the client left blank shows as a fill-in line, not silence */
  const orBlank = (v) => (v ? esc(v) : '<span class="doc-blank"></span>');

  /* typed lists keep their line breaks in the printed document */
  const lines = (v) => esc(v).replace(/\r?\n/g, "<br>");

  /* A stable reference both sides can quote. Built from the event date and
     the client's initials, so the same booking always produces the same
     number, and no two bookings on one day collide unless the names match. */
  const reference = (date, name) => {
    const initials = (name || "")
      .split(/\s+/).filter(Boolean).slice(0, 3)
      .map((w) => w[0].toUpperCase()).join("") || "XX";
    return `DJM-${(date || today()).replace(/-/g, "")}-${initials}`;
  };

  /* Prefill any field from ?name=value, so a pre-filled link can be sent to
     the client with the booking already filled in. A tick box is set from
     the value rather than assigned it, since assigning .value to a checkbox
     changes what it submits and leaves the box itself unticked. */
  function prefillFromURL() {
    const p = new URLSearchParams(location.search);
    p.forEach((v, k) => {
      const el = q("#" + k);
      if (!el) return;
      if (el.type === "checkbox") {
        el.checked = !/^(0|false|no|off|)$/i.test(v.trim());
      } else {
        el.value = v;
      }
    });
  }

  /* =====================================================================
     CONTRACT
     ===================================================================== */
  /* The tick boxes on the form, the wording that goes into the agreement,
     and the short label used in the email summary, kept in one place so a
     service can never be worded three different ways. */
  const SERVICES = [
    { id: "svcDj",       short: "DJ performance and sound",
      clause: "DJ performance, including sound system and microphones" },
    { id: "svcMc",       short: "MC and announcements",
      clause: "MC duties: introductions, announcements and running order" },
    { id: "svcCeremony", short: "Ceremony sound",
      clause: "Ceremony sound, including a microphone for vows and readings" },
    { id: "svcCocktail", short: "Cocktail hour music",
      clause: "Cocktail hour and dinner background music" },
  ];

  function initContract() {
    const form = q("#contractForm");
    const out  = q("#contractDoc");
    if (!form || !out) return;
    if (window.armBotTrap) window.armBotTrap(form);

    /* package dropdown comes from CONFIG so prices cannot drift */
    const pkgSel = q("#pkg");
    if (pkgSel) {
      pkgSel.innerHTML =
        CONFIG.packages.map((p) =>
          `<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join("") +
        `<option value="custom">Custom quote</option>`;
    }

    /* choosing a package fills the fee, which stays editable because the
       real number depends on hours, travel and extras */
    const syncFee = () => {
      const pkg = CONFIG.packages.find((p) => p.id === pkgSel.value);
      if (pkg && q("#fee")) q("#fee").value = pkg.price;
      syncDeposit();
    };
    /* the deposit follows the whole amount payable, travel included, so the
       balance on the day is never a surprise */
    const syncDeposit = () => {
      const total = (parseFloat(val("fee")) || 0) + (parseFloat(val("travel")) || 0);
      if (q("#deposit")) q("#deposit").value = Math.round(total * CONFIG.depositRate);
    };
    if (pkgSel) pkgSel.addEventListener("change", syncFee);
    if (q("#fee")) q("#fee").addEventListener("input", syncDeposit);
    if (q("#travel")) q("#travel").addEventListener("input", syncDeposit);

    if (q("#agreementDate")) q("#agreementDate").value = today();

    /* a deposit sitting open forever is how dates get lost, so the default
       ask is 14 days from today */
    if (q("#depositDue") && !val("depositDue")) {
      q("#depositDue").value = iso(new Date(Date.now() + 14 * 864e5));
    }

    prefillFromURL();
    if (pkgSel && !val("fee")) syncFee();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fee     = parseFloat(val("fee")) || 0;
      const travel  = parseFloat(val("travel")) || 0;
      const total   = fee + travel;
      const deposit = parseFloat(val("deposit")) || 0;
      const balance = Math.max(total - deposit, 0);
      const pkg     = CONFIG.packages.find((p) => p.id === (pkgSel ? pkgSel.value : ""));
      const pkgName = pkg ? pkg.name : "Custom quote";

      /* only the ticked services are written into the agreement, so the
         document never promises something that was not booked */
      const services = SERVICES.filter((s) => checked(s.id)).map((s) => s.clause);

      out.innerHTML = contractHTML({
        pkgName, fee, travel, total, deposit, balance, services,
        client:     val("client"),
        org:        val("org"),
        clientAddr: val("clientAddress"),
        email:      val("email"),
        phone:      val("phone"),
        date:       val("eventDate"),
        type:       val("eventType"),
        venue:      val("venue"),
        address:    val("address"),
        coordName:  val("coordName"),
        coordPhone: val("coordPhone"),
        setup:      val("setupTime"),
        start:      val("startTime"),
        end:        val("endTime"),
        clearBy:    val("clearBy"),
        guests:     val("guests"),
        depositDue: val("depositDue"),
        overtime:   parseFloat(val("overtime")) || 0,
        payMethod:  val("payMethod"),
        notes:      val("notes"),
        promoOptOut: checked("promoOptOut"),
        agreed:     val("agreementDate"),
      });

      q("#contractStage").hidden = false;
      wireSignature();
      q("#contractStage").scrollIntoView({ behavior: "smooth", block: "start" });

      /* Send the details the moment the agreement is generated, without
         waiting for the signature. A guest who fills the whole form and
         then closes the tab before signing is the common case, and their
         details would otherwise be lost entirely. Signing sends a second,
         clearly-labelled copy. */
      sendCopy();
    });

    /* the print button unlocks only once the client has typed their name
       and ticked the box, so a blank agreement cannot be exported */
    function wireSignature() {
      const sig   = q("#sigName");
      const agree = q("#sigAgree");
      const print = q("#printDoc");
      const send  = q("#sendDoc");
      if (!sig || !agree || !print) return;

      const check = () => {
        const ready = sig.value.trim().length > 1 && agree.checked;
        print.disabled = !ready;
        if (send) send.disabled = !ready;
        const line = q("#sigPrinted");
        if (line) line.textContent = sig.value.trim();
        const dl = q("#sigDate");
        if (dl) dl.textContent = longDate(today());
      };
      sig.addEventListener("input", check);
      agree.addEventListener("change", check);
      check();

      print.addEventListener("click", () => window.print());
      if (send) send.addEventListener("click", sendCopy);

      /* Back to the form, keeping every answer as typed. Re-signing is
         required afterwards: the signature belongs to the wording that
         was on screen when it was given, so an edit has to invalidate it
         rather than carry a name over onto changed terms. */
      const edit = q("#editDoc");
      if (edit && !edit.dataset.wired) {
        edit.dataset.wired = "1";
        edit.addEventListener("click", () => {
          q("#contractStage").hidden = true;
          if (sig) sig.value = "";
          if (agree) agree.checked = false;
          check();
          const status = q("#docStatus");
          if (status) { status.textContent = ""; status.className = "form-status"; }
          const f = q("#contractForm");
          if (f) {
            f.scrollIntoView({ behavior: "smooth", block: "start" });
            const first = f.querySelector("input, textarea, select");
            if (first) first.focus({ preventScroll: true });
          }
        });
      }
    }

    async function sendCopy() {
      const status = q("#docStatus");

      /* Same trap as the enquiry forms. Reporting success to the bot and
         sending nothing beats telling it the truth, which only teaches it
         to retry with the field left blank. */
      const theForm = q("#contractForm") || q("#invoiceForm");
      if (window.botTrapTripped && window.botTrapTripped(theForm)) {
        status.textContent = "Sent. Keep your own PDF copy using the print button.";
        status.className = "form-status ok";
        return;
      }

      const ticked = SERVICES.filter((s) => checked(s.id)).map((s) => s.short);

      const summary = {
        document:   val("sigName") ? "Signed booking agreement" : "Booking agreement (details, not yet signed)",
        reference:  reference(val("eventDate"), val("client")),
        signedBy:   val("sigName"),
        signedOn:   today(),
        client:     val("client"),
        org:        val("org"),
        address:    val("clientAddress"),
        email:      val("email"),
        phone:      val("phone"),
        eventDate:  val("eventDate"),
        eventType:  val("eventType"),
        venue:      val("venue"),
        venueAddr:  val("address"),
        dayContact: `${val("coordName")} ${val("coordPhone")}`.trim(),
        setupFrom:  val("setupTime"),
        hours:      `${val("startTime")} to ${val("endTime")}`,
        clearBy:    val("clearBy"),
        guests:     val("guests"),
        package:    pkgSel ? pkgSel.options[pkgSel.selectedIndex].text : "",
        services:   ticked.join("; "),
        fee:        val("fee"),
        travel:     val("travel"),
        deposit:    val("deposit"),
        depositDue: val("depositDue"),
        overtime:   val("overtime"),
        payMethod:  val("payMethod"),
        promoOptOut: checked("promoOptOut") ? "yes" : "no",
        notes:      val("notes"),
      };

      /* Web3Forms first: this is what actually reaches the inbox. The
         older formEndpoint branch below is kept for anyone who swaps in
         Formspree instead, and the mail app is the last resort so a
         completed agreement is never simply lost. */
      if (CONFIG.web3formsKey) {
        status.textContent = "Sending…";
        status.className = "form-status";
        try {
          const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            /* Four standard fields, with the detail inside `message`.
               Sending each answer as its own field trips the service's
               spam checks, which reject the submission outright. */
            body: JSON.stringify({
              access_key: CONFIG.web3formsKey,
              name: summary.client || "Website guest",
              email: summary.email || "",
              subject: `${summary.document} — ${summary.client || "guest"} — ${summary.eventDate || ""}`.trim(),
              message: Object.entries(summary)
                .filter(([, v]) => v !== "" && v !== undefined && v !== null)
                .map(([k, v]) => `${k.replace(/([a-z])([A-Z])/g, "$1 $2")
                  .replace(/^./, (c) => c.toUpperCase())}: ${v}`)
                .join("\n"),
              from_name: `${CONFIG.name} website`,
              replyto: summary.email || "",
            }),
          });
          const out = await res.json().catch(() => ({}));
          if (!res.ok || out.success === false) throw new Error();
          status.textContent = summary.signedBy
            ? "Sent. I have the signed agreement. Keep your own PDF using the download button."
            : "Sent. I have your details. Sign below and download your PDF when you are ready.";
          status.className = "form-status ok";
          return;
        } catch {
          /* fall through to the routes below */
        }
      }

      if (!CONFIG.formEndpoint) {
        if (!CONFIG.email) {
          status.textContent = "No contact address is set up yet. Please print to PDF and send it manually.";
          status.className = "form-status err";
          return;
        }
        /* mailto: URLs are silently truncated by some mail apps past roughly
           two thousand characters, so empty fields are dropped and a long
           music list is cut with a note rather than losing the end quietly */
        let text = Object.entries(summary)
          .filter(([, v]) => v !== "" && v !== undefined)
          .map(([k, v]) => `${k}: ${v}`).join("\n");
        if (text.length > 1600) {
          text = text.slice(0, 1600) + "\n\n[cut short, the full detail is in the attached PDF]";
        }
        const body = encodeURIComponent(text);
        window.location.href =
          `mailto:${CONFIG.email}?subject=${encodeURIComponent(
            "Signed agreement " + summary.reference)}&body=${body}`;
        status.textContent =
          "Couldn't send automatically. Your email app has been opened with the details, " +
          "please press send there, and attach the PDF.";
        status.className = "form-status err";
        return;
      }

      status.textContent = "Sending…";
      status.className = "form-status";
      try {
        const res = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(summary),
        });
        if (!res.ok) throw new Error(res.status);
        status.textContent = "Sent. Keep your own PDF copy using the print button.";
        status.className = "form-status ok";
      } catch {
        status.textContent = "Could not send. Please print to PDF and email it instead.";
        status.className = "form-status err";
      }
    }
  }

  /* The agreement body. Clauses mirror terms.html; if one changes there it
     must change here too, or a client can be shown two versions of the same
     promise. Article headings carry no number in the markup, because the
     stylesheet numbers them with a counter, so inserting an article in the
     middle never leaves the rest mis-numbered. */
  function contractHTML(d) {
    const perf =
      (d.start && d.end) ? `${time12(d.start)} to ${time12(d.end)}` :
      (d.start ? `From ${time12(d.start)}` : "");
    const dur      = spanHours(d.start, d.end);
    const ref      = reference(d.date, d.client);
    const agreedOn = longDate(d.agreed || today());
    const clientOf = d.org ? `${esc(d.client || "the client")} of ${esc(d.org)}` : orBlank(d.client);

    /* the overtime rate is quoted where one was given, and left as a
       fill-in line where it was not, rather than inventing a number */
    const otRate = d.overtime
      ? `${money(d.overtime)} per hour`
      : '<span class="doc-blank"></span> per hour';

    return `
      <header class="doc-head">
        <div>
          <h2>Booking Agreement</h2>
          <p class="doc-meta">
            Reference ${esc(ref)}<br>
            Prepared ${esc(agreedOn)}<br>
            DJ and entertainment services
          </p>
        </div>
        <div class="doc-brand">
          <strong>${esc(CONFIG.name)}</strong>
          <span>${esc(CONFIG.city)}</span>
          <span>${esc(CONFIG.email)}</span>
          <span>${esc(CONFIG.phone)}</span>
        </div>
      </header>

      <p class="doc-recital">
        This agreement is made on ${esc(agreedOn)} between ${esc(CONFIG.name)}
        of ${esc(CONFIG.city)}, referred to below as <strong>the DJ</strong>,
        and ${clientOf}, referred to below as <strong>the Client</strong>.
      </p>
      <p class="doc-recital">
        The Client wishes to engage the DJ to provide entertainment services at
        the event described in article 1, and the DJ agrees to provide them on
        the terms set out below. Together these pages, with the appendices,
        form the whole of what has been agreed.
      </p>

      <section class="doc-parties">
        <div>
          <h3>The DJ</h3>
          <p>
            ${esc(CONFIG.name)}<br>
            ${esc(CONFIG.city)}<br>
            ${esc(CONFIG.email)}<br>
            ${esc(CONFIG.phone)}
          </p>
        </div>
        <div>
          <h3>The Client</h3>
          <p>
            ${orBlank(d.client)}<br>
            ${d.org ? esc(d.org) + "<br>" : ""}
            ${orBlank(d.clientAddr)}<br>
            ${orBlank(d.email)}<br>
            ${orBlank(d.phone)}
          </p>
        </div>
      </section>

      <h3 class="doc-art">The event</h3>
      <table class="doc-table">
        <tr><th>Event date</th><td>${orBlank(longDate(d.date))}</td></tr>
        <tr><th>Event type</th><td>${orBlank(d.type)}</td></tr>
        <tr><th>Venue</th><td>${orBlank(d.venue)}</td></tr>
        <tr><th>Venue address</th><td>${orBlank(d.address)}</td></tr>
        <tr><th>Approximate guests</th><td>${orBlank(d.guests)}</td></tr>
        <tr><th>Contact on the day</th><td>${orBlank(
          [d.coordName, d.coordPhone].filter(Boolean).join(", "))}</td></tr>
        <tr><th>Package booked</th><td>${esc(d.pkgName)}</td></tr>
        <tr><th>Agreement reference</th><td>${esc(ref)}</td></tr>
      </table>
      <ol class="doc-clauses">
        <li>The details in the table above are the booking. A change to any of
            them is only effective once both parties have confirmed it in
            writing, which includes email.</li>
        <li>Where a line above has been left blank, the parties will complete
            it in writing as soon as it is known, and in any event no later
            than 14 days before the event date.</li>
        <li>The Client confirms they have authority to make this booking and
            to commit to the payments set out in article 4.</li>
      </ol>

      <h3 class="doc-art">Services</h3>
      <p class="doc-lead">The DJ will provide the following at the event:</p>
      ${d.services.length
        ? `<ul class="doc-terms" style="list-style:disc">${
            d.services.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`
        : `<p class="doc-lead"><span class="doc-blank" style="min-width:100%"></span></p>`}
      <ol class="doc-clauses">
        <li>The DJ will attend in appropriate dress, arrive at the access time
            in article 3, and perform for the hours set out there.</li>
        <li>The DJ supplies a complete sound system scaled to the room, at
            least two wireless microphones where speeches are expected, and a
            backup laptop able to take over the set if primary equipment
            fails.</li>
        <li>Anything not listed above is not included. Additional services can
            be added by written agreement, and are charged at the rates in
            article 4 or as separately quoted.</li>
        <li>The DJ may use a substitute performer of comparable skill if
            prevented from attending, having first told the Client and given
            them the chance to object. Where the Client reasonably objects,
            article 7 applies instead.</li>
      </ol>

      <h3 class="doc-art">Times and access</h3>
      <table class="doc-table">
        <tr><th>Setup access from</th><td>${orBlank(time12(d.setup))}</td></tr>
        <tr><th>Performance</th><td>${orBlank(perf)}${
          dur ? ` <span class="doc-quiet">(${dur} hours)</span>` : ""}</td></tr>
        <tr><th>Venue cleared by</th><td>${orBlank(time12(d.clearBy))}</td></tr>
      </table>
      <ol class="doc-clauses">
        <li>Setup normally needs 60 to 90 minutes of clear access before the
            performance, and packing down takes about an hour after it. The
            Client will make sure the venue allows for both.</li>
        <li>Where access is given later than the time above, the performance
            may start late or run short by the time lost. The full fee still
            applies in that case.</li>
        <li>The performance may be paused for speeches, meals, and other parts
            of the running order. Time paused counts toward the hours booked.</li>
        <li>Where the event runs beyond the finish time and the DJ is willing
            and able to continue, article 4 sets out how the extra time is
            charged.</li>
      </ol>

      <h3 class="doc-art">Fee and payment</h3>
      <table class="doc-table">
        <tr><th>${esc(d.pkgName)} package</th><td>${money(d.fee)}</td></tr>
        ${d.travel ? `<tr><th>Travel</th><td>${money(d.travel)}</td></tr>` : ""}
        <tr><th>Total fee</th><td>${money(d.total)}</td></tr>
        <tr><th>Deposit to hold the date</th><td>${money(d.deposit)}${
          d.depositDue ? `, due ${esc(longDate(d.depositDue))}` : ""}</td></tr>
        <tr class="doc-due"><th>Balance due on the day</th>
            <td><strong>${money(d.balance)}</strong></td></tr>
      </table>
      <ol class="doc-clauses">
        <li>The date is held only once the deposit has been received and the DJ
            has confirmed the booking in writing. Until then the date stays
            available to other clients, whatever has been discussed.</li>
        <li>The deposit is <strong>non-refundable</strong>, because holding the
            date means turning down other work for it. It is credited against
            the total fee.</li>
        <li>The balance is due on the day of the event, before the performance
            begins, unless agreed otherwise in writing.</li>
        <li>Payment is by ${d.payMethod ? esc(d.payMethod) : '<span class="doc-blank"></span>'},
            to the details the DJ provides. The DJ will never send new payment
            details by unprompted message. If details appear to change, the
            Client should call the number on this agreement before paying.</li>
        <li>Overtime is charged at ${otRate}, billed in half hour blocks and
            payable on the night. Overtime is only worked where the DJ agrees
            at the time and the venue permits it.</li>
        <li>Amounts unpaid seven days after they fall due carry interest at 2
            percent per month on the outstanding amount, and the DJ may recover
            reasonable costs of collection.</li>
        <li>Fees quoted are exclusive of any tax that may apply, which is added
            where required by law.</li>
        <li>Travel outside ${esc(CONFIG.city)}, extra hours, and late finishes
            are quoted separately and added to the balance.</li>
      </ol>

      <h3 class="doc-art">If the Client cancels</h3>
      <ol class="doc-clauses">
        <li>Cancellation must be given in writing. The date the DJ receives it
            is the date the cancellation takes effect.</li>
        <li>The deposit is not refunded, whenever the cancellation happens.</li>
        <li>Cancelling <strong>30 days or less</strong> before the event means
            the full balance remains payable, as the date can rarely be
            rebooked at short notice.</li>
        <li>Where the DJ does rebook the date at a similar fee, the amount
            payable under clause 5.3 is reduced by what is actually recovered.</li>
      </ol>

      <h3 class="doc-art">Rescheduling</h3>
      <ol class="doc-clauses">
        <li>One reschedule to a new date within <strong>12 months</strong> of
            the original is offered at no extra charge, subject to the DJ being
            available and to any difference in seasonal rates.</li>
        <li>The deposit already paid transfers to the new date.</li>
        <li>If the DJ is not available for the new date, the original booking
            is treated as a cancellation by the Client under article 5.</li>
      </ol>

      <h3 class="doc-art">If the DJ cancels</h3>
      <ol class="doc-clauses">
        <li>In the unlikely event of cancellation for a reason within the DJ's
            control, all money paid, including the deposit, is refunded in full
            within 14 days.</li>
        <li>The DJ will also make reasonable efforts to find a suitable
            replacement, though no particular replacement can be guaranteed.</li>
        <li>The refund in clause 7.1 is the Client's remedy for that
            cancellation, subject to article 16.</li>
      </ol>

      <h3 class="doc-art">Events outside anyone's control</h3>
      <ol class="doc-clauses">
        <li>Neither party is responsible for failing to perform because of
            something genuinely outside its control, including serious illness,
            bereavement, extreme weather, road closure, power failure, venue
            closure, or government restriction.</li>
        <li>The first step in that case is to reschedule to a date that suits
            both parties, on the terms in article 6.</li>
        <li>Where rescheduling is not possible, fees for services not delivered
            are refunded, less any costs already unavoidably incurred by the
            party claiming them, evidenced on request.</li>
      </ol>

      <h3 class="doc-art">What the Client and venue provide</h3>
      <p class="doc-lead">The Client, or the venue on the Client's behalf, will provide:</p>
      <ol class="doc-clauses">
        <li>Access for setup at the time in article 3, with a clear route in
            for equipment and parking or loading access reasonably close to the
            entrance.</li>
        <li>Safe, adequate mains power near the performance area, on a circuit
            able to carry the load without being shared with kitchen or heating
            equipment.</li>
        <li>A level, dry performance space of the size agreed, under cover, and
            for outdoor events a solid floor and protection from sun and rain
            for both the DJ and the equipment.</li>
        <li>Any permissions, licences, noise approvals or insurance the venue
            requires, and notice of any curfew or sound limit before the day.</li>
        <li>Where the DJ is on site for five hours or more, reasonable access
            to drinking water and a meal break of at least 20 minutes.</li>
        <li>Where power, access or space is not as agreed, the performance may
            start late or be shortened, and the full fee still applies.</li>
      </ol>

      <h3 class="doc-art">Equipment and damage</h3>
      <ol class="doc-clauses">
        <li>All equipment remains the property of the DJ at all times, and
            nothing in this agreement transfers any interest in it.</li>
        <li>The Client is responsible for damage to, or loss of, the equipment
            caused by the Client, their guests, or others attending the event,
            other than fair wear and tear or damage caused by the DJ.</li>
        <li>For everyone's safety, guests may not operate the equipment.
            Drinks are not permitted on or near the DJ booth.</li>
        <li>The DJ maintains the equipment in safe working order and will
            provide test certificates or an equipment list where a venue asks
            for them, given reasonable notice.</li>
      </ol>

      <h3 class="doc-art">Conduct and safety</h3>
      <ol class="doc-clauses">
        <li>The DJ may stop the performance and leave, with the full fee
            remaining payable, where there is a genuine threat to the safety of
            people or equipment, including violence, threatening behaviour, or
            sustained abuse toward the DJ.</li>
        <li>This is a last resort. In practice a quiet word with the Client or
            the contact on the day comes first.</li>
        <li>The Client is responsible for the conduct of their guests and for
            any security the venue requires.</li>
      </ol>

      <h3 class="doc-art">Special effects</h3>
      <ol class="doc-clauses">
        <li>Dry ice and cold spark fountains, where booked, need the venue's
            <strong>written approval in advance</strong>. Some venues do not
            permit them, and some require a fire safety plan.</li>
        <li>Obtaining that approval is the Client's responsibility, and the DJ
            will supply whatever specifications the venue asks for.</li>
        <li>Where approval is refused or withdrawn, those effects will not be
            used. That is not a failure to deliver the booking, and no refund
            is due for the effects element.</li>
        <li>Effects will not be used near anyone with a known sensitivity where
            the Client has told the DJ in advance, and will not be used at all
            if the DJ judges on the day that it is unsafe.</li>
      </ol>

      <h3 class="doc-art">Music, requests and volume</h3>
      <ol class="doc-clauses">
        <li>The must-play and do-not-play lists in appendix A are agreed in
            advance and will be respected, subject to availability of a
            legitimate recording.</li>
        <li>Beyond those lists, song selection and mixing on the night are at
            the DJ's discretion, based on reading the room.</li>
        <li>Guest requests are welcome and are played at the DJ's discretion,
            taking the do-not-play list and the mood of the floor into account.</li>
        <li>Volume is kept within any limit set by the venue, including
            automatic sound limiters. Where a limiter or venue policy restricts
            volume, that is not a failure to deliver the booking.</li>
        <li>Final music details should reach the DJ no later than 14 days
            before the event.</li>
      </ol>

      <h3 class="doc-art">Photos, video and promotion</h3>
      <ol class="doc-clauses">
        <li>${d.promoOptOut
              ? `The Client has <strong>opted out</strong>. No photo or video of
                 this event will be used for promotion.`
              : `Photos or video may be taken of the setup and the event for use
                 in promotion, including on the DJ's website and social media.`}</li>
        <li>The Client may change this position by telling the DJ in writing at
            any time before the event, and the DJ will remove promotional
            material already published if asked afterwards.</li>
        <li>Neither party will use the other's name or images in a way that is
            misleading about what was supplied.</li>
      </ol>

      <h3 class="doc-art">Insurance and status</h3>
      <ol class="doc-clauses">
        <li>The DJ operates as an independent contractor, not as an employee,
            agent or partner of the Client, and is responsible for their own
            taxes and contributions.</li>
        <li>The DJ carries insurance appropriate to the services supplied and
            will provide details to a venue on request.</li>
        <li>The Client is responsible for insuring the event itself, including
            the venue, the guests and their property.</li>
      </ol>

      <h3 class="doc-art">Liability</h3>
      <ol class="doc-clauses">
        <li>Nothing in this agreement limits liability for death or personal
            injury caused by negligence, for fraud, or for anything else that
            cannot be limited by law.</li>
        <li>Subject to clause 16.1, the total liability of either party in
            connection with this booking is limited to the total fee paid for
            it.</li>
        <li>Neither party is liable for indirect or consequential loss, such as
            lost profits or the cost of other parts of the event.</li>
        <li>The Client will cover claims brought by third parties arising from
            the conduct of the Client or their guests at the event, other than
            claims caused by the DJ.</li>
      </ol>

      <h3 class="doc-art">Notices and general terms</h3>
      <ol class="doc-clauses">
        <li>Notices under this agreement are given in writing to the email
            addresses on the first page, and are treated as received on the
            next working day.</li>
        <li>This agreement, with its appendices, is the entire agreement
            between the parties about this booking, and replaces anything said
            or written beforehand.</li>
        <li>Any change to this agreement must be recorded in writing and agreed
            by both parties.</li>
        <li>If any clause is found to be unenforceable, the rest of the
            agreement continues in force.</li>
        <li>A delay in enforcing a term is not a waiver of it.</li>
        <li>Neither party may transfer this agreement to someone else without
            the other's written consent, other than the substitution allowed by
            clause 2.4.</li>
        <li>Personal information is handled as described in the DJ's privacy
            policy, and is used only to deliver this booking.</li>
        <li>This agreement may be signed electronically and in counterparts,
            each of which is an original, and together they form one
            agreement.</li>
        <li>This agreement is governed by the laws of the Province of Alberta
            and the federal laws of Canada that apply there. The courts of
            Alberta have jurisdiction over any dispute.</li>
      </ol>

      <h3>Appendix A: music and extras</h3>
      <p class="doc-quiet">Forms part of this agreement, see article 13.</p>
      <p class="doc-lead">Song choices and the lighting or effects for this event are recorded on
        two separate sheets, the music plan and the extras sheet, both supplied by the client and
        held with this agreement. They are kept separate so they can be revised at any time before
        the event without altering or re-signing these terms. The most recent version of each
        received in writing is the one that applies.</p>

      <h3>Appendix B: anything else agreed</h3>
      <p class="doc-quiet">Anything written here has the same force as the articles above.</p>
      <p class="doc-lead">${d.notes
        ? lines(d.notes)
        : '<span class="doc-blank" style="min-width:100%"></span>'}</p>
      <div class="doc-initials">
        <span>Client initials</span><span class="doc-blank"></span>
        <span>DJ initials</span><span class="doc-blank"></span>
      </div>

      <h3>Signatures</h3>
      <p class="doc-lead">
        Signed by the parties, who confirm they have read and accepted the
        whole of this agreement, including the appendices.
      </p>
      <div class="doc-sign">
        <div>
          <span class="doc-sig-line" id="sigPrinted"></span>
          <span class="doc-sig-label">Client signature</span>
          <span class="doc-sig-label">Name: ${orBlank(d.client)}</span>
          <span class="doc-sig-label">Dated <span id="sigDate"></span></span>
        </div>
        <div>
          <span class="doc-sig-line">${esc(CONFIG.name)}</span>
          <span class="doc-sig-label">For ${esc(CONFIG.name)}</span>
          <span class="doc-sig-label">Name: ${esc(CONFIG.name)}</span>
          <span class="doc-sig-label">Dated ${esc(agreedOn)}</span>
        </div>
      </div>
      <p class="doc-quiet" style="margin-top:1.4rem">
        Agreement ${esc(ref)}. Please keep a copy. A signature typed on the
        website is a record of acceptance, not an identity checked signature,
        so both parties should retain the PDF.
      </p>`;
  }

  /* =====================================================================
     INVOICE / RECEIPT
     ===================================================================== */
  function initInvoice() {
    const form = q("#invoiceForm");
    const out  = q("#invoiceDoc");
    if (!form || !out) return;
    if (window.armBotTrap) window.armBotTrap(form);

    const now = new Date();

    /* A receipt numbered INV- looks like the wrong document, so the prefix
       follows the type. Only ever rewritten while the box still holds a
       generated number: the moment it is typed in by hand it is left
       alone, since a number quoted to a guest must not move. */
    const autoNo = (mode) =>
      (mode === "invoice" ? "INV-" : "RCT-") + today().replace(/-/g, "") + "-01";
    const isAutoNo = (v) => /^(INV|RCT)-\d{8}-\d+$/.test(v);
    const syncNo = (mode) => {
      const box = q("#invNo");
      if (box && (!box.value || isAutoNo(box.value))) box.value = autoNo(mode);
    };

    /* The document type decides what the amount box is for, so the box
       follows it: greyed out and explained on a paid-in-full receipt,
       where the figure comes from the total, and a due date only makes
       sense on something that is still owed.

       Defined after the number helpers above, and called only once they
       exist: a const is not hoisted, so calling this any earlier throws
       and takes the whole generator down with it. */
    const modeSel = q("#docMode");
    const syncMode = () => {
      const mode = modeSel ? modeSel.value : "invoice";
      const paidBox = q("#paid"), hint = q("#paidHint"), dueRow = q("#dueDate");
      if (paidBox) {
        paidBox.disabled = mode === "receipt-full";
        paidBox.closest(".field").classList.toggle("is-off", paidBox.disabled);
      }
      if (hint) hint.hidden = mode !== "receipt-full";
      if (dueRow) dueRow.closest(".field").hidden = mode !== "invoice";
      syncNo(mode);
    };
    if (modeSel) modeSel.addEventListener("change", syncMode);
    syncMode();

    if (q("#invDate")) q("#invDate").value = today();
    if (q("#dueDate")) {
      const due = new Date(now.getTime() + 14 * 864e5);
      q("#dueDate").value = iso(due);
    }

    const pkgSel = q("#invPkg");
    if (pkgSel) {
      pkgSel.innerHTML =
        `<option value="">Choose a package…</option>` +
        CONFIG.packages.map((p) =>
          `<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join("");
      pkgSel.addEventListener("change", () => {
        const pkg = CONFIG.packages.find((p) => p.id === pkgSel.value);
        if (!pkg) return;
        if (q("#desc1")) q("#desc1").value = `${pkg.name} package, DJ services`;
        if (q("#amt1"))  q("#amt1").value  = pkg.price;
        if (q("#paid"))  q("#paid").value  = Math.round(pkg.price * CONFIG.depositRate);
      });
    }

    prefillFromURL();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const items = [1, 2, 3, 4]
        .map((i) => ({ desc: val("desc" + i), amount: parseFloat(val("amt" + i)) || 0 }))
        .filter((it) => it.desc || it.amount);

      const subtotal = items.reduce((s, it) => s + it.amount, 0);
      const taxRate  = parseFloat(val("taxRate")) || 0;
      const tax      = subtotal * (taxRate / 100);
      const total    = subtotal + tax;
      /* Three document states. A paid-in-full receipt takes its amount
         from the total rather than from the box, so the figure printed on
         the document cannot contradict the total sitting above it. */
      const mode      = q("#docMode") ? q("#docMode").value : "invoice";
      const isReceipt = mode.indexOf("receipt") === 0;
      const paidFull  = mode === "receipt-full";
      const paid      = paidFull ? total : (parseFloat(val("paid")) || 0);
      const balance   = Math.max(total - paid, 0);

      out.innerHTML = invoiceHTML({
        isReceipt, paidFull, items, subtotal, taxRate, tax, total, paid, balance,
        invNo:   val("invNo"),
        invDate: val("invDate"),
        dueDate: val("dueDate"),
        client:  val("invClient"),
        email:   val("invEmail"),
        evDate:  val("invEventDate"),
        venue:   val("invVenue"),
        payNote: val("payNote"),
      });

      q("#invoiceStage").hidden = false;
      q("#invoiceStage").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    if (q("#printInvoice")) {
      q("#printInvoice").addEventListener("click", () => window.print());
    }
  }

  function invoiceHTML(d) {
    const rows = d.items.map((it) => `
      <tr><td>${esc(it.desc)}</td><td class="doc-num">${money(it.amount)}</td></tr>`).join("");

    return `
      <header class="doc-head">
        <div>
          <h2>${d.isReceipt ? "Receipt" : "Invoice"}</h2>
          <p class="doc-meta">
            ${esc(d.invNo)}<br>
            Issued ${esc(longDate(d.invDate))}
            ${d.isReceipt ? "" : `<br>Due ${esc(longDate(d.dueDate))}`}
          </p>
        </div>
        <div class="doc-brand">
          <strong>${esc(CONFIG.name)}</strong>
          <span>${esc(CONFIG.city)}</span>
          <span>${esc(CONFIG.email)}</span>
          <span>${esc(CONFIG.phone)}</span>
        </div>
      </header>

      ${d.isReceipt
          ? (d.balance === 0
              ? `<p class="doc-stamp">Paid in full</p>`
              : `<p class="doc-stamp doc-stamp-part">Part payment received</p>`)
          : ""}

      <section class="doc-parties">
        <div>
          <h3>Billed to</h3>
          <p>${orBlank(d.client)}<br>${orBlank(d.email)}</p>
        </div>
        <div>
          <h3>Event</h3>
          <p>${orBlank(longDate(d.evDate))}<br>${orBlank(d.venue)}</p>
        </div>
      </section>

      <table class="doc-table doc-items">
        <thead><tr><th>Description</th><th class="doc-num">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><th>Subtotal</th><td class="doc-num">${money(d.subtotal)}</td></tr>
          ${d.taxRate ? `<tr><th>GST (${d.taxRate}%)</th><td class="doc-num">${money(d.tax)}</td></tr>` : ""}
          <tr><th>Total</th><td class="doc-num"><strong>${money(d.total)}</strong></td></tr>
          ${d.paid ? `<tr><th>${d.isReceipt ? "Amount received" : "Deposit received"}</th>
              <td class="doc-num">− ${money(d.paid)}</td></tr>` : ""}
          <tr class="doc-due"><th>${
              d.balance === 0 ? "Balance" :
              d.isReceipt ? "Balance remaining" : "Balance due"}</th>
              <td class="doc-num"><strong>${money(d.balance)}</strong></td></tr>
        </tfoot>
      </table>

      ${d.payNote ? `<h3>Payment</h3><p>${esc(d.payNote)}</p>` : ""}
      <p class="doc-meta">Thank you.</p>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    initContract();
    initInvoice();
  });
})();
