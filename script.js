// ===== Change the password here if you want (not case-sensitive) =====
const PASSWORD = "AJJU";

const gate = document.getElementById("gate");
const form = document.getElementById("passwordForm");
const input = document.getElementById("passwordInput");
const gateStatus = document.getElementById("gateStatus");
const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================================
   ROMANTIC PARTICLE ENGINE  (floating hearts, rose petals, sparkles, bokeh)
   ===================================================================== */
function makeSprite(size, draw) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  return c;
}
function heartPath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy + s * 0.4);
  x.bezierCurveTo(cx + s, cy - s * 0.2, cx + s * 0.55, cy - s * 0.95, cx, cy - s * 0.35);
  x.bezierCurveTo(cx - s * 0.55, cy - s * 0.95, cx - s, cy - s * 0.2, cx, cy + s * 0.4);
  x.closePath();
}
const heartSprites = [["#ffe8b3", "#ffc02d"], ["#ffdd8f", "#e8aa18"], ["#fff1d0", "#ffce5a"], ["#ffd77a", "#c28f18"], ["#ffedc2", "#ffca4f"], ["#e6efff", "#6f8dff"], ["#cfdcff", "#4a67d6"]].map(([light, dark]) =>
  makeSprite(64, (x, n) => {
    const g = x.createRadialGradient(n * 0.4, n * 0.36, 2, n / 2, n / 2, n * 0.42);
    g.addColorStop(0, light); g.addColorStop(1, dark);
    x.shadowColor = dark; x.shadowBlur = 9;
    x.fillStyle = g;
    heartPath(x, n / 2, n / 2 + 2, 22);
    x.fill();
  })
);
const petalSprites = [["#ffe19b", "#c28f18"], ["#ffd77a", "#9c7312"], ["#ffedc2", "#e8b745"], ["#dfe9ff", "#4a67d6"]].map(([light, dark]) =>
  makeSprite(48, (x, n) => {
    const g = x.createLinearGradient(n * 0.3, 0, n * 0.7, n);
    g.addColorStop(0, light); g.addColorStop(1, dark);
    x.fillStyle = g;
    const cx = n / 2, cy = n / 2, s = 18;
    x.beginPath();
    x.moveTo(cx, cy - s);
    x.bezierCurveTo(cx + s * 0.85, cy - s * 0.55, cx + s * 0.7, cy + s * 0.55, cx, cy + s);
    x.bezierCurveTo(cx - s * 0.7, cy + s * 0.55, cx - s * 0.85, cy - s * 0.55, cx, cy - s);
    x.closePath();
    x.fill();
  })
);
const sparkleSprite = makeSprite(32, (x, n) => {
  const c = n / 2;
  x.shadowColor = "#fff3d6"; x.shadowBlur = 8;
  x.fillStyle = "#fffcf4";
  x.beginPath();
  x.moveTo(c, 2);
  x.quadraticCurveTo(c, c, n - 2, c);
  x.quadraticCurveTo(c, c, c, n - 2);
  x.quadraticCurveTo(c, c, 2, c);
  x.quadraticCurveTo(c, c, c, 2);
  x.closePath();
  x.fill();
});
const bokehSprite = makeSprite(128, (x, n) => {
  const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, "rgba(255,224,150,.55)");
  g.addColorStop(0.6, "rgba(255,206,90,.18)");
  g.addColorStop(1, "rgba(255,206,90,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, n, n);
});

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function createFx(canvas, density) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, items = [], raf = 0, running = false, last = 0, time = 0, wanted = false;
  const scale = (reduceMotion ? 0.5 : 1) * (density || 1);

  function make(type, initial) {
    const p = { type, ph: rnd(0, 6.28) };
    if (type === "heart") {
      p.spr = heartSprites[Math.floor(Math.random() * heartSprites.length)];
      p.size = rnd(0.5, 1.4); p.x = rnd(0, w); p.y = initial ? rnd(0, h) : h + 40;
      p.vy = rnd(0.35, 1.1); p.sp = rnd(0.6, 1.6); p.amp = rnd(10, 38);
      p.rot = rnd(-0.4, 0.4); p.vr = rnd(-0.004, 0.004); p.a = rnd(0.5, 0.95);
    } else if (type === "petal") {
      p.spr = petalSprites[Math.floor(Math.random() * petalSprites.length)];
      p.size = rnd(0.6, 1.2); p.x = rnd(0, w); p.y = initial ? rnd(0, h) : -30;
      p.vy = rnd(0.5, 1.3); p.sp = rnd(0.5, 1.3); p.amp = rnd(20, 60);
      p.rot = rnd(0, 6.28); p.vr = rnd(-0.03, 0.03); p.flip = rnd(1, 2.4); p.a = rnd(0.55, 0.9);
    } else if (type === "sparkle") {
      p.size = rnd(0.25, 0.8); p.x = rnd(0, w); p.y = rnd(0, h); p.tw = rnd(1.2, 3.4); p.a = rnd(0.5, 1);
    } else {
      p.size = rnd(1.2, 3.2); p.x = rnd(0, w); p.y = rnd(0, h);
      p.vy = rnd(0.05, 0.18); p.sp = rnd(0.15, 0.4); p.amp = rnd(20, 60); p.a = rnd(0.35, 0.8);
    }
    return p;
  }
  function build() {
    const area = w * h;
    const n = (k, lo, hi) => Math.round(clamp(area / k * scale, lo * (scale < 1 ? 0.5 : 1), hi));
    items = [];
    for (let i = 0; i < n(30000, 9, 30); i++) items.push(make("heart", true));
    for (let i = 0; i < n(42000, 7, 22); i++) items.push(make("petal", true));
    for (let i = 0; i < n(15000, 18, 64); i++) items.push(make("sparkle", true));
    for (let i = 0; i < (reduceMotion ? 3 : 6); i++) items.push(make("bokeh", true));
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(50, now - (last || now)) / 16.667;
    last = now;
    time += dt / 60;
    ctx.clearRect(0, 0, w, h);
    // draw order: glow layers first, then petals and hearts on top
    for (let pass = 0; pass < 3; pass++) {
      ctx.globalCompositeOperation = pass === 0 ? "lighter" : "source-over";
      for (let i = 0; i < items.length; i++) {
        const p = items[i];
        const isGlow = p.type === "bokeh" || p.type === "sparkle";
        if ((pass === 0) !== isGlow && pass !== 2) continue;
        if (pass === 2 && p.type !== "heart") continue;
        if (pass === 1 && p.type !== "petal") continue;
        draw(p, dt);
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  function draw(p, dt) {
    if (p.type === "heart") {
      p.y -= p.vy * dt; p.rot += p.vr * dt;
      if (p.y < -40) Object.assign(p, make("heart", false));
      const px = p.x + Math.sin(time * p.sp + p.ph) * p.amp;
      const f = Math.min(1, Math.max(0, (h - p.y) / 80), Math.max(0, p.y / 120));
      ctx.globalAlpha = p.a * f;
      ctx.save(); ctx.translate(px, p.y); ctx.rotate(p.rot + Math.sin(time * p.sp + p.ph) * 0.2); ctx.scale(p.size, p.size);
      ctx.drawImage(p.spr, -32, -32); ctx.restore();
    } else if (p.type === "petal") {
      p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > h + 30) Object.assign(p, make("petal", false));
      const px = p.x + Math.sin(time * p.sp + p.ph) * p.amp;
      const f = Math.min(1, Math.max(0, p.y / 60), Math.max(0, (h - p.y) / 60 + 0.4));
      ctx.globalAlpha = p.a * f;
      ctx.save(); ctx.translate(px, p.y); ctx.rotate(p.rot); ctx.scale(p.size * Math.cos(time * p.flip + p.ph) * 0.9 + 0.1 * p.size, p.size);
      ctx.drawImage(p.spr, -24, -24); ctx.restore();
    } else if (p.type === "sparkle") {
      const t = 0.5 + 0.5 * Math.sin(time * p.tw * 3 + p.ph);
      ctx.globalAlpha = p.a * t;
      const s = p.size * (0.5 + t * 0.7);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(t * 0.8); ctx.scale(s, s);
      ctx.drawImage(sparkleSprite, -16, -16); ctx.restore();
    } else {
      p.y -= p.vy * dt;
      if (p.y < -120) { p.y = h + 120; p.x = rnd(0, w); }
      const px = p.x + Math.sin(time * p.sp + p.ph) * p.amp;
      ctx.globalAlpha = p.a * 0.35;
      const s = 64 * p.size;
      ctx.drawImage(bokehSprite, px - s, p.y - s, s * 2, s * 2);
    }
  }
  function start() {
    wanted = true;
    if (running) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { wanted = false; running = false; cancelAnimationFrame(raf); }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else if (wanted && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
  });
  window.addEventListener("resize", () => { if (wanted) resize(); });
  resize();
  return { start, stop };
}

const gateFx = createFx(document.getElementById("gateFx"), 1.15);
const appFx = createFx(document.getElementById("appFx"), 1);
gateFx.start();

/* =====================================================================
   HEART BURSTS, TAP HEARTS, CELEBRATIONS (DOM based)
   ===================================================================== */
function spawnHeart(o) {
  const el = document.createElement("span");
  el.className = "pop-heart";
  el.textContent = o.char;
  el.style.left = o.x + "px";
  el.style.top = o.y + "px";
  el.style.fontSize = o.size + "px";
  if (o.color) el.style.color = o.color;
  el.style.transition = "transform " + o.dur + "ms cubic-bezier(.12,.7,.3,1), opacity " + o.dur + "ms ease-in";
  el.style.transform = "translate(0px,0px) rotate(0deg) scale(.6)";
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.style.transform = "translate(" + o.dx + "px," + o.dy + "px) rotate(" + o.rot + "deg) scale(1)";
    el.style.opacity = "0";
  }));
  setTimeout(() => el.remove(), o.dur + 100);
}
const heartChars = ["♥", "♥", "♡", "💛", "✨"];
function burstHearts(n, x, y) {
  n = n || 32;
  x = x === undefined ? window.innerWidth / 2 : x;
  y = y === undefined ? window.innerHeight * 0.55 : y;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, d = rnd(110, 420);
    spawnHeart({ char: heartChars[i % heartChars.length], x, y, size: rnd(14, 36),
      dx: Math.cos(a) * d, dy: Math.sin(a) * d - 130, rot: rnd(-200, 200), dur: rnd(1500, 2300) });
  }
}
function tapBurst(x, y) {
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2, d = rnd(35, 95);
    spawnHeart({ char: i % 3 ? "♥" : "♡", x, y, size: rnd(10, 20),
      dx: Math.cos(a) * d, dy: Math.sin(a) * d - 40, rot: rnd(-90, 90), dur: rnd(700, 1100) });
  }
}
function heartFountain(ms) {
  const end = Date.now() + (ms || 2600);
  const id = setInterval(() => {
    if (Date.now() > end) { clearInterval(id); return; }
    for (let i = 0; i < 3; i++) {
      spawnHeart({ char: heartChars[Math.floor(Math.random() * heartChars.length)],
        x: rnd(0, window.innerWidth), y: window.innerHeight + 10, size: rnd(14, 34),
        dx: rnd(-90, 90), dy: -(window.innerHeight * rnd(0.55, 1)), rot: rnd(-120, 120), dur: rnd(2200, 3400) });
    }
  }, 120);
}
function sadRain() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => spawnHeart({ char: "💔", x: rnd(10, window.innerWidth - 30), y: -30, size: rnd(20, 34),
      dx: rnd(-40, 40), dy: window.innerHeight + 80, rot: rnd(-60, 60), dur: rnd(2400, 3600) }), i * 220);
  }
}
function celebrate() {
  [0, 450, 950].forEach(t => setTimeout(() =>
    burstHearts(20, rnd(window.innerWidth * 0.2, window.innerWidth * 0.8), rnd(window.innerHeight * 0.25, window.innerHeight * 0.5)), t));
  heartFountain(2200);
}
let lastTap = 0;
document.addEventListener("pointerdown", (e) => {
  const now = Date.now();
  if (now - lastTap < 70) return;
  lastTap = now;
  if (e.target.closest && e.target.closest("input")) return;
  tapBurst(e.clientX, e.clientY);
});

/* =====================================================================
   DECORATIONS (fairy lights, city lights, letter-by-letter title, stagger)
   ===================================================================== */
(function buildDecor() {
  // fairy lights hanging on the three garland swags
  const garland = document.getElementById("garland");
  const perSwag = 6;
  for (let s = 0; s < 3; s++) {
    for (let k = 0; k < perSwag; k++) {
      const f = (k + 0.5) / perSwag;
      const b = document.createElement("i");
      b.className = "bulb" + ((s * perSwag + k) % 3 === 1 ? " pk" : "");
      b.style.left = ((s + f) / 3 * 100) + "%";
      b.style.top = (40 * 4 * f * (1 - f)) + "px";
      b.style.animationDelay = (-Math.random() * 2.4).toFixed(2) + "s";
      b.style.animationDuration = (1.8 + Math.random() * 1.6).toFixed(2) + "s";
      garland.appendChild(b);
    }
  }
  // tiny city lights on the hills
  const city = document.getElementById("city");
  for (let i = 0; i < 46; i++) {
    const d = document.createElement("i");
    if (i % 3 === 0) d.className = "pk";
    d.style.left = (Math.random() * 100) + "%";
    d.style.top = (Math.random() * 100) + "%";
    d.style.animationDelay = (-Math.random() * 3).toFixed(2) + "s";
    d.style.animationDuration = (2 + Math.random() * 3).toFixed(2) + "s";
    city.appendChild(d);
  }
  // letter-by-letter title
  let idx = 0;
  document.querySelectorAll(".split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", idx++);
      s.textContent = ch === " " ? "\u00A0" : ch;
      el.appendChild(s);
    }
  });
  // staggered entrance delays
  const heroDelays = [0.2, 1.55, 1.95, 2.3];
  document.querySelectorAll(".page").forEach((page, pi) => {
    page.querySelectorAll(".rv").forEach((el, i) => {
      const d = pi === 0 ? (heroDelays[i] !== undefined ? heroDelays[i] : 2.3) : 0.15 + i * 0.14;
      el.style.setProperty("--d", d.toFixed(2) + "s");
    });
  });
  document.querySelectorAll(".letter-scroll p").forEach((p, i) => {
    p.style.setProperty("--pd", Math.min(0.9 + i * 0.18, 2.7).toFixed(2) + "s");
  });
})();

/* =====================================================================
   PASSWORD GATE
   ===================================================================== */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = input.value.trim();
  if (value.toUpperCase() !== PASSWORD) {
    gateStatus.textContent = "Oops, that's not it 💔 try again";
    input.classList.remove("bad"); void input.offsetWidth; input.classList.add("bad");
    return;
  }
  input.disabled = true;
  form.querySelector("button").disabled = true;
  gateStatus.textContent = "Checking your heart... 💛";
  setTimeout(() => { gateStatus.textContent = "Unlocking your surprise... ✨"; }, 900);
  setTimeout(() => { gateStatus.textContent = "Welcome, AJJU ♡"; burstHearts(36); }, 1800);
  setTimeout(() => {
    appFx.start();
    gate.classList.add("done");
    setTimeout(() => gateFx.stop(), 1000);
  }, 2600);
});

/* =====================================================================
   MAKE A WISH (finale): blow out the candles
   ===================================================================== */
const cake = document.getElementById("cake");
const blowBtn = document.getElementById("blowBtn");
const wishMsg = document.getElementById("wishMsg");
const wishEyebrow = document.getElementById("wishEyebrow");
const wishTitle = document.getElementById("wishTitle");
let blown = false;
function resetWish() {
  blown = false;
  cake.classList.remove("out");
  blowBtn.style.display = "";
  wishMsg.classList.remove("show");
  wishEyebrow.textContent = "MAKE A WISH 🌠";
  wishTitle.innerHTML = "Close your eyes,<br><em>make a wish...</em>";
}
function blowCandles() {
  if (blown) return;
  blown = true;
  cake.classList.add("out");
  blowBtn.style.display = "none";
  setTimeout(() => {
    wishEyebrow.textContent = "HAPPY BIRTHDAY, AJJU 🎂";
    wishTitle.innerHTML = "Your wish is<br><em>on its way...</em> 🌠";
    wishMsg.classList.add("show");
    celebrate();
    const pg = document.querySelector(".final-page");
    pg.scrollTo({ top: pg.scrollHeight, behavior: "smooth" });
  }, 1000);
}
blowBtn.addEventListener("click", blowCandles);
cake.addEventListener("click", blowCandles);

/* =====================================================================
   PAGES
   ===================================================================== */
const pages = [...document.querySelectorAll(".page")];
const dots = document.getElementById("dots");
pages.forEach((_, i) => { const d = document.createElement("i"); if (i === 0) d.classList.add("active"); dots.appendChild(d); });
const dotEls = [...dots.children];

let current = 0;
const QUESTION_INDEX = 2;
let yesNoLocked = false;
let noTaps = 0;

// Single gate for all navigation: nobody can jump past the question until it's answered.
function goTo(i, { force = false } = {}) {
  i = Math.max(0, Math.min(pages.length - 1, i));
  if (!force && current <= QUESTION_INDEX && i > QUESTION_INDEX && !yesNoLocked) {
    pages[QUESTION_INDEX].classList.remove("shake");
    void pages[QUESTION_INDEX].offsetWidth;
    pages[QUESTION_INDEX].classList.add("shake");
    return;
  }
  current = i;
  pages.forEach((p, j) => p.classList.toggle("active", j === i));
  dotEls.forEach((d, j) => d.classList.toggle("active", j === i));
  pages[i].scrollTop = 0;
  const ls = pages[i].querySelector(".letter-scroll");
  if (ls) ls.scrollTop = 0;
  if (i === 3) setTimeout(() => heartFountain(2800), 350);
  if (i === 4) setTimeout(sadRain, 300);
  if (i === 5) resetWish();
}
goTo(0, { force: true });

document.querySelectorAll(".next").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target ? Number(btn.dataset.target) : Number(btn.closest(".page").dataset.page) + 1;
    goTo(target);
  });
});

/* =====================================================================
   QUESTION: YES / NO
   ===================================================================== */
const yes = document.getElementById("yesBtn");
const no = document.getElementById("noBtn");
const note = document.getElementById("questionNote");
const teaseLines = ["Nice try 😌 tap YES", "Nope, not that one 👀", "Last chance... 😏"];
const tapSticker = document.getElementById("tapSticker");
const tapStickerSrcs = ["sticker-no1.webp", "sticker-no2.webp"];

yes.addEventListener("click", () => {
  if (yesNoLocked) return;
  yesNoLocked = true;
  const r = yes.getBoundingClientRect();
  burstHearts(34, r.left + r.width / 2, r.top + r.height / 2);
  setTimeout(() => goTo(3), 450);
});

no.addEventListener("click", () => {
  if (yesNoLocked) return;
  noTaps++;
  if (noTaps < 3) {
    dodgeNoButton();
    note.textContent = teaseLines[noTaps - 1];
    tapSticker.src = tapStickerSrcs[noTaps - 1];
    tapSticker.style.display = "block";
    tapSticker.style.animation = "none"; void tapSticker.offsetWidth; tapSticker.style.animation = "";
    return;
  }
  yesNoLocked = true;
  note.textContent = "Okayyy... I heard you 😭😂";
  resetNoButton();
  setTimeout(() => goTo(4, { force: true }), 500);
});

function resetNoButton() {
  no.style.transition = "none";
  no.style.position = ""; no.style.left = ""; no.style.top = ""; no.style.zIndex = "";
}

// Moves the NO button somewhere else on screen (never on top of YES, never off-screen)
function dodgeNoButton() {
  no.style.transition = "none";
  no.style.position = "relative";
  no.style.left = "0px";
  no.style.top = "0px";
  const base = no.getBoundingClientRect();
  const y = yes.getBoundingClientRect();
  const m = 14, vw = window.innerWidth, vh = window.innerHeight;
  const minX = m, maxX = Math.max(m, vw - base.width - m);
  const minY = 74, maxY = Math.max(minY, vh - base.height - m);
  let tx = base.left, ty = base.top;
  for (let k = 0; k < 30; k++) {
    const cx = rnd(minX, maxX), cy = rnd(minY, maxY);
    const far = Math.hypot(cx - base.left, cy - base.top) > 90;
    const hitsYes = cx < y.right + 12 && cx + base.width > y.left - 12 && cy < y.bottom + 12 && cy + base.height > y.top - 12;
    if (far && !hitsYes) { tx = cx; ty = cy; break; }
  }
  void no.offsetWidth;
  no.style.zIndex = "5";
  no.style.transition = "left .28s cubic-bezier(.3,1.4,.5,1), top .28s cubic-bezier(.3,1.4,.5,1)";
  no.style.left = (tx - base.left) + "px";
  no.style.top = (ty - base.top) + "px";
}

document.getElementById("tryAgain").addEventListener("click", () => {
  yesNoLocked = false;
  noTaps = 0;
  resetNoButton();
  note.textContent = "No escaping this one 😌";
  tapSticker.style.display = "none";
  goTo(2, { force: true });
});

/* =====================================================================
   CLOSE
   ===================================================================== */
const exitBtn = document.getElementById("exitBtn");
const closedScreen = document.getElementById("closedScreen");
exitBtn.addEventListener("click", () => {
  // Most mobile browsers block script-closing a normal tab, so window.close()
  // may do nothing — the closed screen below is the fallback.
  window.close();
  appFx.stop();
  gateFx.stop();
  closedScreen.classList.add("show");
});

// Safety net: the app shell must never scroll by itself (focus / anchors / browser quirks).
[document.getElementById("app"), gate, document.documentElement, document.body].forEach((el) => {
  el.addEventListener("scroll", () => { if (el.scrollTop || el.scrollLeft) { el.scrollTop = 0; el.scrollLeft = 0; } });
});
