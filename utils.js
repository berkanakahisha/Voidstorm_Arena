export const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
export const rand = (a,b)=>a+Math.random()*(b-a);
export const lerp = (a,b,t)=>a+(b-a)*t;
export const hypot = Math.hypot;

export function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a += 0x6D2B79F5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(s){
  // simple FNV-1a-ish
  let h = 2166136261 >>> 0;
  for(let i=0;i<s.length;i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
