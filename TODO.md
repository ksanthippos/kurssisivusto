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


3. Luokkahuoneen esitys- ja valkotaulutyökalut: [TEHTY v1.26–v1.29]
a) Integroitu valkotaulu (Whiteboard Canvas): [TEHTY]
    - Aktivointi leijuvasta painikkeesta ("Alkuun"-napin vieressä) ja yläpalkissa (🖊️). Pikanäppäin Alt+W / W.
    - Näyttötilat: Koko ruutu (fullscreen) yhden klikkauksen paluulla edelliseen näkymään, puoli ruutua (split view rinnakkain teorian/tehtävien kanssa: AINA teksti vasemmalla ja taulu oikealla!), siirrettävä ja laajennettava kelluva ikkuna (oikeasta alanurkasta ja reunoista vedettävä, automaattinen koon ja sijainnin tallennus välimuistiin).
    - Työkalut: Perustussit tumman tilan automaattisella invertoinnilla (musta tussi kääntyy valkoiseksi tummassa teemassa ja päinvastoin, sininen, punainen, vihreä, keltainen korostus), pyyhekumi (destination-out: pyyhkii vain kynää eikä taustaruudukkoa), kynän paksuudet (2px, 4px, 8px), kumoa (undo), tee uudelleen (redo), tyhjennys (clear) ja kuvan tallennus PNG-tiedostoksi.
    - Panorointi ja zoomaus: Panorointityökalu (käsi-ikoni ✋ valikosta), zoomauspainikkeet (+, -, 100% nollaus), hiiren rullan tuki sekä kahden sormen nipistys-zoomaus ja siirto kosketusnäytöllä/älytaululla.
    - Taustapohjat: Tiivistetty yhden napin valitsin (📈, ▦, ⬜, ☰): valmis koordinaatisto (akselit x ja y asteikkoineen), ruutupaperi (matematiikka/geometria), puhdas valkoinen ja viivoitus.
    - Toteutus: Natiivi HTML5 <canvas> ja Pointer Events (toimii hiirellä, kosketuksella ja älytaulun kynällä) ilman ulkoisia kirjastoja. Retina/HiDPI -terävyystuki.
b) Esitys- / Älytaulutila (Smartboard & Clicker): [TEHTY]
    - Koko näytön esitysnäkymä: piilottaa yläpalkin ja ylimääräiset valikot, suurentaa leipätekstin (säädettävä 100% / 125% / 150%) ja KaTeX-kaavat kauempaa luettavaksi. Pikanäppäin F / Alt+P.
    - Täysleveä tekstitila myös rinnakkaisnäkymässä (50vw vasemmalla ilman kapeita marginaaleja) ja leijuvan ohjauspalkin keskitys vasemmalle puolikkaalle.
    - Langattoman esityskauko-ohjaimen (clicker) ja näppäimistön tuki: siirtyminen edelliseen/seuraavaan tuntiin nuolinäppäimillä (ArrowLeft / ArrowRight) tai PageUp / PageDown -näppäimillä.
c) Näytön hereilläpito (Screen Wake Lock & TV HDMI standby -esto): [TEHTY]
    - Estää kosketusnäyttö-TV:n nukahtamisen (esim. 10 min aikaraja) ja työkoneen automaattisen lukittumisen (esim. 15 min) oppitunnin aikana.
    - Asetettavissa asetuksista: "Päällä kun valkotaulu tai esitystila aktiivinen", "Aina kun kurssisivusto avoinna", tai "Pois päältä".
    - Huomaamaton Screen Wake Lock API sekä mikroskooppinen render-heräte (TV HDMI standby -esto). Kahvikuppi-indikaattori esityspalkissa.


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
