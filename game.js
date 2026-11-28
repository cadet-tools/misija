// Noklusējuma misija: Vējiņu kausa 2026 LOF karte, rietumu daļa (14 KP).
// Punkti pēc rogaininga tradīcijas: KP numura pirmais cipars (31 → 3 p., 92 → 9 p.).
// Katrs KP atklāj vienu vai divas ziņas (f) par ienaidnieka plānu. Finišā no tām tiek salikts izlūkošanas ziņojums.
// Vadītāja lapā (vaditajs.html) visu var mainīt un izveidot jaunu starta saiti.
// KP atrašanās vietas LOF kartes attēlā (pikseļos), no VK2
const XY = {"21":[1502.0,1124.0],"23":[1575.0,297.0],"31":[992.0,836.0],"32":[814.0,1189.0],"33":[1654.0,927.0],"35":[753.0,952.0],"41":[1825.0,501.0],"42":[1331.0,409.0],"43":[1211.0,512.0],"44":[807.0,800.0],"46":[1517.0,947.0],"47":[283.0,1061.0],"48":[2353.0,716.0],"49":[1855.0,790.0],"50":[697.0,1135.0],"51":[1333.0,587.0],"52":[1713.0,266.0],"53":[2288.0,406.0],"54":[1642.0,751.0],"55":[413.0,928.0],"56":[2135.0,284.0],"57":[2108.0,633.0],"61":[2175.0,875.0],"62":[1646.0,1199.0],"63":[1509.0,1582.0],"81":[1673.0,1514.0],"82":[2399.0,1047.0],"83":[1931.0,145.0],"91":[1593.0,625.0],"92":[106.0,1136.0]};

// KP leģendas (no VK2): o = objekts, v = KP vieta pie objekta, l = ko meklēt
const LEG = {"23": {"o": "Taku krustojums “+ / X” veida","v": "Krustojuma centrs","l": "Meklē vietu, kur divas takas krustojas “+” vai “X” veidā."},"31": {"o": "Grāvja DA stūris","v": "Dienvidaustrumu stūris","l": "Meklē kartē norādīto grāvi un nosaki tā dienvidaustrumu stūri."},"32": {"o": "Taku krustojums “+ / X” veida","v": "Krustojuma centrs","l": "Meklē vietu, kur divas takas krustojas “+” vai “X” veidā."},"35": {"o": "Paugurs","v": "LOF apļa centrs","l": "Meklē kartē norādīto pauguru."},"42": {"o": "Ēka","v": "LOF apļa centrs","l": "Meklē kartē norādīto ēku."},"43": {"o": "Taku atzars “Y” krustojums","v": "“Y” atzara centrs","l": "Meklē vietu, kur taka sadalās vai pievienojas citai takai “Y” veidā."},"44": {"o": "Grāvis","v": "LOF apļa centrs","l": "Meklē kartē norādīto grāvi."},"47": {"o": "Taku atzars “Y” krustojums","v": "“Y” atzara centrs","l": "Meklē vietu, kur taka sadalās vai pievienojas citai takai “Y” veidā."},"50": {"o": "Paugurs","v": "LOF apļa centrs","l": "Meklē kartē norādīto pauguru."},"51": {"o": "Taku atzars “Y” krustojums","v": "“Y” atzara centrs","l": "Meklē vietu, kur taka sadalās vai pievienojas citai takai “Y” veidā."},"52": {"o": "Taku atzars “Y” krustojums","v": "“Y” atzara centrs","l": "Meklē vietu, kur taka sadalās vai pievienojas citai takai “Y” veidā."},"55": {"o": "Takas R galā","v": "Rietumu gals","l": "Meklē kartē norādītās takas rietumu galu."},"83": {"o": "Paugurs","v": "LOF apļa centrs","l": "Meklē kartē norādīto pauguru."},"92": {"o": "Paugurs","v": "LOF apļa centrs","l": "Meklē kartē norādīto pauguru."}};

window.MISIJA_DEFAULT = {
  v: 7,
  id: 'op-vejs',
  key: 'vejs-2026-cadet',
  title: 'Operācija VĒJŠ',
  brief: 'Piekrastē slēpjas ienaidnieka diversantu grupa, kas gatavo uzbrukumu. Mūsu novērotāji kontrolpunktos atstājuši izlūkziņas. Katra ziņa atklāj daļu no ienaidnieka plāna: KAS viņi ir, MĒRĶIS, LAIKS, PIEEJA, BĀZE un PAROLE. Visus punktus apmeklēt nepaspēsiet, tāpēc plānojiet maršrutu gudri. Atgriezieties štābā pirms laika beigām. Štābā no jūsu ziņām tiks sastādīts izlūkošanas ziņojums, un no tā būs atkarīgs operācijas iznākums.',
  min: 180,
  pen: 1,
  dq: 30,
  bonus: 15,
  // Karte telefonā (bez atrašanās vietas): LOF attēls un starts/finišs
  map: 'lof-map.jpg',
  sf: [1063.8, 738.6],
  // KP apstiprināšana: 'qr' (tikai QR kods), 'gps' (tikai GPS), 'both' (QR vai GPS)
  check: 'both',
  // Operatori ar īpašībām (katram 'uses' reizes)
  // Instruktora tālrunis (poga "Zvanīt instruktoram")
  phone: '+371 24866351',
  abil: true,
  uses: 3,
  radius: 30,
  // Kartes piesaiste (attēla px,py → lat,lng) no VK2; no tās aprēķina KP GPS koordinātas
  geo: [[1075.1,670.0,57.073497,24.088683],[1121.8,628.2,57.074517,24.091644],[925.5,1538.3,57.048119,24.072783],[1622.5,901.4,57.063889,24.116868],[1589.8,1575.8,57.043801,24.109089],[873.1,1158.5,57.059789,24.073255],[1093.5,1013.9,57.063068,24.086655],[1062.8,739.0,57.071472,24.087406]],
  facts: [
    { id: 'kas', t: 'KAS', x: 'Diversantu grupa “Kaija”: 6 cilvēki, komandieris ar segvārdu “Bārda”.' },
    { id: 'merkis', t: 'MĒRĶIS', x: 'Sagrābt tiltu pār Vecdaugavu un atslēgt sakaru torni aiz tā.' },
    { id: 'laiks', t: 'LAIKS', x: 'Rīt rītausmā, plkst. 05:30, kad mainās sardze.' },
    { id: 'pieeja', t: 'PIEEJA', x: 'Ar divām gumijas laivām no jūras, krastā izkāps Vecāķu pludmalē.' },
    { id: 'baze', t: 'BĀZE', x: 'Slēptuve kāpu mežā pie vecā bunkura, tur glabājas viņu aprīkojums.' },
    { id: 'parole', t: 'PAROLE', x: '“Smilga”, atbilde “Priede”. Ar to var iefiltrēties viņu sakaros.' }
  ],
  end: {
    full: 'Pilns ziņojums! Štābs zina visu ienaidnieka plānu. Rītausmā grupa “Kaija” tiek sagaidīta Vecāķu pludmalē un aizturēta, pirms tā paspēj izkāpt krastā. Tilts un sakaru tornis ir drošībā. Operācija VĒJŠ izdevusies pilnībā.',
    part: 'Ziņojumā ir robi. Štābs nostiprina apsardzi, bet daļa ienaidnieka plāna paliek nezināma. Uzbrukums tiek atvairīts, tomēr diversantiem izdodas aizbēgt. Vēl dažas izlūkziņas, un iznākums būtu bijis pilnīgs.',
    fail: 'Štābam trūkst informācijas. Ienaidnieka plāns paliek neskaidrs, un rītausmā grupa “Kaija” pārsteidz mūsu sardzi. Nākamreiz plānojiet maršrutu tā, lai savāktu dažādas ziņas.'
  },
  kp: [
    ['23', 'Novērotājs naktī redzēja laivu signāllukturus jūrā pie Vecāķiem.', ['pieeja']],
    ['31', 'Novērotāja piezīmes: grupa pārvietojas kopā, visi klausa vīru ar bārdu.', ['kas']],
    ['32', 'Ienaidnieka sakarnieka pazaudētajā bloknotā ir parole un atbilde.', ['parole']],
    ['35', 'Krastā atrastas gumijas laivas pēdas un airu atstātas zīmes smiltīs.', ['pieeja']],
    ['42', 'Pēdas ved uz kāpu mežu, kur zeme izmīdīta pie vecas betona sienas.', ['baze']],
    ['43', 'Atrasta saplēsta karte: aplis ap tiltu un bultiņa uz sakaru torni.', ['merkis']],
    ['44', 'Zīmīte ar ciparu “0530” un vārdiem “sardzes maiņa”.', ['laiks']],
    ['47', 'Kāpās noslēpts laivas sūknis un rezerves airis.', ['pieeja']],
    ['50', 'Vietējais zvejnieks redzēja svešiniekus fotografējam tiltu un torni.', ['merkis']],
    ['51', 'Noklausīta saruna mežā: “Smilga?” un atbilde “Priede.”', ['parole']],
    ['52', 'Pārtverta rācijas saruna: “Kaija, šeit Bārda. Sešinieks gatavs.”', ['kas']],
    ['55', 'Pie vecā bunkura svaigi ugunskura pelni un tukšas konservu kārbas.', ['baze']],
    ['83', 'Ienaidnieka kurjera soma! Tajā pavēle ar grupas sastāvu un uzbrukuma laiku.', ['kas', 'laiks']],
    ['92', 'Aizturēts ienaidnieka ziņnesis! Viņš izstāsta, kur ir bāze un kāda ir parole.', ['baze', 'parole']]
  ].map(([id, m, f]) => ({ id, p: Number(id[0]), m, f, x: XY[id][0], y: XY[id][1], leg: LEG[id] }))
};
