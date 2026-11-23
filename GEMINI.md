# Antigravity Workspace Guidelines

Tämä ohjeistus koskee tekoälyavustajaa (Antigravity) tässä työtilassa (`kurssisivusto`, `latex` ja muut työtilan projektit).

## Automaattinen Git Commit ja Push (Tekoälyn tekemät muutokset)

Aina kun tekoäly (Antigravity) tekee tai muokkaa tiedostoja käyttäjän pyynnöstä ja tehtävä on suoritettu ja validoitu:
1. **Tarkistus ja siisteys:**
   - Varmista, että muutokset toimivat ja kääntyvät virheettömästi (esim. LaTeX-tiedostot kääntyvät PDF:ksi ilman virheitä tai ylilyöntejä, JSON-tiedostot ovat syntaksiltaan oikein).
   - Älä lisää gitin seurantaan tarpeettomia väliaikaistiedostoja.
2. **Automaattinen commit:**
   - Lisää kyseisen tehtävän muuttuneet tiedostot: `git add <tiedostot>`
   - Tee commit kuvaavalla, selkeällä suomenkielisellä viestillä: `git commit -m "..."`
3. **Automaattinen push:**
   - Pushaa muutokset heti GitHubiin: `git push origin main` (tai aktiiviseen haaraan).
   - Kerro vastauksessasi käyttäjälle lyhyesti, että muutokset on commitoitu ja pushattu GitHubiin.

## Käyttäjän omat muokkaukset
- Jos käyttäjä muokkaa tiedostoja itse, tekoäly ei koske niihin eikä tee niille automaattisia committeja tai pusheja. Käyttäjä hoitaa omat muokkauksensa manuaalisesti.

## Turvallisuus ja koetiedostot
- Koetiedostoja (`*_koe_*`, `*/koe/*`) ei koskaan synkronoida tai kopioida julkiselle kurssisivustolle.
