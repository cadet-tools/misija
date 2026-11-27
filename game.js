// Noklusējuma misija: Vējiņu kausa 2026 LOF karte, rietumu daļa (14 KP).
// Punkti pēc rogaininga tradīcijas: KP numura pirmais cipars (31 → 3 p., 92 → 9 p.).
// Katrs KP atklāj vienu vai divas ziņas (f) par ienaidnieka plānu. Finišā no tām tiek salikts izlūkošanas ziņojums.
// Vadītāja lapā (vaditajs.html) visu var mainīt un izveidot jaunu starta saiti.
window.MISIJA_DEFAULT = {
  v: 2,
  id: 'op-vejs',
  key: 'vejs-2026-cadet',
  title: 'Operācija VĒJŠ',
  brief: 'Piekrastē slēpjas ienaidnieka diversantu grupa, kas gatavo uzbrukumu. Mūsu novērotāji kontrolpunktos atstājuši izlūkziņas. Katra ziņa atklāj daļu no ienaidnieka plāna: KAS viņi ir, MĒRĶIS, LAIKS, PIEEJA, BĀZE un PAROLE. Visus punktus apmeklēt nepaspēsiet, tāpēc plānojiet maršrutu gudri. Atgriezieties štābā pirms laika beigām. Štābā no jūsu ziņām tiks sastādīts izlūkošanas ziņojums, un no tā būs atkarīgs operācijas iznākums.',
  min: 180,
  pen: 1,
  dq: 30,
  bonus: 15,
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
  ].map(([id, m, f]) => ({ id, p: Number(id[0]), m, f }))
};
