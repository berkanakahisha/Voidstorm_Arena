// Basit achievement sistemi: progress -> unlock -> ödül coin + kozmetik
export const ACH = {
  FIRST_BLOOD: { name:"First Blood", desc:"İlk düşmanı öldür.", reward:{coins:50} },
  ELITE_HUNTER: { name:"Elite Hunter", desc:"10 elite öldür.", reward:{coins:250, cosmetic:{trail:"gold"}} },
  BOSS_DOWN: { name:"Boss Down", desc:"İlk boss'u indir.", reward:{coins:400, cosmetic:{skin:"gold"}} },
  LASER_MAIN: { name:"Laser Main", desc:"Laser ile 200 kill.", reward:{coins:300, cosmetic:{crosshair:"x"}} },
  NO_HIT_BOSS: { name:"Clean Execution", desc:"Boss fazı boyunca hasar alma.", reward:{coins:500} },
};

export function makeAchState(){
  return {
    unlocked:{},
    stats:{
      kills:0,
      eliteKills:0,
      bossKills:0,
      laserKills:0,
      lastBossNoHit:true,
      inBoss:false,
    }
  };
}

export function achOnEvent(achState, ev){
  const s=achState.stats;
  if(ev.type==="kill"){
    s.kills++;
    if(ev.elite) s.eliteKills++;
    if(ev.weapon==="LASER") s.laserKills++;
  }
  if(ev.type==="boss_start"){
    s.inBoss=true;
    s.lastBossNoHit=true;
  }
  if(ev.type==="player_hit"){
    if(s.inBoss) s.lastBossNoHit=false;
  }
  if(ev.type==="boss_kill"){
    s.bossKills++;
    s.inBoss=false;
  }
}

export function achCheckUnlocks(achState){
  const u=achState.unlocked;
  const s=achState.stats;
  const newly=[];

  const unlock = (id)=>{
    if(u[id]) return;
    u[id]=true;
    newly.push(id);
  };

  if(s.kills>=1) unlock("FIRST_BLOOD");
  if(s.eliteKills>=10) unlock("ELITE_HUNTER");
  if(s.bossKills>=1) unlock("BOSS_DOWN");
  if(s.laserKills>=200) unlock("LASER_MAIN");
  if(s.bossKills>=1 && s.lastBossNoHit===true) unlock("NO_HIT_BOSS");

  return newly;
}
