/* Modules 1-4. Helpers tbl() and co() come from js/lib.js. */

COURSE.push({
id:'m1',short:'Payments ecosystem',title:'The payments ecosystem',day:1,minutes:25,
lead:'Who takes part in a card payment, what each party is responsible for, and why one transaction carries several different numbers.',
learn:['name the parties in a card payment and explain the role of each','tell an acquirer, a processor, a gateway and a PSP apart','explain why one transaction has several identifiers','say where a card processor sits in the chain'],
body:`
<h2>Why an analyst needs this</h2>
<p>The requirement "the customer pays by card" looks simple. Behind it stands a chain of several organizations and dozens of messages. Until an analyst understands who is responsible for what in that chain, they cannot describe the process, ask the team the right question, or find the cause of a mismatch.</p>
<h2>The four-party model</h2>
${tbl(['Role','What it does','Note'],[
['Cardholder','Pays and confirms the payment','A customer of the issuing bank'],
['Merchant','Sells goods or services and receives the money minus a fee','Web shop, point of sale, app'],
['Issuer','Issued the card, decides whether to approve a payment, answers to the cardholder','A bank. The issuer sees the balance and the limits'],
['Acquirer','Signs the contract with the merchant, accepts payments, pays the merchant out','A bank or a licensed institution. Carries the risk of the merchant'],
['Payment scheme','Sets the rules, routes messages, calculates the settlement between participants','Visa, Mastercard, Dina. Dina is operated by the National Bank of Serbia']
])}
{{w:roles}}
<h2>Who else sits in between</h2>
${tbl(['Participant','What it is'],[
['Processor','The technical platform a bank uses to handle card operations: authorizations, card data, clearing files. There are issuer processors and acquirer processors'],
['Payment gateway','Accepts merchant requests over an API and passes them to the acquirer or processor. Does not hold the money itself'],
['PSP / payment aggregator','Accepts payments on behalf of many small merchants under one contract with an acquirer and takes on part of the risk'],
['Token provider','Issues and maintains card tokens for wallets and cards on file']
])}
${co('Where processors sit','A card processor is a technology company that runs the platform for banks: it receives authorization messages, keeps card data, produces clearing files and talks to the schemes and to the banks. A business analyst at a processor writes requirements for a platform that receives authorization messages, keeps card data, produces clearing and exchanges messages with banks and schemes.')}
<h2>Three flows in every payment</h2>
<ul><li><b>Information.</b> The authorization request and response: can this amount be charged to this card.</li><li><b>Money.</b> Clearing and settlement: who is actually paid, how much and when.</li><li><b>Liability and disputes.</b> Chargebacks, fraud, refunds: who pays when something goes wrong.</li></ul>
<p>For any requirement, ask yourself which flow it belongs to. It quickly shows which participants you will have to talk to.</p>
<h2>Why one transaction has many numbers</h2>
<p>Every participant keeps its own identifier, and the only way to link them is through shared keys. This is why reconciliation (module 8) and disputes (module 7) depend on the right identifiers.</p>
${tbl(['Identifier','Assigned by','What it is for'],[
['Order ID','Merchant','Link to the order in the shop'],
['Payment / Transaction ID','PSP or gateway','Link to the merchant request to the payment service'],
['STAN','Message originator (terminal, acquirer)','Traces a message within a session; the number repeats quickly'],
['RRN (retrieval reference number)','Acquirer','Finds the transaction between acquirer and issuer; a key for reconciliation'],
['Auth code','Issuer','Confirms the authorization was approved (usually 6 characters)'],
['ARN (acquirer reference number)','Acquirer, at clearing','An unambiguous reference to a clearing record; needed in disputes']
])}
<p class="src">Formats and lengths differ between schemes and banks. Take them from the specification of the integration you work on.</p>
`,
takeaways:['Four parties plus a scheme: cardholder, merchant, issuer, acquirer, payment scheme.','Processor, gateway and PSP are technical and commercial intermediaries, not synonyms for a bank.','Three flows: information, money, disputes. Every requirement belongs to one of them.','One payment carries several identifiers, and reconciliation depends on linking them.'],
quiz:[
{q:'Who makes the final decision to approve an authorization?',o:['The acquirer','The payment scheme','The issuer','The payment gateway'],a:2,why:'The issuing bank decides, because only it sees the account, the limits and the card status.'},
{q:'Who pays the merchant for the accepted payments?',o:['The issuer directly','The acquirer','The payment scheme','The cardholder'],a:1,why:'Money moves from the issuer through the scheme settlement to the acquirer, and the acquirer pays the merchant minus the fee (MDR).'},
{q:'A company runs the technical platform that banks use to handle authorizations, card data and clearing files for their cards. What role is that?',o:['Payment scheme','Processor','Merchant','Cardholder'],a:1,why:'It is a processor: a technical processing platform, not a scheme and not an end seller.'},
{q:'Which identifier does the acquirer assign to a clearing record and use in disputes?',o:['STAN','ARN','CVV','BIN'],a:1,why:'The ARN (acquirer reference number) points unambiguously to a clearing record and is needed to find the transaction in a dispute.'},
{q:'How does a payment gateway differ from an acquirer?',o:['The gateway decides whether to approve the payment','The gateway technically passes requests on, while the contract with the merchant and the settlement belong to the acquirer','They are the same thing','The gateway issues cards'],a:1,why:'A gateway is a technical intermediary. The contract, the risk and the payout to the merchant stay with the acquirer.'}
],
practice:{id:'p-m1',title:'A payment flow diagram',
brief:'<p>Describe a card payment on a website: who sends which message to whom, and in what order. Use text or a diagram in <a href="https://bpmn.io/" target="_blank" rel="noopener">bpmn.io</a> (one lane per participant). Mark the three flows separately: information, money, disputes.</p>',
template:'Participants:\n- \n\nSteps:\n1. \n2. \n\nInformation flow:\nMoney flow:\nDispute flow:\n\nIdentifiers by step:\n',
checks:['All five parties are named and the role of each is clear','The order of messages from request to response is unambiguous','The money flow is shown separately from the information flow','It is marked where the order ID, RRN, auth code and ARN appear'],
model:'<ol><li>The cardholder enters the card details at the merchant.</li><li>The merchant sends a request to the gateway, and the gateway passes it to the acquirer.</li><li>The acquirer builds an authorization message and sends it through the scheme to the issuer.</li><li>The issuer decides, and the response travels back along the same chain (the information flow).</li><li>Later the acquirer sends clearing, the scheme calculates net positions, and settlement runs issuer → scheme → acquirer → merchant (the money flow).</li><li>If the cardholder disputes the payment, the issuer starts a chargeback through the scheme (the dispute flow).</li></ol><p>Identifiers: the order ID at the merchant in step 1, the RRN at authorization in step 3, the auth code in step 4, the ARN at clearing.</p>'}
});

COURSE.push({
id:'m2',short:'Payment lifecycle',title:'The lifecycle of a card payment',day:1,minutes:35,
lead:'Authorization, capture, clearing, settlement: where money really moves, how a cancellation differs from a refund, and which statuses you need to describe.',
learn:['name the stages of a payment and explain where money moves','tell reversal, void, refund and partial capture apart','describe a status model and its allowed transitions','understand what dual-message and single-message mean'],
body:`
<h2>A payment splits into "allow" and "post"</h2>
<p>The first part answers the question "is it allowed". The second part moves the money. Between them anything from seconds to several days can pass.</p>
${tbl(['Stage','What happens','Does money move'],[
['Authorization','The issuer checks the card, the limit, the balance and anti-fraud. It approves, places a hold and returns an auth code','No, only a hold on the amount'],
['Capture','The merchant confirms the goods were delivered and asks to post the charge','No'],
['Clearing','The acquirer sends financial records to the scheme. The scheme passes them to the issuer and calculates the fees','No, it is an exchange of information'],
['Settlement','The net settlement between issuer, scheme, acquirer and merchant','Yes']
])}
{{w:paysim}}
<h2>Single-message and dual-message models</h2>
<ul><li><b>Dual-message.</b> Authorization and clearing are two separate exchanges. Most online and in-store purchases work this way.</li><li><b>Single-message.</b> One message authorizes and posts the transaction at once. ATMs and PIN debit transactions usually work this way.</li></ul>
<p>In single-message there is no separate capture or clearing stage, so reconciliation works differently. Find out which model the integration uses before you describe the process.</p>
<h2>Cancellations, refunds and partial charges</h2>
${tbl(['Operation','When','What happens'],[
['Reversal / void','Before clearing','Cancels the authorization, and the issuer releases the hold. No money moved'],
['Refund','After clearing or settlement','A separate reverse operation. It goes through the acquirer and the scheme to the issuer, and the money comes back in a few days'],
['Partial capture','When less than the authorized amount is charged','Part is charged and the rest of the hold is released'],
['Incremental authorization','When the amount grows (hotel, car rental)','An additional authorization increases the hold']
])}
${co('Terms differ between PSPs','Void, reversal, cancel, refund and credit mean slightly different things at different payment services. In requirements, define every term explicitly and tie it to a stage of the payment.',true)}
<h2>Payment statuses and transitions</h2>
<p>A typical status model: <code>created → pending (3-D Secure) → authorized → captured → settled</code>. Side branches: <code>declined</code>, <code>expired</code> (the authorization lapsed before capture), <code>voided</code>, <code>refunded</code> (partly or fully), <code>chargeback</code>.</p>
<p>An analyst describes not only the statuses but also the matrix of allowed transitions: which status can move to which, who or what triggers it, and what happens to the money.</p>
${tbl(['From status','To status','Triggered by','Condition'],[
['authorized','captured','Merchant','The amount is not above the authorized amount, and the authorization has not expired'],
['authorized','voided','Merchant, or the system on timeout','There was no clearing yet'],
['captured','refunded','Merchant','The refund amount is not above the charged amount'],
['settled','chargeback','Issuer through the scheme','Within the dispute window set by the scheme rules']
])}
<h2>What can go wrong</h2>
<ul><li><b>Response timeout.</b> The merchant does not know whether the authorization was approved. Simply repeating the request can create a double hold. You need an idempotency key and a cancellation on timeout.</li><li><b>Late response.</b> The issuer response arrives after the merchant has already cancelled the operation.</li><li><b>Expired authorization.</b> Its lifetime is limited by the scheme and issuer rules, and after that a capture will not go through.</li><li><b>Capture amount above the authorization.</b> Whether it is allowed depends on the scheme rules and the type of business, so it has to be clarified.</li></ul>
`,
takeaways:['Authorization and capture do not move money, clearing passes information, settlement moves money.','Reversal cancels an authorization before clearing, refund is a separate reverse operation afterwards.','Single-message (ATM, PIN) has no separate clearing.','A status model is described together with its transition matrix and timeout handling.'],
quiz:[
{type:'order',q:'Put the stages of a card payment in order.',items:['Authorization','Capture','Clearing','Settlement'],why:'First the issuer allows the payment and places a hold, then the merchant confirms the charge, then financial records are exchanged, and finally the real settlement happens.'},
{q:'At which stage does money actually move between banks?',o:['Authorization','Clearing','Settlement','Capture'],a:2,why:'Only at settlement. The other stages pass information or place a hold.'},
{q:'The merchant cancelled the order an hour after the authorization, and there was no capture yet. What is correct?',o:['Refund','Chargeback','Reversal (cancel the authorization)','A repeated authorization'],a:2,why:'There was no clearing, so it is enough to release the hold by cancelling the authorization.'},
{q:'How does a refund differ from a reversal?',o:['A refund is a separate reverse operation after clearing, while a reversal releases the hold before clearing','They are synonyms','The issuer makes a reversal and the cardholder makes a refund','A refund is always free'],a:0,why:'After clearing, an authorization is no longer enough: the money has gone into settlement, and the return goes through a separate reverse operation.'},
{q:'An authorization request was sent and there is no response (timeout). What is the risk of simply repeating the request?',o:['None, the scheme filters the repeat out itself','A duplicate hold or charge may appear, so an idempotency key and a cancellation on timeout are needed','The issuer will block the card','The response has certainly been received'],a:1,why:'The first request may have reached the issuer. Without idempotency the repeat creates a second operation.'},
{q:'An ATM with PIN usually works on the model:',o:['Dual-message','Single-message','No authorization','Clearing only'],a:1,why:'At an ATM one message both authorizes and posts the transaction.'}
],
practice:{id:'p-m2',title:'BPMN: authorization, capture, reversal, refund',
brief:'<p>Draw in <a href="https://bpmn.io/" target="_blank" rel="noopener">bpmn.io</a> (or describe in words) a payment process with three branches: a successful capture, a cancellation after authorization (reversal), and a refund after settlement. Use lanes for the participants and mark where the "money moves" boundary runs. In the field below, write which branches and events are on the diagram and how they differ.</p>',
template:'Lanes:\n- \n\nEvents and tasks of the main branch:\n\nReversal branch:\n\nRefund branch:\n\nWhere money moves:\n',
checks:['The three branches differ by the stage at which they fire','It is visible that the reversal happens before clearing and the refund after settlement','The boundary of money movement is marked','There is handling for a response timeout'],
model:'<p>Main process: start → authorization request → XOR gateway (approved or not) → capture → clearing → settlement → end. After the "approved" branch of the gateway, add the event "timer: authorization expired" → expired branch.</p><p>Reversal: between authorization and capture, a "cancel" message leads to releasing the hold, and the process ends without clearing.</p><p>Refund: after settlement a new subprocess "refund" starts: refund request → clearing in the reverse direction → settlement → cardholder notification.</p><p>Money boundary: a dashed line before settlement.</p>'}
});

COURSE.push({
id:'m3',short:'Money and fees',title:'Money in a payment: fees and currencies',day:1,minutes:30,
lead:'What a merchant fee is made of, who receives what, how the acquirer margin is calculated, and why a calculation can be off by a cent.',
learn:['split the MDR into interchange, scheme fees and acquirer markup','compare the IC++ and blended pricing models','explain how currency and rounding break reconciliation','write requirements for a fee report'],
body:`
<h2>Where the merchant fee comes from</h2>
<p>The merchant pays the acquirer a single fee, the MDR (merchant discount rate). It has three parts inside.</p>
${tbl(['Part','Paid to','Depends on'],[
['Interchange','The issuer (the acquirer pays it, then passes it on to the merchant)','Card type, region, acceptance method, merchant category, regulation'],
['Scheme fees','The payment scheme','The scheme, the type of transaction, international or domestic'],
['Acquirer markup','The acquirer or PSP','The contract, the volume, the merchant risk']
])}
{{w:feecalc}}
<h2>What interchange depends on</h2>
<ul><li>Card type: debit, credit, prepaid, commercial.</li><li>Region: domestic, within a region, or international.</li><li>Acceptance method: card present (chip, contactless) or not present (online).</li><li>Merchant category (MCC).</li></ul>
<p>Regulation. In the European Economic Area, the interchange regulation caps the rate for consumer cards at 0.2% for debit and 0.3% for credit. In Serbia, interchange fees are regulated by law and by the National Bank of Serbia, so check the current documents for exact rates. According to the DinaCard website, interchange is the amount the acquirer pays the issuer for each completed transaction.</p>
<h2>Pricing models</h2>
${tbl(['Model','What it is','Pros and cons'],[
['IC++ (interchange plus plus)','The merchant pays the actual interchange, the actual scheme fee and a separate markup','Transparent, but reports are more complex'],
['Blended (flat rate)','One rate for all transactions, for example 1.2%','Simple for the merchant, and the acquirer carries the risk of "expensive" cards'],
['Fixed fee per transaction','A small amount for each attempt or transaction','Often added on top of the percentage rate']
])}
<p>Besides the MDR there are separate charges: for a refund, for a chargeback, monthly fees, and a rolling reserve (part of the revenue is held back as a reserve against disputes).</p>
<h2>Currencies</h2>
<ul><li>The transaction currency, the card currency and the settlement currency can all differ.</li><li>Conversion uses the scheme rate plus the margins of the participants. Which rate and for which date is a frequent source of mismatches.</li><li>DCC (dynamic currency conversion): the merchant offers to pay in the card currency. The terms and the fee are described separately.</li></ul>
<h2>Cents and rounding</h2>
${co('Example','Three transactions of 0.33 EUR at a rate of 1.4%. For each, the fee is 0.00462, which rounds to 0.00, so the total is 0.00. If you calculate from the sum of 0.99, the fee is 0.01386, which is 0.01. Both calculations are correct, but the report totals will not match. The rounding rule (per transaction or on the total, up or to the nearest) is a requirement, not an implementation detail.',true)}
<h2>What an analyst must describe</h2>
<ul><li>Who calculates the fee and at which stage (at authorization, at clearing, at settlement).</li><li>The currency and the rate, and the date on which the rate is fixed.</li><li>The rounding rule and the storage precision.</li><li>What happens to the fee on a refund and on a chargeback.</li><li>The report structure: detail by transaction and totals, and how they connect.</li></ul>
`,
takeaways:['MDR = interchange + scheme fees + acquirer markup.','Interchange flows from the acquirer to the issuer and depends on card type, region and acceptance method.','With a flat rate the acquirer can lose money on "expensive" cards.','Rounding and the exchange rate are requirements, otherwise the reports will not match.'],
quiz:[
{q:'What is the MDR made of?',o:['Only the fee of the merchant bank','Interchange, scheme fees and acquirer markup','Only interchange','A fee from the cardholder and the merchant'],a:1,why:'Three parts: interchange to the issuer, a fee to the scheme, markup to the acquirer.'},
{type:'num',q:'The amount is 200 EUR. Interchange 0.30%, scheme fee 0.10%, markup 0.60%, fixed fee 0.10 EUR. How much does the merchant receive (EUR)?',ans:197.9,tol:0.005,why:'The fee: 0.60 + 0.20 + 1.20 + 0.10 = 2.10. The merchant receives 200 minus 2.10.'},
{q:'Who pays interchange, and to whom?',o:['The issuer pays the acquirer','The acquirer pays the issuer and passes it on to the merchant as part of the MDR','The cardholder pays the scheme','The merchant pays the issuer directly'],a:1,why:'The acquirer pays interchange to the issuer. The merchant pays for it as part of the MDR.'},
{q:'Why can the acquirer end up with a negative margin on a single transaction under a flat (blended) rate?',o:['The scheme returns the money','The rate is flat, while interchange on "expensive" cards (commercial, international) is higher than it','The issuer charges a penalty','A rounding error'],a:1,why:'Revenue under a flat rate is fixed, while the interchange cost depends on the card.'},
{type:'num',q:'Flat rate 1.20%, interchange 1.50%, scheme fee 0.20%. A transaction of 100 EUR. What is the acquirer margin (EUR, with sign)?',ans:-0.5,tol:0.005,why:'Revenue 1.20, costs 1.70. Margin -0.50.'},
{q:'Three transactions of 0.33 EUR, rate 1.4%. What must the analyst fix in the requirements so the reports agree?',o:['Nothing, it will all add up by itself','The rounding rule: per transaction or on the total','Switch the fee off for small amounts','Use whole amounts only'],a:1,why:'Rounding in different places gives different totals. The rule has to be written down explicitly.'}
],
practice:{id:'p-m3',title:'Requirements for a fee report',
brief:'<p>Write 5 testable acceptance criteria for a monthly fee report sent to a merchant: which fields are in a row, how the totals are calculated, the rounding rule, the currency, and what happens with refunds. A criteria builder is available in module 11.</p>',
template:'1. \n2. \n3. \n4. \n5. \n',
checks:['Every criterion has concrete values or rules, not just "correct"','Rounding is described explicitly','The currency and the source of the rate are stated','The behavior for refunds and chargebacks is described'],
model:'<ol><li>A report row contains: date, transaction ID, amount, currency, interchange, scheme fee, markup, total fee.</li><li>The fee per transaction is rounded to 2 decimals to the nearest (0.005 rounds up) and stored with a precision of 5 decimals.</li><li>The report total equals the sum of the rounded transaction fees.</li><li>If the transaction currency differs from the settlement currency, the rate and the rate-fixing date are shown.</li><li>A refund appears as a separate row with a negative amount, and the fee is returned according to the contract terms (a flag on the merchant profile).</li></ol>'}
});

COURSE.push({
id:'m4',short:'Card and tokens',title:'Inside the card: number, chip, tokens, PCI DSS',day:4,minutes:40,
lead:'What a card number is made of, what the chip protects, how wallets replace the number with a token, and which data must never be stored or shown.',
learn:['break a card number into parts and check it with Luhn','explain why a chip is safer than a magnetic stripe','tell network tokens and PSP tokens apart','say what may be stored and what may not (PCI DSS)'],
body:`
<h2>What a card number is made of</h2>
${tbl(['Part','What it is'],[
['PAN','Primary account number, usually 16 digits, 13-19 allowed'],
['MII','The first digit: the industry. 4 is Visa bank cards, 9 is reserved for national schemes'],
['BIN / IIN','The first 6-8 digits: an identifier of the issuer and the product. The BIN gives the scheme, the country and the card type'],
['Account','The remaining digits, an internal identifier at the issuer'],
['Check digit','The last digit, by the Luhn algorithm. It catches typos but does not protect against forgery']
])}
<p>Mastercard: prefixes 51-55 and 2221-2720. You do not need to memorize the BIN ranges of a national scheme: take them from the scheme directory or from the team.</p>
{{w:luhn}}
<h2>What else is on the card and in the chip</h2>
<ul><li><b>Expiry date.</b> Takes part in authorization.</li><li><b>CVV/CVC.</b> The code on the back for card-not-present transactions. The issuer verifies it. It must not be stored after authorization.</li><li><b>PIN.</b> Known only to the cardholder and the issuer, and transmitted encrypted.</li><li><b>Magnetic stripe.</b> Holds static data, so forgery is easy.</li><li><b>Chip (EMV).</b> Creates a unique cryptogram for every transaction, so copied data is useless.</li><li><b>Contactless interface (NFC).</b> The same chip, a different way of communicating.</li></ul>
<h2>EMV in plain words</h2>
<ol><li>The terminal and the chip agree on an application and on a cardholder verification method (PIN, signature, confirmation on the phone, or none for small amounts).</li><li>The chip builds an ARQC cryptogram and sends it with the data in the authorization request (in ISO 8583 this is field DE55).</li><li>The issuer verifies the cryptogram and replies; the response may contain an ARPC.</li><li>The transaction ends with an approval (TC) or a decline (AAC).</li></ol>
<h2>Tokens and wallets</h2>
<p>A token replaces the card number with a surrogate value. There are two kinds.</p>
${tbl(['Kind','Issued by','Where it works'],[
['Network token','Scheme services (for example Visa Token Service, Mastercard MDES)','Apple Pay, Google Pay, a card on file at a merchant. Works in the scheme network and is bound to a device or a merchant'],
['PSP token','The payment provider','Only inside the PSP: the merchant stores the token instead of the number, and repeat charges go through the provider']
])}
<p>In a wallet the card is stored as a device token (DPAN), and every transaction carries a one-time cryptogram. The issuer replaces the token with the real number and makes the decision. What matters to an analyst is the token lifecycle (issuing, suspending, deleting, updating when a card is reissued) and the fact that the merchant never sees the real number.</p>
<h2>What may be stored and shown (PCI DSS)</h2>
<p>PCI DSS is the industry standard for protecting card data. The main rules for an analyst: sensitive authentication data (CVV/CVC, PIN, full track data) must not be stored after authorization, a stored PAN must be unreadable, and screens and logs show a mask.</p>
{{w:pci}}
${co('A working rule','Real card numbers must not end up in tickets, logs, screenshots or messages. Use test cards and masks. This applies to test environments too: copies of production data often end up there.',true)}
`,
takeaways:['PAN = MII + BIN + account + check digit (Luhn).','The chip makes a unique cryptogram for every transaction, so a copy of the data is useless.','Network tokens and PSP tokens are different things with different scope.','CVV/CVC, PIN and full track data are not stored after authorization. A mask is safe, a real PAN is not.'],
quiz:[
{q:'What is the last digit of a card number for?',o:['It identifies the bank','It is a check digit by the Luhn algorithm and catches typos','It shows the expiry date','It encrypts the number'],a:1,why:'It is a check digit. It catches accidental input errors but does not protect against forgery.'},
{q:'What must not be stored after authorization, even encrypted?',o:['PAN','CVV/CVC','Expiry date','The last 4 digits'],a:1,why:'Verification codes are sensitive authentication data and are not stored after authorization.'},
{q:'A number starts with 4. Which scheme is it by prefix?',o:['Mastercard','Visa','Dina','American Express'],a:1,why:'Prefix 4 means Visa. Mastercard is 51-55 and 2221-2720.'},
{q:'Why is it harder to forge a chip transaction than a magnetic stripe one?',o:['A chip is more expensive','The chip generates a unique cryptogram for every transaction, while stripe data is static','A chip has more digits','A chip works only offline'],a:1,why:'A copied cryptogram will not work for the next transaction.'},
{q:'What is transmitted in an Apple Pay payment instead of the real card number?',o:['The card number in encrypted form','A device token and a one-time transaction cryptogram','Only the CVV','A photo of the card'],a:1,why:'The wallet stores a token (DPAN) and adds a cryptogram to every transaction.'},
{q:'Can you paste into a Jira ticket a screenshot of a log with the full number of a real customer card?',o:['Yes, if the ticket is internal','No: mask the number or use test cards','Yes, if the card is already blocked','Yes, but only in a closed project'],a:1,why:'A real PAN must not end up in tickets, logs or messages.'}
],
practice:{id:'p-m4',title:'Masking rules',
brief:'<p>Write one requirement each for how an application handles a card number: what is shown in the interface, what is written to the log, what a support operator sees, what is stored in the database, and what is sent in notifications.</p>',
template:'Interface:\nLog:\nSupport:\nDatabase:\nNotifications:\n',
checks:['A full PAN does not appear anywhere without need','The mask is specific (which positions are shown)','CVV/CVC and PIN are not stored or logged','It is stated how a token works instead of the PAN'],
model:'<ul><li>Interface: a mask of the first 6 and last 4 digits is shown, the rest as asterisks; for saved cards only the last 4 digits and the brand.</li><li>Log: the PAN and CVV are never written; a token or a salted hash is logged; the PAN field is masked at the entry to the logging system.</li><li>Support: the operator sees the last 4 digits, the status and the token; the RRN or payment ID is used to find a transaction.</li><li>Database: the PAN is stored only encrypted in a separate protected store, or not at all (a PSP token); CVV/CVC is not stored after authorization.</li><li>Notifications: only the last 4 digits and the card brand.</li></ul>'}
});
