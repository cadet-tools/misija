# Misija — rogainings ar QR kodiem (CADET.LV)

Jaunsargi apmeklē kontrolpunktus, noskenē QR kodu, saņem punktus un izlūkziņu. Rīks darbojas **bez interneta** (internets vajadzīgs tikai pirmajai atvēršanai). Serveris nav vajadzīgs.

## Faili
- `index.html` — jaunsarga lapa (starts, KP skenēšana, taimeris, finiša rezultāta QR)
- `vaditajs.html` — vadītāja panelis (rezultātu skenēšana, tabula, CSV, starta saite, KP drukāšana, iestatījumi)
- `game.js` — noklusējuma misija: Vējiņu kausa 2026 LOF kartes 30 KP, punkti = KP numura pirmais cipars
- `common.js`, `jsqr.js`, `qrcode.js`, `sw.js`, `site.webmanifest`, ikonas

## Publicēšana
Ielādē visus failus jaunā GitHub repo (piem. `cadet-tools/misija`) → Settings → Pages → Deploy from branch `main` / root.
Kamerai vajadzīgs HTTPS, un GitHub Pages to nodrošina.

## Kā lietot
1. **Sagatavošana** (`vaditajs.html`): pārbaudi iestatījumus → **KP drukāšana** → izdrukā kartītes (6 uz A4) un izvieto pie KP.
2. **Starts**: jaunsargi, kamēr ir internets, atver **starta saiti** vai noskenē starta QR. Ieraksta vārdu → “Sākt misiju”.
3. **Mežā**: pie KP spied “Skenēt KP” (vai ievadi 4 simbolu kodu ar roku). Saņem apstiprinājumu, punktus un izlūkziņu.
4. **Finišs**: jaunsargs spiež “Finišs”, un viņa telefons parāda rezultāta QR. Vadītājs to noskenē sadaļā **Rezultāti**. Tabulu var lejupielādēt kā CSV.

## Noteikumi (noklusējums)
180 min (3 h), −1 p. par katru sākto nokavēto minūti, vairāk nekā 30 min kavējuma = rezultāts netiek ieskaitīts. Visu var mainīt sadaļā **Misijas iestatījumi** (pēc tam jāizsūta jauna starta saite).

## Godīgums
- KP kods ir piesaistīts misijas atslēgai, tāpēc izdomāt KP kodu nevar.
- Rezultāta QR ir parakstīts; ja kāds to labo, tabulā redzams ✕.
- ⏱ brīdina, ja telefona finiša laiks būtiski atšķiras no skenēšanas brīža.
- Ja jaunsargi varētu izmantot iepriekšējās reizes KP bildes, spied **Jauna misija (jauna atslēga)** un izdrukā KP no jauna.

Rezultāti glabājas tikai jaunsarga telefonā līdz finišam un pēc tam vadītāja pārlūkā. Neskenētu rezultātu nedzēst!
