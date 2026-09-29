/* ============ Business details: edit these ============ */
const CONTACT = {
  phone: "083 800 1933",
  email: "info@bigbearplanetariums.ie",
  website: "www.bigbearplanetariums.ie",
  facebook: "https://www.facebook.com/bigbearplanetariums/",
  // Web3Forms access key. Public by design: it can only send enquiries to the inbox it was created for.
  formKey: "47ff878f-e509-42d6-8d65-c19a8d2cd3b7"
};

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
const root = document.documentElement;

/* ============ Hero video: only play while it is on screen, not covered by a menu or player ============ */
const heroEl = $('#heroVid');
let heroReady = false, heroVisible = true;
function heroSync() {
  if (!heroEl) return;
  const covered = root.classList.contains('menu-lock') || !!document.querySelector('.lightbox.on');
  const want = heroReady && heroVisible && !covered && !document.hidden && !document.prerendering;
  if (want) heroEl.play().catch(() => {}); else heroEl.pause();
}
if (heroEl) {
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; heroSync(); }).observe($('#heroMedia') || heroEl);
  document.addEventListener('visibilitychange', heroSync);
  document.addEventListener('prerenderingchange', heroSync);
}

/* ============ Intro: logo video + warp-speed starfield ============ */
(() => {
  const intro = $('#intro'), vid = $('#logoVid'), bar = $('#introBar'), hero = $('#heroVid');
  if (!intro) {
    document.body.classList.remove('loading');
    requestAnimationFrame(() => document.body.classList.add('ready'));
    const go = () => setTimeout(() => { heroReady = true; if (heroEl) heroEl.preload = 'auto'; heroSync(); }, 250);
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
    return;
  }
  const c = $('#introStars'), x = c.getContext('2d', {alpha: false});
  let w, h, stars = [], speed = 3, target = 3, running = true, done = false, last = 0, frames = 0, acc = 0;
  // Render at CSS-pixel resolution: streaks don't need retina detail and it's 4x cheaper on phones
  const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  size();
  // Phone browsers resize the page when the address bar hides. Resetting the canvas then makes the stars flash, so ignore small height-only changes.
  addEventListener('resize', () => { if (innerWidth !== w || Math.abs(innerHeight - h) > 160) size(); });
  const N = Math.round(Math.min(420, Math.max(160, innerWidth * innerHeight / 3000)));
  const spawn = (s, far) => { s.x = (Math.random() - .5) * w * 2; s.y = (Math.random() - .5) * h * 2; s.z = far ? w : Math.random() * w; s.pz = s.z; return s; };
  for (let i = 0; i < N; i++) stars.push(spawn({}));
  const loop = now => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 16.67, 3) : 1; last = now; // frame-rate independent
    // Slow phone? After ~20 frames, halve the star count (and flag the page so the background stays light too)
    if (frames < 40 && last) { frames++; if (frames > 6) acc += dt * 16.67; if (frames === 40) { const avg = acc / 34; if (avg > 30) { stars.length = Math.ceil(stars.length * (avg > 45 ? .4 : .6)); document.documentElement.dataset.perf = 'low'; } } }
    speed += (target - speed) * Math.min(1, .06 * dt);
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, k = w * .5;
    // Batch streaks into 4 depth buckets: one stroke() per bucket instead of one per star
    const B = [[], [], [], []];
    for (const s of stars) {
      s.z -= speed * dt;
      if (s.z < 1) { spawn(s, true); continue; }
      const sx = s.x / s.z * k + cx, sy = s.y / s.z * k + cy;
      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) { spawn(s, true); continue; }
      const tz = s.z + speed * dt * 1.8;
      B[Math.min(3, (4 * (1 - s.z / w)) | 0)].push(s.x / tz * k + cx, s.y / tz * k + cy, sx, sy);
    }
    x.lineCap = 'round';
    for (let b = 0; b < 4; b++) {
      const a = B[b]; if (!a.length) continue;
      x.globalAlpha = [.3, .55, .8, 1][b]; x.lineWidth = [.6, 1.1, 1.7, 2.5][b]; x.strokeStyle = b > 2 ? '#fff' : '#c8d4ff';
      x.beginPath();
      for (let n = 0; n < a.length; n += 4) { x.moveTo(a[n], a[n + 1]); x.lineTo(a[n + 2], a[n + 3]); }
      x.stroke();
    }
    x.globalAlpha = 1;
    requestAnimationFrame(loop);
  };
  // The hand-off used to start the hero video, the background starfield, the nebula and all the text animations in the same instant
  // the intro opened, which froze phones for up to a second. Now each piece starts in its own turn.
  const reveal = () => {
    document.body.classList.add('ready');                                    // hero text: compositor-only, cheap
    setTimeout(() => document.body.classList.remove('loading'), 450);        // background fades in after the overlay is gone
    setTimeout(() => { heroReady = true; if (heroEl) heroEl.preload = 'auto'; heroSync(); }, 900); // video decode last; poster shows meanwhile
    if (window.__fixHash) setTimeout(window.__fixHash, 500);                    // a link like /#videos: re-aim now that the page is unlocked
  };
  const finish = instant => {
    if (done) return; done = true;
    try { sessionStorage.setItem('bb-intro', '1'); } catch (e) {}
    if (instant) { intro.classList.add('gone'); running = false; document.body.classList.remove('loading'); reveal(); return; }
    target = 90; intro.classList.add('warp');
    setTimeout(() => { intro.classList.add('open'); requestAnimationFrame(() => setTimeout(reveal, 120)); }, 650);
    intro.addEventListener('transitionend', function te(e) { if (e.target !== intro || e.propertyName !== 'opacity') return; intro.removeEventListener('transitionend', te); intro.classList.add('gone'); running = false; vid.pause(); });
    setTimeout(() => { if (!intro.classList.contains('gone')) { intro.classList.add('gone'); running = false; vid.pause(); } }, 1700); // safety net if transitionend never fires
  };
  $('#skip').onclick = () => finish();

  let seen = false;
  try { seen = sessionStorage.getItem('bb-intro') === '1'; } catch (e) {}
  if (reduce || seen) { finish(true); return; }
  requestAnimationFrame(loop);

  // Fallback animation if the video can't autoplay (e.g. iPhone low-power mode)
  const fallback = () => {
    if (intro.classList.contains('playing') || done) return;
    intro.classList.add('fallback');
    const t = $('#introTitle'), txt = t.textContent; t.textContent = '';
    [...txt].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? '\u00a0' : ch; s.style.animationDelay = (.9 + i * .03) + 's'; t.appendChild(s); });
    target = 8;
    bar.style.transition = 'width 2.6s linear'; requestAnimationFrame(() => bar.style.width = '100%');
    setTimeout(() => finish(), 2800);
  };
  vid.addEventListener('playing', () => { intro.classList.add('playing'); target = 5; }, {once: true});
  // Progress bar + star speed follow the video (5.7s): the video's own warp runs ~3.5s-4.7s
  const sync = () => {
    if (done || !vid.duration) return;
    const t = vid.currentTime;
    bar.style.width = (t / vid.duration * 100) + '%';
    target = t > 3.4 && t < 4.7 ? 22 : t >= 4.7 ? 4 : 5;
    if (vid.duration - t < .25) return finish();
    if ('requestVideoFrameCallback' in vid) vid.requestVideoFrameCallback(sync); else requestAnimationFrame(sync);
  };
  vid.addEventListener('playing', sync, {once: true});
  vid.addEventListener('ended', () => finish());
  const p = vid.play(); if (p && p.catch) p.catch(fallback);
  setTimeout(fallback, 1800);
  setTimeout(() => finish(), 10000); // hard safety net
})();

/* ============ Starfield, shooting stars, comet cursor ============ */
(() => {
  const c = $('#stars'), x = c.getContext('2d');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let w, h, dpr, stars = [], shoot = [], trail = [], mx = 0, my = 0, px0 = -1, py0 = -1, sy = 0, nextShot = 60, cx = 0, cy = 0, trimmed = false, lastT = 0, drawn = false;
  const resize = () => {
    // Phones get a 1x canvas: the dots are tiny, and a 3x canvas is 9x the pixels to clear and repaint every frame
    dpr = fine ? Math.min(devicePixelRatio || 1, 2) : 1;
    w = c.width = Math.round(innerWidth * dpr); h = c.height = Math.round(innerHeight * dpr);
    const n = Math.min(420, Math.floor(innerWidth * innerHeight / 3200)) >> (root.dataset.perf === 'low' ? 1 : 0);
    stars = Array.from({length: n}, () => {
      const z = Math.random() ** 2 * .9 + .1, hue = [220, 220, 220, 45, 265, 190][Math.floor(Math.random() * 6)];
      return {x: Math.random() * w, y: Math.random() * h, z, r: (z * 1.5 + .25) * dpr, t: Math.random() * 6.28, sp: .01 + Math.random() * .03,
        fill: `hsl(${hue} 100% 88%)`, line: `hsl(${hue} 100% 92%)`, glint: z > .85 && Math.random() < .5};
    });
  };
  resize();
  let lw = innerWidth, lh = innerHeight;
  // Phone address bars resize the page while you scroll; rebuilding the stars each time made them jump
  addEventListener('resize', () => { if (innerWidth !== lw || Math.abs(innerHeight - lh) > 160) { lw = innerWidth; lh = innerHeight; resize(); } });
  addEventListener('mousemove', e => {
    mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
    if (fine && !reduce) {
      const X = e.clientX * dpr, Y = e.clientY * dpr;
      if (px0 >= 0) { const d = Math.hypot(X - px0, Y - py0); for (let i = 0; i < Math.min(4, d / (6 * dpr)); i++) trail.push({x: X + (Math.random() - .5) * 6 * dpr, y: Y + (Math.random() - .5) * 6 * dpr, vx: (Math.random() - .5) * .6 * dpr, vy: (Math.random() - .5) * .6 * dpr + .3 * dpr, l: 1, hue: 200 + Math.random() * 110}); }
      px0 = X; py0 = Y;
    }
  });
  addEventListener('scroll', () => sy = scrollY, {passive: true});
  const shootingStar = () => {
    const dir = Math.random() < .7 ? 1 : -1, a = .25 + Math.random() * .35, sp = (10 + Math.random() * 8) * dpr;
    shoot.push({x: dir > 0 ? Math.random() * w * .7 : w * (.3 + Math.random() * .7), y: Math.random() * h * .5, l: 0,
      vx: dir * Math.cos(a) * sp, vy: Math.sin(a) * sp, len: (90 + Math.random() * 120) * dpr});
  };
  const frame = k => {                      // k = elapsed time in 60fps frames, so speed doesn't depend on frame rate
    x.clearRect(0, 0, w, h);
    cx += (mx - cx) * Math.min(1, .05 * k); cy += (my - cy) * Math.min(1, .05 * k);
    const big = 1.4 * dpr;
    for (const s of stars) {
      s.t += s.sp * k;
      const X = ((s.x - cx * 60 * s.z * dpr) % w + w) % w;
      const Y = ((s.y - cy * 60 * s.z * dpr - sy * .25 * s.z * dpr) % h + h) % h;
      const a = (.55 + Math.sin(s.t) * .45) * (.35 + s.z * .65);
      x.globalAlpha = a; x.fillStyle = s.fill;
      if (s.r < big) x.fillRect(X - s.r, Y - s.r, s.r * 2, s.r * 2);           // tiny stars: a square is far cheaper than an arc
      else { x.beginPath(); x.arc(X, Y, s.r, 0, 6.283); x.fill(); }
      if (s.glint && a > .6) {
        x.globalAlpha = (a - .6) * 1.6; x.strokeStyle = s.line; x.lineWidth = .7 * dpr;
        const L = s.r * 5;
        x.beginPath(); x.moveTo(X - L, Y); x.lineTo(X + L, Y); x.moveTo(X, Y - L); x.lineTo(X, Y + L); x.stroke();
      }
    }
    if ((nextShot -= k) <= 0) { shootingStar(); nextShot = 90 + Math.random() * 200; }
    shoot = shoot.filter(s => s.l < 1);
    for (const s of shoot) {
      s.l += .012 * k; s.x += s.vx * k; s.y += s.vy * k;
      const m = Math.hypot(s.vx, s.vy), tx = s.x - s.vx / m * s.len, ty = s.y - s.vy / m * s.len;
      const g = x.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(170,200,255,.5)'); g.addColorStop(1, 'rgba(170,200,255,0)');
      x.globalAlpha = Math.sin(Math.min(s.l, 1) * Math.PI); x.strokeStyle = g; x.lineWidth = 2 * dpr; x.lineCap = 'round';
      x.beginPath(); x.moveTo(s.x, s.y); x.lineTo(tx, ty); x.stroke();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(s.x, s.y, 1.6 * dpr, 0, 6.283); x.fill();
    }
    trail = trail.filter(p => p.l > 0);
    for (const p of trail) {
      p.l -= .025 * k; p.x += p.vx * k; p.y += p.vy * k;
      x.globalAlpha = Math.max(0, p.l) * .8; x.fillStyle = `hsl(${p.hue} 100% 80%)`;
      x.beginPath(); x.arc(p.x, p.y, Math.max(0, p.l) * 2.2 * dpr, 0, 6.283); x.fill();
    }
    x.globalAlpha = 1;
  };
  // Idle (no drawing at all) behind the intro, while a menu or player covers the page, during a jump-scroll, or in a hidden tab.
  const idle = () => document.hidden || document.body.classList.contains('loading') || root.classList.contains('menu-lock') || root.classList.contains('jumping') || !!document.querySelector('.lightbox.on');
  const loop = now => {
    requestAnimationFrame(loop);
    if (idle() || (reduce && drawn)) { lastT = now; return; }
    const dt = now - lastT;
    if (dt < 30) return;                                                       // cap at ~30fps: twinkling doesn't need 60
    lastT = now;
    if (!trimmed) { trimmed = true; if (root.dataset.perf === 'low') stars.length >>= 1; }
    frame(Math.min(dt / 16.67, 4)); drawn = true;
  };
  requestAnimationFrame(loop);
})();


const PHOTOS = [
  ['school-group', 'schools', 'A school group cheering in front of the navy planetarium'],
  ['dome-lights-hall', 'setup', 'The planetarium glowing under a hall full of star lights'],
  ['festival-flags', 'outdoor', 'The planetarium at a colourful summer festival'],
  ['community-group', 'community', 'A community group all smiles after their show'],
  ['dome-black-park', 'outdoor', 'The black planetarium set up in the sunshine at an outdoor event'],
  ['secondary-students', 'schools', 'A secondary school year group in front of the planetarium'],
  ['telescope', 'setup', 'Looking up through the telescope'],
  ['school-group-2', 'schools', 'Hands up for the planetarium!'],
  ['festival-domes', 'outdoor', 'Sky dancers, planetariums and a festival field'],
  ['dome-navy-flags', 'schools', 'The navy planetarium in a school hall full of flags'],
  ['school-group-4', 'schools', 'Junior classes ready for lift-off'],
  ['domes-skydancer-hall', 'setup', 'Both planetariums and a sky dancer, set up indoors'],
  ['dome-navy-hall', 'schools', 'The navy planetarium inside a school hall'],
  ['festival-queue', 'outdoor', 'Families queueing for a show at a summer festival'],
  ['school-group-3', 'schools', 'A class celebrating in front of the black planetarium'],
  ['display-plush', 'setup', 'Our display table with plush planets and banners'],
  ['dome-black-hall', 'setup', 'Both planetariums set up side by side in a sports hall'],
  ['school-group-5', 'schools', 'A whole school hall of happy astronomers'],
  ['dome-navy-school', 'schools', 'The navy planetarium in a school with our Educate and Inspire banner'],
  ['festival-sunny', 'outdoor', 'A long queue under the sky dancers at a sunny festival'],
  ['dome-black-banners', 'setup', 'The black planetarium framed by our pop-up banners'],
  ['dome-navy-gym', 'schools', 'The navy planetarium in a school sports hall, ready for the first class'],
  ['dome-navy-classroom', 'schools', 'The planetarium set up beside a classroom of space crafts'],
  ['display-table', 'setup', 'Our display table with brochures and plush planets'],
  ['dome-navy-hall-2', 'schools', 'The navy planetarium waiting for the next class'],
  ['dome-banners-hall', 'setup', 'The black planetarium framed by our pop-up banners'],
  ['dome-navy-library', 'community', 'The navy planetarium visiting a local library']
];
const SIZES = {"school-group":[700,525],"dome-lights-hall":[700,525],"festival-flags":[700,525],"community-group":[700,525],"dome-black-park":[700,525],"secondary-students":[700,525],"telescope":[700,606],"school-group-2":[700,525],"festival-domes":[700,525],"dome-navy-flags":[700,525],"school-group-4":[700,525],"domes-skydancer-hall":[700,525],"dome-navy-hall":[525,700],"festival-queue":[700,525],"school-group-3":[700,525],"display-plush":[700,525],"dome-black-hall":[700,467],"school-group-5":[700,525],"dome-navy-school":[525,700],"festival-sunny":[525,700],"dome-black-banners":[700,525],"dome-navy-gym":[700,525],"dome-navy-classroom":[700,525],"display-table":[700,467],"dome-navy-hall-2":[700,525],"dome-banners-hall":[700,467],"dome-navy-library":[525,700]};  // photo sizes, so the layout is fixed before images load
(() => {
  const grid = $('#gallery-grid'); if (!grid) return;
  const moreBtn = $('#moreBtn'), LIMIT = +(grid.dataset.limit || 12), cats = grid.dataset.cats ? grid.dataset.cats.split(',') : null;
  const expand = () => { $$('.g-item.more').forEach(el => { el.classList.remove('more'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in'))); }); if (moreBtn) moreBtn.parentElement.style.display = 'none'; };
  const list = PHOTOS.map((p, i) => [...p, i]).filter(p => !cats || cats.includes(p[1]));
  grid.innerHTML = list.map(([f, cat, alt, i], n) =>
    `<figure class="g-item rv${n >= LIMIT ? ' more' : ''}" data-cat="${cat}" data-i="${i}" tabindex="0" style="transition-delay:${(n % 3) * .08}s">
       <img src="img/${f}-sm.webp" alt="${alt}" width="${SIZES[f][0]}" height="${SIZES[f][1]}" loading="lazy" decoding="async">
       <figcaption>${alt}</figcaption>
     </figure>`).join('');
  $$('.filters button').forEach(b => b.onclick = () => {
    $$('.filters button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    if (f !== 'all') expand();
    $$('.g-item').forEach(el => {
      const show = f === 'all' || el.dataset.cat === f;
      if (show) { el.classList.remove('hidden'); el.classList.remove('in'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in'))); }
      else el.classList.add('hidden');
    });
  });
  if (moreBtn) {
    if (list.length <= LIMIT) moreBtn.parentElement.style.display = 'none';
    moreBtn.onclick = expand; moreBtn.textContent = `Show all ${list.length} photos`;
  }
  // Lightbox
  const lb = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
  let cur = 0;
  const visible = () => $$('.g-item:not(.hidden)').map(e => +e.dataset.i);
  const show = i => {
    cur = i; const [f, , alt] = PHOTOS[i];
    img.style.opacity = 0;
    const n = new Image(); n.src = `img/${f}.webp`;
    n.onload = () => { img.src = n.src; img.alt = alt; img.style.opacity = 1; };
    cap.textContent = alt;
  };
  const step = d => { const v = visible(); show(v[(v.indexOf(cur) + d + v.length) % v.length]); };
  const open = i => { show(i); lb.classList.add('on'); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; };
  grid.addEventListener('click', e => { const g = e.target.closest('.g-item'); if (g) open(+g.dataset.i); });
  grid.addEventListener('keydown', e => { if (e.key === 'Enter') { const g = e.target.closest('.g-item'); if (g) open(+g.dataset.i); } });
  $('#lbClose').onclick = close; $('#lbPrev').onclick = () => step(-1); $('#lbNext').onclick = () => step(1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1);
  });
  let tx = 0;
  lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive: true});
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) step(d < 0 ? 1 : -1); });
})();

/* ============ Scroll reveals + counters ============ */
(() => {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    const n = e.target.querySelector('[data-count]');
    if (n) {
      const end = +n.dataset.count, suf = n.dataset.suffix || '', t0 = performance.now(), dur = 1800;
      const tick = t => { const p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 4))); n.textContent = v + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
  }), {threshold: .15, rootMargin: '0px 0px -40px 0px'});
  $$('.rv').forEach(el => io.observe(el));
  // Safety net: a fast fling or jump link can skip past an element without it ever intersecting
  let t = 0;
  addEventListener('scroll', () => {
    if (t) return;
    t = setTimeout(() => { t = 0; $$('.rv:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }); }, 250);
  }, {passive: true});
})();

/* ============ Header, progress, parallax, to-top ============ */
const menuOpen = () => root.classList.contains('menu-lock');
let closeMenu = () => {};

/* ============ Jump links: one fast, predictable scroll ============
   The old browser smooth-scroll took seconds on this long page and stopped early, because photos above the target
   kept loading and growing the page. This scrolls for a fixed short time, re-aims at the target every frame, and
   keeps checking for a moment afterwards. */
const jump = (() => {
  let raf = 0, token = 0;
  const stop = () => { token++; cancelAnimationFrame(raf); raf = 0; root.classList.remove('jumping'); };
  addEventListener('wheel', stop, {passive: true});
  addEventListener('touchstart', stop, {passive: true});
  const dest = t => {
    const m = parseFloat(getComputedStyle(t).scrollMarginTop) || 0, max = root.scrollHeight - innerHeight;
    return Math.max(0, Math.min(t.getBoundingClientRect().top + scrollY - m, max));
  };
  const settle = (getDest, my) => {
    let n = 0;
    const chk = () => { if (my !== token) return; const d = getDest(); if (Math.abs(d - scrollY) > 2) scrollTo(0, d); if (++n < 10) setTimeout(chk, 130); };
    setTimeout(chk, 60);
  };
  const to = getDest => {
    stop();
    const my = token, y0 = scrollY, dist = Math.abs(getDest() - y0);
    if (dist < 2) return;
    const dur = reduce ? 0 : Math.min(650, 240 + dist * .05), t0 = performance.now();
    root.classList.add('jumping');
    const step = now => {
      if (my !== token) return;
      const k = dur ? Math.min(1, (now - t0) / dur) : 1, e = 1 - Math.pow(1 - k, 3);
      scrollTo(0, y0 + (getDest() - y0) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else { raf = 0; root.classList.remove('jumping'); settle(getDest, my); }
    };
    raf = requestAnimationFrame(step);
  };
  return {to, dest};
})();

document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
  let u; try { u = new URL(a.href, location.href); } catch (_) { return; }
  if (u.origin !== location.origin) return;
  const norm = p => p.replace(/index\.html$/, '').replace(/\/$/, '');
  if (norm(u.pathname) !== norm(location.pathname)) {          // another page: show that something is happening straight away
    root.classList.add('navigating');
    return;
  }
  const t = u.hash.length > 1 ? document.getElementById(decodeURIComponent(u.hash.slice(1))) : null;
  if (u.hash.length > 1 && !t) return;
  e.preventDefault();
  const go = () => jump.to(t ? () => jump.dest(t) : () => 0);
  try { history.replaceState(null, '', u.hash || location.pathname); } catch (_) {}
  if (menuOpen()) { closeMenu(); requestAnimationFrame(() => requestAnimationFrame(go)); } else go();
});

// Arriving on a link such as /#videos: the browser jumps once at load, then photos and fonts move things. Re-aim until the visitor scrolls.
(() => {
  let touched = false;
  ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => { touched = true; }, {passive: true, once: true}));
  const fix = () => {
    if (touched || location.hash.length < 2 || document.body.classList.contains('loading')) return;
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t && Math.abs(jump.dest(t) - scrollY) > 4) scrollTo(0, jump.dest(t));
  };
  window.__fixHash = fix;
  addEventListener('load', () => { setTimeout(fix, 150); setTimeout(fix, 900); });
})();

(() => {
  const hd = $('#header'), pr = $('#progress'), tt = $('#toTop'), hero = $('#heroMedia');
  const par = $$('[data-speed]');
  let last = 0, ticking = false;
  const update = () => {
    const y = scrollY, max = root.scrollHeight - innerHeight;
    hd.classList.toggle('scrolled', y > 40);
    if (!menuOpen()) hd.classList.toggle('hide', y > last && y > 400);
    last = y;
    pr.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    tt.classList.toggle('on', y > 900);
    if (!reduce) {
      if (hero && y < innerHeight * 1.2) hero.style.transform = `translate3d(0,${y * .35}px,0)`;
      par.forEach(el => {
        const r = el.getBoundingClientRect(), mid = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translateY(${mid * +el.dataset.speed}px)`;
      });
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking && !menuOpen()) { requestAnimationFrame(update); ticking = true; } }, {passive: true});
  update();
  tt.onclick = () => jump.to(() => 0);
})();

/* ============ Mobile menu ============ */
(() => {
  const hd = $('#header'), bg = $('#burger'), mnav = $('#mnav');
  const toggle = on => {
    mnav.classList.toggle('on', on); bg.classList.toggle('on', on);
    hd.classList.toggle('menu-open', on); if (on) hd.classList.remove('hide');
    root.classList.toggle('menu-lock', on);
    bg.setAttribute('aria-expanded', on); bg.setAttribute('aria-label', on ? 'Close menu' : 'Open menu');
    if (on) mnav.scrollTop = 0;
    heroSync();
  };
  closeMenu = () => toggle(false);
  bg.addEventListener('click', () => toggle(!menuOpen()));
  // Links inside the menu are handled by the page-wide link handler above (it closes the menu, then scrolls)
  addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen()) toggle(false); });
  addEventListener('resize', () => { if (innerWidth > 820 && menuOpen()) toggle(false); });
  addEventListener('pageshow', () => { toggle(false); root.classList.remove('navigating'); }); // back button: never return to an open menu
})();

/* ============ Pointer effects: cursor glow, tilt, magnetic ============ */

if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cur = $('#cursor'); let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; });
  (function loop() { cx += (tx - cx) * .12; cy += (ty - cy) * .12; cur.style.transform = `translate(${cx - 210}px,${cy - 210}px)`; requestAnimationFrame(loop); })();

  $$('.tilt').forEach(c => {
    c.addEventListener('mousemove', e => {
      const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      c.style.transform = `perspective(900px) rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg) translateY(-6px)`;
      c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
    });
    c.addEventListener('mouseleave', () => c.style.transform = '');
  });
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}

/* ============ Video modal + hover previews ============ */
(() => {
  const box = $('#vidbox'), v = $('#promo');
  const open = (src, poster) => { v.poster = poster || ''; v.src = src; box.classList.add('on'); document.body.style.overflow = 'hidden'; heroSync(); v.play().catch(() => {}); };
  const close = () => { box.classList.remove('on'); v.pause(); v.removeAttribute('src'); v.load(); document.body.style.overflow = ''; heroSync(); };
  $$('[data-play]').forEach(b => b.addEventListener('click', () => open(b.dataset.play, b.dataset.poster)));
  $$('.vid-card').forEach(c => {
    c.onclick = () => open(c.dataset.src, c.dataset.poster);
    const pv = c.querySelector('video'); if (!pv) return;
    c.addEventListener('mouseenter', () => { if (!pv.src) pv.src = pv.dataset.src; pv.play().then(() => c.classList.add('hover')).catch(() => {}); });
    c.addEventListener('mouseleave', () => { c.classList.remove('hover'); pv.pause(); });
  });
  $('#vidClose').onclick = close;
  box.addEventListener('click', e => { if (e.target === box) close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('on')) close(); });
})();

/* ============ FAQ smooth accordion ============ */
$$('.faq details').forEach(d => {
  const s = d.querySelector('summary'), a = d.querySelector('.ans');
  s.addEventListener('click', e => {
    e.preventDefault();
    if (d.open) {
      a.style.height = a.scrollHeight + 'px';
      requestAnimationFrame(() => a.style.height = '0px');
      a.addEventListener('transitionend', () => { d.open = false; a.style.height = ''; }, {once: true});
    } else {
      $$('.faq details[open]').forEach(o => o !== d && o.querySelector('summary').click());
      d.open = true; const h = a.scrollHeight; a.style.height = '0px';
      requestAnimationFrame(() => a.style.height = h + 'px');
      a.addEventListener('transitionend', () => a.style.height = '', {once: true});
    }
  });
});

/* ============ Contact + booking form ============ */
(() => {
  const ic = {
    mail: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/>',
    web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    fb: '<path d="M15 3h-2.5A4.5 4.5 0 008 7.5V10H5.5v3.5H8V21h3.5v-7.5H14l.6-3.5h-3.1V7.8c0-.7.5-1.3 1.3-1.3H15z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'
  };
  const row = (i, label, val, href) => `<${href ? `a href="${href}"${href.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}` : 'div'}><span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${ic[i]}</svg></span><span><small>${label}</small>${val}</span></${href ? 'a' : 'div'}>`;
  const info = $('#contactInfo'), form = $('#bookForm'); if (!info || !form) return;
  info.innerHTML =
    (CONTACT.phone ? row('phone', 'Call us', CONTACT.phone, 'tel:' + CONTACT.phone.replace(/\s/g, '')) : '') +
    row('mail', 'Email', CONTACT.email, 'mailto:' + CONTACT.email) +
    row('web', 'Website', CONTACT.website, 'https://' + CONTACT.website) +
    row('fb', 'Facebook', 'bigbearplanetariums', CONTACT.facebook) +
    row('pin', 'Where', 'Travelling all over Ireland');

  const counties = ['Carlow','Cavan','Clare','Cork','Donegal','Dublin','Galway','Kerry','Kildare','Kilkenny','Laois','Leitrim','Limerick','Longford','Louth','Mayo','Meath','Monaghan','Offaly','Roscommon','Sligo','Tipperary','Waterford','Westmeath','Wexford','Wicklow','Antrim','Armagh','Derry','Down','Fermanagh','Tyrone'];
  $('#f-county').innerHTML = '<option value="">Select county</option>' + counties.map(c => `<option>${c}</option>`).join('');
  const d = $('#f-date'); d.min = new Date().toISOString().split('T')[0];
  if (form.dataset.type) form.type.value = form.dataset.type;

  const ok = $('#formOk');
  const say = (msg, good) => { ok.textContent = msg; ok.classList.toggle('bad', !good); ok.classList.add('on'); ok.scrollIntoView({block: 'nearest'}); };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, name = f.name.value.trim(), email = f.email.value.trim();
    let bad = false;
    [[f.name, !name], [f.email, !/^\S+@\S+\.\S+$/.test(email)]].forEach(([el, b]) => { el.style.borderColor = b ? '#ff7a9a' : ''; if (b) bad = true; });
    if (bad) { say('Please add your name and a valid email so we can reply.', false); return; }
    if (f.botcheck && f.botcheck.checked) return;                               // hidden trap field: only spam bots tick it
    const btn = f.querySelector('button[type=submit]'), label = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Sending…'; ok.classList.remove('on');
    const sendByEmail = () => {
      const body = `Name: ${name}\nEmail: ${email}\nPhone: ${f.phone.value}\nBooking for: ${f.type.value}\nPreferred date: ${f.date.value}\nCounty: ${f.county.value}\n\n${f.message.value}`;
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Planetarium booking enquiry: ' + f.type.value)}&body=${encodeURIComponent(body)}`;
    };
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, signal: ctrl.signal,
        body: JSON.stringify({
          access_key: CONTACT.formKey, subject: `Planetarium enquiry: ${f.type.value} (${name})`, from_name: 'Big Bear Planetariums website',
          name, email, phone: f.phone.value, booking_for: f.type.value, preferred_date: f.date.value, county: f.county.value,
          message: f.message.value, page: location.href, botcheck: ''
        })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || r.status);
      say(`Thanks ${name.split(' ')[0]}! Your enquiry has been sent and we'll be in touch soon. ✨`, true);
      f.reset(); if (form.dataset.type) f.type.value = form.dataset.type;
    } catch (err) {
      say(`We couldn't send that just now, so your email app is opening instead. Just press send, or call us on ${CONTACT.phone}.`, false);
      setTimeout(sendByEmail, 900);
    } finally {
      clearTimeout(timer); btn.disabled = false; btn.innerHTML = label;
    }
  });
})();


/* ============ Warm the other pages ============
   Quietly download the other pages once this one has settled, so tapping Schools / Corporate / Parties / Festivals is instant. */
(() => {
  const c = navigator.connection || {};
  if (c.saveData || /2g/.test(c.effectiveType || '')) return;
  const here = location.pathname.split('/').pop() || 'index.html';
  const pages = ['index.html', 'schools.html', 'corporate-groups.html', 'private-parties.html', 'festivals-events.html'].filter(p => p !== here);
  const warm = () => pages.forEach((p, i) => setTimeout(() => fetch(p, {credentials: 'same-origin', priority: 'low'}).catch(() => {}), i * 400));
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(warm, {timeout: 6000}) : setTimeout(warm, 3000));
  if (document.readyState === 'complete') setTimeout(later, 3500); else addEventListener('load', () => setTimeout(later, 3500));
})();
