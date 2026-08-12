/* =====================================================================
   GATE.JS — the password screen on admin.html

   READ THIS BEFORE TRUSTING IT WITH ANYTHING.

   This is a convenience lock, not security. The site is static files on
   GitHub Pages with no server, so nothing can check a password before a
   page is sent. Everything here runs in the visitor's own browser, after
   the page has already arrived, which means anyone determined can skip it
   by reading the source or by typing a tool's address directly.

   What it is good for: keeping one memorable address instead of four, and
   stopping someone who wanders onto /admin.html from idly clicking about.

   What is done properly anyway, because it costs nothing:

     - The password is never written down here. Only a PBKDF2-SHA256 hash
       of it is, with a random salt and 250,000 iterations, so the value
       in this file cannot be read back into a password and guessing at it
       is slow even though the file is public.
     - Comparison is constant time, so the number of correct leading bytes
       cannot be measured by timing the answer.
     - Unlocking stores the same derived hash, not the password.

   TO CHANGE THE PASSWORD, run this and paste the two values below:

     python3 -c "import hashlib,os,base64;p=input('new password: ');\
     s=os.urandom(16);d=hashlib.pbkdf2_hmac('sha256',p.encode(),s,250000);\
     print('SALT',base64.b64encode(s).decode());\
     print('HASH',base64.b64encode(d).decode())"

   ===================================================================== */
(function gate() {
  const SALT = "HWRhn4x+LNu9NC0iUa3UUw==";
  const HASH = "VpGlsA9FjL8/m4qObiUbTP1IAnp+5ePBzuhOsRaTB9s=";
  const ITER = 250000;
  const KEY  = "djm-admin";

  const $ = (s) => document.querySelector(s);
  const screen = $("#gate");
  const tools  = $("#tools");
  if (!screen || !tools) return;

  const b64ToBytes = (b64) =>
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const bytesToB64 = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)));

  /* Compares every byte whichever way it goes, so a wrong answer takes the
     same time as a nearly right one. */
  function sameBytes(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  async function derive(password) {
    const enc = new TextEncoder();
    const material = await crypto.subtle.importKey(
      "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: b64ToBytes(SALT), iterations: ITER, hash: "SHA-256" },
      material, 256);
    return bytesToB64(bits);
  }

  function unlock() {
    screen.hidden = true;
    tools.hidden = false;
    document.body.classList.add("is-unlocked");
  }

  /* Already unlocked on this device. The stored value is the derived hash,
     so a look through local storage still turns up no password. */
  try {
    if (localStorage.getItem(KEY) === HASH) unlock();
  } catch { /* private browsing */ }

  const form   = $("#gateForm");
  const input  = $("#gatePass");
  const status = $("#gateStatus");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "Checking…";
      status.className = "form-status";
      /* 250,000 rounds is deliberately slow: about a fifth of a second
         here, and the same tax on anyone working through a word list. */
      let got;
      try {
        got = await derive(input.value);
      } catch {
        status.textContent = "This browser cannot run the check. Use a current browser.";
        status.className = "form-status err";
        return;
      }
      if (sameBytes(b64ToBytes(got), b64ToBytes(HASH))) {
        try { localStorage.setItem(KEY, HASH); } catch { /* private browsing */ }
        input.value = "";
        status.textContent = "";
        unlock();
      } else {
        status.textContent = "Wrong password.";
        status.className = "form-status err";
        input.select();
      }
    });
  }

  const out = $("#gateOut");
  if (out) {
    out.addEventListener("click", () => {
      try { localStorage.removeItem(KEY); } catch { /* private browsing */ }
      location.reload();
    });
  }
})();
