# Fantasy Towers

Ein kleines Tower-Defense-Spiel im Pixel-Art-Stil, inspiriert von *Zelda: A Link to the Past*.
Läuft im Browser, ist für Smartphones im Hochformat optimiert und wird über GitHub Pages veröffentlicht.

Eine Horde aus Goblins, Orks, Ork-Brutes und Wolfsreitern marschiert auf das Tor zu.
Baue auf festen Bauplätzen Bogentürme, Katapulte, Feuer- und Frostmagier und rüste sie auf.

## Spielen

Nach dem Merge auf `main` baut eine GitHub Action das Spiel und veröffentlicht es unter
`https://ganonium.github.io/FantasyTowers/`.

> Einmalig nötig: Im Repository unter **Settings → Pages → Build and deployment → Source**
> den Eintrag **GitHub Actions** auswählen.

## Entwicklung

```bash
npm install
npm run dev      # Entwicklungsserver (auch im WLAN erreichbar, z. B. zum Testen am Handy)
npm run build    # Typprüfung + Produktions-Build nach dist/
```

Technik: TypeScript, Vite, HTML5-Canvas. Keine Laufzeit-Abhängigkeiten, keine fremden Assets –
alle Grafiken und die Schrift sind im Code gezeichnet.

## Projektstruktur

```
src/
  core/      Anzeige (Pixel-Skalierung), Eingabe, Bitmap-Schrift, Speicherstand
  art/       Pixel-Art: Palette, Gegner, Türme, Icons, prozedurales Gelände
  data/      Spielinhalte: Türme, Gegner, Karten, Level/Wellen (reine Daten)
  game/      Spiellogik (Battle) und Spielfeld-Darstellung
  scenes/    Titel, Levelauswahl, Kampf
  ui/        Buttons und Panels
  i18n/      Texte (Deutsch)
```

## Inhalte erweitern

Fast alles wird über Daten gesteuert. Spiellogik muss dafür nicht angefasst werden.

| Was | Wo |
| --- | --- |
| **Neues Level** | Eintrag in `src/data/levels.ts` (Karte, Startgold, Leben, Wellen) und Name in `src/i18n/de.ts`. |
| **Neue Karte** | Datei in `src/data/maps/`, in `src/data/maps/index.ts` registrieren. Gelände als Textraster (`#` Weg, `B` Bauplatz, `T` Baum …), Wege als Wegpunkte. Mehrere Wege sind möglich. |
| **Neuer Gegner** | Werte in `src/data/enemies.ts`, Zeichnung in `src/art/enemies.ts` (gleiche ID), Name in `de.ts`. |
| **Neuer Turm** | Werte und Stufen in `src/data/towers.ts` (+ `TOWER_ORDER`), Zeichnung in `src/art/towers.ts`, Texte in `de.ts`. |
| **Neue Sprache** | Kopie von `src/i18n/de.ts` übersetzen und in `src/i18n/index.ts` auswählen. |

Pixel-Art wird als Textraster gezeichnet: Jedes Zeichen ist eine Farbe aus `src/art/palette.ts`,
`.` ist transparent. Die dunkle Kontur wird automatisch ergänzt.
