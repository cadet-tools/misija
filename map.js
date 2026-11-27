// Misijas karte telefonā: LOF attēls ar KP, tuvināšana/pārvietošana ar pirkstiem, GPS punkts (ja atļauts)
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';

  function solve3(A, b) {
    const m = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < 3; c++) {
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      [m[c], m[p]] = [m[p], m[c]];
      for (let r = 0; r < 3; r++) if (r !== c) { const f = m[r][c] / m[c][c]; for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k]; }
    }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
  }
  // lat,lng → attēla px,py (afīna piesaiste, mazos apgabalos pietiekami precīza)
  function fitGeo(geo) {
    if (!geo || geo.length < 3) return null;
    const lat0 = geo[0][2], lng0 = geo[0][3];
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
    for (const [px, py, lat, lng] of geo) {
      const v = [(lng - lng0) * 1e4, (lat - lat0) * 1e4, 1];
      for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; bx[i] += v[i] * px; by[i] += v[i] * py; }
    }
    const cx = solve3(A, bx), cy = solve3(A, by);
    const toPx = (lat, lng) => { const u = (lng - lng0) * 1e4, w = (lat - lat0) * 1e4; return [cx[0] * u + cx[1] * w + cx[2], cy[0] * u + cy[1] * w + cy[2]]; };
    // metri uz pikseli
    const hav = (a, b, c, d) => { const R = 6371000, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
    let sm = 0, sp = 0;
    for (let i = 0; i < geo.length; i++) for (let j = i + 1; j < geo.length; j++) {
      sm += hav(geo[i][2], geo[i][3], geo[j][2], geo[j][3]); sp += Math.hypot(geo[i][0] - geo[j][0], geo[i][1] - geo[j][1]);
    }
    return { toPx, mpp: sp ? sm / sp : 1 };
  }

  window.MisijaMap = function (vp, game, opts = {}) {
    vp.style.touchAction = 'none';
    const inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform';
    const img = new Image(); img.src = game.map; img.draggable = false;
    img.style.cssText = 'display:block;user-select:none;-webkit-user-drag:none';
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;pointer-events:none';
    inner.append(img, svg); vp.innerHTML = ''; vp.appendChild(inner);

    let W = 2481, H = 1754, s = 0.2, tx = 0, ty = 0, minS = 0.05, ready = false;
    const geo = game.gps ? fitGeo(game.geo) : null;
    let visited = new Set(), gpsPos = null, marks = [];

    function el(tag, attrs, parent) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }

    function build() {
      svg.innerHTML = ''; marks = [];
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (game.sf) {
        const g = el('g', {}); const t = el('polygon', { fill: 'none', stroke: '#c51fc5', 'stroke-linejoin': 'round' }, g);
        marks.push({ type: 'sf', g, t, x: game.sf[0], y: game.sf[1] });
      }
      for (const k of game.kp) {
        if (k.x == null || k.y == null) continue;
        const g = el('g', {});
        const c = el('circle', {}, g);
        const t = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'system-ui,sans-serif', 'font-weight': '900' }, g);
        t.textContent = k.id;
        const p = el('text', { 'text-anchor': 'middle', 'font-family': 'system-ui,sans-serif', 'font-weight': '800' }, g);
        p.textContent = k.p + 'p';
        marks.push({ type: 'kp', id: k.id, g, c, t, p, x: k.x, y: k.y });
      }
      const ga = el('circle', { fill: 'rgba(30,136,255,.18)', stroke: 'rgba(30,136,255,.6)' });
      const gd = el('circle', { fill: '#1e88ff', stroke: '#fff' });
      marks.push({ type: 'gps', ga, gd });
    }

    // Marķieri vienmēr vienā izmērā uz ekrāna
    function drawMarks() {
      const u = 1 / s;
      for (const m of marks) {
        if (m.type === 'sf') {
          const r = 17 * u;
          m.t.setAttribute('points', `${m.x},${m.y - r} ${m.x + r * 0.87},${m.y + r * 0.5} ${m.x - r * 0.87},${m.y + r * 0.5}`);
          m.t.setAttribute('stroke-width', 3.5 * u);
        } else if (m.type === 'kp') {
          const v = visited.has(m.id), r = 17 * u;
          m.c.setAttribute('cx', m.x); m.c.setAttribute('cy', m.y); m.c.setAttribute('r', r);
          // Caurspīdīgs aplis kā orientēšanās kartē, lai redzams apvidus centrā
          m.c.setAttribute('fill', v ? 'rgba(95,208,122,.45)' : 'none');
          m.c.setAttribute('stroke', v ? '#0d8a2e' : '#c51fc5'); m.c.setAttribute('stroke-width', 3.5 * u);
          m.t.setAttribute('x', m.x + r * 1.15); m.t.setAttribute('y', m.y - r * 0.85); m.t.setAttribute('font-size', 15 * u);
          m.t.setAttribute('text-anchor', 'start');
          m.t.setAttribute('fill', v ? '#0d6a26' : '#a0129f'); m.t.setAttribute('stroke', '#fff'); m.t.setAttribute('stroke-width', 3.5 * u); m.t.setAttribute('paint-order', 'stroke');
          m.t.textContent = v ? m.id + ' ✓' : m.id;
          m.p.setAttribute('x', m.x + r * 1.15); m.p.setAttribute('y', m.y - r * 0.85 + 15 * u); m.p.setAttribute('font-size', 11 * u); m.p.setAttribute('text-anchor', 'start');
          m.p.setAttribute('fill', '#5a0a5a'); m.p.setAttribute('stroke', '#fff'); m.p.setAttribute('stroke-width', 3 * u); m.p.setAttribute('paint-order', 'stroke');
          m.p.style.display = v ? 'none' : '';
        } else if (m.type === 'gps') {
          if (!gpsPos) { m.ga.style.display = m.gd.style.display = 'none'; continue; }
          m.ga.style.display = m.gd.style.display = '';
          const [x, y] = gpsPos.px;
          m.ga.setAttribute('cx', x); m.ga.setAttribute('cy', y); m.ga.setAttribute('r', Math.max(gpsPos.acc / geo.mpp, 9 * u)); m.ga.setAttribute('stroke-width', 1.5 * u);
          m.gd.setAttribute('cx', x); m.gd.setAttribute('cy', y); m.gd.setAttribute('r', 8 * u); m.gd.setAttribute('stroke-width', 3 * u);
        }
      }
    }

    function clamp() {
      const vw = vp.clientWidth, vh = vp.clientHeight, mw = W * s, mh = H * s;
      tx = mw < vw ? (vw - mw) / 2 : Math.min(vw * 0.4, Math.max(vw * 0.6 - mw, tx));
      ty = mh < vh ? (vh - mh) / 2 : Math.min(vh * 0.4, Math.max(vh * 0.6 - mh, ty));
    }
    function apply() { clamp(); inner.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; drawMarks(); }
    function zoomAt(f, cx, cy) {
      const ns = Math.min(4, Math.max(minS, s * f)); f = ns / s;
      tx = cx - (cx - tx) * f; ty = cy - (cy - ty) * f; s = ns; apply();
    }
    function fit() {
      const pts = game.kp.filter(k => k.x != null).map(k => [k.x, k.y]);
      if (game.sf) pts.push(game.sf);
      let x0 = 0, y0 = 0, x1 = W, y1 = H;
      if (pts.length) { x0 = Math.min(...pts.map(p => p[0])) - 80; x1 = Math.max(...pts.map(p => p[0])) + 80; y0 = Math.min(...pts.map(p => p[1])) - 80; y1 = Math.max(...pts.map(p => p[1])) + 80; }
      const vw = vp.clientWidth || 360, vh = vp.clientHeight || 600;
      s = Math.min(vw / (x1 - x0), vh / (y1 - y0));
      minS = Math.min(s, vw / W, vh / H) * 0.8;
      tx = (vw - (x1 - x0) * s) / 2 - x0 * s; ty = (vh - (y1 - y0) * s) / 2 - y0 * s;
      apply();
    }

    img.onload = () => { W = img.naturalWidth; H = img.naturalHeight; img.width = W; img.height = H; build(); ready = true; fit(); };

    // Pirksti / pele
    const ptr = new Map(); let last = null, lastTap = 0;
    const pos = e => { const r = vp.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    vp.addEventListener('pointerdown', e => {
      if (e.target.closest('button,.maplegend')) return;
      vp.setPointerCapture(e.pointerId); ptr.set(e.pointerId, pos(e)); last = null;
      if (ptr.size === 1) { const now = Date.now(); if (now - lastTap < 300) { const [x, y] = pos(e); zoomAt(2, x, y); } lastTap = now; }
    });
    vp.addEventListener('pointermove', e => {
      if (!ptr.has(e.pointerId)) return;
      ptr.set(e.pointerId, pos(e));
      const ps = [...ptr.values()];
      const cur = ps.length >= 2
        ? { x: (ps[0][0] + ps[1][0]) / 2, y: (ps[0][1] + ps[1][1]) / 2, d: Math.hypot(ps[0][0] - ps[1][0], ps[0][1] - ps[1][1]) }
        : { x: ps[0][0], y: ps[0][1], d: 0 };
      if (last && last.n === ps.length) {
        tx += cur.x - last.x; ty += cur.y - last.y;
        if (cur.d && last.d) { zoomAt(cur.d / last.d, cur.x, cur.y); } else apply();
      }
      last = { ...cur, n: ps.length };
    });
    const up = e => { ptr.delete(e.pointerId); last = null; };
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    vp.addEventListener('wheel', e => { e.preventDefault(); const [x, y] = pos(e); zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, x, y); }, { passive: false });

    // GPS
    let watch = null;
    function startGps(onStatus) {
      if (!geo || !navigator.geolocation) { onStatus && onStatus('GPS nav pieejams'); return; }
      if (watch != null) return;
      watch = navigator.geolocation.watchPosition(p => {
        gpsPos = { px: geo.toPx(p.coords.latitude, p.coords.longitude), acc: p.coords.accuracy };
        if (ready) drawMarks(); onStatus && onStatus(`±${Math.round(p.coords.accuracy)} m`);
      }, err => { onStatus && onStatus('GPS: ' + (err.code === 1 ? 'nav atļauts' : 'nav signāla')); }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    }
    function stopGps() { if (watch != null) navigator.geolocation.clearWatch(watch); watch = null; }
    function centerGps() {
      if (!gpsPos) return false;
      const vw = vp.clientWidth, vh = vp.clientHeight;
      if (s < 0.6) s = 0.6;
      tx = vw / 2 - gpsPos.px[0] * s; ty = vh / 2 - gpsPos.px[1] * s; apply(); return true;
    }

    return {
      setVisited(set) { visited = set; if (ready) drawMarks(); },
      fit() { if (ready) fit(); },
      zoom(f) { zoomAt(f, vp.clientWidth / 2, vp.clientHeight / 2); },
      startGps, stopGps, centerGps,
      hasGps: !!geo
    };
  };
})();
