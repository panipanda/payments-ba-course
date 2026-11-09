/* Public sources shown at the bottom of each module. All links were opened and checked on 2026-11-09. */
(function(){
  const L={
    emvSpecs:{t:'EMVCo: EMV specifications',u:'https://www.emvco.com/specifications/'},
    emv3ds:{t:'EMVCo: EMV 3-D Secure',u:'https://www.emvco.com/emv-technologies/3-d-secure/'},
    jpos:{t:'jPOS: ISO packager tutorial',u:'https://jpos.org/docs/tutorial/iso-packager/'},
    dinaAbout:{t:'DinaCard: about the system',u:'https://dinacard.nbs.rs/en/o_nama'},
    dinaBanks:{t:'DinaCard: banks and other legal entities',u:'https://dinacard.nbs.rs/en/banke_i_druga_pravna_lica'},
    dinaMerchants:{t:'DinaCard: merchants',u:'https://dinacard.nbs.rs/en/trgovci_akceptanti'},
    nbsClearing:{t:'National Bank of Serbia: decision on clearing and settlement of payment card transactions',u:'https://www.nbs.rs/export/sites/NBS_site/documents-eng/propisi/propisi-ps/clearing_payment_cards.pdf'},
    visaRules:{t:'Visa: public rules',u:'https://usa.visa.com/support/consumer/visa-rules.html'},
    mcChargeback:{t:'Mastercard: Chargeback Guide (PDF; it may refuse automated requests, but opens in a browser)',u:'https://www.mastercard.us/content/dam/public/mastercardcom/na/global-site/documents/chargeback-guide.pdf'},
    stripeDisputes:{t:'Stripe: disputes',u:'https://docs.stripe.com/disputes'},
    checkoutLife:{t:'Checkout.com: transaction lifecycle',u:'https://www.checkout.com/docs/card-issuing/manage-issuing-transactions/transaction-lifecycle'},
    marqetaTx:{t:'Marqeta: about transactions',u:'https://www.marqeta.com/docs/developer-guides/about-transactions'},
    marqetaClearing:{t:'Marqeta: card program clearing and settlement',u:'https://www.marqeta.com/blog/card-program-clearing-and-settlement-how-issuer-processors-manage-fund-flow'},
    worldpay:{t:'Worldpay: how credit card processing works',u:'https://worldpay.com/en/insights/articles/how-credit-card-processing-works'},
    worldpayTraining:{t:'Worldpay: payments training, part 1',u:'https://docs.worldpay.com/access/products/articles/payments-training-pt1'},
    bpmn:{t:'bpmn.io: a free BPMN editor',u:'https://bpmn.io/'},
    swagger:{t:'Swagger Editor: read and try an API description',u:'https://editor.swagger.io/'}
  };
  const S={
    m1:[L.worldpay,L.worldpayTraining,L.bpmn],
    m2:[L.checkoutLife,L.marqetaTx,L.worldpayTraining,L.bpmn],
    m3:[L.marqetaClearing,L.dinaMerchants,L.visaRules],
    m4:[L.emvSpecs],
    m5:[L.jpos,L.emvSpecs],
    m6:[L.emv3ds,L.visaRules],
    m7:[L.stripeDisputes,L.mcChargeback,L.visaRules],
    m8:[L.marqetaClearing,L.marqetaTx,L.checkoutLife],
    m9:[L.dinaAbout,L.dinaBanks,L.dinaMerchants,L.nbsClearing],
    m10:[L.stripeDisputes,L.emv3ds],
    m11:[L.bpmn,L.swagger],
    m12:[L.bpmn,L.swagger]
  };
  Object.keys(S).forEach(k=>{SOURCES[k]=S[k]});
})();
