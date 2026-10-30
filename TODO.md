1. OPSin mukaisest kriteerit sivustolle ja oppituntien linkitys
a) jokaiselle tunnille OPH:n mukaiset kriteerit (erityisesti arvosanan 5 ns. minimikriteerit selkeästi näkyviin)
b) sijainti oppitunnin lopussa


2. Latex-puolelle:
a) LaTeXmk ja .latex-aux:
    Juuren .latexmkrc -tiedostossa on määritelty $out_dir = "build"; ja $aux_dir = "build";.
    Huomasin, että kurssikansioissa käytät kuitenkin alikansioita .latex-aux/. Jos haluat, että LaTeXmk osaa automaattisesti ohjata aux-tiedostot kuhunkin paikalliseen .latex-aux-kansioon myös suoraan kurssikansioista käsin käännettäessä, voimme hioa .latexmkrc-sääntöä.
b) Yhteiset tyylipaketit ja pohjat (Pohjat/):
    Pohjakansiossa Pohjat/POHJA.tex on hyvä runko. Jos huomaat toistavasi samoja \usepackage-määrittelyjä ja geometrioita eri kokeissa, voisimme tehdä pienen oman tyylitiedoston (esim. rauh-koe.sty), jota kaikki kurssit voivat hyödyntää \usepackage{rauh-koe} -komennolla.
c) Kertausmateriaalien laajennus:
    Nyt kun pohjat ja synkronointi ovat valmiina, aina kun laadit uusia kertaustehtäviä vaikkapa kursseille MA_72, MA_73, MA_92 tai FY_91, riittää että käännät ne nimellä [KURSSI]_kertaus_v1.pdf ja [KURSSI]_kertaus_mallit_v1.pdf. Ne siirtyvät suoraan sivuston käyttöön!


3. Luokkahuoneen esitys- ja valkotaulutyökalut:
a) Integroitu valkotaulu (Whiteboard Canvas):
    - Aktivointi leijuvasta painikkeesta (esim. "Alkuun"-napin vieressä tai yläpalkissa).
    - Näyttötilat: Koko ruutu, puoli ruutua (split view rinnakkain teorian/tehtävien kanssa!), 1/4 ruutua / siirrettävä ikkuna.
    - Työkalut: Perustussit (musta, punainen, sininen, vihreä), pyyhekumi, kynän paksuus, tyhjennys, kumoa (undo).
    - Taustapohjat: Puhdas valkoinen, ruutupaperi (matematiikka/geometria) ja valmis koordinaatistopohja (akselit x ja y).
    - Toteutus: Natiivi HTML5 <canvas> ja Pointer Events (toimii heti hiirellä, sormella ja älytaulun/stylus-kynällä) ilman ulkoisia kirjastoja. Erittäin kevyt (n. 200–300 riviä koodia) ja nopea (60 fps).
b) Esitys- / Älytaulutila (Smartboard & Clicker):
    - Koko näytön esitysnäkymä: piilottaa yläpalkin ja ylimääräiset valikot, suurentaa leipätekstin ja KaTeX-kaavat kauempaa luettavaksi.
    - Langattoman esityskauko-ohjaimen (clicker) ja näppäimistön tuki: siirtyminen edelliseen/seuraavaan tuntiin nuolinäppäimillä (ArrowLeft / ArrowRight) tai PageUp / PageDown -näppäimillä.


4. Haku ja navigointi:
a) Pikahaku (Spotlight / Ctrl+K):
    - Reaaliaikainen pikahaku oppituntien otsikoista, ydinkäsitteistä, syventävistä teemoista ja fysiikan/matematiikan kaavoista.


5. Tulostus ja oppilaan työkalut:
a) Tulostustyylit (@media print):
    - Erityisesti sijaisohjeille (/sijaiselle) ja oppitunneille siisti paperi- ja PDF-tulostus ilman navigaatiopalkkeja tai taustavärejä.
b) Tehtävien vinkit ja tarkistusvastaukset:
    - Haastavampiin syventäviin tehtäviin avattavat vinkit (<details>/<summary>) itsenäisen opiskelun tueksi.
c) Oppilaan edistymisen seuranta (paikallinen):
    - Mahdollisuus merkitä tunti tai tehtävät käydyksi ilman kirjautumista (tallentuu selaimen localStorageen).


6. Tekninen laatu ja ylläpidettävyys:
a) Täysi offline-tuki (Service Worker sw.js):
    - Asennettava PWA, joka toimii luotettavasti vaikka koulun Wi-Fi pätkisi.
b) Koodin modulaarisuus (ES Modules):
    - src/app.js:n (yli 5 100 riviä) jakaminen loogisiin osiin (router, views, state) natiiveilla ES-moduleilla ilman mitään build/npm-vaihetta.
c) JSON-syntaksin automaattitarkistus Git pre-commitiin:
    - Nopea Python-tarkistus, joka estää viallisen JSON-tiedoston (puuttuvat pilkut tms.) commitoinnin.
