/* Modules 9-12. Helpers tbl() and co() come from js/lib.js. */

COURSE.push({
id:'m9',short:'National scheme: Dina',title:'A national scheme: Dina (Serbia)',day:5,minutes:30,
lead:'What primary sources confirm about the Dina national card scheme, how to read the documents of the National Bank of Serbia (NBS), and which questions to ask so that you do not guess.',
learn:['name the operator of Dina and how banks join it','explain how interchange, clearing and settlement work for Dina according to the NBS description','not confuse the Dina card scheme with the NBS instant payment system IPS NBS','build a comparison of Dina with Visa and Mastercard using a template'],
body:`
<h2>What the primary sources say</h2>
<p>This module contains only facts that are described on the DinaCard website and in the NBS decision. Everything else is deliberately marked "to find out". It also works as a case study: the same approach fits any national scheme.</p>
${tbl(['Topic','What is confirmed','Source'],[
['Operator','The DinaCard system is under the National Bank of Serbia (NBS)','<a href="https://dinacard.nbs.rs/en/o_nama" target="_blank" rel="noopener">DinaCard, about the system</a>'],
['Participation','Banks and other organizations join through a written application to the NBS, go through certification and sign an agreement. The annual fees of participants are set by the NBS','<a href="https://dinacard.nbs.rs/en/banke_i_druga_pravna_lica" target="_blank" rel="noopener">DinaCard, banks and other legal entities</a>'],
['Interchange','It is the amount the acquirer pays the issuer for each completed transaction. The amount is determined in line with the conditions of the Serbian market','<a href="https://dinacard.nbs.rs/en/trgovci_akceptanti" target="_blank" rel="noopener">DinaCard, merchants</a> and <a href="https://dinacard.nbs.rs/en/o_nama" target="_blank" rel="noopener">about the system</a>'],
['Clearing and settlement','The NBS decision describes clearing and settlement of Dina card transactions: the NBS calculates the multilateral net positions of participants and posts them to their accounts, based on the DinaCard system rules and the RTGS rules','<a href="https://www.nbs.rs/export/sites/NBS_site/documents-eng/propisi/propisi-ps/clearing_payment_cards.pdf" target="_blank" rel="noopener">NBS decision on clearing and settlement</a>']
])}
${co('What is missing here','There is no text of the DinaCard system rules, no current interchange table, no BIN ranges and no technical specifications. Before you write requirements, request them from the team or find them in current NBS documents. Do not reconstruct them from memory.',true)}
<h2>How to read NBS documents: five questions</h2>
<ol><li>Who is the operator and who are the participants of the system?</li><li>How does a bank become a participant and what does it take (certification, agreement)?</li><li>How are fees between participants determined?</li><li>How do clearing and settlement work: when, through which accounts, in what form (net or not)?</li><li>How are disputes and refunds handled?</li></ol>
<h2>Do not confuse</h2>
<ul><li><b>Dina</b> is a national payment card scheme.</li><li><b>IPS NBS</b> is an instant payment system between accounts (round-the-clock transfers), not a card scheme.</li><li>Visa and Mastercard cards issued by Serbian banks work under the rules of those schemes, not of Dina.</li></ul>
<h2>What sets a national scheme apart for an analyst</h2>
<p>These are not facts but questions for the team. A national scheme may have its own interface specifications, its own certification procedure, and local features of settlement and reporting. Ask: which specification does the platform use for the scheme, which messages and fields differ from Visa and Mastercard, how certification is organized, and what the dispute rules are.</p>
<h2>Comparison template</h2>
${tbl(['Topic','Dina','Visa / Mastercard'],[
['Operator','NBS','The company operating the scheme'],
['Bank participation','Application to the NBS, certification, agreement','Scheme license, certification'],
['Interchange','Paid by the acquirer to the issuer; the rate follows market conditions','Regional and country rates of the scheme, subject to regulation'],
['Clearing and settlement','Net positions calculated by the NBS (NBS decision)','Settlement through the scheme centers'],
['Disputes, tokens, wallets, specifications','To find out','Public scheme rules and guides']
])}
`,
takeaways:['The operator of Dina is the NBS, and banks join through an application, certification and an agreement.','Interchange is paid by the acquirer to the issuer, and clearing and settlement under the NBS decision run on net positions.','IPS NBS is instant transfers, not a card scheme.','Everything that is not in the primary sources (BINs, rates, specifications) has to be requested, not guessed.'],
quiz:[
{q:'Who is the operator of the DinaCard system?',o:['Visa','The National Bank of Serbia (NBS)','Any acquiring bank','A card processor'],a:1,why:'The system is under the NBS.'},
{q:'How does a bank become a DinaCard participant (according to the website)?',o:['Automatically when it issues cards','A written application to the NBS, certification and signing an agreement','A Visa license is enough','Through Mastercard'],a:1,why:'An application to the NBS, then certification and an agreement.'},
{q:'Who pays interchange under Dina?',o:['The issuer to the acquirer','The acquirer to the issuer','The cardholder to the scheme','The merchant directly to the NBS'],a:1,why:'According to the NBS description, interchange is the amount the acquirer pays the issuer for each transaction.'},
{q:'IPS NBS is:',o:['The Dina card scheme','An instant payment system between accounts','An anti-fraud system','A BIN directory'],a:1,why:'IPS NBS is instant transfers. The card scheme is DinaCard.'},
{q:'You need the BIN range of Dina cards. What is the right thing to do?',o:['Guess it from the prefix','Take it from the current scheme directory or from the team','Ask the customer','Use the Visa range'],a:1,why:'Ranges change, so they are taken from the current directory, not from memory.'}
],
practice:{id:'p-m9',title:'Compare Dina with Visa and Mastercard',
brief:'<p>Fill in the comparison table for your own purposes: for each topic write what is confirmed by documents (with a link) and what needs to be found out. Then write five questions to a subject-matter expert.</p>',
template:'Operator:\nParticipation:\nInterchange:\nClearing and settlement:\nDisputes:\nTechnical specifications:\n\nMy five questions:\n1. \n2. \n3. \n4. \n5. \n',
checks:['Every confirmed fact comes with a source','The unknown is explicitly marked "to find out"','The questions do not contain demands like "confirm that the BIN is such-and-such"','Visa data is not used anywhere in place of Dina data'],
model:'<p>Confirmed: the operator is the NBS; participation through an application, certification and an agreement; interchange is paid by the acquirer to the issuer; the NBS calculates net positions under the decision on clearing and settlement. To find out: dispute rules, tokens and wallets, interface specifications, current rates, BIN ranges.</p><p>Questions: which specification is used for Dina; how certification of a new function works; which messages differ from Visa and Mastercard; how refunds and disputes are organized; what the settlement calendar and cut-off are.</p>'}
});

COURSE.push({
id:'m10',short:'Risk and compliance',title:'Risk, KYC and compliance',day:7,minutes:30,
lead:'Types of card fraud, how anti-fraud works and why threshold trade-offs are not the same as "just configure it right", plus the basics of KYC/AML and PCI DSS.',
learn:['name the main types of card fraud','explain how rules and scoring work and what the threshold trade-off is','tell KYC, KYB and AML apart','understand what PCI DSS requires from an analyst'],
body:`
<h2>Types of card fraud</h2>
${tbl(['Type','What it is','How it is caught'],[
['CNP fraud','The card is used without being present (online), and the data was stolen','3-D Secure, scoring, device checks'],
['Card testing (BIN attack)','Series of small attempts with different numbers to find a working card','Attempt limits, velocity, captcha'],
['Account takeover','Takeover of a customer account','Device, behavior, changes of details'],
['Friendly fraud','The cardholder disputes their own legitimate purchase','Evidence, 3-D Secure, history'],
['Counterfeit / lost-stolen','A forged or stolen physical card','EMV, PIN, limits, blocking'],
['Merchant fraud','A fraudulent merchant','KYB, monitoring, reserves']
])}
<h2>How anti-fraud works</h2>
<p>The system collects signals (amount, device, country, velocity, customer history, the 3-D Secure result), calculates risk with rules and models, and makes a decision: let it through, send it to manual review, or decline. Any threshold trades one kind of error for another: the stricter the threshold, the less fraud slips through and the more honest customers are wrongly declined.</p>
{{w:risk}}
<h2>Quality metrics</h2>
<ul><li><b>Approve rate.</b> The share of approved transactions.</li><li><b>Fraud rate.</b> The share of fraudulent transactions that came back as disputes.</li><li><b>False positive rate.</b> The share of honest transactions that were declined or sent to manual review.</li><li><b>Manual review load.</b> How many transactions wait for an operator and for how long.</li></ul>
<h2>KYC, KYB, AML</h2>
${tbl(['Term','What it is'],[
['KYC (know your customer)','Identification and verification of a customer: documents, face, address. Verification flows usually run through a provider'],
['KYB (know your business)','The same kind of check for a merchant, its beneficiaries and its activity at onboarding'],
['AML (anti-money laundering)','Monitoring of suspicious transactions and mandatory reporting to the regulator'],
['Sanctions screening and PEP','Checking customers and counterparties against sanctions lists and lists of politically exposed persons']
])}
<h2>PCI DSS for an analyst</h2>
<ul><li>A card data protection standard. How strict it is depends on the transaction volume and the way of processing.</li><li>The fewer systems touch the card number, the smaller the scope of the audit. Tokenization reduces it.</li><li>In requirements, describe which systems see the PAN, how it is protected, who has access to it, and how logs are kept and protected.</li><li>CVV/CVC, PIN and full track data are not stored after authorization (module 4).</li></ul>
<h2>Data and regulation in broad strokes</h2>
<p>For personal data, GDPR applies (for data of people in the EU), as does the Serbian personal data protection law, so in requirements it is useful to describe retention periods, customer rights and storage locations. PSD2 in the EU adds SCA and open bank interfaces. The applicability of specific rules is decided by the company lawyers and compliance team, not by the analyst, but the analyst must know where to go for it.</p>
`,
takeaways:['Anti-fraud is a balance: a strict threshold cuts fraud and hits honest customers.','Metrics: approve rate, fraud rate, false positive rate, manual review load.','KYC is about the customer, KYB about the business, AML about monitoring and reporting.','PCI DSS: the fewer systems see the PAN, the smaller the audit scope.'],
quiz:[
{q:'Card testing usually looks like:',o:['One large purchase','Many small attempts in a row with different numbers or codes','One refund','Ordinary purchases by a regular customer'],a:1,why:'Fraudsters check stolen numbers with small attempts, so the signal is velocity and repeats.'},
{q:'The decline threshold in anti-fraud was raised too high. What is more likely?',o:['More fraud slips through and fewer false declines','Less fraud and more false declines','Nothing changes','More refunds to merchants'],a:0,why:'A high threshold declines less often: fewer honest customers are declined, but more fraud gets through.'},
{q:'KYB when onboarding a merchant is:',o:['A check of the cardholder','A check of the business and its beneficiaries','Testing the website','A card check'],a:1,why:'KYB is "know your business": checking the company and the people behind it.'},
{q:'What does tokenization give you from the PCI DSS point of view?',o:['Nothing','It narrows the audit scope: the system does not store the real card number','It cancels the requirement to protect logs','It allows storing the CVV'],a:1,why:'The fewer systems handle the PAN, the smaller the scope the standard applies to.'},
{q:'Friendly fraud is:',o:['A fraudster stole a card','The cardholder disputes their own legitimate purchase','A network failure','Phishing'],a:1,why:'The cardholder themselves disputes a legitimate purchase, often by mistake or on purpose.'}
],
practice:{id:'p-m10',title:'Anti-fraud rules for a subscription',
brief:'<p>A service sells a subscription for 9 EUR a month and has recently run into card testing. Describe five rules (signal, threshold, action) and three metrics you will use to decide whether the rules work.</p>',
template:'Rule 1: signal / threshold / action\nRule 2:\nRule 3:\nRule 4:\nRule 5:\n\nMetrics:\n1. \n2. \n3. \n',
checks:['Every rule has a number or a clear condition','There is a velocity or repeat rule for card testing','There is a rule with manual review, not only a decline','The metrics show both sides: fraud and false positives'],
model:'<ul><li>More than 3 failed attempts from one device in 10 minutes: block the device for 1 hour.</li><li>More than 5 different cards from one IP in an hour: captcha, then decline.</li><li>First payment with a new card and a mismatch between IP country and card country: mandatory 3-D Secure.</li><li>Score above 30 but below 60: manual review within 4 hours.</li><li>Score from 60: decline with a neutral message.</li></ul><p>Metrics: the share of honest customers declined (false positive rate), the share of transactions that came back as disputes (fraud rate), manual review time.</p>'}
});

COURSE.push({
id:'m11',short:'The analyst craft',title:'The analyst craft: requirements, diagrams, acceptance criteria',day:7,minutes:55,
lead:'How to write testable requirements and acceptance criteria, draw BPMN, and describe the non-functional requirements of a payment system.',
learn:['tell a good requirement from a bad one and rewrite bad ones','write user stories and acceptance criteria in the Given/When/Then format','draw basic BPMN and choose the right type of diagram','describe non-functional requirements and idempotency'],
body:`
<h2>Levels of requirements</h2>
${tbl(['Level','Example for a payment platform'],[
['Business goal','Reduce the number of disputes lost because of missed deadlines'],
['Stakeholder requirements','A merchant wants to be notified about a dispute within 5 minutes'],
['Functional','The system creates a case when a notification is received and sends an email to the merchant'],
['Non-functional','Process 100 notifications per second, availability 99.9%'],
['Constraints','Integration only through files over SFTP until the end of the year']
])}
<h2>What a good requirement is</h2>
<p>It is clear (one reading), testable (you can think of a test), necessary (it has a source and a value), consistent, complete enough, and does not dictate a solution without a reason.</p>
{{w:reqclinic}}
<h2>User stories and acceptance criteria</h2>
<p>The user story format: <i>As a</i> role, <i>I want</i> an action, <i>so that</i> a value. A good story meets INVEST: independent, negotiable, valuable, estimable, small and testable. Acceptance criteria are written as examples in the Given / When / Then format: the initial state, an event and a verifiable result.</p>
<p>Example: "As a merchant, I want to receive a chargeback notification within 5 minutes, so that I can respond in time".</p>
{{w:acbuilder}}
<h2>BPMN in 10 minutes</h2>
${tbl(['Element','Notation','What it is for'],[
['Event','A circle: start, intermediate, end','Start, timer, message received, completion'],
['Task','A rounded rectangle','An action. Name it "verb + object": "Create case"'],
['XOR gateway','A diamond with a cross','Choosing one path out of several'],
['AND gateway','A diamond with a plus','Parallel branches'],
['Pool and lane','Rectangles for the participants','Who does what'],
['Sequence flow and message flow','Solid and dashed arrows','Order inside a participant and exchange between participants']
])}
<ul><li>One process on one diagram, at one level of detail.</li><li>Always draw the exception branches: decline, timeout, retry.</li><li>First a simple "as is" diagram, then "to be".</li><li>A free editor: <a href="https://bpmn.io/" target="_blank" rel="noopener">bpmn.io</a>.</li></ul>
<h2>Other diagrams</h2>
<ul><li><b>Sequence.</b> The exchange of messages between systems: ideal for integrations.</li><li><b>State.</b> The statuses of a payment or a case and the transitions.</li><li><b>ER.</b> Entities and relationships in the data.</li></ul>
<h2>A skeleton for a functional specification</h2>
<ol><li>Goal and context, boundaries (what is in and what is out).</li><li>Participants and roles.</li><li>Process (BPMN) and scenarios.</li><li>Numbered functional requirements.</li><li>Data: fields, formats, reference lists, statuses and transitions.</li><li>Integrations: interfaces, messages, errors, timeouts.</li><li>Non-functional requirements.</li><li>Acceptance criteria and test data.</li><li>Open questions and assumptions.</li></ol>
<h2>Non-functional requirements of payment systems</h2>
<ul><li><b>Performance.</b> Throughput (TPS) and latency (for example, 95% of authorizations within 300 ms at 200 TPS).</li><li><b>Availability.</b> The SLA and the allowed downtime.</li><li><b>Idempotency.</b> Repeating a request with the same key does not create a second operation.</li><li><b>Timeouts and retries.</b> What counts as a failure, how many times and at what interval we retry.</li><li><b>Consistency and audit.</b> Every change of money is traceable.</li><li><b>Security.</b> PCI DSS, masking, access.</li><li><b>Observability.</b> Logs and metrics without sensitive data.</li></ul>
${co('Idempotency by example','A merchant sent a request to charge 100 EUR with the key <code>order-8841</code> and got no response. It repeats the same request with the same key. The system must return the result of the first attempt and not charge the money a second time. The key, how long it is kept, and the behavior when the parameters differ under the same key are all requirements.')}
<h2>UAT, traceability, changes</h2>
<ul><li><b>UAT.</b> Acceptance testing by the business: checks that the solution covers the need, not only that it works.</li><li><b>Traceability matrix.</b> A table of links "requirement source, requirement, solution, test": it shows what is covered and helps assess the impact of a change.</li><li><b>Impact analysis.</b> Before a change, find out which requirements, integrations and reports are affected.</li></ul>
<h2>Working with uncertainty</h2>
<p>When a requirement is vague, ask questions in this order: what is the goal and who is the user, what counts as success and how will we measure it, which exceptions and errors are possible, what depends on what, what can be postponed. Do not fill the gaps with guesses: record them as assumptions and agree on them.</p>
`,
takeaways:['A good requirement is clear, testable and describes a need, not a solution.','Acceptance criteria in Given/When/Then make a requirement testable.','In BPMN draw the exceptions, not only the happy path.','For payments you must describe idempotency, timeouts, retries, audit and security.'],
quiz:[
{q:'Which requirement is testable?',o:['The system must work fast','A payment must be processed conveniently','An authorization returns a response within 300 ms for 95% of requests at a load of 200 TPS','The system must be modern'],a:2,why:'It has a metric, a percentage and a load condition. The other wordings cannot be verified.'},
{q:'Which wording is a good user story?',o:['Make the button blue','As a merchant, I want to receive a chargeback notification within 5 minutes, so that I can respond in time','Use microservices','The system must be reliable'],a:1,why:'It has a role, an action, a value and a measurable deadline.'},
{q:'An XOR gateway in BPMN means:',o:['All branches run in parallel','Exactly one of the outgoing paths is chosen','A loop','The end of the process'],a:1,why:'XOR is an exclusive choice. Parallelism is set by an AND gateway.'},
{q:'Idempotency of a payment request is:',o:['Encryption of the request','Repeating the same request with the same key does not create a second payment','Processing speed','Checking the amount'],a:1,why:'It protects against duplicates when a request is resent after a timeout.'},
{q:'What is a traceability matrix?',o:['A table linking requirements to sources, solutions and tests','A load graph','A list of bugs','A release schedule'],a:0,why:'It shows coverage and helps assess the impact of changes.'},
{q:'A stakeholder asks to "add Kafka". What does the analyst do?',o:['Adds Kafka to the specification','Finds the need behind the solution and records the requirement, leaving the technology to the team','Refuses','Picks another technology'],a:1,why:'Behind a solution there is a need: that is what has to be described. Choosing the technology is a team decision.'}
],
practice:{id:'p-m11',title:'Rewrite three bad requirements',
brief:'<p>Rewrite each so that it is testable, with a metric and Given/When/Then acceptance criteria.</p><ol><li>"The system must process refunds quickly."</li><li>"We need a convenient reconciliation."</li><li>"Use Redis to store payment statuses."</li></ol>',
template:'1. Requirement:\nAcceptance criteria:\n\n2. Requirement:\nAcceptance criteria:\n\n3. Requirement:\nAcceptance criteria:\n',
checks:['Each has a measurable metric or a clear condition','A technology is not named in place of a need','The criteria describe one event and one result','Exceptions are covered: errors, timeout, empty data'],
model:'<ol><li>"95% of refund requests are processed within 5 seconds at 50 requests per second". Given an original purchase of 100 EUR, When the merchant requests a refund of 30 EUR, Then a response with the refund ID arrives within 5 seconds, with the status "processing".</li><li>"The operator sees the day mismatches in one table with a filter by type and amount, and a CSV export takes 10 seconds at 100,000 rows". Given the files for the day are loaded, When the operator opens the report, Then they see the mismatches by type and their amounts.</li><li>"The payment status is available by ID within 50 ms (p95) and is kept for at least 13 months". The technology (Redis or another) is chosen by the team based on the speed and retention requirements.</li></ol>'}
});

COURSE.push({
id:'m12',short:'Final project',title:'Final project and screening preparation',day:7,minutes:60,
lead:'Build a functional specification, practice an honest account of your own background, and go through the screening flashcards.',
learn:['assemble a functional specification for chargeback handling','tell the story of your move into business analysis honestly and convincingly','answer technical screening questions briefly and to the point','understand what you must not claim on the basis of a course'],
body:`
<h2>The final project</h2>
<p>Write a functional specification of 1-2 pages: <b>handling a chargeback notification in a processing system</b>. It is a document you can show in an interview. Use only synthetic data and do not take materials from past employers. The skeleton is already in the practice field below.</p>
<h3>What it must include</h3>
<ul><li>Goal and boundaries: what the system does and does not do.</li><li>Participants: merchant, acquirer, processor, scheme, operator.</li><li>The process (attach a diagram from bpmn.io) with exception branches.</li><li>Case statuses and the transition matrix.</li><li>Three user stories with Given/When/Then acceptance criteria.</li><li>Data: notification fields (ARN, RRN, amount, currency, reason code, response deadline).</li><li>Non-functional requirements: idempotency, processing time, audit, masking.</li><li>The eight edge cases from module 7.</li><li>Open questions and assumptions.</li></ul>
<h2>Turning your background into BA evidence</h2>
<p>Whatever role you start from, QA, support, development or operations, you already have material that counts as business analysis evidence. The task is to translate it, not to invent it.</p>
${tbl(['Starting point','What it can honestly show','Evidence worth preparing'],[
['QA','Reading requirements critically, finding gaps and ambiguities, reproducing defects with SQL, logs and API tools','A requirement defect you found, and what changed after you raised it'],
['Support','Understanding real customer problems, spotting recurring failures, writing instructions','A recurring problem you traced back to a missing or unclear requirement'],
['Development','Turning specifications into working behavior, knowing what is expensive or risky to build','A question you asked that changed a decision'],
['Operations or other','Knowing the process from the inside, handling exceptions','A process you described or improved, with its exceptions']
])}
${co('The honesty rule','Say what you actually did. Do not take a job title you did not hold. Everything you name must survive a follow-up question. What you only studied, describe as studied.')}
<h3>What you can name</h3>
<p>Make a short list in your own words, and keep it to facts you can explain in detail:</p>
<ul><li>Tasks where you worked with requirements: wrote, reviewed, clarified or tested them.</li><li>Artifacts you produced: diagrams, acceptance scenarios, documentation, tickets, sprint plans.</li><li>Tools you really used: SQL, log viewers, API clients, diagram editors.</li><li>Domain situations you really handled: payment forms, refunds, disputes, statuses, webhooks.</li></ul>
<h3>What not to claim</h3>
<ul><li>A business analyst job title and years in it, if you did not hold the role.</li><li>Production experience with clearing, settlement, scheme rules or ISO 8583 if you have only studied them.</li><li>Practices you did not run, such as formal UAT, or user stories tied to specific work, when you cannot support them.</li></ul>
<h3>If you are asked about something you have not done</h3>
<p>The formula: "I have not worked with this in production. I studied [what exactly], built [an artifact] and understand how to apply it. In the first weeks I would need [something specific]." Honesty and specifics are stronger than an attempt to fake experience.</p>
<h3>STAR for behavioral questions</h3>
<p>Situation, Task, Action (what you yourself did), Result (the outcome, even without numbers if you have none). Two minutes, one story per question.</p>
<h2>Questions to ask an employer</h2>
<ul><li>The salary range, the period, and whether it is gross or net.</li><li>Remote or office, working hours.</li><li>Which entity employs you, and what type of contract it is.</li><li>The composition of the team and who makes product decisions.</li><li>How requirements are tested, and whether there are QA or test analyst roles nearby.</li></ul>
<h2>Next</h2>
<ul><li><a href="#cards">Screening flashcards</a>: questions to answer out loud.</li><li><a href="#exam">Final exam</a>: 20 questions from all modules.</li><li><a href="#glossary">Glossary</a>.</li></ul>
`,
takeaways:['The final specification is a verifiable artifact you can show.','Name only confirmed experience and describe the rest as studied.','Answer "I have not done this" with a formula: what you studied, what you built, how you will apply it.','Prepare a short self-introduction in advance.'],
quiz:[
{q:'You are asked about production experience with clearing. Which answer is honest and strong?',o:['"Yes, I have worked a lot with it"','"I have not worked with it in production. I studied the lifecycle, built a reconciliation of authorizations and clearing in SQL and understand how to apply it"','"I do not know"','Change the subject'],a:1,why:'Honesty, specifics and a demonstrated artifact are more convincing than an untrue claim.'},
{q:'What best confirms the skill of writing requirements?',o:['A list of courses','A concrete artifact (a specification, acceptance criteria, BPMN) that you can show','A description of your own qualities','A friend recommendation'],a:1,why:'An artifact proves the skill directly.'},
{q:'Which structure should you use to tell a story about your experience in answer to a behavioral question?',o:['STAR: situation, task, action, result','Only a list of technologies','A free story without structure','Only the result'],a:0,why:'STAR keeps the story within two minutes and shows your role.'},
{q:'Your real work included drawing BPMN diagrams for requirements, but your job title was QA engineer. How do you describe it?',o:['"I was a business analyst"','"I used BPMN to analyze requirements as part of my QA role"','"I only drew diagrams"','"I led the analysts"'],a:1,why:'Describe what you did without borrowing a job title.'},
{q:'What must you not claim on the basis of this course?',o:['That you studied the payment lifecycle','Production experience with scheme rules and ISO 8583','That you built a practice specification','That you can write SQL for reconciliation'],a:1,why:'The course gives knowledge and artifacts, not work experience.'}
],
practice:{id:'p-m12',title:'Functional specification: chargeback handling',
brief:'<p>Fill in the skeleton below (1-2 pages). When you finish, go through the self-check and ask someone to read the document without any explanations: is it clear?</p><p>A separate block at the end: a self-introduction (30-60 seconds).</p>',
template:'1. Goal and boundaries\n\n2. Participants and roles\n\n3. Process (description of the diagram)\n\n4. Case statuses and transitions\nReceived ->\nIn progress ->\nResponse sent ->\nWon / Lost / Expired\n\n5. User stories and acceptance criteria\nStory 1:\nGiven / When / Then:\n\nStory 2:\n\nStory 3:\n\n6. Notification data\nARN, RRN, amount, currency, reason code, response deadline\n\n7. Non-functional requirements\n\n8. Edge cases\n\n9. Open questions and assumptions\n\n10. Self-introduction (30-60 seconds)\n',
checks:['The boundaries are named, including what is out of scope','The process contains exception branches','There is a status transition matrix','Three stories with acceptance criteria that a test can verify','Non-functional requirements with numbers','The self-introduction is written and fits within a minute'],
model:'<p>A sample structure for section 5. Story 1: "As a merchant, I want to receive a chargeback notification within 5 minutes, so that I can respond in time". Given a notification arrives with an ARN found in the system, When the notification is processed, Then a case with the status "Received" is created, the calculated response deadline is set, and a message is sent to the merchant.</p><p>Story 2: an operator sees overdue cases. Story 3: the system does not create a duplicate case on a repeated notification.</p><p>For section 10, write 4-5 short sentences: who I am, where I come from (my previous role), why business analysis, why card processing, how I can be useful in the first months.</p>'}
});
