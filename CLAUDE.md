# Hinweise für Claude

- Sprache: Code-Kommentare, Texte und Commits auf Deutsch.
- Zielplattform: Smartphone im Hochformat. Logische Auflösung ist 192 px breit, Höhe 348–440 px
  (siehe `src/core/Display.ts`). Spielfeld 12×16 Felder à 16 px, darüber HUD (20 px), darunter Panel.
- Alles wird in einen kleinen Puffer gezeichnet und pixelgenau hochskaliert – Positionen beim Zeichnen runden.
- Keine externen Assets oder Fonts: Grafiken entstehen in `src/art/`, Text über die Bitmap-Schrift
  in `src/core/font.ts` (nur Großbuchstaben, Umlaute vorhanden; fehlende Zeichen dort ergänzen).
- Inhalte (Türme, Gegner, Karten, Level) sind reine Daten in `src/data/`. Neue Inhalte möglichst dort
  ergänzen statt Sonderfälle in der Logik einzubauen.
- Die Spiellogik in `src/game/Battle.ts` kennt keine Darstellung und läuft mit festem Zeitschritt.
  Sie lässt sich daher auch headless simulieren (z. B. für Balancing-Tests).
- Vor dem Commit: `npm run build` muss fehlerfrei durchlaufen.
