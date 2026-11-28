// Štāba uzdevumi: par pareizu atbildi jaunsargs saņem +1 īpašības reizi.
// Jauni uzdevumi nonāk pie jaunsargiem ar automātisko atjaunināšanu (kad telefonam ir internets).
// type: 'num' (precīzs skaitlis), 'range' (skaitlis diapazonā), 'text' (vārds, vairākas pareizas formas)
// h: kontrolsummas M.taskHash(id, normalizēta atbilde); r (range): base64 no "no|līdz"
// tries: mēģinājumu skaits (1 = atkārtot nevar); show: pareizā atbilde, ko parāda pēc pareizas iesniegšanas
window.MISIJA_TASKS = [
  { id: 't1', q: 'Cik gadi paliek Jaunsardzes centram 30. novembrī?', hint: 'Ieraksti tikai skaitli.',
    type: 'num', num: true, h: ['ujncfm3oox'], tries: 3, reward: 1, show: '34 gadi' },
  { id: 't2', q: 'Cik garš ir Mangaļsalas mols? (km)', hint: 'Ieraksti skaitli kilometros, piem. 1,5. Tikai viens mēģinājums!',
    type: 'range', r: 'MnwyLjQ=', tries: 1, reward: 1, show: '2,2 km' },
  { id: 't3', q: 'Kartes mērogs ir 1:20 000. Cik metriem dabā atbilst 1 cm kartē?', hint: 'Ieraksti tikai skaitli (metros). Tikai viens mēģinājums!',
    type: 'num', num: true, h: ['xr4mmzxftv'], tries: 1, reward: 1, show: '200 m' },
  { id: 't4', q: 'Kurā debespusē lec saule?', hint: 'Ieraksti debespusi. Tikai viens mēģinājums!',
    type: 'text', h: ['xnpme3p3sq', 'xdd3xf8iq5', '155e00rin5o', '1a1ve9y85l1', '1pfufn930st'], tries: 1, reward: 1, show: 'Austrumos' },
  { id: 't5', q: 'Uz kādu numuru Latvijā zvana ārkārtas situācijā (ugunsgrēks, nelaimes gadījums)?', hint: 'Ieraksti numuru. Tikai viens mēģinājums!',
    type: 'num', num: true, h: ['a0rh0ze21g'], tries: 1, reward: 1, show: '112' },
  { id: 't6', q: 'Cik grādu ir kompasa skalā (pilnā aplī)?', hint: 'Ieraksti tikai skaitli. Tikai viens mēģinājums!',
    type: 'num', num: true, h: ['25ej1jg8aez'], tries: 1, reward: 1, show: '360°' },
  { id: 't7', q: 'Kādā krāsā orientēšanās kartē attēlo ūdeni (ezerus, upes, grāvjus)?', hint: 'Ieraksti krāsu. Tikai viens mēģinājums!',
    type: 'text', h: ['2fhzzmqtef9', 'xsscxeoh8', '1smtu7dg07s', '1213arcv838', '14augetvdlr', 'zu73ibukku', '1l99ptcpnfg'], tries: 1, reward: 1, show: 'Zilā' }
];
