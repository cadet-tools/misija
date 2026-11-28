// Operatori: tēli (SVG), lomas un īpašības. Kopīgs jaunsarga un vadītāja lapai.
(function () {
  const OPS = [
    { k: 'vanags', name: 'VANAGS', role: 'IZLŪKS', c: '#7CFF6B', soft: 'rgba(124,255,107,.35)',
      motto: 'Redz visu no augšas. Pirmais pamana pēdas un ziņo štābam.',
      ab: 'IZLŪKOT KP', ad: 'Izvēlies KP un uzzini, kuru ziņu tas glabā, pirms ej uz to.' },
    { k: 'lusis', name: 'LŪSIS', role: 'NAVIGATORS', c: '#5CC8FF', soft: 'rgba(92,200,255,.35)',
      motto: 'Karte un kompass rokā. Vienmēr zina, kurp vest komandu.',
      ab: 'MĒRĪT MARŠRUTU', ad: 'Izvēlies divus punktus un uzzini attālumu taisnā līnijā un aptuveno gājiena laiku.' },
    { k: 'bebrs', name: 'BEBRS', role: 'SAKARNIEKS', c: '#FFB547', soft: 'rgba(255,181,71,.35)',
      motto: 'Uztur saiti ar štābu. Pārtver ienaidnieka rācijas.',
      ab: 'PĀRTVERT', ad: 'Izvēlies trūkstošu ziņu un uzzini, kuros KP to var atrast.' },
    { k: 'vilks', name: 'VILKS', role: 'KOMANDIERIS', c: '#FF6B5E', soft: 'rgba(255,107,94,.35)',
      motto: 'Plāno maršrutu un pieņem lēmumus, kad laiks skrien.',
      ab: 'PAVĒLE', ad: 'Nākamais apstiprinātais KP dod dubultus punktus.' },
    { k: 'udris', name: 'ŪDRIS', role: 'MEDIĶIS', c: '#E8E1CC', soft: 'rgba(232,225,204,.35)',
      motto: 'Rūpējas, lai visi atgriežas štābā veseli un laikā.',
      ab: 'SPĒKA REZERVE', ad: 'Pievieno misijai +10 minūtes laika bez soda.' },
    { k: 'puce', name: 'PŪCE', role: 'NOVĒROTĀJS', c: '#B78CFF', soft: 'rgba(183,140,255,.35)',
      motto: 'Pamana to, ko citi palaiž garām. Nakts ir tās laiks.',
      ab: 'DUBULTA NOVĒROŠANA', ad: 'Nākamais KP atklāj vēl vienu nejaušu trūkstošo ziņu.' }
  ];

  const HEAD = {
    vanags: c => `<ellipse cx="50" cy="36" rx="25" ry="5" fill="#3f5232"/><path d="M36 36 C36 24 64 24 64 36 Z" fill="#4a5f3a"/><path d="M37 32 H63" stroke="#2c3a27" stroke-width="2"/>`,
    lusis: c => `<path d="M33 44 C33 25 67 25 67 44 L70 46 H30 Z" fill="#55623f"/><rect x="37" y="31" width="26" height="7" rx="3" fill="#1a2417" stroke="${c}" stroke-width="1.2"/><circle cx="44" cy="34.5" r="2.4" fill="${c}" opacity="0.7"/><circle cx="56" cy="34.5" r="2.4" fill="${c}" opacity="0.7"/>`,
    bebrs: c => `<path d="M35 40 C35 28 65 28 65 40" fill="#3a4a30"/><path d="M33 47 C33 30 67 30 67 47" fill="none" stroke="#0d140c" stroke-width="3"/><rect x="29" y="43" width="6" height="11" rx="2" fill="${c}"/><rect x="65" y="43" width="6" height="11" rx="2" fill="#0d140c"/><path d="M32 52 Q36 58 44 57" fill="none" stroke="#0d140c" stroke-width="1.6"/><path d="M69 43 L76 18" stroke="#0d140c" stroke-width="1.6"/><circle cx="76" cy="18" r="1.6" fill="${c}"/>`,
    vilks: c => `<path d="M33 39 C30 28 58 23 70 31 C72 34 66 37 60 37 L34 40 Z" fill="#6b1f24"/><rect x="34" y="37" width="30" height="4" rx="2" fill="#3b1013"/><circle cx="40" cy="34" r="2.6" fill="${c}"/>`,
    udris: c => `<path d="M33 44 C33 25 67 25 67 44 L70 46 H30 Z" fill="#4c5a3c"/><rect x="45" y="30" width="10" height="7" rx="1" fill="#d8dccf"/><path d="M46 33.5 H48 L49 31.5 L51 35.5 L52 33.5 H54" fill="none" stroke="#1a2417" stroke-width="1"/>`,
    puce: c => `<path d="M33 44 C33 25 67 25 67 44 L70 46 H30 Z" fill="#2f3a2a"/><rect x="46" y="28" width="8" height="5" fill="#1a2417"/><rect x="44" y="33" width="5" height="9" rx="1.5" fill="#1a2417" stroke="${c}" stroke-width="1"/><rect x="51" y="33" width="5" height="9" rx="1.5" fill="#1a2417" stroke="${c}" stroke-width="1"/><circle cx="46.5" cy="41" r="1.4" fill="${c}"/><circle cx="53.5" cy="41" r="1.4" fill="${c}"/>`
  };

  function avatar(kind, size) {
    const o = OPS.find(x => x.k === kind) || OPS[0], c = o.c;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Operators ${o.name}">
<polygon points="50,2 92,26 92,74 50,98 8,74 8,26" fill="#0d140c" stroke="${c}" stroke-width="2.5"/>
<polygon points="50,9 86,30 86,70 50,91 14,70 14,30" fill="none" stroke="${c}" stroke-width="0.8" stroke-dasharray="2 3" opacity="0.6"/>
<path d="M20 92 C22 74 34 67 50 67 C66 67 78 74 80 92 L50 98 Z" fill="#2c3a27"/>
<path d="M38 69 L44 92 M62 69 L56 92" stroke="#1a2417" stroke-width="4"/>
<rect x="44" y="60" width="12" height="10" fill="#1a2417"/>
<circle cx="50" cy="47" r="15" fill="#1a2417"/>
<rect x="38" y="44" width="24" height="7" rx="3" fill="#c49a72"/>
<circle cx="44" cy="47.5" r="1.6" fill="#0d140c"/><circle cx="56" cy="47.5" r="1.6" fill="#0d140c"/>
<rect x="58" y="74" width="10" height="7" fill="${c}"/>
${HEAD[o.k](c)}</svg>`;
  }

  window.OPS = OPS;
  window.opById = k => OPS.find(o => o.k === k) || null;
  window.avatarSvg = avatar;
})();
