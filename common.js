// Kopīgās funkcijas jaunsarga un vadītāja lapai
(function () {
  const M = {};

  M.cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };

  // Bez sajaucamiem simboliem (nav O/0, I/1, Q, W, X, Y)
  const ALPH = 'ABCDEFGHJKLMNPRSTUVZ23456789';
  M.kpCode = (key, id) => {
    let n = M.cyrb53(key + '|kp|' + id), s = '';
    for (let i = 0; i < 4; i++) { s += ALPH[n % ALPH.length]; n = Math.floor(n / ALPH.length); }
    return s;
  };
  M.sign = (key, str) => M.cyrb53(key + '|res|' + str).toString(36);

  M.newKey = () => {
    const a = new Uint8Array(9); crypto.getRandomValues(a);
    return Array.from(a, b => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
  };

  // base64url
  M.b64e = bytes => {
    let s = ''; bytes.forEach(b => s += String.fromCharCode(b));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  M.b64d = str => {
    str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '=';
    const s = atob(str), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  };
  const enc = new TextEncoder(), dec = new TextDecoder();

  async function streamBytes(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }
  // Spēles konfigurācija saitē: 'z' + deflate, vai 'j' + vienkāršs JSON
  M.pack = async obj => {
    const raw = enc.encode(JSON.stringify(obj));
    if ('CompressionStream' in window) {
      try { return 'z' + M.b64e(await streamBytes(raw, new CompressionStream('deflate-raw'))); } catch (e) {}
    }
    return 'j' + M.b64e(raw);
  };
  M.unpack = async s => {
    const kind = s[0], bytes = M.b64d(s.slice(1));
    if (kind === 'z') return JSON.parse(dec.decode(await streamBytes(bytes, new DecompressionStream('deflate-raw'))));
    if (kind === 'j') return JSON.parse(dec.decode(bytes));
    throw new Error('Nezināms formāts');
  };

  // Rezultāta QR: MR1.<base64url JSON>
  M.encodeResult = (game, st) => {
    const body = { g: game.id, n: st.name, s: st.start, f: st.finish, v: st.visits };
    // Operators, papildlaiks (min) un īpašību žurnāls, ja izmantoti
    if (st.op) body.o = st.op;
    if (st.extra) body.x = st.extra;
    if (st.uses && st.uses.length) body.u = st.uses;
    const json = JSON.stringify(body);
    body.h = M.sign(game.key, json);
    return 'MR1.' + M.b64e(enc.encode(JSON.stringify(body)));
  };
  M.decodeResult = (text, game) => {
    text = String(text || '').trim();
    const i = text.indexOf('MR1.');
    if (i < 0) throw new Error('Tas nav misijas rezultāta kods');
    const body = JSON.parse(dec.decode(M.b64d(text.slice(i + 4))));
    const h = body.h; delete body.h;
    const ok = game && body.g === game.id && M.sign(game.key, JSON.stringify(body)) === h;
    return { ...body, valid: ok };
  };

  // Punktu aprēķins (vienāds abās lapās)
  // Apmeklējums: [kpId, sekundes no starta, metode 'g'|'q'|undefined, karodziņi 'x2' un/vai 'o:<ziņa>' ar komatu]
  M.vflags = v => String(v[3] || '').split(',').filter(Boolean);
  M.score = (game, start, finish, visits, extraMin = 0) => {
    const pts = Object.fromEntries(game.kp.map(k => [k.id, k.p]));
    const seen = new Set(); let raw = 0, doubled = 0;
    for (const v of visits) {
      const id = v[0];
      if (seen.has(id) || pts[id] == null) continue;
      seen.add(id);
      const x2 = M.vflags(v).includes('x2');
      raw += pts[id] * (x2 ? 2 : 1); if (x2) doubled += pts[id];
    }
    const facts = M.foundFacts(game, visits);
    const nFacts = (game.facts || []).length;
    const complete = nFacts > 0 && facts.size === nFacts;
    const bonus = complete ? (game.bonus || 0) : 0;
    const usedMs = Math.max(0, (finish || Date.now()) - start);
    const limit = game.min + (extraMin || 0);
    const overMin = Math.max(0, Math.ceil(usedMs / 60000 - limit - 1e-9));
    const penalty = overMin * game.pen;
    const dq = game.dq > 0 && overMin > game.dq;
    return { raw, penalty, bonus, facts, nFacts, complete, total: dq ? 0 : Math.max(0, raw + bonus - penalty), overMin, dq, count: seen.size, usedMs, doubled, limit };
  };
  M.foundFacts = (game, visits) => {
    const byId = Object.fromEntries(game.kp.map(k => [k.id, k]));
    const out = new Set();
    for (const v of visits) {
      for (const f of (byId[v[0]]?.f || [])) out.add(f);
      for (const fl of M.vflags(v)) if (fl.startsWith('o:')) out.add(fl.slice(2));
    }
    return new Set((game.facts || []).map(f => f.id).filter(id => out.has(id)));
  };
  M.maxPoints = game => game.kp.reduce((a, k) => a + k.p, 0) + ((game.facts || []).length ? (game.bonus || 0) : 0);
  // Iznākums pēc noskaidroto ziņu skaita
  M.outcome = (game, sc) => {
    if (!sc.nFacts) return null;
    const r = sc.facts.size / sc.nFacts;
    if (sc.complete) return { k: 'full', t: 'OPERĀCIJA IZDEVUSIES', x: game.end?.full || '' };
    if (r >= 0.5) return { k: 'part', t: 'DAĻĒJI IZDEVUSIES', x: game.end?.part || '' };
    return { k: 'fail', t: 'NEIZDEVĀS', x: game.end?.fail || '' };
  };

  M.rank = (game, total) => {
    const r = total / Math.max(1, M.maxPoints(game));
    if (r >= 0.8) return 'Leģenda';
    if (r >= 0.6) return 'Komandieris';
    if (r >= 0.4) return 'Vecākais izlūks';
    if (r >= 0.2) return 'Izlūks';
    return 'Kandidāts';
  };

  M.fmt = ms => {
    const neg = ms < 0; ms = Math.abs(ms);
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
    return (neg ? '−' : '') + (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(ss).padStart(2, '0');
  };
  M.clock = t => new Date(t).toLocaleTimeString('lv-LV', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  M.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  M.qrSvg = (text, ecc = 'M') => {
    const q = qrcode(0, ecc); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  };

  // KP saites formāts: <bāze>index.html#k=31-ABCD
  M.parseKp = text => {
    const m = String(text || '').match(/[#&?]k=([0-9A-Za-z]+)-([A-Za-z0-9]{4})/);
    return m ? { id: m[1], code: m[2].toUpperCase() } : null;
  };

  // QR skeneris ar kameru (BarcodeDetector, ja ir; citādi jsQR)
  M.startScanner = async (video, onText) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    video.srcObject = stream; video.setAttribute('playsinline', ''); video.muted = true;
    await video.play();
    let stopped = false, detector = null;
    if ('BarcodeDetector' in window) {
      try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { detector = null; }
    }
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    const tick = async () => {
      if (stopped) return;
      try {
        if (video.readyState >= 2) {
          let text = null;
          if (detector) {
            const codes = await detector.detect(video);
            if (codes.length) text = codes[0].rawValue;
          } else {
            const w = Math.min(720, video.videoWidth), h = Math.round(video.videoHeight * w / video.videoWidth);
            canvas.width = w; canvas.height = h; ctx.drawImage(video, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const r = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
            if (r) text = r.data;
          }
          if (text && !stopped) { onText(text); }
        }
      } catch (e) { /* turpinām */ }
      if (!stopped) setTimeout(tick, 120);
    };
    tick();
    return () => { stopped = true; stream.getTracks().forEach(t => t.stop()); video.srcObject = null; };
  };

  M.buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  // GPS: KP koordinātas no kartes piesaistes (attēla px,py → lat,lng)
  function solve3(A, b) {
    const m = A.map((r, i) => [...r, b[i]]);
    for (let c = 0; c < 3; c++) {
      let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
      [m[c], m[p]] = [m[p], m[c]];
      for (let r = 0; r < 3; r++) if (r !== c) { const f = m[r][c] / m[c][c]; for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k]; }
    }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
  }
  M.pxToLatLng = game => {
    const geo = game.geo; if (!geo || geo.length < 3) return null;
    const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bl = [0, 0, 0], bg = [0, 0, 0];
    for (const [px, py, lat, lng] of geo) {
      const v = [px / 1000, py / 1000, 1];
      for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) A[i][j] += v[i] * v[j]; bl[i] += v[i] * lat; bg[i] += v[i] * lng; }
    }
    const a = solve3(A, bl), b = solve3(A, bg);
    return (px, py) => [a[0] * px / 1000 + a[1] * py / 1000 + a[2], b[0] * px / 1000 + b[1] * py / 1000 + b[2]];
  };
  M.kpLatLng = (game, k) => {
    if (k.lat != null && k.lng != null) return [k.lat, k.lng];
    if (k.x == null || k.y == null) return null;
    const f = M.pxToLatLng(game); return f ? f(k.x, k.y) : null;
  };
  M.dist = (a, b, c, d) => { const R = 6371000, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  M.checkMode = game => game.check || 'qr'; // 'qr' | 'gps' | 'both'

  // Starta saitei: tikai lauki, kas atšķiras no noklusējuma (game.js), lai saite ietilptu QR kodā
  M.gameDiff = (game, def) => {
    const out = { $d: def.v };
    for (const k of Object.keys(game)) if (JSON.stringify(game[k]) !== JSON.stringify(def[k])) out[k] = game[k];
    return out;
  };
  M.gameFromLink = (obj, def) => {
    if (!obj || obj.$d == null) return obj; // vecais formāts: pilna konfigurācija
    const g = JSON.parse(JSON.stringify(def));
    for (const k of Object.keys(obj)) if (k !== '$d') g[k] = obj[k];
    return g;
  };

  window.M = M;
})();
