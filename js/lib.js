'use strict';
/* Pure functions: no DOM access. Loaded as a plain script in the browser and with require() in Node tests. */

/* ===== formatting and small helpers ===== */
const fmt=(n,d=2)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const tbl=(head,rows)=>'<div class="tbl"><table><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
const co=(title,txt,warn)=>`<div class="callout${warn?' warn':''}"><b>${title}</b>${txt}</div>`;
/* A numeric answer may use a dot or a comma as the decimal separator. Returns NaN when it is not a plain number. */
function parseNum(s){
  const t=String(s==null?'':s).trim().replace(/\s+/g,'').replace(',','.');
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)?parseFloat(t):NaN;
}

/* ===== card numbers ===== */
function luhnCheck(s){let sum=0,alt=false;for(let i=s.length-1;i>=0;i--){let d=+s[i];if(alt){d*=2;if(d>9)d-=9}sum+=d;alt=!alt}return sum%10===0}
function luhnDigit(body){let sum=0,alt=true;for(let i=body.length-1;i>=0;i--){let d=+body[i];if(alt){d*=2;if(d>9)d-=9}sum+=d;alt=!alt}return (10-sum%10)%10}
function brandOf(p){
  if(/^4/.test(p))return 'Visa';
  const f4=+p.slice(0,4),f2=+p.slice(0,2);
  if((f2>=51&&f2<=55)||(f4>=2221&&f4<=2720))return 'Mastercard';
  if(/^3[47]/.test(p))return 'American Express';
  return 'not recognized from the prefix (identify national schemes, including Dina, with a BIN directory)';
}

/* ===== ISO 8583 ===== */
const DE_NAMES={1:'Secondary bitmap',2:'Primary account number (PAN)',3:'Processing code',4:'Amount, transaction',5:'Amount, settlement',6:'Amount, cardholder billing',7:'Transmission date & time',8:'Amount, cardholder billing fee',9:'Conversion rate, settlement',10:'Conversion rate, cardholder billing',11:'System trace audit number (STAN)',12:'Time, local transaction',13:'Date, local transaction',14:'Date, expiration',15:'Date, settlement',16:'Date, conversion',17:'Date, capture',18:'Merchant category code (MCC)',19:'Acquiring institution country code',20:'PAN extended, country code',21:'Forwarding institution country code',22:'Point of service entry mode',23:'Card sequence number',24:'Network international identifier',25:'Point of service condition code',26:'Point of service PIN capture code',27:'Authorization identification response length',28:'Amount, transaction fee',29:'Amount, settlement fee',30:'Amount, transaction processing fee',31:'Amount, settlement processing fee',32:'Acquiring institution identification code',33:'Forwarding institution identification code',34:'PAN, extended',35:'Track 2 data',36:'Track 3 data',37:'Retrieval reference number (RRN)',38:'Authorization identification response (auth code)',39:'Response code',40:'Service restriction code',41:'Card acceptor terminal identification (TID)',42:'Card acceptor identification code (MID)',43:'Card acceptor name / location',44:'Additional response data',45:'Track 1 data',46:'Additional data (ISO)',47:'Additional data (national)',48:'Additional data (private)',49:'Currency code, transaction',50:'Currency code, settlement',51:'Currency code, cardholder billing',52:'PIN data',53:'Security related control information',54:'Additional amounts',55:'ICC data (EMV)',56:'Reserved (ISO)',57:'Reserved (national)',58:'Reserved (national)',59:'Reserved (national)',60:'Reserved (national)',61:'Reserved (private)',62:'Reserved (private)',63:'Reserved (private)',64:'Message authentication code (MAC)'};
function bitmapHex(des){const bits=new Array(64).fill(0);des.forEach(n=>{if(n>=1&&n<=64)bits[n-1]=1});let hex='';for(let i=0;i<64;i+=4)hex+=parseInt(bits.slice(i,i+4).join(''),2).toString(16).toUpperCase();return hex}
function bitmapDes(hex){const out=[];for(let i=0;i<16;i++){const v=parseInt(hex[i],16);for(let b=0;b<4;b++){if(v&(8>>b))out.push(i*4+b+1)}}return out}
const ISO_DES=[2,3,4,7,11,12,13,14,18,22,37,41,42,49];
function isoBuild(f){
  const v={2:f.pan,3:f.proc,4:String(Math.round(f.amount*100)).padStart(12,'0'),7:'1109153012',11:String(f.stan).padStart(6,'0'),12:'163012',13:'1109',14:'2812',18:f.mcc,22:f.pem,37:String(f.rrn).padStart(12,'0'),41:String(f.tid).padEnd(8,' ').slice(0,8),42:String(f.mid).padEnd(15,' ').slice(0,15),49:f.cur};
  const bm=bitmapHex(ISO_DES);
  const raw=f.mti+bm+ISO_DES.map(n=>n===2?String(v[2].length).padStart(2,'0')+v[2]:v[n]).join('');
  return {v,bm,raw};
}

/* ===== reconciliation lab ===== */
function reconData(){
  return {
    auth:[['R001',10.00,'approved'],['R002',25.50,'approved'],['R003',99.99,'approved'],['R004',15.00,'approved'],['R005',40.00,'approved'],['R006',7.20,'approved'],['R007',120.00,'reversed'],['R008',18.00,'approved']],
    clr:[['R001',10.00],['R002',25.50],['R003',94.99],['R004',15.00],['R004',15.00],['R006',7.20],['R008',18.00],['R009',33.00]]
  };
}
function reconKey(){return {R001:'ok',R002:'ok',R003:'amt',R004:'dup',R005:'nocl',R006:'ok',R007:'ok',R008:'ok',R009:'noauth'}}
function reconTotals(){
  const d=reconData();
  const exp=d.auth.filter(a=>a[2]==='approved').reduce((s,a)=>s+a[1],0);
  const got=d.clr.reduce((s,c)=>s+c[1],0);
  return {exp:Math.round(exp*100)/100,got:Math.round(got*100)/100,diff:Math.round((got-exp)*100)/100};
}

/* ===== risk scoring and fees ===== */
function riskScore(c){
  let s=0;const why=[];
  const add=(n,t)=>{s+=n;why.push((n>0?'+':'')+n+' '+t)};
  if(c.amount>1500)add(30,'very large amount');else if(c.amount>500)add(15,'large amount');
  if(c.newDevice)add(20,'new device');
  if(c.geo)add(25,'IP country differs from card country');
  if(c.attempts>2)add(Math.min(30,(c.attempts-2)*6),'many attempts in an hour');
  if(c.newAddr)add(10,'new delivery address');
  if(c.tds)add(-30,'3-D Secure passed');
  if(c.old)add(-15,'long-standing customer');
  s=Math.max(0,Math.min(100,s));return {s,why};
}
function riskDecision(s,rv,dc){return s>=dc?'decline':s>=rv?'review':'approve'}
function feeCalc(a,ic,sc,mk,fx){const fi=a*ic/100,fs=a*sc/100,fm=a*mk/100;const tot=fi+fs+fm+fx;return {fi,fs,fm,fx,tot,net:a-tot,pct:a?tot/a*100:0}}

/* ===== progress state: shape, sanitizing, export, import, merge ===== */
const APP_ID='payments-ba-course';
const LS_KEY='payments-ba-course.v1';
const LIMITS={keys:200,note:20000,file:2000000,quizTotal:200};
const KEY_RE=/^[A-Za-z0-9_:-]{1,40}$/;
const BAD_KEYS=new Set(['__proto__','constructor','prototype']);
const fresh=()=>({v:1,done:{},quiz:{},qprog:{},notes:{},cards:{},last:'',ts:0});

function clampInt(n,lo,hi){n=Math.floor(+n);return isFinite(n)?Math.min(hi,Math.max(lo,n)):lo}
function clampTs(n){n=+n;return isFinite(n)&&n>0&&n<4e12?Math.floor(n):0}
function eachKey(obj,fn){
  if(!obj||typeof obj!=='object'||Array.isArray(obj))return;
  let n=0;
  for(const k of Object.keys(obj)){
    if(!KEY_RE.test(k)||BAD_KEYS.has(k))continue;
    if(++n>LIMITS.keys)break;
    fn(k,obj[k]);
  }
}
/* Returns a clean copy of a state object, or null when the input does not have the expected shape. Unknown keys and oversized values are dropped. */
function sanitizeState(o){
  if(!o||typeof o!=='object'||Array.isArray(o)||o.v!==1)return null;
  const s=fresh();
  eachKey(o.done,(k,v)=>{if(v)s.done[k]=true});
  eachKey(o.quiz,(k,v)=>{
    if(!v||typeof v!=='object')return;
    const total=clampInt(v.total,1,LIMITS.quizTotal),best=clampInt(v.best,0,total);
    s.quiz[k]={best,total,last:clampInt(v.last==null?best:v.last,0,total)};
  });
  eachKey(o.qprog,(k,v)=>{if(typeof v==='string'&&/^[cw-]{1,100}$/.test(v))s.qprog[k]=v});
  eachKey(o.notes,(k,v)=>{if(v&&typeof v==='object'&&typeof v.t==='string'&&v.t.length<=LIMITS.note)s.notes[k]={t:v.t,ts:clampTs(v.ts)}});
  eachKey(o.cards,(k,v)=>{if(v&&typeof v==='object'&&(v.k===1||v.k===2))s.cards[k]={k:v.k,ts:clampTs(v.ts)}});
  if(typeof o.last==='string'&&KEY_RE.test(o.last)&&!BAD_KEYS.has(o.last))s.last=o.last;
  s.ts=clampTs(o.ts);
  return s;
}
function serializeState(state,now){
  const clean=sanitizeState(state)||fresh();
  return JSON.stringify({app:APP_ID,v:1,exported:new Date(now==null?Date.now():now).toISOString(),state:clean},null,1);
}
/* Parses the text of an exported file. Never throws. */
function parseImport(text){
  if(typeof text!=='string'||!text.trim())return {ok:false,error:'The file is empty.'};
  if(text.length>LIMITS.file)return {ok:false,error:'The file is too large.'};
  let o;
  try{o=JSON.parse(text)}catch(e){return {ok:false,error:'The file is not valid JSON.'}}
  if(!o||typeof o!=='object'||o.app!==APP_ID)return {ok:false,error:'This is not a progress file from this course.'};
  if(o.v!==1)return {ok:false,error:'This file version is not supported.'};
  const s=sanitizeState(o.state);
  if(!s)return {ok:false,error:'The progress data in the file is malformed.'};
  return {ok:true,state:s};
}
const answered=str=>(str||'').replace(/-/g,'').length;
function mergeNewer(x,y){
  const out={};
  new Set(Object.keys(x||{}).concat(Object.keys(y||{}))).forEach(k=>{
    const p=(x||{})[k],q=(y||{})[k];
    out[k]=!p?q:(!q?p:((q.ts||0)>=(p.ts||0)?q:p));
  });
  return out;
}
/* Merge keeps the best of both sides and never loses a finished module. b wins ties. */
function mergeStates(a,b){
  const out=fresh();
  out.done=Object.assign({},a.done,b.done);
  new Set(Object.keys(a.quiz||{}).concat(Object.keys(b.quiz||{}))).forEach(k=>{
    const x=(a.quiz||{})[k],y=(b.quiz||{})[k];
    out.quiz[k]=!x?y:(!y?x:((y.best||0)>=(x.best||0)?y:x));
  });
  new Set(Object.keys(a.qprog||{}).concat(Object.keys(b.qprog||{}))).forEach(k=>{
    const x=(a.qprog||{})[k],y=(b.qprog||{})[k];
    out.qprog[k]=!x?y:(!y?x:(answered(y)>=answered(x)?y:x));
  });
  out.notes=mergeNewer(a.notes,b.notes);
  out.cards=mergeNewer(a.cards,b.cards);
  out.ts=Math.max(a.ts||0,b.ts||0);
  out.last=(b.ts||0)>=(a.ts||0)?(b.last||a.last||''):(a.last||b.last||'');
  return out;
}
function doneCount(state,ids){return ids.filter(id=>state.done[id]).length}

if(typeof module!=='undefined'&&module.exports){
  module.exports={fmt,tbl,co,parseNum,luhnCheck,luhnDigit,brandOf,DE_NAMES,bitmapHex,bitmapDes,ISO_DES,isoBuild,reconData,reconKey,reconTotals,riskScore,riskDecision,feeCalc,APP_ID,LS_KEY,LIMITS,fresh,sanitizeState,serializeState,parseImport,mergeStates,answered,doneCount};
}
