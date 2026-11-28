// Misijas karte telefonā: LOF attēls ar KP, tuvināšana/pārvietošana ar pirkstiem. Atrašanās vieta netiek rādīta.
(function () {
  const SVGNS = 'http://www.w3.org/2000/svg';

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
    let visited = new Set(), marks = [], hl = null;

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
          m.c.setAttribute('stroke', m.id === hl ? '#ff7a00' : v ? '#0d8a2e' : '#c51fc5'); m.c.setAttribute('stroke-width', (m.id === hl ? 6 : 3.5) * u);
          m.t.setAttribute('x', m.x + r * 1.15); m.t.setAttribute('y', m.y - r * 0.85); m.t.setAttribute('font-size', 15 * u);
          m.t.setAttribute('text-anchor', 'start');
          m.t.setAttribute('fill', v ? '#0d6a26' : '#a0129f'); m.t.setAttribute('stroke', '#fff'); m.t.setAttribute('stroke-width', 3.5 * u); m.t.setAttribute('paint-order', 'stroke');
          m.t.textContent = v ? m.id + ' ✓' : m.id;
          m.p.setAttribute('x', m.x + r * 1.15); m.p.setAttribute('y', m.y - r * 0.85 + 15 * u); m.p.setAttribute('font-size', 11 * u); m.p.setAttribute('text-anchor', 'start');
          m.p.setAttribute('fill', '#5a0a5a'); m.p.setAttribute('stroke', '#fff'); m.p.setAttribute('stroke-width', 3 * u); m.p.setAttribute('paint-order', 'stroke');
          m.p.style.display = v ? 'none' : '';
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

    return {
      setVisited(set) { visited = set; if (ready) drawMarks(); },
      fit() { if (ready) fit(); },
      // Pietuvina karti konkrētam punktam (attēla px)
      focus(x, y, scale) {
        const go = () => { const vw = vp.clientWidth, vh = vp.clientHeight; s = Math.max(s, scale || 0.9); tx = vw / 2 - x * s; ty = vh / 2 - y * s; apply(); };
        if (ready) go(); else img.addEventListener('load', () => setTimeout(go, 0), { once: true });
      },
      highlight(id) { hl = id; if (ready) drawMarks(); },
      zoom(f) { zoomAt(f, vp.clientWidth / 2, vp.clientHeight / 2); },
    };
  };
})();
