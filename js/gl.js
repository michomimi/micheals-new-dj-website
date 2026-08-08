/* =====================================================================
   GL.JS — animated background
   A single full-screen fragment shader: domain-warped fbm noise tinted
   black→red, drifting on its own and leaning toward the pointer. Written
   in raw WebGL on purpose — no three.js — so the page stays dependency
   free and loads instantly.

   Falls back silently to a CSS gradient if WebGL is unavailable, and
   never runs under prefers-reduced-motion.
   ===================================================================== */
(function background() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("gl");
  if (!canvas || reduce) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: true })
          || canvas.getContext("experimental-webgl");
  if (!gl) { canvas.style.display = "none"; return; }   // fallback: plain black

  const VERT = `
    attribute vec2 p;
    void main(){ gl_Position = vec4(p, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;   // 0..1, eased
    uniform float u_scroll;  // 0..1 down the page

    // --- value noise + fbm -------------------------------------------
    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);          // smoothstep
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 5; i++){
        v += a * noise(p);
        p = p * 2.03 + vec2(37.1, 17.3);
        a *= 0.5;
      }
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      vec2 st = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

      float t = u_time * 0.045;

      // pointer pulls the field around; scroll slides it upward
      vec2 m = (u_mouse - 0.5) * 0.6;
      st += m * 0.35;
      st.y += u_scroll * 0.55;

      // domain warp — noise offsetting the lookup of more noise. This is
      // what gives the slow liquid movement rather than a flat gradient.
      vec2 q = vec2(fbm(st * 1.6 + t), fbm(st * 1.6 + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(st * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4),
                    fbm(st * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t * 1.1));
      float f = fbm(st * 1.6 + 3.4 * r);

      // shape it: most of the frame stays near black, with bright veins
      float veins = smoothstep(0.42, 0.92, f);
      float glow  = smoothstep(0.90, 0.28, length(st - m * 0.7));

      vec3 black = vec3(0.005, 0.005, 0.008);
      vec3 red   = vec3(0.863, 0.149, 0.149);   // #DC2626
      vec3 hot   = vec3(1.000, 0.290, 0.320);   // #FF2E3E

      vec3 col = black;
      col = mix(col, red * 0.55, veins * 0.85);
      col = mix(col, hot, pow(veins, 3.0) * 0.45);
      col += red * glow * 0.10;                  // soft pool around the cursor

      // vignette so edges fall to true black and copy stays readable
      float vig = smoothstep(1.25, 0.25, length(uv - 0.5) * 1.35);
      col *= vig;

      // fine grain — keeps large flat areas from banding on dark screens
      float g = hash(gl_FragCoord.xy + fract(u_time)) - 0.5;
      col += g * 0.022;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[gl] shader failed:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.style.display = "none"; return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = "none"; return; }
  gl.useProgram(prog);

  // one full-screen triangle pair
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes    = gl.getUniformLocation(prog, "u_res");
  const uTime   = gl.getUniformLocation(prog, "u_time");
  const uMouse  = gl.getUniformLocation(prog, "u_mouse");
  const uScroll = gl.getUniformLocation(prog, "u_scroll");

  // cap the pixel ratio: a full-screen shader at DPR 3 on a phone is a
  // pointless amount of fragment work and drains battery for no gain
  const DPR = Math.min(window.devicePixelRatio || 1, 1.75);

  function resize() {
    const w = Math.floor(canvas.clientWidth  * DPR);
    const h = Math.floor(canvas.clientHeight * DPR);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize, { passive: true });

  let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, scroll = 0;
  window.addEventListener("pointermove", (e) => {
    tx = e.clientX / window.innerWidth;
    ty = 1.0 - e.clientY / window.innerHeight;
  }, { passive: true });
  window.addEventListener("scroll", () => {
    const max = document.body.scrollHeight - window.innerHeight;
    scroll = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
  }, { passive: true });

  // pause when the tab is hidden so it costs nothing in the background
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(frame);
  });

  const start = performance.now();
  function frame(now) {
    if (!running) return;
    resize();
    mx += (tx - mx) * 0.05;      // ease toward the cursor, never snap
    my += (ty - my) * 0.05;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  resize();
  requestAnimationFrame(frame);
})();
