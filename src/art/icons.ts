import { makeSprite, type Sprite } from './sprite';

const DEFS: Record<string, string[]> = {
  heart: ['.RR.RR.', 'RzRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  coin: ['.YYY.', 'YFYYP', 'YFYYP', 'YYYYP', '.PPP.'],
  sword: ['.....l', '....lU', '...lU.', 'Y.lU..', '.YU...', '.nY...', 'n..Y..'],
  star: ['...Y...', '...Y...', 'YYYFYYY', '.YFFFY.', '..YFY..', '.YY.YY.', '.Y...Y.'],
  starEmpty: ['...u...', '...u...', 'uuuuuuu', '.uuuuu.', '..uuu..', '.uu.uu.', '.u...u.'],
  lock: ['.uuu.', 'u...u', 'u...u', 'YYYYY', 'YPYPY', 'YYPYY', 'YYYYY'],
  pause: ['zz.zz', 'zz.zz', 'zz.zz', 'zz.zz', 'zz.zz'],
  play: ['z....', 'zzz..', 'zzzzz', 'zzz..', 'z....'],
  ff: ['z..z..', 'zz.zz.', 'zzzzzz', 'zz.zz.', 'z..z..'],
  close: ['z...z', '.z.z.', '..z..', '.z.z.', 'z...z'],
};

const cache = new Map<string, Sprite>();

export function icon(name: string): Sprite {
  let s = cache.get(name);
  if (!s) {
    s = makeSprite(DEFS[name] ?? DEFS.close);
    cache.set(name, s);
  }
  return s;
}
