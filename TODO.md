1. OPSin mukaisest kriteerit sivustolle ja oppituntien linkitys

2. Latex-puolelle:
a) LaTeXmk ja .latex-aux:
    Juuren .latexmkrc -tiedostossa on määritelty $out_dir = "build"; ja $aux_dir = "build";.
    Huomasin, että kurssikansioissa käytät kuitenkin alikansioita .latex-aux/. Jos haluat, että LaTeXmk osaa automaattisesti ohjata aux-tiedostot kuhunkin paikalliseen .latex-aux-kansioon myös suoraan kurssikansioista käsin käännettäessä, voimme hioa .latexmkrc-sääntöä.
b) Yhteiset tyylipaketit ja pohjat (Pohjat/):
    Pohjakansiossa Pohjat/POHJA.tex on hyvä runko. Jos huomaat toistavasi samoja \usepackage-määrittelyjä ja geometrioita eri kokeissa, voisimme tehdä pienen oman tyylitiedoston (esim. rauh-koe.sty), jota kaikki kurssit voivat hyödyntää \usepackage{rauh-koe} -komennolla.
c) Kertausmateriaalien laajennus:
    Nyt kun pohjat ja synkronointi ovat valmiina, aina kun laadit uusia kertaustehtäviä vaikkapa kursseille MA_72, MA_73, MA_92 tai FY_91, riittää että käännät ne nimellä [KURSSI]_kertaus_v1.pdf ja [KURSSI]_kertaus_mallit_v1.pdf. Ne siirtyvät suoraan sivuston käyttöön!