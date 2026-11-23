export const clone = x => JSON.parse(JSON.stringify(x));
const ex=(id,name,weights,goals,extra={})=>({id,name,rest:90,kind:'normal',step:2.5,sets:weights.map((kg,i)=>({kg,target:goals[i],reps:'',done:false})),...extra});
export const program=[
{name:'Bröst & triceps',exercises:[ex('bench','Bänkpress',[80,75,75,70],[9,8,9,11],{rest:150}),ex('incline','Lutande hantelpress 15°',[27.5,25,22.5],[11,9,13]),ex('fly','Hantelflyes',[20,20],[12,11]),ex('pushdown','Triceps pushdown',[35,35,32.5],[13,11,10]),ex('myo','Sidolyft · Myo',[9],['16+4+4+4'],{kind:'myo',rest:120})]},
{name:'Rygg & biceps',exercises:[ex('pulldown','Latsdrag',[77.5,75,72.5],[13,11,10],{rest:120}),ex('row','Sittande kabelrodd',[77.5,75],[11,10]),ex('facepull','Liggande face pull',[28.75],[21],{step:1.25}),ex('curl','Hantelcurl',[15,12.5,12.5],[13,14,12]),ex('hammer','Hammercurl',[15,15],[12,10]),ex('plank','Planka',[0,0],[100,80],{unit:'sek'}),ex('legraise','Benlyft',[0,0],[12,12])]},
{name:'Axlar & ben',exercises:[ex('shoulder','Sittande hantelaxelpress',[25,22.5,20],[11,10,12],{rest:120}),ex('incline2','Lutande hantelpress',[22.5,20],[13,13]),ex('lateral','Bakåtlutad sidolyft',[10,10],[16,14]),ex('rdl','Rumänska marklyft',[25,25],[12,12],{kind:'legs',rest:120}),ex('stepup','Step-ups · per ben',[15,15],[11,11],{kind:'legs',rest:120}),ex('crunch','Cable crunch',[40,40],[20,22])]}
];
export const initial=()=>({version:1,templates:clone(program),history:[],active:null,settings:{timer:true,rest:90},timer:null});
export function validState(s){
 if(!s||s.version!==1||!Array.isArray(s.templates)||s.templates.length!==3||!Array.isArray(s.history)||!s.settings||typeof s.settings.timer!=='boolean'||!Number.isFinite(s.settings.rest)||s.settings.rest<0) return false;
 const good=e=>e&&typeof e.id==='string'&&typeof e.name==='string'&&['normal','myo','legs'].includes(e.kind)&&Number.isFinite(e.rest)&&e.rest>=0&&Number.isFinite(e.step)&&e.step>0&&Array.isArray(e.sets)&&e.sets.length>0&&e.sets.every(r=>Number.isFinite(r.kg)&&r.kg>=0&&['string','number'].includes(typeof r.target)&&['string','number'].includes(typeof r.reps)&&typeof r.done==='boolean');
 const session=a=>a&&Number.isInteger(a.day)&&a.day>=0&&a.day<3&&typeof a.started==='string'&&Array.isArray(a.exercises)&&a.exercises.every(good);
 return s.templates.every(t=>typeof t.name==='string'&&Array.isArray(t.exercises)&&t.exercises.every(good))&&(!s.active||session(s.active))&&s.history.every(session)&&(!s.timer||Number.isFinite(s.timer.end));
}
export function suggestion(e,i,history){
 const r=e.sets[i]; if(!r.done) return 'Registrera setet för förslag';
 if(e.pain||!e.quality) return 'Behåll vikten · kontrollera teknik, RIR och smärta';
 if(e.kind==='myo') return String(r.reps)==='20+4+4+4'?'Mål uppnått · bekräfta stabil sekvens före viktökning':'Behåll vikten · bygg mot 20+4+4+4';
 if(e.kind==='legs') return e.sets.every(s=>s.done&&Number(s.reps)>=12)?'Båda set ≥12 smärtfritt · överväg minsta viktsteg':'Behåll vikten · båda set ska nå 12 smärtfritt';
 if(Number(r.reps)<Number(r.target)) return 'Behåll vikten · försök nå repsmålet';
 if(e.id==='bench'&&i===0){const prev=history.slice().reverse().find(h=>h.exercises.some(x=>x.id==='bench'));const p=prev?.exercises.find(x=>x.id==='bench');return r.kg===80&&Number(r.reps)>=9&&p?.quality&&!p.pain&&p.sets[0].done&&p.sets[0].kg===80&&Number(p.sets[0].reps)>=9?'Överväg 82,5 kg · kontrollera efterföljande set':'Behåll vikten · 80 × 9 krävs två pass i rad';}
 return r.kg===0?'Repsmål nått · öka tiden/reps manuellt':`Överväg ${String(r.kg+e.step).replace('.',',')} kg · bekräfta nästa repsmål`;
}
