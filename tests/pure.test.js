'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/lib.js');

test('Luhn accepts the standard test numbers and rejects a broken one', () => {
  assert.equal(L.luhnCheck('4111111111111111'), true);
  assert.equal(L.luhnCheck('5555555555554444'), true);
  assert.equal(L.luhnCheck('4111111111111112'), false);
});

test('Luhn check digit is generated correctly', () => {
  assert.equal(L.luhnDigit('411111111111111'), 1);
  assert.equal(L.luhnDigit('555555555555444'), 4);
  const body = '453201511283036';
  assert.equal(L.luhnCheck(body + L.luhnDigit(body)), true);
});

test('brand by prefix', () => {
  assert.equal(L.brandOf('4111111111111111'), 'Visa');
  assert.equal(L.brandOf('5555555555554444'), 'Mastercard');
  assert.equal(L.brandOf('2221000000000009'), 'Mastercard');
  assert.equal(L.brandOf('378282246310005'), 'American Express');
  assert.match(L.brandOf('9792000000000001'), /not recognized/);
});

test('ISO 8583 bitmap, both directions', () => {
  assert.equal(L.ISO_DES.length, 14);
  assert.equal(L.bitmapHex(L.ISO_DES), '723C440008C08000');
  assert.deepEqual(L.bitmapDes('723C440008C08000'), L.ISO_DES);
});

test('ISO 8583 builder', () => {
  const r = L.isoBuild({ mti: '0200', proc: '000000', amount: 100, cur: '978', pan: '4111111111111111', stan: '000417', rrn: '631309000417', tid: 'TERM0001', mid: 'MERCHANT0000001', mcc: '5411', pem: '051' });
  assert.equal(r.bm, '723C440008C08000');
  assert.equal(r.v[4], '000000010000');
  assert.equal(r.raw.slice(0, 4), '0200');
  assert.equal(r.raw.slice(4, 20), '723C440008C08000');
  assert.equal(r.raw.slice(20, 22), '16');
  assert.equal(r.raw.slice(22, 38), '4111111111111111');
});

test('reconciliation totals', () => {
  assert.deepEqual(L.reconTotals(), { exp: 215.69, got: 218.69, diff: 3 });
  const key = L.reconKey();
  assert.equal(Object.keys(key).length, 9);
  assert.equal(key.R007, 'ok');
});

test('fee calculation', () => {
  const r = L.feeCalc(100, 0.3, 0.1, 0.5, 0.05);
  assert.equal(Math.round(r.tot * 100) / 100, 0.95);
  assert.equal(Math.round(r.net * 100) / 100, 99.05);
  const q = L.feeCalc(200, 0.3, 0.1, 0.6, 0.1);
  assert.equal(Math.round(q.net * 100) / 100, 197.9);
  assert.equal(L.feeCalc(0, 1, 1, 1, 0).pct, 0);
});

test('anti-fraud cases at the three threshold pairs', () => {
  const cases = [
    { amount: 25, newDevice: 0, geo: 0, attempts: 0, newAddr: 0, tds: 0, old: 1 },
    { amount: 900, newDevice: 1, geo: 1, attempts: 3, newAddr: 0, tds: 0, old: 0 },
    { amount: 700, newDevice: 1, geo: 0, attempts: 0, newAddr: 0, tds: 1, old: 0 },
    { amount: 1800, newDevice: 0, geo: 1, attempts: 0, newAddr: 0, tds: 0, old: 1 },
    { amount: 60, newDevice: 1, geo: 1, attempts: 6, newAddr: 0, tds: 0, old: 0 },
    { amount: 350, newDevice: 1, geo: 0, attempts: 1, newAddr: 1, tds: 0, old: 0 }
  ];
  const scores = cases.map(c => L.riskScore(c).s);
  assert.deepEqual(scores, [0, 66, 5, 40, 69, 30]);
  const run = (rv, dc) => scores.map(s => L.riskDecision(s, rv, dc));
  assert.deepEqual(run(30, 60), ['approve', 'decline', 'approve', 'review', 'decline', 'review']);
  assert.deepEqual(run(35, 60), ['approve', 'decline', 'approve', 'review', 'decline', 'approve']);
  assert.deepEqual(run(30, 40), ['approve', 'decline', 'approve', 'decline', 'decline', 'review']);
});

test('numeric answers accept a dot or a comma', () => {
  assert.equal(L.parseNum('197.9'), 197.9);
  assert.equal(L.parseNum('197,9'), 197.9);
  assert.equal(L.parseNum(' -0,5 '), -0.5);
  assert.equal(L.parseNum('1 000.5'), 1000.5);
  assert.ok(Number.isNaN(L.parseNum('abc')));
  assert.ok(Number.isNaN(L.parseNum('')));
  assert.ok(Number.isNaN(L.parseNum('1.2.3')));
});

test('amounts use the en-US format', () => {
  assert.equal(L.fmt(0.95), '0.95');
  assert.equal(L.fmt(1234.5), '1,234.50');
});
