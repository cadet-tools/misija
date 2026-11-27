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
  M.score = (game, start, finish, visits) => {
    const pts = Object.fromEntries(game.kp.map(k => [k.id, k.p]));
    const seen = new Set(); let raw = 0;
    for (const [id] of visits) if (!seen.has(id) && pts[id] != null) { seen.add(id); raw += pts[id]; }
    const usedMs = Math.max(0, (finish || Date.now()) - start);
    const overMin = Math.max(0, Math.ceil(usedMs / 60000 - game.min - 1e-9));
    const penalty = overMin * game.pen;
    const dq = game.dq > 0 && overMin > game.dq;
    return { raw, penalty, total: dq ? 0 : Math.max(0, raw - penalty), overMin, dq, count: seen.size, usedMs };
  };
  M.maxPoints = game => game.kp.reduce((a, k) => a + k.p, 0);

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

  window.M = M;
})();
