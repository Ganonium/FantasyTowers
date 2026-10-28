/**
 * Gemeinsame Farbpalette für alle Pixel-Art-Sprites. Jedes Zeichen in einer
 * Sprite-Zeichnung steht für eine Farbe; '.' ist transparent.
 */
export const PAL: Record<string, string> = {
  x: '#140e1c', // Kontur / Schwarz
  z: '#f8f8f0', // Weiß
  // Gras
  G: '#3a7a2c', g: '#58a03a', h: '#7cc050',
  // Erde / Weg
  d: '#9a6e3e', D: '#c49a5c', e: '#dcbc84',
  // Laub
  t: '#1e5428', T: '#2f7a3a', y: '#52a84a',
  // Holz
  b: '#4a2c18', B: '#7a4a24', n: '#a8703a',
  // Stein
  s: '#545a6a', S: '#8890a0', l: '#c0c8d0',
  // Wasser
  w: '#24448a', W: '#3a70c8', v: '#78b0f0',
  // Ork-Haut
  o: '#3e6020', O: '#6a9a30', p: '#94c048',
  // Rot / Feuer
  r: '#8a2020', R: '#d03a2a', f: '#f08a20', F: '#f8d040',
  // Eis
  j: '#3a88c8', I: '#70c8f0', i: '#c8f0ff',
  // Magie
  m: '#4a2a7a', M: '#7a4ab8', q: '#b088e8',
  // Haut (Menschen)
  a: '#e8b080', A: '#b87850',
  // Metall
  u: '#50505a', U: '#a0a0b0',
  // Gold
  Y: '#f0c040', P: '#b08020',
  // Wolf
  k: '#5a5a66', K: '#8c8c98', L: '#c0c0c8',
  // Augen
  E: '#ff4030',
  // Kristall (wird pro Turm überschrieben)
  c: '#b03020', C: '#f08a20',
};

export const UI = {
  outline: '#140e1c',
  woodDark: '#2e1c12',
  wood: '#4a2c18',
  woodLight: '#7a4a24',
  trim: '#c89a48',
  trimLight: '#f0d088',
  text: '#f8f8f0',
  textDim: '#b8a890',
  gold: '#f0c040',
  red: '#e04838',
  green: '#78d048',
  blue: '#70c8f0',
  shade: 'rgba(20,14,28,0.65)',
};
