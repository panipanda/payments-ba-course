/* Modules 5-8. Helpers tbl() and co() come from js/lib.js. */

COURSE.push({
id:'m5',short:'ISO 8583',title:'ISO 8583: the language of card messages',day:3,minutes:45,
lead:'Message structure, the message type indicator (MTI), the bitmap, the main fields and response codes. Enough to read integration specifications and ask precise questions.',
learn:['read an MTI and explain what kind of message is in front of you','use a bitmap to tell which fields are present','decode the main fields and the most common response codes','ask the team the right questions about an interface specification'],
body:`
<h2>What it is and why read it</h2>
<p>ISO 8583 is a standard for exchanging messages about card transactions between terminals, acquirers, schemes and issuers. It is not JSON: the message is compact and byte-based, and its structure is fixed in advance. New integrations are often built on HTTP and REST, but inside the card infrastructure ISO 8583 and its "dialects" are still in use, and schemes and banks publish their own specifications based on it.</p>
<p>An analyst does not need to write codecs. You need to understand which fields exist, what they mean, where they come from, which response codes there are and how a request is matched to its response.</p>
<h2>Message structure</h2>
<div class="mono-box">[network header]  MTI (4 digits)  Bitmap (8 or 16 bytes)  Data fields (in order of number)</div>
${tbl(['Part','What it is'],[
['MTI','Message Type Indicator: version, class, function, origin of the message'],
['Primary bitmap','64 bits: bit N is 1 if field N is present in the message. Bit 1 is 1 if a secondary bitmap follows (fields 65-128)'],
['Data elements (DE)','Fields in order of number. They have a fixed or a variable length: LLVAR (two length digits) and LLLVAR (three length digits)']
])}
<h2>MTI</h2>
<p>The four digits are read by position: <b>version</b> (0 is ISO 8583:1987, 1 is 1993, 2 is 2003), <b>class</b> (1 authorization, 2 financial, 3 file actions, 4 reversal or chargeback, 5 reconciliation, 6 administrative, 7 fees, 8 network management), <b>function</b> (0 request, 1 request response, 2 advice, 3 advice response), <b>origin</b> (0 acquirer, 2 issuer, and so on).</p>
${tbl(['MTI','What it is'],[
['0100 / 0110','Authorization request and its response'],
['0200 / 0210','Financial request (authorization and posting in one message) and its response'],
['0220','Financial advice: a notification about a transaction that has already happened'],
['0400 / 0410','Reversal request and response'],
['0420','Reversal advice'],
['0500 / 0510','Reconciliation of totals and its response'],
['0800 / 0810','Network management: sign-on, echo (connection test), sign-off']
])}
{{w:isobuild}}
{{w:isobitmap}}
<h2>The most common fields</h2>
${tbl(['DE','Name','Why an analyst cares'],[
['2','PAN','The card number. Masked in logs'],
['3','Processing code','Transaction type: 00 purchase, 01 cash withdrawal, 20 refund, 31 balance inquiry, plus account types'],
['4','Amount, transaction','Amount in minor units without a decimal point, 12 digits'],
['7','Transmission date & time','The time the message was sent'],
['11','STAN','Trace number within a session'],
['12 / 13','Local time / date','Local time and date at the terminal'],
['14','Expiration date','Expiry in YYMM'],
['18','MCC','Merchant category, affects interchange and risk'],
['22','POS entry mode','How the card was accepted: chip, contactless, manual entry, stripe'],
['37','RRN','Key for finding the transaction between acquirer and issuer'],
['38','Auth code','Approval code from the issuer'],
['39','Response code','The result: 00 approved and other codes'],
['41 / 42','TID / MID','Terminal and merchant identifiers'],
['49','Currency code','Transaction currency (978 EUR, 941 RSD, 840 USD)'],
['55','ICC data','EMV chip data'],
['70','Network management code','Type of network message: 001 sign-on, 002 sign-off, 301 echo'],
['90','Original data elements','A reference to the original transaction in a reversal']
])}
<h2>Response codes (DE39)</h2>
${tbl(['Code','Meaning','What the merchant or system does'],[
['00','Approved','Continue'],
['05','Do not honor','A general decline by the issuer without explanation. Offer another card'],
['14','Invalid card number','Ask the customer to correct the number'],
['51','Insufficient funds','Offer another card'],
['54','Expired card','Ask for a new card or expiry date'],
['55','Incorrect PIN','Let the customer retry, watch the attempt limit'],
['57','Transaction not permitted to cardholder','Switch the payment method'],
['91','Issuer or switch inoperative','A temporary error, can be retried later according to policy'],
['96','System malfunction','A temporary error, needs timeout handling']
])}
<p class="src">The set of codes and how they are used differ between schemes and banks. Always check the specification of the network you work with.</p>
<h2>What to ask the team</h2>
<ul><li>Which interface specification is used, and which version of ISO 8583 it is based on.</li><li>Which fields are mandatory and under which conditions the others appear.</li><li>How the fields are encoded (ASCII, EBCDIC, BCD, binary) and what the length format is.</li><li>What matches a request to a response (usually a combination of STAN, time and RRN).</li><li>How a timeout, a late response and a reversal are handled.</li><li>Which issuer response codes are passed through unchanged and which the system replaces.</li></ul>
`,
takeaways:['The MTI is read by position: version, class, function, origin.','The bitmap says which fields are in the message, and the fields follow in order of number.','The amount in DE4 is in minor units, the currency is in DE49, and the key for finding a transaction is the RRN (DE37).','Response codes depend on the network: always check the specification.'],
quiz:[
{q:'MTI 0110 is:',o:['An authorization request','A response to an authorization request','A reversal request','A network message'],a:1,why:'0100 is an authorization request and 0110 is its response: function 1 means a response.'},
{q:'What does the bitmap show?',o:['The transaction amount','Which data fields are present in the message','The result of the transaction','The currency'],a:1,why:'Each bit corresponds to a field number: a one means the field is present.'},
{q:'DE4 holds 000000012550 and DE49 holds 978. What is the amount?',o:['12,550 EUR','125.50 EUR','1,255.0 EUR','12.55 EUR'],a:1,why:'The amount is in minor units (cents): 12550 cents = 125.50 EUR.'},
{q:'Response code 51 means:',o:['Insufficient funds','Incorrect PIN','Expired card','Issuer unavailable'],a:0,why:'51 is insufficient funds, 55 is an incorrect PIN, 54 is an expired card, 91 is issuer unavailable.'},
{q:'Which field is usually used as the key to find a transaction between acquirer and issuer?',o:['DE18 MCC','DE37 RRN','DE22 POS entry mode','DE49 Currency'],a:1,why:'The RRN (retrieval reference number) exists precisely to find a transaction in reconciliation and disputes.'},
{q:'What is a message with MTI 0400 used for?',o:['An authorization request','A reversal request (cancelling a previously sent transaction)','Reconciliation of totals','A connection test'],a:1,why:'Class 4 covers reversals and chargeback messages, and function 0 is a request.'},
{q:'In which field is EMV chip data usually carried?',o:['DE2','DE39','DE55','DE41'],a:2,why:'DE55 (ICC data) carries chip data, including the cryptogram.'}
],
practice:{id:'p-m5',title:'Read a message',
brief:'<p>Take the message from the builder with its default values and describe in words: what kind of transaction it is, what amount and currency, which card (masked), how the terminal accepted the card, and by which key the transaction can be found. Then change the MTI to 0100 and describe what changes in the business logic (money and stages).</p>',
template:'What the transaction is:\nAmount and currency:\nCard (masked):\nHow the card was accepted:\nSearch key:\nWhat changes with MTI 0100:\n',
checks:['The amount is converted from minor units to major units','The currency is decoded from DE49','There is no full PAN in the card description','The difference between 0100 and 0200 is described through the payment stages'],
model:'<p>The transaction: a financial purchase request (DE3 = 000000). Amount: DE4 000000010000 is 100.00, and currency 978 is EUR. Card: 411111******1111. Acceptance: DE22 = 051, chip. Search key: the RRN in DE37, plus the STAN in DE11 and the terminal TERM0001 in DE41.</p><p>With MTI 0100 this is only an authorization request: the issuer approves and places a hold, and posting (clearing and settlement) follows later in a separate exchange. With 0200, authorization and posting happen in one message (single-message).</p>'}
});

COURSE.push({
id:'m6',short:'3-D Secure and SCA',title:'3-D Secure and strong authentication',day:4,minutes:35,
lead:'How a bank checks that the card owner is the one paying, what frictionless and challenge mean, how liability shift works, and which requirements you need to describe.',
learn:['name the participants of 3-D Secure and the messages between them','tell frictionless, challenge, decline and unavailable apart','explain ECI and liability shift','describe 3-D Secure scenarios in requirements'],
body:`
<h2>Why it exists</h2>
<p>In an online payment there is no physical card, and the merchant cannot inspect it. This is the source of most card-not-present (CNP) fraud. 3-D Secure adds a check on the issuer side. In the European Economic Area it is also the way to meet the strong customer authentication (SCA) requirement under PSD2.</p>
<h2>Participants</h2>
${tbl(['Participant','Who it is'],[
['3DS Requestor','The merchant or its PSP, which requests authentication'],
['3DS Server','The component that builds 3-D Secure messages on behalf of the merchant'],
['Directory Server (DS)','Owned by the payment scheme, routes messages to the right bank'],
['ACS (Access Control Server)','The issuer server: evaluates the risk and runs the check'],
['3DS SDK','A library in the merchant mobile app that shows the bank window']
])}
{{w:tds}}
<h2>Messages and statuses</h2>
<p>The main EMV 3-D Secure messages: AReq and ARes (authentication request and response), CReq and CRes (challenge request and response), RReq and RRes (the final result, sent by the ACS).</p>
${tbl(['transStatus','Meaning','What next'],[
['Y','Authentication successful','Authorization with 3-D Secure data'],
['N','Not authenticated','Decline or another payment method'],
['U','Could not be performed','Merchant policy: continue without 3-D Secure or decline'],
['A','Attempt counted (attempts)','Authorization with an "attempt" indicator, liability shift is partial'],
['C','Challenge required','CReq and CRes, then the result'],
['R','Rejected','Authorization must not continue']
])}
<h2>ECI, CAVV and liability shift</h2>
<p>The authentication result is passed to the authorization in two fields: <b>ECI</b> (the electronic commerce indicator) and a cryptographic proof (<b>CAVV</b> at Visa, <b>AAV</b> at Mastercard).</p>
${tbl(['Result','ECI Visa','ECI Mastercard'],[['Authenticated','05','02'],['Attempt','06','01'],['Not authenticated','07','00']])}
<p>Liability shift: for an authenticated transaction, liability for fraud disputes generally moves from the merchant to the issuer. For an "attempt" the shift is usually partial, and without 3-D Secure the risk stays with the merchant. The exact conditions and exceptions are set by the scheme rules.</p>
<h2>SCA and exemptions (PSD2)</h2>
<p>Strong authentication requires two independent factors out of three: knowledge (password, PIN), possession (phone, card), inherence (fingerprint, face). Exemptions from SCA: small amounts with a limit on the cumulative amount and count, low-risk transactions by the acquirer analysis (TRA), trusted beneficiaries, recurring payments (subsequent merchant-initiated charges are outside SCA), corporate payments.</p>
${co('Where it applies','SCA is a requirement for the European Economic Area. Whether to apply 3-D Secure outside it, and in which cases, is decided by the bank and the business. Do not assume the rules are the same in every country: ask the team.',true)}
<h2>What the analyst describes</h2>
<ul><li>When to request 3-D Secure: always, by risk, by amount.</li><li>What to do on N, U, R, as well as on network errors and challenge timeouts.</li><li>How many attempts are allowed and which message the user sees.</li><li>Which device and purchase data is sent: the more there is, the more often the bank chooses frictionless.</li><li>What is logged without sensitive data and how the result gets into the authorization.</li><li>Test cards and scenarios for every transStatus.</li></ul>
`,
takeaways:['3-D Secure adds an issuer check to card-not-present transactions.','Frictionless needs no action from the cardholder, challenge does.','ECI and CAVV/AAV carry the authentication result into the authorization and determine the liability shift.','Requirements need scenarios for every ACS response and for timeouts, not only for success.'],
quiz:[
{q:'transStatus = C means:',o:['Authentication successful','Challenge required: the ACS wants confirmation from the cardholder','The transaction was declined','Authentication is unavailable'],a:1,why:'C is challenge required: CReq and CRes follow.'},
{q:'Which 3-D Secure participant belongs to the issuing bank?',o:['3DS Server','Directory Server','ACS','3DS SDK'],a:2,why:'The ACS is the issuer server, while the Directory Server belongs to the scheme.'},
{q:'A payment went through with ECI 05 (Visa). What does it mean for fraud disputes?',o:['Nothing','The transaction was authenticated, and liability for fraud disputes generally lies with the issuer','The merchant always carries the liability','The transaction is definitely legitimate'],a:1,why:'ECI 05 indicates successful authentication, and the liability shift usually applies. The details follow the scheme rules.'},
{q:'Frictionless is:',o:['Authentication without involving the cardholder, based on risk data','A bank decline','A payment without authorization','Payment in cash'],a:0,why:'The ACS judges the risk to be low and approves the transaction without showing a challenge.'},
{q:'Which pair of factors satisfies SCA?',o:['A password and a PIN (both knowledge)','A password and a one-time code on the phone (knowledge and possession)','Two different passwords','A first and a last name'],a:1,why:'Two independent factors from different categories are needed: knowledge, possession, inherence.'},
{q:'The ACS did not respond, transStatus = U. What should the specification describe?',o:['Nothing, this never happens','A decision: continue without authentication (with risk) or decline, by policy','An automatic card block','Retrying until success without limits'],a:1,why:'The behavior on unavailability must be described explicitly: it determines both conversion and risk.'}
],
practice:{id:'p-m6',title:'3-D Secure scenarios in Given/When/Then',
brief:'<p>Write three scenarios: a successful challenge, a bank decline (N), and an unavailable ACS (U). For each, state the final payment status and the message to the user. Use the criteria builder from module 11.</p>',
template:'Scenario 1. Successful challenge\nGiven \nWhen \nThen \n\nScenario 2. Bank decline (N)\nGiven \nWhen \nThen \n\nScenario 3. ACS unavailable (U)\nGiven \nWhen \nThen \n',
checks:['Every scenario has a concrete final payment status','The message to the user is described','In the U scenario a policy is chosen explicitly (continue or decline)','The scenarios describe behavior, not the technical "how"'],
model:'<p><b>Successful challenge.</b> Given a payment of 80 EUR received transStatus C from the ACS. When the cardholder confirms the payment with a code within 5 minutes and the result is Y. Then the payment is sent for authorization with ECI 05 and the CAVV data, and the status is "authorized".</p><p><b>Decline N.</b> Given a payment received transStatus C. When the result is N. Then no authorization is sent, the status is "declined: authentication failed", and the user is offered another payment method.</p><p><b>ACS unavailable.</b> Given an AReq was sent and no response arrived within 10 seconds (U). When the payment is 80 EUR. Then by the policy "up to 30 EUR we continue without 3-D Secure, above that we decline": the status is "declined: authentication unavailable", and the event is written to the log.</p>'}
});

COURSE.push({
id:'m7',short:'Chargebacks',title:'Chargebacks and disputes',day:2,minutes:40,
lead:'What a chargeback is, how it moves through its stages, which reasons exist, how a merchant defends, and what a processor system must be able to do.',
learn:['explain the difference between a refund, an inquiry and a chargeback','name the stages of a dispute and who acts at each','list the families of dispute reasons','describe requirements for chargeback handling in a processor system'],
body:`
<h2>What a chargeback is</h2>
<p>The cardholder disagrees with a transaction and contacts their bank. The issuer returns the money through the payment scheme, and the amount is debited by force from the acquirer and then from the merchant. The merchant can respond with evidence, and the dispute moves through its stages, and if the parties do not agree, the scheme decides.</p>
${tbl(['What','Who starts it','What it is'],[
['Refund','Merchant','A voluntary return of money to the customer'],
['Inquiry / retrieval request','Issuer','A request for information or a copy of the receipt, does not move money'],
['Chargeback','Issuer, on a request from the cardholder','A forced return through the scheme'],
['Fraud report (TC40, SAFE)','Issuer','A notification to the scheme about fraud, does not move money by itself']
])}
{{w:cbline}}
<h2>Dispute reasons</h2>
<p>Every scheme has its own catalog of reason codes. They are grouped into families.</p>
${tbl(['Family','Example reasons','Example codes'],[
['Fraud','The cardholder did not make the transaction, the card was lost or stolen','Visa group 10, Mastercard 4837'],
['Authorization','The transaction went through without authorization or with an authorization error','Visa group 11, Mastercard 4808'],
['Processing errors','A duplicate, a wrong amount, a wrong currency','Visa group 12, Mastercard 4834 (duplicate)'],
['Consumer disputes','Goods not received, not as described, subscription cancelled','Visa group 13, Mastercard 4853']
])}
<p class="src">The codes are examples, and the catalogs change. Check the current values and deadlines in the scheme rules.</p>
<h2>How a merchant defends</h2>
<ul><li>Proof of delivery or of the service rendered.</li><li>Session logs, address and device data, the 3-D Secure result (authentication changes liability for fraud disputes).</li><li>Correspondence with the customer, and the terms the customer accepted.</li><li>The history of earlier undisputed transactions of this customer.</li></ul>
<p>Schemes monitor the share of disputes and fraud at merchants (for example, Visa has the VAMP program and Mastercard has similar ones). With high rates, fines and special conditions are possible.</p>
<h2>What a processor system must be able to do</h2>
<ul><li>Accept a notification (a file or an API) and match it to the original transaction by ARN or RRN.</li><li>Create a case with a status, calculate the response deadline and start the timers.</li><li>Post the entries: debit the dispute amount and fees from the merchant, and return them on a win.</li><li>Store the evidence and the history of actions.</li><li>Handle repeated, incomplete and out-of-order notifications.</li><li>Provide reporting: how many disputes, how many won, amounts, deadlines.</li></ul>
`,
takeaways:['A chargeback is started by the issuer at the request of the cardholder, while a refund is made voluntarily by the merchant.','Stages: chargeback, representment, pre-arbitration, scheme arbitration. Deadlines depend on the scheme and the reason code.','Reason families: fraud, authorization, processing errors, consumer disputes.','A processor system must match, track deadlines, post money and handle exceptions.'],
quiz:[
{q:'Who starts a chargeback?',o:['The merchant','The issuer, on a request from the cardholder','The acquirer','The payment gateway'],a:1,why:'The cardholder contacts their bank, and the issuer starts the chargeback through the scheme.'},
{q:'How does a chargeback differ from a refund?',o:['It does not','A refund is made voluntarily by the merchant, while a chargeback is forced and goes through the issuer and the scheme at the request of the cardholder','A refund is made by the scheme','A chargeback is always free'],a:1,why:'The initiator and the compulsion differ: in a chargeback the money is debited from the merchant without their consent.'},
{type:'order',q:'Put the stages of a dispute in order.',items:['The disputed transaction and the cardholder complaint','Chargeback from the issuer','Representment: the merchant response with evidence','Pre-arbitration','Scheme arbitration'],why:'A typical chain. The exact stages and deadlines depend on the scheme and the reason code.'},
{q:'The transaction passed 3-D Secure (ECI 05), and a month later a fraud dispute arrived: "I did not use the card". What matters?',o:['Nothing, there is no chance','The authentication result is strong evidence: under the scheme rules, liability for fraud disputes generally lies with the issuer','The money must be returned at once','It is enough to write that the customer is lying'],a:1,why:'The liability shift works if authentication really took place. The merchant presents its result as evidence.'},
{q:'What is an ARN?',o:['A card number','Acquirer Reference Number: an identifier of a clearing record used to find the transaction in a dispute','A response code','A security code'],a:1,why:'The ARN is assigned by the acquirer and points unambiguously to a clearing record.'},
{q:'TC40 (Visa) and SAFE (Mastercard) are:',o:['Kinds of cards','Fraud reports that the issuer sends to the scheme and that do not move money by themselves','Authorization response codes','Names of settlement systems'],a:1,why:'They are fraud reports. They count in merchant monitoring but are not a dispute.'},
{q:'A repeated notification about the same chargeback arrived. What is the correct system behavior?',o:['Create a second case and debit the amount a second time','Recognize the duplicate by its key, do not create the case again, write it to the log and acknowledge receipt','Ignore it without a record','Block the merchant'],a:1,why:'Handling must be idempotent: a double debit is worse than an extra log entry.'}
],
practice:{id:'p-m7',title:'Chargeback edge cases',
brief:'<p>Come up with eight non-trivial situations when handling a chargeback notification and describe the expected system behavior for each. For example: a duplicate, an unknown ARN, a partial amount, a different currency, the response deadline has passed, the notification arrived after a refund.</p>',
template:'1. Situation -> expected behavior\n2. \n3. \n4. \n5. \n6. \n7. \n8. \n',
checks:['At least eight different situations','For each it is clear what the system does and what the operator sees','There are cases about money (postings), not only about statuses','There is a case where events arrive in the wrong order'],
model:'<ol><li>A duplicate notification: the case is not created again, a log entry is written, the source gets an acknowledgement.</li><li>The ARN is not found: the case gets the status "needs manual handling", the operator gets a task, and no amount is debited until it is matched.</li><li>The amount is smaller than the original (a partial dispute): only the dispute amount is debited.</li><li>The dispute currency differs from the transaction currency: converted at the scheme rate from the notification, and the entry is recorded with the rate.</li><li>The response deadline has passed: the status is "expired", a response is impossible, and the loss is confirmed automatically.</li><li>The notification arrived after a full refund: the case is created, the amount cannot exceed the remaining balance, and the operator is offered to close it.</li><li>A chargeback reversal notification arrived before the chargeback itself: the event is queued and applied after the case is created.</li><li>The merchant is closed or blocked: postings go to the reserve account, and a task is created for the operator.</li></ol>'}
});

COURSE.push({
id:'m8',short:'Reconciliation',title:'Reconciliation and settlement',day:6,minutes:50,
lead:'How authorizations, clearing and settlement are reconciled, which mismatches occur, and how to find them with SQL queries.',
learn:['explain what is reconciled against what and which keys are used','recognize typical mismatches and their causes','describe the process for handling exceptions','write SQL queries for reconciliation'],
body:`
<h2>Why reconciliation is needed</h2>
<p>One transaction lives in several systems: at the merchant, in the processor log, in the scheme files, in the bank statement. They do not always agree. Reconciliation finds the mismatches before they turn into lost money or claims.</p>
<h2>What is reconciled against what</h2>
${tbl(['Source','What it contains','Key'],[
['Merchant / PSP','Orders and payments','Order ID, Payment ID'],
['Processor','The log of authorizations and reversals','RRN, auth code, STAN'],
['Scheme','Clearing files, settlement reports','RRN, ARN'],
['Bank','Statements of the settlement account','Amount and date of the credit, a reference to the settlement file']
])}
<h2>Typical mismatches</h2>
${tbl(['Mismatch','Likely causes'],[
['Authorization without clearing','The merchant did not capture, the authorization expired, the file has not arrived yet'],
['Clearing without authorization','Force post, a lost message, a transaction of another party'],
['Amount mismatch','Partial capture, a tip, currency and rate, an error'],
['Duplicate in clearing','The file was sent twice, a merchant error'],
['Reversal after clearing','The cancellation came too late, a refund is needed'],
['Fee mismatch','A different interchange rate, rounding, a wrong transaction category'],
['Timing mismatch','Different time zones, cut-off time, weekends and holidays']
])}
{{w:recon}}
<h2>Settlement and positions</h2>
<ul><li><b>Gross and net.</b> With gross, every transaction is settled separately; with net, the participants settle the final net amount of their mutual obligations.</li><li><b>Timing.</b> Settlement runs in T+N business days, which depend on the scheme, the bank and the calendar.</li><li><b>Cut-off.</b> The day boundary determines which reporting day a transaction falls into.</li><li><b>Reserves and holds.</b> Part of the merchant revenue can be held back against disputes.</li></ul>
<h2>The exception handling process</h2>
<ol><li>Detect the mismatch and write it to the exception log.</li><li>Classify it: type, amount, age, owner.</li><li>Assign a person responsible and a deadline.</li><li>Decide: fix the posting, request an adjustment, return the duplicate, accept the loss.</li><li>Close with the reason recorded. Watch the aging and the share closed within the deadline.</li></ol>
<h2>SQL for reconciliation</h2>
<p>Below is the data from the lab above. Copy the script into DBeaver with a SQLite connection (create an empty in-memory database) and run the queries.</p>
<div class="row"><button class="btn ghost" data-copy="sql-data">Copy the data script</button></div>
<pre class="mono-box" id="sql-data">CREATE TABLE authorizations (rrn TEXT, amount REAL, status TEXT);
CREATE TABLE clearing (rrn TEXT, amount REAL);
INSERT INTO authorizations VALUES
('R001',10.00,'approved'),('R002',25.50,'approved'),('R003',99.99,'approved'),
('R004',15.00,'approved'),('R005',40.00,'approved'),('R006',7.20,'approved'),
('R007',120.00,'reversed'),('R008',18.00,'approved');
INSERT INTO clearing VALUES
('R001',10.00),('R002',25.50),('R003',94.99),('R004',15.00),
('R004',15.00),('R006',7.20),('R008',18.00),('R009',33.00);</pre>
<h3>1. Authorizations without clearing</h3>
<div class="row"><button class="btn ghost" data-copy="sql-q1">Copy</button></div>
<pre class="mono-box" id="sql-q1">SELECT a.rrn, a.amount
FROM authorizations a
LEFT JOIN clearing c ON c.rrn = a.rrn
WHERE a.status = 'approved' AND c.rrn IS NULL;</pre>
<p>The technique is called an anti-join: the left table without matches in the right one. The condition <code>status = 'approved'</code> excludes cancelled authorizations, for which no clearing is expected. Expected result: R005.</p>
<h3>2. Duplicates in clearing</h3>
<div class="row"><button class="btn ghost" data-copy="sql-q2">Copy</button></div>
<pre class="mono-box" id="sql-q2">SELECT rrn, COUNT(*) AS cnt, SUM(amount) AS total
FROM clearing
GROUP BY rrn
HAVING COUNT(*) &gt; 1;</pre>
<p>Expected result: R004, two records totaling 30.00.</p>
<h3>3. Amount mismatch</h3>
<div class="row"><button class="btn ghost" data-copy="sql-q3">Copy</button></div>
<pre class="mono-box" id="sql-q3">SELECT a.rrn, a.amount AS auth_amount, c.amount AS clearing_amount
FROM authorizations a
JOIN clearing c ON c.rrn = a.rrn
WHERE a.amount &lt;&gt; c.amount;</pre>
<p>Expected result: R003, 99.99 against 94.99.</p>
<h3>4. Clearing without authorization</h3>
<div class="row"><button class="btn ghost" data-copy="sql-q4">Copy</button></div>
<pre class="mono-box" id="sql-q4">SELECT c.rrn, c.amount
FROM clearing c
LEFT JOIN authorizations a ON a.rrn = c.rrn
WHERE a.rrn IS NULL;</pre>
<p>Expected result: R009, 33.00.</p>
${co('A catch','In query 3 the duplicate R004 gives matching amounts, so it does not appear in the result. Each query catches its own type of mismatch. For full control you need all four and one more query for the totals.')}
`,
takeaways:['Reconcile by the transaction key, not by the total: different mismatches can offset each other.','An authorization without clearing is not always an error: a cancelled authorization (reversal) must not produce clearing.','Types of mismatch: no clearing, no authorization, amount, duplicate, fees, timing.','The exception process: find, classify, assign, decide, close, watch the age.'],
quiz:[
{q:'There is an approved authorization but no clearing for it. What is the most likely cause?',o:['The issuer blocked the card','The merchant did not capture or the clearing file has not arrived yet','The scheme broke','It is always fraud'],a:1,why:'The most common causes: there was no capture, the authorization expired, or the file is still on its way.'},
{q:'Why can you not reconcile by the total amount alone?',o:['It takes too long','Different mismatches can offset each other, so the total agrees even though there are errors','There is no such thing as a total','The scheme forbids it'],a:1,why:'In the lab the totals differ by 3.00, while there are four mismatches.'},
{q:'Which SQL technique finds authorizations without clearing?',o:['INNER JOIN','LEFT JOIN with the condition c.rrn IS NULL','GROUP BY','UNION'],a:1,why:'An anti-join: take all authorizations and keep those for which no clearing row was found.'},
{q:'An authorization was cancelled by a reversal before clearing. How should it look in reconciliation?',o:['As a "no clearing" mismatch','As normal: no clearing is expected','As a duplicate','As an amount mismatch'],a:1,why:'A cancelled transaction must not reach clearing, so it has to be excluded from the expected ones.'},
{type:'num',q:'Expected clearing is 215.69 and actual clearing is 218.69. What is the difference of the totals?',ans:3,tol:0.005,why:'218.69 - 215.69 = 3.00. Yet there are four real mismatches.'},
{q:'Clearing has two identical records for one RRN. What is it?',o:['A normal repeat','A duplicate: the money will be debited twice, and the duplicate must be returned','A partial capture','A reversal'],a:1,why:'One transaction must not reach clearing twice.'},
{q:'Net settlement means:',o:['Settling each transaction separately','Settling the final net amount of mutual obligations','Settlement without fees','Settlement only on weekends'],a:1,why:'The participants offset their mutual obligations and transfer the result.'}
],
practice:{id:'p-m8',title:'Reconciliation queries',
brief:'<p>Create the tables in DBeaver from the script above. First write the four queries yourself without peeking, then compare with the reference. Then add a fifth: how much money sits under the mismatches of each type.</p>',
template:'Query 1 (no clearing):\n\nQuery 2 (duplicates):\n\nQuery 3 (amount):\n\nQuery 4 (no authorization):\n\nQuery 5 (totals by type):\n',
checks:['Queries 1 and 4 are written with LEFT JOIN','Query 1 excludes cancelled authorizations','Query 5 shows amounts by type, not only counts','It is explained why the authorization and clearing totals almost agreed'],
model:'<p>Query 5 can be built with UNION ALL:</p><pre class="mono-box">SELECT \'no clearing\' AS type, SUM(a.amount) AS amount\nFROM authorizations a LEFT JOIN clearing c ON c.rrn=a.rrn\nWHERE a.status=\'approved\' AND c.rrn IS NULL\nUNION ALL\nSELECT \'duplicate\', SUM(amount)/2 FROM clearing\nWHERE rrn IN (SELECT rrn FROM clearing GROUP BY rrn HAVING COUNT(*)&gt;1)\nUNION ALL\nSELECT \'amount\', SUM(a.amount-c.amount)\nFROM authorizations a JOIN clearing c ON c.rrn=a.rrn WHERE a.amount&lt;&gt;c.amount\nUNION ALL\nSELECT \'no authorization\', SUM(c.amount)\nFROM clearing c LEFT JOIN authorizations a ON a.rrn=c.rrn WHERE a.rrn IS NULL;</pre><p>The query returns: no clearing 40.00, duplicate 15.00, amount 5.00, no authorization 33.00. Their effect on the clearing total is -40.00, +15.00, -5.00 and +33.00. They partly cancel each other, so the difference of the totals is only 3.00.</p>'}
});
