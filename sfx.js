// Skaņas efekti, sintezēti ar Web Audio (bez failiem, strādā bez interneta)
(function () {
  let ctx = null, master = null;
  let muted = false;
  try { muted = localStorage.getItem('misija_mute') === '1'; } catch (e) {}

  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Telefoni atļauj skaņu tikai pēc pieskāriena
  ['pointerdown', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => ac(), { passive: true }));

  function tone(f, t0, dur, o = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + (t0 || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    const v = o.vol ?? 0.25, a = o.attack ?? 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v, t + Math.max(a, dur - (o.release ?? 0.04)));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t + dur + 0.02);
  }
  function noise(t0, dur, o = {}) {
    const c = ac(); if (!c || muted) return;
    const t = c.currentTime + (t0 || 0);
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = o.filter || 'bandpass'; flt.frequency.value = o.freq || 1800; flt.Q.value = o.q || 0.8;
    const g = c.createGain(); const v = o.vol ?? 0.15;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(flt); flt.connect(g); g.connect(master); src.start(t); src.stop(t + dur);
  }

  const FX = {
    // Pogas
    click: () => tone(1400, 0, 0.035, { vol: 0.12 }),
    soft: () => tone(900, 0, 0.03, { vol: 0.08, type: 'triangle' }),
    // KP apstiprināts: garš pīkstiens
    success: () => { tone(880, 0, 0.09, { vol: 0.2 }); tone(1320, 0.1, 0.9, { vol: 0.28, type: 'square', release: 0.25 }); },
    // Kļūda: zems dubults dūciens
    error: () => { tone(180, 0, 0.22, { type: 'sawtooth', vol: 0.3 }); tone(140, 0.28, 0.4, { type: 'sawtooth', vol: 0.3 }); },
    // Jau apmeklēts
    dup: () => { tone(660, 0, 0.1, { vol: 0.2 }); tone(660, 0.16, 0.1, { vol: 0.2 }); },
    // Radara impulss GPS meklēšanas laikā
    ping: () => { tone(1500, 0, 0.5, { type: 'sine', vol: 0.22, to: 1350, release: 0.45 }); },
    // Jauna ziņa: atšifrēšanas čivināšana
    decode: () => { for (let i = 0; i < 10; i++) tone(700 + Math.random() * 1400, 0.95 + i * 0.045, 0.035, { vol: 0.1 }); tone(1760, 1.45, 0.18, { vol: 0.18, type: 'triangle' }); },
    // Misijas starts: 3 īsi + 1 garš
    start: () => { [0, 0.35, 0.7].forEach(t => tone(880, t, 0.12, { vol: 0.22 })); tone(1760, 1.05, 0.6, { vol: 0.26 }); },
    // Finišs: fanfara
    finish: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.14, 0.18, { type: 'triangle', vol: 0.25 })); tone(1046, 0.6, 0.7, { type: 'triangle', vol: 0.28 }); },
    // Zīmogs ziņojumā
    stamp: () => { noise(0, 0.18, { filter: 'lowpass', freq: 400, vol: 0.5 }); tone(90, 0, 0.18, { type: 'sine', vol: 0.4 }); },
    // Brīdinājumi par laiku
    warn: () => { [0, 0.3, 0.6].forEach(t => tone(1000, t, 0.18, { vol: 0.25, type: 'square' })); },
    alarm: () => { for (let i = 0; i < 4; i++) { tone(900, i * 0.5, 0.22, { vol: 0.3 }); tone(600, i * 0.5 + 0.24, 0.22, { vol: 0.3 }); } },
    // Kartes atvēršana: papīra šalka
    map: () => noise(0, 0.25, { freq: 2500, q: 0.5, vol: 0.12 }),
    // Operatoru “paraksti” (izvēle un īpašība)
    op_vanags: () => { tone(600, 0, 0.35, { type: 'sine', to: 1800, vol: 0.2 }); noise(0, 0.35, { freq: 3000, vol: 0.06 }); },
    op_lusis: () => { [0, 0.09, 0.18, 0.27].forEach((t, i) => tone(1200 + i * 200, t, 0.05, { vol: 0.15 })); tone(2000, 0.38, 0.2, { type: 'triangle', vol: 0.18 }); },
    op_bebrs: () => { noise(0, 0.3, { freq: 1200, q: 0.4, vol: 0.18 }); [0, 0.1, 0.2, 0.45, 0.55].forEach((t, i) => tone(1000, 0.32 + t, i < 3 ? 0.06 : 0.16, { type: 'sine', vol: 0.2 })); },
    op_vilks: () => { tone(220, 0, 0.35, { type: 'sawtooth', vol: 0.2 }); tone(330, 0.35, 0.5, { type: 'sawtooth', vol: 0.22 }); tone(440, 0.85, 0.5, { type: 'sawtooth', vol: 0.2 }); },
    op_udris: () => { [0, 0.18, 0.8, 0.98].forEach(t => tone(70, t, 0.14, { type: 'sine', vol: 0.55 })); tone(1200, 1.3, 0.3, { type: 'sine', vol: 0.12 }); },
    op_puce: () => { tone(420, 0, 0.35, { type: 'sine', to: 380, vol: 0.25 }); tone(440, 0.45, 0.6, { type: 'sine', to: 360, vol: 0.25 }); }
  };

  window.SFX = {
    play(name) { try { if (!muted && FX[name]) FX[name](); } catch (e) {} },
    get muted() { return muted; },
    setMuted(v) { muted = !!v; try { localStorage.setItem('misija_mute', muted ? '1' : '0'); } catch (e) {} }
  };
})();
