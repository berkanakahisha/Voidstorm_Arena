import { hashStringToSeed } from "./utils.js";

const LB_KEY="voidstorm_lb_v1";

function todayKey(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,"0");
  const dd=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${dd}`;
}

export function getDailySeed(){
  const key = todayKey();
  return hashStringToSeed("VOIDSTORM_DAILY_"+key);
}

export function getDailyCode(){
  return "D-"+todayKey();
}

export function loadLB(){
  try{
    const raw=localStorage.getItem(LB_KEY);
    if(!raw) return { daily:{}, custom:{} };
    const x=JSON.parse(raw);
    x.daily ||= {}; x.custom ||= {};
    return x;
  }catch{ return {daily:{}, custom:{}}; }
}
export function saveLB(lb){
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

export function submitScore({ mode, code, score, wave }){
  const lb=loadLB();
  const bucket = mode==="daily" ? lb.daily : lb.custom;
  bucket[code] ||= [];
  bucket[code].push({ score, wave, ts: Date.now() });
  bucket[code].sort((a,b)=>b.score-a.score);
  bucket[code]=bucket[code].slice(0,10);
  saveLB(lb);
  return bucket[code];
}

export function topScores({ mode, code }){
  const lb=loadLB();
  const bucket = mode==="daily" ? lb.daily : lb.custom;
  return bucket[code] || [];
}
