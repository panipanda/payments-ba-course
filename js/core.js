'use strict';
/* App core: state, router, quizzes, practice, flashcards, exam, glossary.
   Course text comes from content/en/*.js, trainers from widgets.js, pure logic from lib.js. */

const COURSE=[], WIDGETS={}, CARDS=[], GLOSS=[], SOURCES={};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let UID=0; const uid=p=>p+'-'+(++UID);
const SITE_TITLE='Payments analysis for business analysts';

/* ===== state and saving (the visitor's own browser only) ===== */
let state=fresh();
const store={mode:'none'};
let persistAsked=false;
function storageOk(){try{const k=LS_KEY+'.probe';localStorage.setItem(k,'1');localStorage.removeItem(k);return true}catch(e){return false}}
function loadLocal(){try{const s=localStorage.getItem(LS_KEY);if(s)return sanitizeState(JSON.parse(s))}catch(e){}return null}
function saveLocal(){try{localStorage.setItem(LS_KEY,JSON.stringify(state));return true}catch(e){return false}}
function askPersist(){
  if(persistAsked)return;persistAsked=true;
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{})}catch(e){}
}
function touch(){state.ts=Date.now();store.mode=saveLocal()?'browser':'none';paintStatus();askPersist()}
function paintStatus(){
  const s=$('#save-state');if(s)s.textContent=store.mode==='browser'?'Saved in this browser':'Progress is not saved';
  const h=$('#home-save');if(h)h.textContent=store.mode==='browser'?'saved in this browser only':'not saved (this browser blocks site storage), use Export to keep a copy';
}
function initStore(){
  const local=loadLocal();
  if(local)state=local;
  store.mode=storageOk()?'browser':'none';
  paintStatus();
}

/* ===== export and import of progress ===== */
function exportProgress(){
  const blob=new Blob([serializeState(state)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='progress.json';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importProgress(file,msgEl){
  const say=(t,ok)=>{msgEl.className='fb '+(ok?'ok':'bad');msgEl.textContent=t};
  if(!file)return;
  if(file.size>LIMITS.file){say('The file is too large.',false);return}
  let text;try{text=await file.text()}catch(e){say('The file could not be read.',false);return}
  const r=parseImport(text);
  if(!r.ok){say(r.error,false);return}
  state=mergeStates(state,r.state);touch();
  say('Progress imported and merged with what is in this browser.',true);
  setTimeout(()=>{if(currentRoute()==='home')route()},1200);
}

/* ===== navigation ===== */
const view=()=>$('#view');
const currentRoute=()=>(location.hash||'#home').slice(1)||'home';
const moduleIds=()=>COURSE.map(m=>m.id);
function pct(){const n=COURSE.length;return n?Math.round(doneCount(state,moduleIds())/n*100):0}
function renderChrome(){
  const nav=$('#nav');if(!nav)return;
  const r=currentRoute();
  const item=(href,n,t,st,ok)=>`<a href="#${href}" ${r===href?'aria-current="page"':''}><span class="n">${n}</span><span>${t}</span><span class="st ${ok?'ok':''}">${st}</span></a>`;
  nav.innerHTML=`<h4>Start</h4>${item('home','·','About the course','','')}<h4>Modules</h4>`+COURSE.map((m,i)=>{
    const q=state.quiz[m.id];const ok=!!state.done[m.id];
    return item(m.id,String(i+1).padStart(2,'0'),esc(m.short||m.title),ok?'✓':(q?q.best+'/'+q.total:''),ok)}).join('')+
    `<h4>Practice</h4>${item('exam','E','Final exam',state.quiz.exam?state.quiz.exam.best+'/'+state.quiz.exam.total:'','')}${item('cards','F','Screening flashcards',cardStat(),'')}${item('glossary','G','Glossary','','')}`;
  const p=pct();$('#meter-fill').style.width=p+'%';$('#meter-txt').textContent=p+'% of the course';
}
function cardStat(){const k=CARDS.filter(c=>state.cards[c.id]&&state.cards[c.id].k===1).length;return k?k+'/'+CARDS.length:''}
function route(){
  const r=currentRoute();const v=view();$('#nav').classList.remove('open');
  document.title=SITE_TITLE;
  if(r==='home')renderHome(v);
  else if(r==='exam')renderExam(v);
  else if(r==='cards')renderCards(v);
  else if(r==='glossary')renderGlossary(v);
  else{const i=COURSE.findIndex(m=>m.id===r);if(i>=0)renderModule(v,COURSE[i],i);else renderHome(v)}
  renderChrome();window.scrollTo(0,0);
}

/* ===== module page ===== */
function sourcesBlock(id){
  const list=SOURCES[id];if(!list||!list.length)return '';
  return `<div class="sources"><h3>Sources</h3><ul>${list.map(s=>`<li><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ul></div>`;
}
function renderModule(v,m,idx){
  const body=m.body.replace(/\{\{w:([\w-]+)\}\}/g,(_,n)=>`<div class="widget" data-w="${n}"></div>`);
  const prev=COURSE[idx-1],next=COURSE[idx+1];
  const isDone=!!state.done[m.id];
  document.title=m.title+' | '+SITE_TITLE;
  if(state.last!==m.id){state.last=m.id;touch()}
  v.innerHTML=`<article class="sheet">
  <div class="eyebrow">Module ${idx+1} of ${COURSE.length} · day ${m.day} of the fast track · about ${m.minutes} min</div>
  <h1 style="font-size:1.8rem;margin:.3rem 0">${m.title}</h1><p class="lead">${m.lead}</p>
  <div class="learn"><b>After this module you will be able to</b><ul>${m.learn.map(x=>`<li>${x}</li>`).join('')}</ul></div>
  <div class="prose">${body}</div>
  <div class="take"><h3>Key points</h3><ul>${m.takeaways.map(x=>`<li>${x}</li>`).join('')}</ul></div>
  <div class="quiz"><h2 style="margin-top:.4rem">Quiz</h2><p class="src">The answer options are shuffled each time. The explanation appears right after you answer, and your answers are kept in this browser, so you can leave and come back.</p><div id="quiz-box"></div></div>
  <div class="practice" id="practice-box"></div>
  ${sourcesBlock(m.id)}
  <div class="row" style="margin-top:22px;justify-content:space-between">
    <div class="row">${prev?`<a class="btn ghost" style="text-decoration:none" href="#${prev.id}">← ${esc(prev.short||prev.title)}</a>`:''}</div>
    <div class="row"><button class="btn ${isDone?'ghost':''}" id="done-btn">${isDone?'Module complete ✓ (undo)':'Mark module complete'}</button>${next?`<a class="btn ghost" style="text-decoration:none" href="#${next.id}">${esc(next.short||next.title)} →</a>`:''}</div>
  </div>
  ${isDone?'<p class="src" style="text-align:right">Export your progress to keep a backup. <button class="btn ghost" id="export-hint">Export progress</button></p>':''}</article>`;
  $$('.widget',v).forEach(w=>{
    const def=WIDGETS[w.dataset.w];if(!def){w.remove();return}
    w.innerHTML=`<div class="w-head"><span>${def.title}</span><span>${def.tag||'trainer'}</span></div><div class="w-body"></div>`;
    def.init($('.w-body',w));
  });
  $$('[data-copy]',v).forEach(bt=>{bt.onclick=()=>{const t=document.getElementById(bt.dataset.copy);if(t)copyText(t.textContent,bt)}});
  mountQuiz($('#quiz-box'),m.quiz,{id:m.id,persist:true,onFinish:(c,t)=>{recordQuiz(m.id,c,t)}});
  mountPractice($('#practice-box'),m.practice);
  $('#done-btn').onclick=()=>{if(state.done[m.id])delete state.done[m.id];else state.done[m.id]=true;touch();renderModule(v,m,idx);renderChrome()};
  const eh=$('#export-hint');if(eh)eh.onclick=exportProgress;
}
function recordQuiz(id,c,t){const o=state.quiz[id];if(!o||c>=o.best){state.quiz[id]={best:c,total:t,last:c}}else{o.last=c}touch();renderChrome()}

/* ===== quiz (answers of module quizzes are kept per question) ===== */
function feedback(q,ok,restored){
  const t=q.type||'mc';
  const head=ok?'Correct.':(t==='order'?'Different order.':'Incorrect.');
  const note=restored?` <span class="src">(answered ${ok?'correctly':'incorrectly'} earlier)</span>`:'';
  let extra='';
  if(t==='num')extra=` Answer: <span class="num">${fmt(q.ans)}</span>.`;
  if(t==='order')extra=` The correct sequence: ${q.items.map((x,i)=>`${i+1}) ${x}`).join('; ')}.`;
  return `<div class="fb ${ok?'ok':'bad'}"><b>${head}</b>${note}${extra} ${q.why}</div>`;
}
function mountQuiz(box,qs,cfg){
  const key=cfg.persist?cfg.id:null;
  let saved=key?state.qprog[key]:null;
  if(saved&&saved.length!==qs.length)saved=null;
  const res=qs.map((_,i)=>saved?(saved[i]==='c'?true:saved[i]==='w'?false:null):null);
  box.innerHTML='';
  const saveQuiz=()=>{state.qprog[key]=res.map(r=>r===true?'c':r===false?'w':'-').join('');touch()};
  qs.forEach((q,qi)=>{
    const card=document.createElement('div');card.className='q';box.appendChild(card);
    renderQ(card,q,res[qi],ok=>{res[qi]=ok;if(key)saveQuiz();update(true)});
  });
  const foot=document.createElement('div');foot.className='row';foot.style.marginTop='12px';box.appendChild(foot);
  foot.addEventListener('click',e=>{
    if(e.target.dataset.act!=='reset')return;
    if(key){delete state.qprog[key];touch()}
    mountQuiz(box,qs,cfg);
  });
  function update(live){
    const done=res.filter(x=>x!==null).length,c=res.filter(x=>x===true).length;
    let h=`<span class="score">Answered ${done} of ${qs.length}, correct ${c}</span>`;
    if(done===qs.length)h+=` <span class="pill ${c/qs.length>=0.7?'ok':'hold'}">${Math.round(c/qs.length*100)}%</span>`;
    if(key?done>0:done===qs.length)h+=` <button class="btn ghost" data-act="reset">${key?'Reset quiz':'Try again'}</button>`;
    foot.innerHTML=h;
    if(live&&done===qs.length&&cfg.onFinish)cfg.onFinish(c,qs.length,res);
  }
  update(false);
}
function renderQ(card,q,prior,cb){
  const t=q.type||'mc';
  if(prior!==null){
    const opts=t==='mc'?q.o.map((o,i)=>`<button class="opt ${i===q.a?'right':''}" disabled>${o}</button>`).join(''):'';
    card.innerHTML=`<p class="qt">${q.q}</p>${opts}<div class="slot">${feedback(q,prior,true)}</div>`;
    return;
  }
  if(t==='mc'){
    const order=shuffle(q.o.map((_,i)=>i));
    card.innerHTML=`<p class="qt">${q.q}</p>`+order.map(i=>`<button class="opt" data-i="${i}">${q.o[i]}</button>`).join('')+'<div class="slot"></div>';
    card.addEventListener('click',e=>{
      const b=e.target.closest('.opt');if(!b||b.disabled)return;
      const ok=+b.dataset.i===q.a;
      $$('.opt',card).forEach(x=>{x.disabled=true;if(+x.dataset.i===q.a)x.classList.add('right')});
      if(!ok)b.classList.add('wrong');
      $('.slot',card).innerHTML=feedback(q,ok,false);cb(ok);
    });
  }else if(t==='num'){
    const id=uid('num');
    card.innerHTML=`<p class="qt">${q.q}</p><div class="row"><input type="text" inputmode="decimal" id="${id}" style="max-width:170px" aria-label="Answer"><button class="btn">Check</button></div><div class="slot"></div>`;
    const btn=$('button',card),inp=$('input',card);let fin=false;
    const submit=()=>{
      if(fin)return;const v=parseNum(inp.value);if(isNaN(v)){$('.slot',card).innerHTML='<div class="fb info">Enter a number. A dot or a comma both work.</div>';return}
      const ok=Math.abs(v-q.ans)<=(q.tol||0.005);fin=true;inp.disabled=true;btn.disabled=true;
      $('.slot',card).innerHTML=feedback(q,ok,false);cb(ok);
    };
    btn.onclick=submit;
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit()}});
  }else if(t==='order'){
    const idx=shuffle(q.items.map((_,i)=>i));let picked=[],fin=false;
    const draw=()=>{
      card.innerHTML=`<p class="qt">${q.q}</p><div class="chips">${idx.map(i=>`<button class="chip ${picked.includes(i)?'used':''}" data-i="${i}" ${picked.includes(i)||fin?'disabled':''}>${q.items[i]}</button>`).join('')}</div>
      <ol class="seq">${picked.map(i=>`<li>${q.items[i]}</li>`).join('')}</ol>
      <div class="row">${fin?'':'<button class="btn ghost" data-r="1">Clear my choice</button>'}</div><div class="slot"></div>`;
    };
    draw();
    card.addEventListener('click',e=>{
      if(fin)return;
      if(e.target.dataset.r){picked=[];draw();return}
      const b=e.target.closest('.chip');if(!b||b.disabled)return;picked.push(+b.dataset.i);
      if(picked.length===q.items.length){
        fin=true;const ok=picked.every((v,k)=>v===k);draw();
        $('.slot',card).innerHTML=feedback(q,ok,false);cb(ok);
      }else draw();
    });
  }
}

/* ===== practice ===== */
function mountPractice(box,p){
  const note=state.notes[p.id]||{};const chk=(state.notes[p.id+':c']||{}).t||'';
  box.innerHTML=`<h3>Practice: ${p.title}</h3><div class="prose">${p.brief}</div>
  <div class="field" style="margin-top:10px"><label for="n-${p.id}">Your answer (${store.mode==='browser'?'saved in this browser':'not saved, storage is unavailable'})</label><textarea id="n-${p.id}" data-note="${p.id}" maxlength="${LIMITS.note}" placeholder="Write here">${esc(note.t||p.template||'')}</textarea></div>
  <p class="src">Do not enter anything confidential here, such as employer data or real card numbers.</p>
  <h3 style="font-size:.95rem">Self-check</h3>${p.checks.map((c,i)=>`<label class="chk"><input type="checkbox" data-c="${i}" ${chk[i]==='1'?'checked':''}><span>${c}</span></label>`).join('')}
  <details><summary>Show the reference answer</summary><div class="prose">${p.model}</div></details>`;
  const ta=$('textarea',box);let tm=null;
  ta.addEventListener('input',()=>{ta.dataset.touched='1';clearTimeout(tm);tm=setTimeout(()=>{state.notes[p.id]={t:ta.value,ts:Date.now()};touch()},700)});
  box.addEventListener('change',e=>{if(e.target.dataset.c===undefined)return;const bits=$$('input[data-c]',box).map(x=>x.checked?'1':'0').join('');state.notes[p.id+':c']={t:bits,ts:Date.now()};touch()});
}

/* ===== home ===== */
function continueTarget(){
  const lastIdx=COURSE.findIndex(m=>m.id===state.last);
  if(lastIdx>=0&&!state.done[COURSE[lastIdx].id])return COURSE[lastIdx];
  const after=COURSE.slice(lastIdx+1).find(m=>!state.done[m.id]);
  return after||COURSE.find(m=>!state.done[m.id])||COURSE[0];
}
function renderHome(v){
  const first=continueTarget();
  const doneN=doneCount(state,moduleIds());
  const started=doneN>0||!!state.last||Object.keys(state.qprog).length>0;
  const verb=doneN===COURSE.length?'Review: ':started?'Continue: ':'Start: ';
  v.innerHTML=`<article class="sheet">
  <div class="eyebrow">A course for business analysts · payments, cards, finance</div>
  <h1 style="font-size:2.1rem;margin:.4rem 0">Payments analysis from zero to a screening interview</h1>
  <p class="lead">${COURSE.length} modules: from the four-party model to reconciliation in SQL and a specification for chargeback handling. Each module has an explanation, a trainer, a quiz and a practice task. At the end there is an exam, flashcards with screening questions and a glossary.</p>
  <div class="row"><a class="btn" style="text-decoration:none" href="#${first.id}">${verb}${esc(first.short||first.title)}</a><span class="src">${doneN} of ${COURSE.length} complete</span></div>
  <h2>Fast track</h2>
  <div class="dayplan">
   <b>Day 1</b><span>Modules 1-3: the ecosystem, the payment lifecycle, fees</span>
   <b>Day 2</b><span>Module 7: chargebacks and disputes</span>
   <b>Day 3</b><span>Module 5: ISO 8583</span>
   <b>Day 4</b><span>Modules 4 and 6: the card, EMV, tokens, 3-D Secure</span>
   <b>Day 5</b><span>Module 9: a national scheme (Dina), the glossary</span>
   <b>Day 6</b><span>Module 8: reconciliation and SQL</span>
   <b>Day 7</b><span>Modules 10-12: risk, the analyst craft, the final specification, the exam, the flashcards</span>
  </div>
  <p class="src">A 7-day fast track, with trainers. The order of the modules in the contents is logical, and the days can be rearranged.</p>
  <h2>Modules</h2>
  <div class="grid">${COURSE.map((m,i)=>`<a class="tile" href="#${m.id}"><span class="eyebrow">${String(i+1).padStart(2,'0')} · day ${m.day} · ${m.minutes} min</span><b>${m.title}</b><small>${state.done[m.id]?'Complete ✓':(state.quiz[m.id]?'Quiz: '+state.quiz[m.id].best+'/'+state.quiz[m.id].total:'Not started')}</small></a>`).join('')}</div>
  <div class="callout warn"><b>How to treat the facts</b>The course is educational, not a reference. Visa and Mastercard rules, dispute deadlines, fee rates and regulator requirements change. Specific numbers in the course are examples and are marked as such. Before relying on them at work, check them against the current documents of the schemes, the National Bank of Serbia and your partner bank. For Dina, only facts from the DinaCard website and the NBS decision are given. This course is not affiliated with Visa, Mastercard, EMVCo, the PCI Security Standards Council or the National Bank of Serbia; scheme names are used only to describe how things work.</div>
  <h2>Your progress</h2>
  <p>Progress and notes stay in your browser. Nothing is sent anywhere. There are no accounts, no cookies and no analytics. Current state: <b id="home-save"></b>.</p>
  <ul>
   <li>Saved: completed modules, quiz results and answers, flashcard marks, the text you write in practice tasks, and the module you opened last.</li>
   <li>Not saved on purpose: input in the trainers and an unfinished final exam.</li>
   <li>Progress belongs to this browser, profile and device. It does not sync to your phone or another computer.</li>
   <li>It disappears if you clear site data, close a private window or switch browsers. Safari may clear site data on its own after about a week without a visit.</li>
   <li>Back up with Export, and restore it on another device with Import. Import merges the file with what is already here.</li>
  </ul>
  <div class="row"><button class="btn" id="export-btn">Export progress</button><button class="btn ghost" id="import-btn">Import progress</button><input type="file" id="import-file" accept="application/json,.json" hidden><button class="btn ghost" id="reset-btn">Reset progress</button><span id="reset-box"></span></div>
  <div id="import-msg" role="status" style="margin-top:10px"></div>
  </article>`;
  paintStatus();
  $('#export-btn').onclick=exportProgress;
  $('#import-btn').onclick=()=>$('#import-file').click();
  $('#import-file').onchange=e=>{importProgress(e.target.files[0],$('#import-msg'));e.target.value=''};
  $('#reset-btn').onclick=()=>{
    $('#reset-box').innerHTML='<span class="fb bad" style="margin:0">Erase all progress and answers? <button class="btn" id="reset-yes">Yes, erase</button> <button class="btn ghost" id="reset-no">Cancel</button></span>';
    $('#reset-yes').onclick=()=>{state=fresh();touch();route()};$('#reset-no').onclick=()=>{$('#reset-box').innerHTML=''};
  };
}

/* ===== exam ===== */
function examPool(){const p=[];COURSE.forEach(m=>m.quiz.forEach(q=>p.push(Object.assign({mod:m.id,modTitle:m.short||m.title},q))));return p}
function renderExam(v){
  const best=state.quiz.exam;
  v.innerHTML=`<article class="sheet"><div class="eyebrow">Final exam</div><h1 style="font-size:1.8rem;margin:.3rem 0">20 questions from all modules</h1>
  <p class="lead">The questions are picked at random. After you finish, you will see which modules to review.${best?` Best result: <b>${best.best}/${best.total}</b>.`:''} An unfinished exam is not saved.</p>
  <div class="row"><button class="btn" id="ex-start">Start the exam</button></div><div id="ex-box"></div></article>`;
  $('#ex-start').onclick=()=>{
    const qs=shuffle(examPool()).slice(0,20);
    $('#ex-start').textContent='New exam';
    mountQuiz($('#ex-box'),qs,{id:'exam',persist:false,onFinish:(c,t,res)=>{
      recordQuiz('exam',c,t);
      const bad={};qs.forEach((q,i)=>{if(res[i]===false){bad[q.mod]=bad[q.mod]||{t:q.modTitle,n:0};bad[q.mod].n++}});
      const keys=Object.keys(bad);
      const sum=document.createElement('div');sum.className='callout';
      sum.innerHTML='<b>What to review</b>'+(keys.length?'<ul>'+keys.map(k=>`<li><a href="#${k}">${esc(bad[k].t)}</a>: ${bad[k].n} ${bad[k].n===1?'mistake':'mistakes'}</li>`).join('')+'</ul>':'No mistakes. Move on to the screening flashcards.');
      $('#ex-box').appendChild(sum);
    }});
    $('#ex-box').scrollIntoView({behavior:'smooth',block:'start'});
  };
}

/* ===== flashcards ===== */
let cardFilter='all',cardIdx=0,cardShown=false;
function renderCards(v){
  const list=()=>cardFilter==='all'?CARDS:CARDS.filter(c=>!(state.cards[c.id]&&state.cards[c.id].k===1));
  const draw=()=>{
    const L=list();
    if(!L.length){v.innerHTML=`<article class="sheet"><h1 style="font-size:1.6rem">All cards are marked "I know it"</h1><p class="lead">Switch to "All" or reset the marks on individual cards.</p><button class="btn" id="cf-all">Show all</button></article>`;$('#cf-all').onclick=()=>{cardFilter='all';cardIdx=0;draw()};return}
    if(cardIdx>=L.length)cardIdx=0;const c=L[cardIdx];const k=(state.cards[c.id]||{}).k;
    v.innerHTML=`<article class="sheet"><div class="eyebrow">Screening flashcards · ${cardIdx+1} of ${L.length}</div>
    <div class="row" style="margin:10px 0"><button class="btn ${cardFilter==='all'?'':'ghost'}" data-f="all">All (${CARDS.length})</button><button class="btn ${cardFilter==='rev'?'':'ghost'}" data-f="rev">Not marked "I know it" (${CARDS.filter(x=>!(state.cards[x.id]&&state.cards[x.id].k===1)).length})</button><button class="btn ghost" data-sh="1">Shuffle</button></div>
    <div class="cardbox"><div class="eyebrow">${esc(c.tag||'')}${k===1?' · I know it':k===2?' · review later':''}</div><div class="cq">${c.q}</div>
    ${cardShown?`<div class="prose">${c.a}</div><div class="row"><button class="btn" data-k="1">I know it</button><button class="btn ghost" data-k="2">Review later</button></div>`:`<div><button class="btn" data-show="1">Show the answer</button></div>`}</div>
    <div class="row" style="margin-top:12px"><button class="btn ghost" data-nav="-1">← Back</button><button class="btn ghost" data-nav="1">Next →</button></div>
    <p class="src">Answer out loud first, then open the answer. The questions are phrased the way they are often asked in English-language interviews. Cards marked as templates are for you to fill in with your own facts.</p></article>`;
    v.onclick=e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.f){cardFilter=b.dataset.f;cardIdx=0;cardShown=false;draw()}
      else if(b.dataset.sh){const a=shuffle(CARDS);CARDS.splice(0,CARDS.length,...a);cardIdx=0;cardShown=false;draw()}
      else if(b.dataset.show){cardShown=true;draw()}
      else if(b.dataset.k){state.cards[c.id]={k:+b.dataset.k,ts:Date.now()};touch();cardShown=false;if(cardFilter==='rev'&&b.dataset.k==='1'){}else cardIdx++;draw();renderChrome()}
      else if(b.dataset.nav){cardIdx=(cardIdx+ +b.dataset.nav+L.length)%L.length;cardShown=false;draw()}
    };
  };
  draw();
}

/* ===== glossary ===== */
function renderGlossary(v){
  v.innerHTML=`<article class="sheet"><div class="eyebrow">Glossary</div><h1 style="font-size:1.8rem;margin:.3rem 0">${GLOSS.length} terms of payments and analysis</h1>
  <p class="lead">Short working definitions. For exact wording, use the documents of the scheme or the bank you work with.</p>
  <div class="field" style="max-width:420px"><label for="gl-q">Search</label><input type="text" id="gl-q" placeholder="chargeback, interchange, token…"></div>
  <div class="tbl"><table><thead><tr><th>Term</th><th>Also called</th><th>What it is</th></tr></thead><tbody id="gl-body"></tbody></table></div></article>`;
  const draw=q=>{const s=q.trim().toLowerCase();$('#gl-body').innerHTML=GLOSS.filter(g=>!s||(g.en+' '+(g.alt||'')+' '+g.d).toLowerCase().includes(s)).map(g=>`<tr class="gl-row"><td>${esc(g.en)}</td><td>${esc(g.alt||'')}</td><td>${g.d}</td></tr>`).join('')||'<tr><td colspan="3">Nothing found</td></tr>'};
  draw('');$('#gl-q').oninput=e=>draw(e.target.value);
}

/* ===== utilities and start ===== */
function copyText(text,btn){
  const done=()=>{if(!btn)return;const o=btn.textContent;btn.textContent='Copied';setTimeout(()=>btn.textContent=o,1400)};
  try{navigator.clipboard.writeText(text).then(done,()=>fallback())}catch(e){fallback()}
  function fallback(){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}
}
function boot(){
  $('#menu-btn').onclick=()=>$('#nav').classList.toggle('open');
  window.addEventListener('hashchange',route);
  initStore();route();
}
