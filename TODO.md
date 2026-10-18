1. OPSin mukaisest kriteerit sivustolle ja oppituntien linkitys

2. Latex-puolelle:
a) LaTeXmk ja .latex-aux:
    Juuren .latexmkrc -tiedostossa on määritelty $out_dir = "build"; ja $aux_dir = "build";.
    Huomasin, että kurssikansioissa käytät kuitenkin alikansioita .latex-aux/. Jos haluat, että LaTeXmk osaa automaattisesti ohjata aux-tiedostot kuhunkin paikalliseen .latex-aux-kansioon myös suoraan kurssikansioista käsin käännettäessä, voimme hioa .latexmkrc-sääntöä.
b) Yhteiset tyylipaketit ja pohjat (Pohjat/):
    Pohjakansiossa Pohjat/POHJA.tex on hyvä runko. Jos huomaat toistavasi samoja \usepackage-määrittelyjä ja geometrioita eri kokeissa, voisimme tehdä pienen oman tyylitiedoston (esim. rauh-koe.sty), jota kaikki kurssit voivat hyödyntää \usepackage{rauh-koe} -komennolla.
c) Kertausmateriaalien laajennus:
    Nyt kun pohjat ja synkronointi ovat valmiina, aina kun laadit uusia kertaustehtäviä vaikkapa kursseille MA_72, MA_73, MA_92 tai FY_91, riittää että käännät ne nimellä [KURSSI]_kertaus_v1.pdf ja [KURSSI]_kertaus_mallit_v1.pdf. Ne siirtyvät suoraan sivuston käyttöön!

[x] 3. Kurssiportaaliin yhdenmukaiset tyylit kurssisivusto-newin kanssa, on tyylikkäämpi. Ainoa jonka muuttaisin, on lämmittelytehtävien oranssi ulkoasu, tumman harmaa parempi?
    -> Valmis! Molemmat sivustot jakavat nyt yhtenäisen design-järjestelmän (väripaletti, pyöristykset, varjot, yläpalkki, pillerilinkit, dropdownit, kortit sekä siisti 'Alkuun'-nappi). Lämmittelytehtävät on päivitetty hillityn tumman harmaiksi molemmissa (#475569).

[x] 4. FY_91 layout ja sisältö näyttää hyvältä. Ajatuksena sivustolla voisi ollakin, että kaikilla kursseilla pääasiat tiivistetään tähän malliin todella yksinkertaiseen muotoon ja oppitunnin lopussa on avattava kortti tms, josta pääsee syvennä-osioon tms. Tänne sitten tarkempi kuvaus magneettikentistä, miksi käämeillä on rautasydän ym ym. Voisiko tämän ajatuksen pohjalta katsoa aluksi tuon lataamani FY_91 pdf-version, olisiko siellä materiaalia? Eli perusnäkymässä suht lyhyesti oleelliset asiat kuten nyt jo on ja lisäksi perään tuo syventävä osio.
    -> Valmis! PDF-versio (Pasilan PK _ RAUH - FY_91.pdf, 47 sivua) käyty läpi ja sen laadukkaat syventävät fysiikan teemat poimittu jokaiseen oppituntiin. Toteutettu tyylikäs, avattava "💡 Syvennä osaamistasi" -kortti oppituntien loppuun (ennen tehtäviä). Perusnäkymä säilyy tiiviinä ja selkeänä, ja kiinnostuneet voivat avata syventävän teorian (mm. miksi käämeissä on rautasydän, sähkömoottorin virrankäännin, Maan magneettikenttä & revontulet, salaman fysiikka, oikosulku, miksi siirtoverkossa käytetään 400 kV jännitettä, miksi muuntaja ei toimi tasavirralla). KaTeX-kaavat renderöidään siististi.