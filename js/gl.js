/* =====================================================================
   GL.JS — animated background

   A single full-screen fragment shader. Several looks are available and
   the one used is set by BACKGROUND below, or overridden per visit with
   a ?bg= parameter, which is how preview-background.html compares them.

   Written in raw WebGL on purpose, with no three.js, so the page stays
   dependency free and loads instantly. Falls back silently to plain
   black if WebGL is unavailable, and never runs under
   prefers-reduced-motion.
   ===================================================================== */

/* ---- BACKGROUND PER PAGE -------------------------------------------
   Every page gets its own look, keyed off the data-page attribute on
   <body>. Available shaders:

   "waves"     pulsing rings, like sound leaving a speaker cone
   "vinyl"     a spinning record, grooves catching a sweep of light
   "equalizer" a spectrum analyser rising and falling along the bottom
   "lasers"    a crisp fan of beams sweeping from a rig above the frame
   "discoball" a mirror ball throwing bright spots around a dark room
   "waveform"  a scrolling track waveform, the way DJ software draws it
   "strobe"    softer beams through haze, dimmer than "lasers"
   "sparks"    embers drifting upward, like the cold spark fountains
   "ribbons"   the earlier abstract look, kept for comparison

   Add ?bg=name to any URL to override, which is how
   preview-background.html compares them.
   ------------------------------------------------------------------ */
const PAGE_BACKGROUNDS = {
  home:    "waves",       // speaker cone pushing air, sets the tone
  about:   "vinyl",       // the record, for the personal page
  gallery: "lasers",      // beams raking behind the photos
  reviews: "waveform",    // a track laid out, like a night played back
  booking: "discoball",   // bright spots, sparse enough to read forms over
  contact: "equalizer",   // levels, still moving
  terms:   "waves",       // legal pages reuse a calm look on purpose
  privacy: "waves",
};
const FALLBACK_BACKGROUND = "waves";

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

  /* Shared header for every look: the uniforms, the palette, and small
     helpers. Concatenated in front of each shader body below. */
  const COMMON = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;   // 0..1, eased
    uniform float u_scroll;  // 0..1 down the page

    const vec3 RED    = vec3(0.863, 0.149, 0.149);   // #DC2626
    const vec3 HOT    = vec3(1.000, 0.290, 0.320);   // #FF2E3E
    const vec3 MAGENTA= vec3(1.000, 0.180, 0.420);   // #FF2E6B
    const vec3 VIOLET = vec3(0.486, 0.227, 0.929);   // #7C3AED
    const vec3 AMBER  = vec3(1.000, 0.520, 0.145);   // #FF8525

    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float hash1(float n){ return fract(sin(n * 127.1) * 43758.5453123); }

    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
    }

    /* A soft four-on-the-floor pulse. Sharp attack, slow decay, which is
       what makes it read as a beat rather than a sine wave. */
    float beat(float t, float bpm){
      float b = t * (bpm / 60.0);
      return pow(1.0 - fract(b), 3.0);
    }

    /* edges to true black so overlaid copy stays readable */
    float vignette(vec2 uv){
      return smoothstep(1.20, 0.20, length(uv - 0.5) * 1.30);
    }
    float grain(vec2 fragCoord, float t){
      return (hash(fragCoord + fract(t)) - 0.5) * 0.020;
    }
  `;

  const SHADERS = {

    /* ---------------------------------------------------------------
       WAVES — concentric rings pushing outward from the centre on a
       beat, the way sound leaves a speaker cone. Red into magenta.
       --------------------------------------------------------------- */
    waves: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        vec2 m = (u_mouse - 0.5);
        p -= m * 0.16;                       // cone drifts toward the cursor
        p.y += u_scroll * 0.20;

        float t   = u_time * 0.30;
        float pop = beat(u_time, 124.0);     // 124bpm, a house tempo

        float d = length(p);
        vec3 col = vec3(0.0);

        /* six rings, each launched a fraction of a cycle apart so they
           chase each other outward instead of pulsing together */
        for (int i = 0; i < 6; i++){
          float fi = float(i);
          float r  = fract(t + fi * 0.1667);       // 0..1 expansion
          float radius = r * 1.55;
          float fade   = (1.0 - r) * (1.0 - r);    // thin out as it grows
          float width  = 0.010 + r * 0.045;        // and soften

          float ring = smoothstep(width, 0.0, abs(d - radius));
          col += mix(RED, MAGENTA, r) * ring * fade * 0.55;
        }

        /* the cone itself: a tight core that kicks on every beat */
        col += mix(HOT, MAGENTA, 0.35) * smoothstep(0.28, 0.0, d) * (0.10 + pop * 0.22);
        col += RED * smoothstep(0.85, 0.0, d) * 0.05;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       VINYL — a record turning under a moving light. Grooves are static
       rings; the sheen sweeping around them is what sells the rotation.
       --------------------------------------------------------------- */
    vinyl: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        vec2 m = (u_mouse - 0.5);
        p -= m * 0.12;
        p.y += u_scroll * 0.22;

        float t = u_time * 0.55;
        float d = length(p);
        float a = atan(p.y, p.x);

        vec3 col = vec3(0.0);

        /* grooves: fine concentric rings, denser toward the rim */
        float grooves = sin(d * 190.0) * 0.5 + 0.5;
        grooves = smoothstep(0.35, 0.85, grooves);
        float disc = smoothstep(1.15, 1.05, d);       // outer edge of the record
        float label = smoothstep(0.16, 0.20, d);      // clear the centre label

        col += RED * grooves * disc * label * 0.055;

        /* two highlights sweeping around, as if the booth lights are
           catching the record while it turns */
        float sweep1 = pow(max(0.0, cos(a - t)), 10.0);
        float sweep2 = pow(max(0.0, cos(a - t * 0.62 + 2.1)), 16.0);
        col += mix(RED, HOT, 0.5)     * grooves * disc * label * sweep1 * 0.85;
        col += mix(MAGENTA, VIOLET,.4)* grooves * disc * label * sweep2 * 0.45;

        /* centre label and spindle */
        col += mix(RED, AMBER, 0.25) * smoothstep(0.20, 0.05, d) * 0.18;
        col += vec3(1.0) * smoothstep(0.012, 0.0, d) * 0.5;

        /* rim light so the disc reads as an object, not a texture */
        col += HOT * smoothstep(0.02, 0.0, abs(d - 1.10)) * 0.35;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       EQUALIZER — a spectrum analyser along the bottom. Each bar has
       its own seed so they move independently, with bass on the left
       moving slower and heavier than the treble on the right.
       --------------------------------------------------------------- */
    equalizer: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        float t = u_time;

        float bw  = 0.026;                       // bar pitch
        float idx = floor(uv.x / bw);
        float seed = hash1(idx + 1.0);

        /* low bars swing slowly and stay tall, high bars flicker */
        float tilt  = uv.x;
        float speed = mix(1.1, 3.4, tilt);
        float reach = mix(0.46, 0.20, tilt);

        float wob = sin(t * speed + seed * 6.2831)
                  * 0.5 + 0.5;
        float wob2 = sin(t * speed * 0.47 + seed * 12.0) * 0.5 + 0.5;
        float h = 0.035 + reach * pow(wob * 0.65 + wob2 * 0.35, 1.6);
        h *= 0.75 + 0.25 * beat(t, 124.0);       // whole rig breathes on the beat

        float gap = step(fract(uv.x / bw), 0.66);           // space between bars
        float body = gap * (1.0 - smoothstep(h - 0.012, h, uv.y));
        float cap  = gap * smoothstep(0.014, 0.0, abs(uv.y - h)); // bright tip

        /* colour rises through the bar: red at the base, violet at the top */
        vec3 ramp = mix(RED, MAGENTA, clamp(uv.y / max(h, 0.001), 0.0, 1.0));
        ramp = mix(ramp, VIOLET, clamp((uv.y - h * 0.6) / 0.35, 0.0, 1.0) * 0.5);

        vec3 col = vec3(0.0);
        col += ramp * body * 0.42;
        col += mix(MAGENTA, VIOLET, 0.4) * cap * 0.9;

        /* spill of light above the bars, and a mirrored floor glow */
        col += RED * gap * smoothstep(h + 0.16, h, uv.y) * step(h, uv.y) * 0.06;
        col += mix(RED, VIOLET, 0.3) * smoothstep(0.30, 0.0, uv.y) * 0.05;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       STROBE — beams raking across a dark room from an off-screen rig,
       the way moving heads look through haze. Red with violet spill.
       --------------------------------------------------------------- */
    strobe: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        vec2 m = (u_mouse - 0.5);
        p.y += u_scroll * 0.25;

        float t = u_time * 0.22;
        vec3 col = vec3(0.0);

        /* four beams pivoting about a point above the frame */
        vec2 origin = vec2(m.x * 0.35, 0.95);
        vec2 v = p - origin;
        float ang = atan(v.x, -v.y);              // 0 straight down
        float dist = length(v);

        for (int i = 0; i < 4; i++){
          float fi = float(i);
          float sway = sin(t * (0.7 + fi * 0.17) + fi * 1.9) * 0.55;
          float beam = smoothstep(0.16, 0.0, abs(ang - sway));
          beam *= smoothstep(2.1, 0.15, dist);     // fades with throw
          beam *= 0.55 + 0.45 * beat(u_time + fi * 0.11, 124.0);

          vec3 tint = mix(RED, i == 1 ? VIOLET : MAGENTA, fi * 0.22);
          col += tint * beam * 0.30;
        }

        /* haze the beams pass through, so they are volumes not lines */
        float haze = noise(p * 2.2 + vec2(0.0, u_time * 0.05));
        col *= 0.75 + haze * 0.5;

        /* pool of light on the floor */
        col += RED * smoothstep(0.55, 0.0, length(p - vec2(0.0, -0.75))) * 0.07;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       LASERS — a fan of beams from a rig above the frame, sweeping
       through haze. The falloff is w/(d+w) rather than a smoothstep,
       which gives a hard bright core with a soft bloom around it, so
       the beams stay crisp and visible instead of washing out.
       --------------------------------------------------------------- */
    lasers: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        vec2 m = (u_mouse - 0.5);
        p.y += u_scroll * 0.28;

        float t = u_time;
        vec2 origin = vec2(m.x * 0.45, 1.05);      // rig sits just off screen
        vec2 v = p - origin;
        float ang  = atan(v.x, -v.y);
        float dist = length(v);

        vec3 col = vec3(0.0);

        /* seven beams fanned out, each sweeping at its own rate */
        for (int i = 0; i < 7; i++){
          float fi = float(i);
          float spread = (fi - 3.0) * 0.17;
          float sway = sin(t * (0.28 + fi * 0.045) + fi * 1.6) * 0.30;
          float a = spread + sway;

          float w = 0.0075;
          float line = w / (abs(ang - a) + w);      // crisp core, soft bloom
          line = pow(line, 1.5);
          line *= smoothstep(2.6, 0.10, dist);      // fades with throw
          line *= 0.60 + 0.40 * beat(u_time + fi * 0.08, 124.0);

          vec3 tint = RED;
          if (i == 1 || i == 5) tint = MAGENTA;
          if (i == 3)           tint = mix(MAGENTA, VIOLET, 0.6);

          col += tint * line * 0.42;
        }

        /* haze the beams travel through, added rather than multiplied so
           it lifts the picture instead of dimming it */
        float haze = noise(p * 2.4 + vec2(0.0, t * 0.05));
        col += mix(RED, MAGENTA, 0.4) * haze * 0.035;

        /* bright source where the beams originate, and floor spill */
        col += mix(HOT, vec3(1.0), 0.3) * smoothstep(0.22, 0.0, dist) * 0.55;
        col += RED * smoothstep(0.75, 0.0, length(p - vec2(0.0, -0.85))) * 0.10;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       DISCOBALL — a mirror ball throwing spots of light around a dark
       room. Bright but sparse, so copy laid over it stays readable.
       --------------------------------------------------------------- */
    discoball: `
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        vec2 m = (u_mouse - 0.5);
        p.y += u_scroll * 0.24;

        float t = u_time;
        float pulse = 0.70 + 0.30 * beat(t, 124.0);

        vec3 col = vec3(0.0);
        vec2 ballAt = vec2(m.x * 0.20, 0.62);

        /* 18 spots spread by the golden angle so they never band up */
        for (int i = 0; i < 18; i++){
          float fi = float(i);
          float s  = hash1(fi + 3.0);

          float a   = t * 0.30 + fi * 2.3999;
          float rad = 0.30 + s * 1.05;
          vec2  c   = ballAt + vec2(cos(a) * rad * 1.45,
                                    sin(a * 0.62 + s * 5.0) * rad * 0.70 - 0.55);

          float size = 0.020 + s * 0.026;
          float d = length(p - c);

          /* each spot has a bright centre plus a wide halo */
          float core = smoothstep(size, 0.0, d);
          float halo = smoothstep(size * 5.5, 0.0, d);

          float twinkle = 0.45 + 0.55 * sin(t * 2.2 + fi * 1.9);

          vec3 tint = mix(RED, MAGENTA, s);
          if (i == 4 || i == 11) tint = mix(MAGENTA, VIOLET, 0.7);

          col += tint * (core * 0.85 + halo * 0.10) * twinkle * pulse;
        }

        /* the ball itself: facets catching light, turning slowly */
        float bd = length((p - ballAt) * vec2(1.0, 1.0));
        float ball = smoothstep(0.11, 0.095, bd);
        float facets = sin((p.x - ballAt.x) * 90.0 + t * 1.6)
                     * sin((p.y - ballAt.y) * 90.0);
        col += mix(RED, vec3(1.0), 0.45) * ball * (0.30 + 0.45 * abs(facets)) * pulse;
        col += MAGENTA * smoothstep(0.30, 0.10, bd) * 0.12 * pulse;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       WAVEFORM — a track scrolling past, drawn the way DJ software
       draws one: mirrored around a centre line, quantised into columns,
       with a bright playhead fixed in the middle of the frame.
       --------------------------------------------------------------- */
    waveform: `
      /* amplitude of one column, built from a few sines so it has the
         loud/quiet structure of an actual track rather than pure noise */
      float amplitude(float x){
        float body = 0.34
          + 0.26 * sin(x * 0.90)
          + 0.16 * sin(x * 2.30 + 1.7)
          + 0.10 * sin(x * 5.10 + 0.4);
        float detail = hash1(floor(x * 6.0)) * 0.30;      // per-transient jitter
        return clamp(body * 0.75 + detail, 0.05, 1.0);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        float t = u_time;

        /* the track scrolls right to left; scroll position nudges it on */
        float x = uv.x * 12.0 + t * 0.85 + u_scroll * 4.0;

        float cols = 190.0;                    // column pitch across the frame
        float ci   = floor(uv.x * cols);
        float cx   = (ci / cols) * 12.0 + t * 0.85 + u_scroll * 4.0;

        float h = amplitude(cx) * 0.30;
        h *= 0.80 + 0.20 * beat(t, 124.0);

        float gap = step(fract(uv.x * cols), 0.72);
        float d   = abs(uv.y - 0.5);

        float body = gap * (1.0 - smoothstep(h - 0.006, h, d));
        float edge = gap * smoothstep(0.010, 0.0, abs(d - h));   // lit tips

        /* low frequencies drawn deeper red at the core, highs violet out
           toward the peaks, the way a coloured waveform is shaded */
        vec3 ramp = mix(RED, MAGENTA, clamp(d / max(h, 0.001), 0.0, 1.0));
        ramp = mix(ramp, VIOLET, smoothstep(0.55, 1.0, d / max(h, 0.001)) * 0.55);

        vec3 col = vec3(0.0);
        col += ramp * body * 0.40;
        col += mix(MAGENTA, VIOLET, 0.35) * edge * 0.55;

        /* playhead: the fixed line the track runs under */
        float head = smoothstep(0.0016, 0.0, abs(uv.x - 0.5));
        col += mix(HOT, vec3(1.0), 0.35) * head * 0.5;
        col += HOT * smoothstep(0.05, 0.0, abs(uv.x - 0.5)) * 0.05;

        /* centre line through the whole waveform */
        col += RED * smoothstep(0.0012, 0.0, d) * 0.30;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       SPARKS — embers rising and fading, the cold spark fountains from
       the Headline package. Columns each carry their own ember so the
       effect stays cheap: no particle system, just cell maths.
       --------------------------------------------------------------- */
    sparks: `
      /* one layer of embers. cells sets the density, size the ember. */
      vec3 emberLayer(vec2 uv, float cells, float size, float speed, float seedOff, float t){
        float ci   = floor(uv.x * cells);
        float seed = hash1(ci + seedOff);

        float rise  = fract(t * (speed * (0.55 + seed * 0.9)) + seed * 9.7);
        float drift = sin(t * (0.5 + seed) + seed * 12.0) * 0.020;

        vec2 pos = vec2((ci + 0.5) / cells + drift, rise);

        /* stretch vertically so each ember reads as a streak, not a dot */
        vec2 q = (uv - pos) * vec2(1.0, 0.42);
        float e = smoothstep(size, 0.0, length(q));

        float fade = (1.0 - rise) * smoothstep(0.0, 0.12, rise);  // born low, die high
        vec3 tint = mix(AMBER, RED, rise);                        // cool as they climb
        tint = mix(tint, MAGENTA, smoothstep(0.6, 1.0, rise) * 0.5);

        return tint * e * fade;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        float t = u_time;

        vec2 m = (u_mouse - 0.5);
        uv.x += m.x * 0.02;                    // embers lean with the cursor

        vec3 col = vec3(0.0);
        col += emberLayer(uv, 14.0, 0.030, 0.16,  0.0, t) * 0.85;
        col += emberLayer(uv, 23.0, 0.019, 0.24, 31.0, t) * 0.65;
        col += emberLayer(uv, 37.0, 0.011, 0.34, 77.0, t) * 0.45;

        /* the fountains themselves: glow banked along the bottom edge */
        float base = smoothstep(0.26, 0.0, uv.y);
        col += mix(AMBER, RED, 0.55) * base * 0.13;
        col += RED * smoothstep(0.60, 0.0, uv.y) * 0.04;

        /* soft kick on the beat so it feels tied to the music */
        col *= 0.90 + 0.10 * beat(t, 124.0);

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,

    /* ---------------------------------------------------------------
       RIBBONS — the earlier abstract look, kept so it can be compared.
       --------------------------------------------------------------- */
    ribbons: `
      float ribbon(vec2 p, float seed, float speed, float amp, float thick, float t){
        float y = sin(p.x * 1.05 + t * speed + seed) * amp
                + sin(p.x * 2.30 - t * speed * 0.6 + seed * 2.1) * amp * 0.45
                + (noise(vec2(p.x * 0.55, t * 0.09 + seed)) - 0.5) * amp * 1.1;
        return pow(smoothstep(thick, 0.0, abs(p.y - y)), 1.7);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res.xy;
        vec2 p  = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
        float t = u_time * 0.14;
        vec2 m = (u_mouse - 0.5);
        p   += m * 0.09;
        p.y += u_scroll * 0.30;

        vec3 col = vec3(0.0);
        col += RED                 * ribbon(p * vec2(0.85,1.0), 0.0, 0.42, 0.26, 0.34, t) * 0.40;
        col += mix(RED, HOT, 0.45) * ribbon(p * vec2(1.15,1.0), 2.4, 0.60, 0.17, 0.20, t) * 0.30;
        col += HOT                 * ribbon(p * vec2(1.60,1.0), 5.1, 0.85, 0.10, 0.11, t) * 0.20;
        col += RED * smoothstep(0.80, 0.0, length(p - m * 0.7)) * 0.09;

        col *= vignette(uv);
        col += grain(gl_FragCoord.xy, u_time);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  };

  /* ------------------------------------------------------------------
     compile + link
     ------------------------------------------------------------------ */
  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[gl] shader failed:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  // one full-screen triangle pair, shared by every program
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  let prog = null, uRes, uTime, uMouse, uScroll;

  function useShader(name) {
    const body = SHADERS[name] || SHADERS[FALLBACK_BACKGROUND] || SHADERS.waves;

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, COMMON + body);
    if (!vs || !fs) return false;

    const next = gl.createProgram();
    gl.attachShader(next, vs);
    gl.attachShader(next, fs);
    gl.linkProgram(next);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(next, gl.LINK_STATUS)) {
      console.warn("[gl] link failed:", gl.getProgramInfoLog(next));
      gl.deleteProgram(next);
      return false;
    }

    if (prog) gl.deleteProgram(prog);        // don't leak the old one
    prog = next;
    gl.useProgram(prog);

    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    uRes    = gl.getUniformLocation(prog, "u_res");
    uTime   = gl.getUniformLocation(prog, "u_time");
    uMouse  = gl.getUniformLocation(prog, "u_mouse");
    uScroll = gl.getUniformLocation(prog, "u_scroll");
    resize();
    return true;
  }

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
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
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
    if (!running || !prog) return;
    resize();
    mx += (tx - mx) * 0.05;      // ease toward the cursor, never snap
    my += (ty - my) * 0.05;
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.uniform1f(uScroll, scroll);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }

  /* Page decides the look; ?bg=name overrides it so backgrounds can be
     compared without editing this file. preview-background.html uses it. */
  const page   = document.body.dataset.page || "home";
  const forced = new URLSearchParams(location.search).get("bg");
  const chosen = forced || PAGE_BACKGROUNDS[page] || FALLBACK_BACKGROUND;

  if (!useShader(chosen)) { canvas.style.display = "none"; return; }

  /* let the preview page swap looks live */
  window.setBackground = (name) => useShader(name);
  window.BACKGROUNDS = Object.keys(SHADERS);

  requestAnimationFrame(frame);
})();
