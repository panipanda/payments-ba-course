'use strict';
/* The 13 interactive trainers. Calculations live in lib.js; this file only draws and wires the interface. */

/* ===== 1. Who is who ===== */
WIDGETS.roles={title:'Who is who in a payment',tag:'matching',init(b){
  const roles=['Cardholder','Merchant','Issuer','Acquirer','Payment scheme','Processor','Payment gateway','PSP / aggregator'];
  const items=[
    ['Issued the card to the cardholder and makes the final decision: approve or decline the payment',2,'The authorization decision belongs to the issuer. Technically, a processor may carry it out under the rules of the bank.'],
    ['Has a contract with the seller, accepts payments from them and pays the money out',3,'This is the acquirer. It also carries the risk on the merchant: if the merchant disappears, refunds and chargebacks fall on the acquirer.'],
    ['Sets the rules, routes messages between banks and calculates the mutual settlement of participants',4,'The payment scheme (Visa, Mastercard, Dina). For Dina the system operator is the National Bank of Serbia.'],
    ['Accepts a payment request from the seller website over an API and passes it to the acquirer',6,'A payment gateway: a technical intermediary that does not hold the money and does not make decisions.'],
    ['The technical platform of a bank: handles authorizations, keeps card data, produces clearing files',5,'A processor. Processors work in this role for banks (issuing and acquiring processing).'],
    ['One contract with thousands of small sellers who do not need their own contract with an acquirer',7,'A PSP or payment aggregator. It accepts payments on behalf of connected merchants and takes on part of the risk.'],
    ['Pays for the goods and confirms the payment on the bank page (3-D Secure)',0,'The cardholder.'],
    ['Sells goods or a service and receives the money minus a fee',1,'The merchant. Its fee is called the MDR.']
  ];
  const ids=items.map(()=>uid('role'));
  b.innerHTML=items.map((it,i)=>`<div class="field" style="margin-bottom:10px"><label for="${ids[i]}">${i+1}. ${it[0]}</label><select id="${ids[i]}"><option value="">Choose a role</option>${roles.map((r,j)=>`<option value="${j}">${r}</option>`).join('')}</select><div class="fb-slot" id="${ids[i]}-fb"></div></div>`).join('')+'<div class="row"><button class="btn" id="roles-check">Check</button><span class="score" id="roles-score"></span></div>';
  $('#roles-check',b).onclick=()=>{let ok=0;items.forEach((it,i)=>{const v=$('#'+ids[i],b).value;const good=v!==''&&+v===it[1];if(good)ok++;$('#'+ids[i]+'-fb',b).innerHTML=v===''?'':`<div class="fb ${good?'ok':'bad'}">${good?'Correct. ':'The answer is '+roles[it[1]]+'. '}${it[2]}</div>`});$('#roles-score',b).textContent=`${ok} of ${items.length} correct`};
}};

/* ===== 2. Payment simulator ===== */
WIDGETS.paysim={title:'Simulator: a purchase of 100.00 EUR',tag:'step by step',init(b){
  const actors=['Cardholder','Merchant','Gateway','Acquirer','Scheme','Issuer'];
  const S=[
    {t:'Start',a:[0],d:'The cardholder has 500.00 EUR on the card. They pick goods worth 100.00 EUR.',st:[500,0,500,0],ph:''},
    {t:'Card entry and 3-D Secure',a:[0,1],d:'The cardholder enters the card details on the merchant page. If 3-D Secure is needed, the issuing bank additionally checks that the owner is paying (a password, a push in the app).',st:[500,0,500,0],ph:''},
    {t:'Authorization request',a:[1,2,3],d:'The merchant sends a request to the gateway, and the gateway passes it to the acquirer: "ask the issuer whether 100.00 EUR can be charged".',st:[500,0,500,0],ph:'Authorization'},
    {t:'Acquirer → scheme → issuer',a:[3,4,5],d:'The acquirer builds an authorization message (ISO 8583, for example MTI 0100 or 0200) and sends it through the scheme to the issuer.',st:[500,0,500,0],ph:'Authorization'},
    {t:'Issuer decision',a:[5],d:'The issuer checks that the card is active, the limit is sufficient and anti-fraud has no objection. It approves, places a hold of 100.00, and returns response code 00 and an auth code. The money is not charged yet, but it is already unavailable to the cardholder.',st:[500,100,400,0],ph:'Hold'},
    {t:'Response to the merchant',a:[5,4,3,2,1],d:'The response travels back along the same chain. The merchant sees "approved". The balance has not changed, only the available amount has.',st:[500,100,400,0],ph:'Hold'},
    {t:'Capture',a:[1,3],d:'The merchant confirms the charge: immediately (digital goods) or after shipping. Capture turns the permission into a demand for payment.',st:[500,100,400,0],ph:'Hold'},
    {t:'Clearing',a:[3,4,5],d:'The acquirer sends a financial record to the scheme. The scheme passes it to the issuer and calculates interchange and scheme fees. This is where the authorization amount is checked against the clearing amount.',st:[500,100,400,0],ph:'Clearing'},
    {t:'The issuer posts the charge',a:[5],d:'The hold becomes a posted transaction: the card balance is now 400.00 and the hold is released.',st:[400,0,400,0],ph:'Posted'},
    {t:'Settlement',a:[5,4,3,1],d:'The scheme calculates the net positions of the participants. The issuer sends money through the settlement bank, the scheme pays the acquirer, and the acquirer pays the merchant minus the fee. In this teaching example the fee is 0.95 EUR (see module 3).',st:[400,0,400,99.05],ph:'Settlement'}
  ];
  let i=0;
  const draw=()=>{
    const s=S[i];
    b.innerHTML=`<div class="row" style="margin-bottom:8px">${actors.map((a,j)=>`<span class="pill ${s.a.includes(j)?'ok':''}">${a}</span>`).join('')}</div>
    <div class="eyebrow">Step ${i+1} of ${S.length}${s.ph?' · stage: '+s.ph:''}</div><h3 style="margin:.2rem 0">${s.t}</h3><p>${s.d}</p>
    <div class="kv" style="max-width:420px"><span>Card balance (posted)</span><b class="num">${fmt(s.st[0])}</b><span>Hold (reserved)</span><b class="num">${fmt(s.st[1])}</b><span>Available to the cardholder</span><b class="num">${fmt(s.st[2])}</b><span>Received by the merchant</span><b class="num">${fmt(s.st[3])}</b></div>
    <div class="row" style="margin-top:12px"><button class="btn ghost" data-a="back" ${i===0?'disabled':''}>← Back</button><button class="btn" data-a="next" ${i===S.length-1?'disabled':''}>Next →</button><button class="btn ghost" data-a="reset">Restart</button></div>
    <div class="row" style="margin-top:12px"><span class="src">What if:</span><button class="btn ghost" data-a="rev">cancel after step 6 (reversal)</button><button class="btn ghost" data-a="ref">return the money after step 10 (refund)</button></div><div id="sim-alt"></div>`;
  };
  draw();
  b.onclick=e=>{
    const t=e.target.closest('button');if(!t)return;const a=t.dataset.a;
    if(a==='next'&&i<S.length-1){i++;draw()}
    else if(a==='back'&&i>0){i--;draw()}
    else if(a==='reset'){i=0;draw()}
    else if(a==='rev'){$('#sim-alt',b).innerHTML='<div class="fb info"><b>Reversal.</b> If the merchant cancels the order before clearing, it sends an authorization cancellation. The issuer releases the hold: 500.00 is available again, there will be no clearing, and the merchant has 0.00. No money was transferred anywhere, so the cancellation costs the cardholder nothing and is simple to account for.</div>'}
    else if(a==='ref'){$('#sim-alt',b).innerHTML='<div class="fb info"><b>Refund.</b> After settlement this is a separate reverse operation (a credit). The merchant starts a refund of 100.00, it travels through the acquirer and the scheme to the issuer, and clearing runs in the opposite direction. The cardholder usually sees the money after a few days. Whether the fee is returned to the merchant depends on the contract with the acquirer. The terms void, reversal and refund mean slightly different things at different PSPs, so requirements must define them explicitly.</div>'}
  };
}};

/* ===== 3. Fee calculator ===== */
WIDGETS.feecalc={title:'Merchant fee calculator',tag:'teaching numbers',init(b){
  const P=[['Consumer debit, EEA',0.20,0.10,0.50],['Consumer credit, EEA',0.30,0.10,0.50],['Commercial or non-European',1.50,0.20,0.50]];
  const id=n=>'fc-'+n;
  b.innerHTML=`<div class="row" style="margin-bottom:8px">${P.map((p,i)=>`<button class="btn ghost" data-p="${i}">${p[0]}</button>`).join('')}</div>
  <div class="row"><div class="field"><label for="${id('a')}">Amount, EUR</label><input type="number" id="${id('a')}" value="100" min="0" step="1"></div>
  <div class="field"><label for="${id('i')}">Interchange, %</label><input type="number" id="${id('i')}" value="0.30" step="0.01"></div>
  <div class="field"><label for="${id('s')}">Scheme fee, %</label><input type="number" id="${id('s')}" value="0.10" step="0.01"></div>
  <div class="field"><label for="${id('m')}">Acquirer markup, %</label><input type="number" id="${id('m')}" value="0.50" step="0.01"></div>
  <div class="field"><label for="${id('f')}">Fixed fee per transaction, EUR</label><input type="number" id="${id('f')}" value="0.05" step="0.01"></div></div>
  <div id="fc-out" style="margin-top:12px"></div>
  <hr style="border:0;border-top:1px solid var(--rule);margin:14px 0">
  <b>The blended (flat rate) model</b>
  <div class="row" style="margin-top:6px"><div class="field" style="max-width:220px"><label for="${id('b')}">Flat rate to the merchant, %</label><input type="number" id="${id('b')}" value="1.20" step="0.01"></div></div>
  <div id="fc-bl" style="margin-top:8px"></div>
  <p class="src">The numbers are for teaching, not real tariffs. For consumer cards inside the EEA, the interchange regulation caps the rate at 0.2% for debit and 0.3% for credit. The other values are picked as examples.</p>`;
  const num=n=>parseFloat($('#'+id(n),b).value)||0;
  const calc=()=>{
    const a=num('a'),r=feeCalc(a,num('i'),num('s'),num('m'),num('f'));
    const w=x=>a?Math.max(0,Math.min(100,x/r.tot*100)):0;
    $('#fc-out',b).innerHTML=`<div style="display:flex;height:16px;border-radius:4px;overflow:hidden;border:1px solid var(--rule)" aria-hidden="true"><div style="width:${w(r.fi)}%;background:var(--accent)"></div><div style="width:${w(r.fs)}%;background:var(--amber)"></div><div style="width:${w(r.fm+r.fx)}%;background:var(--muted)"></div></div>
    <div class="row src" style="margin:4px 0 8px"><span>■ interchange (to the issuer)</span><span>■ scheme</span><span>■ acquirer</span></div>
    <div class="kv"><span>Interchange → issuer</span><b class="num">${fmt(r.fi)}</b><span>Scheme fee</span><b class="num">${fmt(r.fs)}</b><span>Acquirer markup</span><b class="num">${fmt(r.fm)}</b><span>Fixed fee per transaction</span><b class="num">${fmt(r.fx)}</b><span><b>MDR, total (${fmt(r.pct)}%)</b></span><b class="num">${fmt(r.tot)}</b><span><b>The merchant receives</b></span><b class="num">${fmt(r.net)}</b></div>`;
    const bl=num('b'),mar=a*(bl-num('i')-num('s'))/100;
    $('#fc-bl',b).innerHTML=`<div class="kv"><span>Acquirer revenue at the flat rate</span><b class="num">${fmt(a*bl/100)}</b><span>Minus interchange and scheme fee</span><b class="num">${fmt(a*(num('i')+num('s'))/100)}</b><span><b>Acquirer margin</b></span><b class="num" style="color:${mar<0?'var(--bad)':'var(--good)'}">${fmt(mar)}</b></div>${mar<0?'<div class="fb bad">The margin is negative: the flat rate does not cover the interchange of this card. This is why acquirers on a flat rate watch the card mix and add surcharges.</div>':''}`;
  };
  b.addEventListener('input',calc);
  b.addEventListener('click',e=>{const t=e.target.closest('[data-p]');if(!t)return;const p=P[+t.dataset.p];$('#'+id('i'),b).value=p[1].toFixed(2);$('#'+id('s'),b).value=p[2].toFixed(2);$('#'+id('m'),b).value=p[3].toFixed(2);calc()});
  calc();
}};

/* ===== 4. Luhn ===== */
WIDGETS.luhn={title:'Card number: Luhn, BIN, brand',tag:'checker and generator',init(b){
  const id=uid('pan');
  b.innerHTML=`<div class="row"><div class="field" style="max-width:340px"><label for="${id}">Card number (test)</label><input type="text" id="${id}" value="4111 1111 1111 1111" inputmode="numeric" autocomplete="off"></div>
  <button class="btn ghost" data-g="v">Generate a Visa</button><button class="btn ghost" data-g="m">Generate a Mastercard</button></div>
  <div id="lh-out" style="margin-top:10px"></div><p class="src">Use test numbers only. Never enter real card numbers into trainers or tickets.</p>`;
  const inp=$('#'+id,b);
  const draw=()=>{
    const p=inp.value.replace(/\D/g,'');
    if(p.length<12){$('#lh-out',b).innerHTML='<div class="fb info">Enter at least 12 digits.</div>';return}
    const ok=luhnCheck(p);const cells=[];let alt=false;
    for(let i=p.length-1;i>=0;i--){let d=+p[i],r=d;if(alt){r=d*2;if(r>9)r-=9}cells.unshift({d,dbl:alt,r});alt=!alt}
    const sum=cells.reduce((s,c)=>s+c.r,0);
    $('#lh-out',b).innerHTML=`<div class="tbl"><table><tbody><tr><th>Digit</th>${cells.map(c=>`<td class="num">${c.d}</td>`).join('')}</tr><tr><th>Double?</th>${cells.map(c=>`<td>${c.dbl?'×2':''}</td>`).join('')}</tr><tr><th>Result</th>${cells.map(c=>`<td class="num" style="${c.dbl?'font-weight:700':''}">${c.r}</td>`).join('')}</tr></tbody></table></div>
    <div class="kv" style="max-width:460px"><span>Sum</span><b class="num">${sum}</b><span>Is the sum a multiple of 10?</span><b>${ok?'<span class="pill ok">Number is valid</span>':'<span class="pill bad">Fails Luhn</span>'}</b><span>Brand by prefix</span><b style="text-align:right">${brandOf(p)}</b><span>BIN (first 6 digits)</span><b class="num">${p.slice(0,6)}</b><span>Check digit</span><b class="num">${p.slice(-1)}</b><span>Masked form</span><b class="num">${p.slice(0,6)+'*'.repeat(Math.max(0,p.length-10))+p.slice(-4)}</b></div>`;
  };
  inp.addEventListener('input',draw);
  b.addEventListener('click',e=>{
    const t=e.target.closest('[data-g]');if(!t)return;
    let body=t.dataset.g==='v'?'4':String(51+Math.floor(Math.random()*5));
    while(body.length<15)body+=Math.floor(Math.random()*10);
    const full=body+luhnDigit(body);inp.value=full.replace(/(\d{4})(?=\d)/g,'$1 ');draw();
  });
  draw();
}};

/* ===== 5. What may be stored ===== */
WIDGETS.pci={title:'What may be stored (PCI DSS)',tag:'classification',init(b){
  const cats=['May be stored, but only protected (encryption, tokenization, masking)','Must not be stored after authorization','A safe mask or token, not card data'];
  const items=[
    ['The full card number (PAN)',0,'A PAN may be stored when necessary, but only in an unreadable form: strong encryption, tokenization or truncation.'],
    ['The CVV/CVC from the back of the card',1,'Verification codes (sensitive authentication data) must not be stored after authorization, even encrypted.'],
    ['The PIN or PIN block',1,'The PIN and PIN block are not stored after authorization. They are handled only in secure devices (HSM).'],
    ['Full magnetic stripe data (track 2)',1,'Full track data is sensitive authentication data and is not stored after authorization.'],
    ['The expiry date together with the PAN',0,'The expiry date and the cardholder name are cardholder data: if stored with the PAN, they are protected the same way.'],
    ['The last 4 digits and BIN (mask 411111******1111)',2,'A mask is safe to show in interfaces, receipts and logs. Usually no more than the first 6 and the last 4 digits may be shown.'],
    ['A token issued by a payment provider',2,'A token does not reveal the PAN and does not allow restoring it outside the provider system. This is exactly why tokenization narrows the PCI DSS scope.']
  ];
  const ids=items.map(()=>uid('pci'));
  b.innerHTML=items.map((it,i)=>`<div class="field" style="margin-bottom:10px"><label for="${ids[i]}">${it[0]}</label><select id="${ids[i]}"><option value="">Choose</option>${cats.map((c,j)=>`<option value="${j}">${c}</option>`).join('')}</select><div id="${ids[i]}-fb"></div></div>`).join('')+'<div class="row"><button class="btn" id="pci-check">Check</button><span class="score" id="pci-score"></span></div>';
  $('#pci-check',b).onclick=()=>{let ok=0;items.forEach((it,i)=>{const v=$('#'+ids[i],b).value;const good=v!==''&&+v===it[1];if(good)ok++;$('#'+ids[i]+'-fb',b).innerHTML=v===''?'':`<div class="fb ${good?'ok':'bad'}">${good?'Correct. ':'No, the answer is: '+cats[it[1]]+'. '}${it[2]}</div>`});$('#pci-score',b).textContent=`${ok} of ${items.length} correct`};
}};

/* ===== 6. ISO 8583: builder ===== */
WIDGETS.isobuild={title:'Build an ISO 8583 message',tag:'builder',init(b){
  const I={};['mti','proc','amount','cur','pan','stan','rrn','tid','mid','mcc','pem'].forEach(k=>I[k]=uid('iso'));
  b.innerHTML=`<p class="src" style="margin-top:0">This is a teaching format: an ASCII representation without a header and a length. Real networks encode fields in their own way (BCD, EBCDIC, binary), but the logic is the same.</p>
  <div class="row"><div class="field"><label for="${I.mti}">MTI</label><select id="${I.mti}"><option value="0200">0200 financial request</option><option value="0100">0100 authorization request</option></select></div>
  <div class="field"><label for="${I.proc}">DE3, processing code</label><select id="${I.proc}"><option value="000000">000000 purchase</option><option value="200000">200000 refund</option><option value="010000">010000 cash withdrawal</option></select></div>
  <div class="field"><label for="${I.amount}">DE4, amount (in major units)</label><input type="number" id="${I.amount}" value="100.00" step="0.01" min="0"></div>
  <div class="field"><label for="${I.cur}">DE49, currency</label><select id="${I.cur}"><option value="978">978 EUR</option><option value="941">941 RSD</option><option value="840">840 USD</option></select></div></div>
  <div class="row" style="margin-top:8px"><div class="field"><label for="${I.pan}">DE2, PAN</label><input type="text" id="${I.pan}" value="4111111111111111" maxlength="19"></div>
  <div class="field"><label for="${I.stan}">DE11, STAN</label><input type="text" id="${I.stan}" value="000417" maxlength="6"></div>
  <div class="field"><label for="${I.rrn}">DE37, RRN</label><input type="text" id="${I.rrn}" value="631309000417" maxlength="12"></div></div>
  <div class="row" style="margin-top:8px"><div class="field"><label for="${I.tid}">DE41, TID</label><input type="text" id="${I.tid}" value="TERM0001" maxlength="8"></div>
  <div class="field"><label for="${I.mid}">DE42, MID</label><input type="text" id="${I.mid}" value="MERCHANT0000001" maxlength="15"></div>
  <div class="field"><label for="${I.mcc}">DE18, MCC</label><input type="text" id="${I.mcc}" value="5411" maxlength="4"></div>
  <div class="field"><label for="${I.pem}">DE22, entry mode</label><select id="${I.pem}"><option value="051">051 chip</option><option value="071">071 contactless chip</option><option value="012">012 manual entry</option></select></div></div>
  <div id="iso-out" style="margin-top:14px"></div>`;
  const g=k=>$('#'+I[k],b).value;
  const draw=()=>{
    const f={mti:g('mti'),proc:g('proc'),amount:parseFloat(g('amount'))||0,cur:g('cur'),pan:g('pan').replace(/\D/g,''),stan:g('stan'),rrn:g('rrn'),tid:g('tid'),mid:g('mid'),mcc:g('mcc'),pem:g('pem')};
    const r=isoBuild(f);
    const vis=s=>String(s).replace(/ /g,'·');
    $('#iso-out',b).innerHTML=`<b>The message</b><div class="mono-box" style="margin:6px 0">${esc(vis(r.raw))}</div>
    <div class="tbl"><table><thead><tr><th>Part</th><th>Value</th><th>How to read it</th></tr></thead><tbody>
    <tr><td>MTI</td><td class="num">${f.mti}</td><td>0 version 1987; ${f.mti[1]} ${f.mti[1]==='1'?'authorization':'financial message'}; 0 request; 0 from the acquirer</td></tr>
    <tr><td>Bitmap</td><td class="num">${r.bm}</td><td>Fields included: ${ISO_DES.join(', ')}</td></tr>
    ${ISO_DES.map(n=>`<tr><td>DE${n}</td><td class="num">${esc(vis(n===2?String(r.v[2].length).padStart(2,'0')+' '+r.v[2]:r.v[n]))}</td><td>${DE_NAMES[n]}${n===2?' (LLVAR: two length digits, then the value)':''}${n===4?' (12 digits, minor units, no decimal point)':''}</td></tr>`).join('')}
    </tbody></table></div>
    <button class="btn ghost" id="iso-copy">Copy the bitmap to the decoder</button>`;
    $('#iso-copy',b).onclick=()=>{const t=$('[data-bm]');if(t){t.value=r.bm;t.dispatchEvent(new Event('input'))}};
  };
  b.addEventListener('input',draw);b.addEventListener('change',draw);draw();
}};

/* ===== 7. ISO 8583: bitmap decoder ===== */
WIDGETS.isobitmap={title:'Bitmap decoder',tag:'which fields are in the message',init(b){
  const id=uid('bm');
  b.innerHTML=`<div class="row"><div class="field" style="max-width:340px"><label for="${id}">Primary bitmap, 16 hex characters</label><input type="text" id="${id}" data-bm="1" value="723C440008C08000" maxlength="16" autocomplete="off"></div></div><div id="bm-out" style="margin-top:10px"></div>
  <p class="src">The highest bit is 1 if a secondary bitmap follows (fields 65-128). Names follow ISO 8583:1987; fields 48, 55 and 60-63 are filled in differently by each network and bank.</p>`;
  const inp=$('#'+id,b);
  const draw=()=>{
    const h=inp.value.trim();
    if(!/^[0-9a-fA-F]{16}$/.test(h)){$('#bm-out',b).innerHTML='<div class="fb info">Exactly 16 hex characters are needed (0-9, A-F).</div>';return}
    const des=bitmapDes(h);const bin=parseInt(h.slice(0,8),16).toString(2).padStart(32,'0')+parseInt(h.slice(8),16).toString(2).padStart(32,'0');
    $('#bm-out',b).innerHTML=`<div class="mono-box">${bin.replace(/(.{8})/g,'$1 ')}</div><p style="margin:.5rem 0">Fields in the message: <b>${des.length}</b>${des.includes(1)?' (a secondary bitmap is present)':''}</p>
    <div class="tbl"><table><tbody>${des.map(n=>`<tr><td class="num" style="width:70px">DE${n}</td><td>${DE_NAMES[n]}</td></tr>`).join('')}</tbody></table></div>`;
  };
  inp.addEventListener('input',draw);draw();
}};

/* ===== 8. 3-D Secure ===== */
WIDGETS.tds={title:'The 3-D Secure flow (EMV 3DS)',tag:'scenarios',init(b){
  const base=[['Cardholder → Merchant','Clicks "Pay". The merchant (3DS Requestor) calls its 3DS Server.'],['3DS Server → Directory Server → ACS','An AReq (Authentication Request) is sent: the amount, the card, device data and the purchase context. The Directory Server belongs to the scheme, and the ACS to the issuing bank.'],['ACS','Evaluates the risk from context and history: a familiar device, a usual amount, the address.']];
  const sc={
    fr:{n:'Frictionless',s:[['ACS → 3DS Server','An ARes (Authentication Response) with transStatus = Y: authentication passed without the cardholder taking part.'],['Merchant → Acquirer','Authorization with the authentication data: CAVV or AAV and the ECI (Visa 05, Mastercard 02).']],r:'The payment goes through without extra steps. Fraud disputes on such a transaction usually rest with the issuer (liability shift).'},
    ch:{n:'Challenge',s:[['ACS → 3DS Server','An ARes with transStatus = C: a challenge is needed, the ACS wants to make sure the owner is paying.'],['Merchant → Cardholder','A CReq (Challenge Request): the browser or SDK shows the bank window.'],['Cardholder → ACS','Enters a one-time code or confirms with biometrics. The ACS returns a CRes (Challenge Response).'],['ACS → DS → 3DS Server','RReq/RRes (Results Request/Response): the outcome Y or N.'],['Merchant → Acquirer','If Y: authorization with the CAVV/AAV and the ECI 05/02.']],r:'Conversion is lower (some cardholders abandon the payment at the code step), but protection is stronger. The timeout of the step also has to be described in the requirements.'},
    no:{n:'Decline (N or R)',s:[['ACS → 3DS Server','An ARes with transStatus = N (not authenticated) or R (rejected, authorization must not continue).'],['Merchant','The payment does not go to authorization. The cardholder sees a decline and an offer to change the payment method.']],r:'No authorization is made. The requirements must state which message the user sees and how many attempts are allowed.'},
    un:{n:'Unavailable (U)',s:[['ACS → 3DS Server','An ARes with transStatus = U: authentication could not be performed (a technical problem, the ACS is unavailable).'],['Merchant','Decides by risk rules: send to authorization without authentication, or decline.']],r:'If it continues without 3-D Secure, the liability shift does not apply: the risk of a fraud dispute stays with the merchant.'}
  };
  const id=uid('tds');
  b.innerHTML=`<div class="field" style="max-width:320px"><label for="${id}">Scenario</label><select id="${id}">${Object.keys(sc).map(k=>`<option value="${k}">${sc[k].n}</option>`).join('')}</select></div><div id="tds-out" style="margin-top:12px"></div>`;
  const draw=()=>{
    const s=sc[$('#'+id,b).value];const steps=base.concat(s.s);
    $('#tds-out',b).innerHTML=`<ol class="seq" style="padding-left:1.3rem">${steps.map(x=>`<li><b>${x[0]}.</b> ${x[1]}</li>`).join('')}</ol><div class="fb info"><b>Outcome.</b> ${s.r}</div>`;
  };
  $('#'+id,b).addEventListener('change',draw);draw();
}};

/* ===== 9. Chargeback stages ===== */
WIDGETS.cbline={title:'The chargeback lifecycle',tag:'dispute stages',init(b){
  const S=[
    {t:'1. The disputed transaction',w:'Cardholder',m:'The money has already been charged to the cardholder and eventually received by the merchant.',ba:'The transaction exists in the system, with a known RRN, auth code, ARN, amounts and clearing status.'},
    {t:'2. The cardholder complaint',w:'Cardholder → issuer',m:'No money moves.',ba:'The issuer collects the reason and the documents. Sometimes a request for a copy of the receipt (retrieval request, inquiry) comes before the chargeback.'},
    {t:'3. Chargeback',w:'Issuer → scheme → acquirer',m:'The disputed amount is debited from the acquirer through the scheme, and the acquirer debits it from the merchant.',ba:'The processor has to accept the notification (a file or an API), match it to the original transaction by ARN or RRN, create a case, calculate the response deadline and make the postings.'},
    {t:'4. Merchant response (representment)',w:'Merchant → acquirer → scheme → issuer',m:'If the dispute is won, the amount is returned to the merchant (sometimes with a repeated movement of money).',ba:'Needs evidence upload, deadline checks, a case status and an action log. A late response usually means a loss.'},
    {t:'5. Pre-arbitration',w:'Issuer → acquirer',m:'Under scheme rules the money stays where the last decision put it.',ba:'A new stage of the same case, not a new case: the link to the original chain, new deadlines, the option to accept the loss.'},
    {t:'6. Scheme arbitration',w:'Scheme',m:'The losing side pays the fee and the dispute amount.',ba:'The final case status, the final postings, reporting on won and lost disputes.'}
  ];
  let k=0;
  const draw=()=>{
    const s=S[k];
    b.innerHTML=`<div class="row" style="margin-bottom:10px">${S.map((x,i)=>`<button class="btn ${i===k?'':'ghost'}" data-k="${i}" aria-label="${x.t}">${i+1}</button>`).join('')}</div>
    <h3 style="margin:.2rem 0">${s.t}</h3><div class="kv" style="grid-template-columns:150px 1fr"><b>Who acts</b><span>${s.w}</span><b>Money</b><span>${s.m}</span><b>Through the eyes of an analyst</b><span>${s.ba}</span></div>
    <p class="src">The deadlines at each stage and the order of the stages depend on the scheme, the type of dispute and the reason code. Visa and Mastercard describe the process differently, so check the current rules for the exact days.</p>`;
  };
  b.onclick=e=>{const t=e.target.closest('[data-k]');if(t){k=+t.dataset.k;draw()}};draw();
}};

/* ===== 10. Reconciliation ===== */
WIDGETS.recon={title:'Reconciliation lab: authorizations and clearing',tag:'find the mismatches',init(b){
  const d=reconData(),key=reconKey();
  const opts=[['ok','Normal'],['nocl','No clearing for the authorization'],['amt','Amount mismatch'],['dup','Duplicate in clearing'],['noauth','Clearing without authorization']];
  const rrns=['R001','R002','R003','R004','R005','R006','R007','R008','R009'];
  const ids=rrns.map(()=>uid('rc'));
  const tbl=(head,rows)=>`<div class="tbl"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td class="${i?'num':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  b.innerHTML=`<div class="row" style="align-items:flex-start"><div style="flex:1;min-width:260px"><b>Authorization log</b>${tbl(['RRN','Amount','Status'],d.auth.map(a=>[a[0],fmt(a[1]),a[2]==='approved'?'approved':'reversed']))}</div>
  <div style="flex:1;min-width:260px"><b>Clearing file</b>${tbl(['RRN','Amount'],d.clr.map(c=>[c[0],fmt(c[1])]))}</div></div>
  <p>For every RRN, choose the reconciliation result.</p>
  ${rrns.map((r,i)=>`<div class="row" style="margin:6px 0"><span class="num" style="width:56px"><b>${r}</b></span><select id="${ids[i]}" aria-label="${r}" style="max-width:300px"><option value="">Choose</option>${opts.map(o=>`<option value="${o[0]}">${o[1]}</option>`).join('')}</select><span id="${ids[i]}-fb"></span></div>`).join('')}
  <div class="row" style="margin-top:10px"><button class="btn" id="rc-check">Check</button><span class="score" id="rc-score"></span></div><div id="rc-sum"></div>`;
  const why={ok:'The authorization and the clearing match.',nocl:'The authorization is approved, but there is no clearing. The merchant may not have captured, or the file has not arrived yet.',amt:'The clearing amount is lower than the authorized one: a partial capture or an error is possible. A decision is needed on which amount is right.',dup:'The same transaction arrived in clearing twice. The money will be charged twice, and the duplicate has to be returned.',noauth:'There is clearing but no authorization: a force post, a lost message or a transaction of another party. It needs investigation.'};
  const why7='The authorization was cancelled (reversed), so no clearing is expected. This is normal, not a mismatch.';
  $('#rc-check',b).onclick=()=>{
    let ok=0;
    rrns.forEach((r,i)=>{const v=$('#'+ids[i],b).value,k=key[r],good=v===k;if(good)ok++;
      $('#'+ids[i]+'-fb',b).innerHTML=v===''?'':`<span class="pill ${good?'ok':'bad'}">${good?'correct':'no: '+opts.find(o=>o[0]===k)[1]}</span> <span class="src">${r==='R007'?why7:why[k]}</span>`});
    $('#rc-score',b).textContent=`${ok} of ${rrns.length} correct`;
    const t=reconTotals();
    $('#rc-sum',b).innerHTML=`<div class="callout"><b>Why you cannot reconcile by the total</b>Expected clearing (approved, not cancelled authorizations): <span class="num">${fmt(t.exp)}</span>. Actual clearing: <span class="num">${fmt(t.got)}</span>. The difference is only <span class="num">${fmt(t.diff)}</span>, although there are four mismatches, and they offset each other: -5.00 (R003), +15.00 (R004), -40.00 (R005), +33.00 (R009). Reconciliation runs by the transaction key, and the totals are only a control.</div>`;
  };
}};

/* ===== 11. Risk scoring ===== */
const RISK_CASES=[
  ['A. A regular customer, a usual purchase of 25 EUR',{amount:25,newDevice:0,geo:0,attempts:0,newAddr:0,tds:0,old:1},'legit'],
  ['B. 900 EUR, a new device, a foreign country, 3 attempts',{amount:900,newDevice:1,geo:1,attempts:3,newAddr:0,tds:0,old:0},'fraud'],
  ['C. A new customer, 700 EUR, a new device, 3-D Secure passed',{amount:700,newDevice:1,geo:0,attempts:0,newAddr:0,tds:1,old:0},'legit'],
  ['D. A regular customer on a trip: 1800 EUR, IP country does not match',{amount:1800,newDevice:0,geo:1,attempts:0,newAddr:0,tds:0,old:1},'legit'],
  ['E. 60 EUR, 6 attempts in an hour (card testing)',{amount:60,newDevice:1,geo:1,attempts:6,newAddr:0,tds:0,old:0},'fraud'],
  ['F. 350 EUR, a new device, a new address, no 3-D Secure',{amount:350,newDevice:1,geo:0,attempts:1,newAddr:1,tds:0,old:0},'fraud']
];
WIDGETS.risk={title:'Anti-fraud: scoring and thresholds',tag:'trade-off',init(b){
  const id=n=>'rk-'+n;
  b.innerHTML=`<div class="row"><div class="field"><label for="${id('r')}">Manual review threshold (review), points</label><input type="number" id="${id('r')}" value="30" min="0" max="100"></div><div class="field"><label for="${id('d')}">Decline threshold (decline), points</label><input type="number" id="${id('d')}" value="60" min="0" max="100"></div></div>
  <div id="rk-out" style="margin-top:10px"></div>
  <p class="src">The rules and weights are for teaching. Real systems have many rules, and add machine learning models, lists and manual decisions.</p>`;
  const draw=()=>{
    const rv=parseFloat($('#'+id('r'),b).value)||0,dc=parseFloat($('#'+id('d'),b).value)||0;let fp=0,miss=0;
    const rows=RISK_CASES.map(c=>{const r=riskScore(c[1]),dec=riskDecision(r.s,rv,dc);
      let note='';if(c[2]==='legit'&&dec==='decline'){fp++;note='<span class="pill bad">honest customer declined</span>'}else if(c[2]==='legit'&&dec==='review'){note='<span class="pill hold">needless manual review</span>'}else if(c[2]==='fraud'&&dec==='approve'){miss++;note='<span class="pill bad">fraud missed</span>'}
      return `<tr><td>${c[0]}<br><span class="src">${r.why.join('; ')||'no factors'}</span></td><td class="num">${r.s}</td><td><span class="pill ${dec==='approve'?'ok':dec==='review'?'hold':'bad'}">${dec}</span></td><td>${c[2]==='fraud'?'fraud':'honest'}</td><td>${note}</td></tr>`}).join('');
    $('#rk-out',b).innerHTML=`<div class="tbl"><table><thead><tr><th>Case</th><th>Points</th><th>Decision</th><th>In reality</th><th>Outcome</th></tr></thead><tbody>${rows}</tbody></table></div><p>Honest customers declined: <b>${fp}</b>. Fraud missed: <b>${miss}</b>. Move the thresholds: raise review to 35 and see who slips through; lower decline to 40 and see who suffers. Any threshold trades one kind of error for another.</p>`;
  };
  b.addEventListener('input',draw);draw();
}};

/* ===== 12. Requirements clinic ===== */
WIDGETS.reqclinic={title:'Requirements clinic',tag:'find the defect',init(b){
  const cats=['A good requirement','No measurable criterion','Ambiguous','Suggests a solution instead of a need'];
  const it=[
    ['The system must process payments quickly.',1,'There is no metric. Better: "95% of authorizations are processed within 300 ms at a load of 200 TPS".'],
    ['The user can pay by card or another method, whichever is convenient.',2,'"Another method" and "convenient" can be understood in different ways. A list of methods and the conditions for each are needed.'],
    ['Use Kafka to store transaction statuses.',3,'This is a solution, not a need. The requirement should say what must be saved, for how long, and who reads it and how. The team chooses the technology.'],
    ['When a chargeback notification is received, the system creates a case with the status "Received" within 5 minutes.',0,'It has an event, an action, a status and a measurable deadline. The requirement is testable.'],
    ['The monthly fee report is generated in no more than 3 seconds for 100,000 transactions.',0,'A non-functional requirement with a metric and a load condition. Testable.']
  ];
  const ids=it.map(()=>uid('rq'));
  b.innerHTML=it.map((x,i)=>`<div class="field" style="margin-bottom:10px"><label for="${ids[i]}">"${x[0]}"</label><select id="${ids[i]}"><option value="">Choose</option>${cats.map((c,j)=>`<option value="${j}">${c}</option>`).join('')}</select><div id="${ids[i]}-fb"></div></div>`).join('')+'<div class="row"><button class="btn" id="rq-check">Check</button><span class="score" id="rq-score"></span></div>';
  $('#rq-check',b).onclick=()=>{let ok=0;it.forEach((x,i)=>{const v=$('#'+ids[i],b).value,good=v!==''&&+v===x[1];if(good)ok++;$('#'+ids[i]+'-fb',b).innerHTML=v===''?'':`<div class="fb ${good?'ok':'bad'}">${good?'Correct. ':'The answer is '+cats[x[1]]+'. '}${x[2]}</div>`});$('#rq-score',b).textContent=`${ok} of ${it.length} correct`};
}};

/* ===== 13. Acceptance criteria builder ===== */
WIDGETS.acbuilder={title:'Acceptance criteria: Given / When / Then',tag:'template',init(b){
  const ex=[
    ['Duplicate notification',['A chargeback case with ARN 7400…0123 already exists in the system','A repeated notification arrives with the same ARN and the same amount','No new case is created, the repeat is written to the case log, and the response to the source is 200 OK']],
    ['3-D Secure timeout',['The cardholder received a challenge from the bank','They do not confirm the payment within 5 minutes','The payment gets the status "authentication not completed", no authorization is sent, and a message offering to try again is shown']],
    ['Refund above the original amount',['The original purchase is 100.00 EUR and there were no refunds','The merchant requests a refund of 120.00 EUR','The request is rejected with the error code AMOUNT_EXCEEDS_ORIGINAL, and the balance does not change']]
  ];
  const I=['g','w','t'].map(()=>uid('ac'));
  b.innerHTML=`<div class="row" style="margin-bottom:8px">${ex.map((e,i)=>`<button class="btn ghost" data-e="${i}">${e[0]}</button>`).join('')}</div>
  <div class="field" style="margin-bottom:8px"><label for="${I[0]}">Given: the initial state</label><textarea id="${I[0]}" style="min-height:56px"></textarea></div>
  <div class="field" style="margin-bottom:8px"><label for="${I[1]}">When: the action or event</label><textarea id="${I[1]}" style="min-height:56px"></textarea></div>
  <div class="field" style="margin-bottom:8px"><label for="${I[2]}">Then: the verifiable result</label><textarea id="${I[2]}" style="min-height:56px"></textarea></div>
  <div class="mono-box" id="ac-out" style="white-space:pre-wrap"></div><div class="row" style="margin-top:8px"><button class="btn ghost" id="ac-copy">Copy</button></div>
  <p class="src">Quality check: does the Then contain concrete values and statuses? Can you think of a test that gives an unambiguous "passed" or "failed"? Is there more than one different event in a single scenario?</p>`;
  const draw=()=>{$('#ac-out',b).textContent=`Given ${$('#'+I[0],b).value||'…'}\nWhen ${$('#'+I[1],b).value||'…'}\nThen ${$('#'+I[2],b).value||'…'}`};
  b.addEventListener('input',draw);
  b.addEventListener('click',e=>{const t=e.target.closest('[data-e]');if(!t)return;const x=ex[+t.dataset.e][1];I.forEach((id,i)=>{$('#'+id,b).value=x[i]});draw()});
  $('#ac-copy',b).onclick=ev=>copyText($('#ac-out',b).textContent,ev.target);
  draw();
}};
