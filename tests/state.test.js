'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/lib.js');

function sample() {
  const s = L.fresh();
  s.done = { m1: true, m2: true };
  s.quiz = { m1: { best: 5, total: 5, last: 4 }, m2: { best: 4, total: 6, last: 4 } };
  s.qprog = { m3: 'cw-c--' };
  s.notes = { 'p-m1': { t: 'My flow: A -> B', ts: 1700000000000 }, 'p-m1:c': { t: '1010', ts: 1700000000001 } };
  s.cards = { c01: { k: 1, ts: 1700000000002 }, c02: { k: 2, ts: 1700000000003 } };
  s.last = 'm3';
  s.ts = 1700000000005;
  return s;
}

test('export then import gives the same progress back', () => {
  const s = sample();
  const text = L.serializeState(s, 1700000000000);
  const r = L.parseImport(text);
  assert.equal(r.ok, true);
  assert.deepEqual(r.state, s);
  const file = JSON.parse(text);
  assert.equal(file.app, L.APP_ID);
  assert.equal(file.v, 1);
});

test('garbage files are rejected without throwing', () => {
  for (const bad of ['', '   ', 'not json', '[]', 'null', '42', '{}', '{"app":"other","v":1,"state":{}}', '{"app":"payments-ba-course","v":2,"state":{}}', '{"app":"payments-ba-course","v":1}', '{"app":"payments-ba-course","v":1,"state":[]}']) {
    const r = L.parseImport(bad);
    assert.equal(r.ok, false, JSON.stringify(bad));
    assert.ok(r.error);
  }
  assert.equal(L.parseImport(undefined).ok, false);
  assert.equal(L.parseImport(123).ok, false);
});

test('a too large file is rejected', () => {
  const r = L.parseImport('x'.repeat(L.LIMITS.file + 1));
  assert.equal(r.ok, false);
  assert.match(r.error, /too large/);
});

test('unknown keys and wrong shapes are dropped', () => {
  const text = JSON.stringify({ app: L.APP_ID, v: 1, state: {
    v: 1, evil: { a: 1 },
    done: { m1: true, 'bad key!': true, m2: 0 },
    quiz: { m1: { best: 99, total: 5 }, m2: 'x', m3: { best: -4, total: 6, last: 'z' } },
    qprog: { m1: 'cw-', m2: 'xyz', m3: 5 },
    notes: { a: { t: 'ok', ts: 5 }, b: { t: 7 }, c: 'str' },
    cards: { c1: { k: 1, ts: 3 }, c2: { k: 9 }, c3: null },
    last: '<script>', ts: 'now'
  } });
  const r = L.parseImport(text);
  assert.equal(r.ok, true);
  const s = r.state;
  assert.equal(s.evil, undefined);
  assert.deepEqual(Object.keys(s.done), ['m1']);
  assert.deepEqual(s.quiz.m1, { best: 5, total: 5, last: 5 });
  assert.equal(s.quiz.m2, undefined);
  assert.deepEqual(s.quiz.m3, { best: 0, total: 6, last: 0 });
  assert.deepEqual(s.qprog, { m1: 'cw-' });
  assert.deepEqual(s.notes, { a: { t: 'ok', ts: 5 } });
  assert.deepEqual(s.cards, { c1: { k: 1, ts: 3 } });
  assert.equal(s.last, '');
  assert.equal(s.ts, 0);
});

test('oversized values are dropped', () => {
  const s = sample();
  s.notes.big = { t: 'x'.repeat(L.LIMITS.note + 1), ts: 1 };
  s.notes.fine = { t: 'x'.repeat(L.LIMITS.note), ts: 1 };
  const r = L.parseImport(JSON.stringify({ app: L.APP_ID, v: 1, state: s }));
  assert.equal(r.ok, true);
  assert.equal(r.state.notes.big, undefined);
  assert.equal(r.state.notes.fine.t.length, L.LIMITS.note);
});

test('too many keys are cut off', () => {
  const done = {};
  for (let i = 0; i < L.LIMITS.keys + 50; i++) done['k' + i] = true;
  const r = L.parseImport(JSON.stringify({ app: L.APP_ID, v: 1, state: { v: 1, done } }));
  assert.equal(Object.keys(r.state.done).length, L.LIMITS.keys);
});

test('prototype pollution through keys is not possible', () => {
  const text = '{"app":"payments-ba-course","v":1,"state":{"v":1,"done":{"__proto__":{"polluted":true},"constructor":true,"m1":true},"notes":{"__proto__":{"t":"x","ts":1}}}}';
  const r = L.parseImport(text);
  assert.equal(r.ok, true);
  assert.equal({}.polluted, undefined);
  assert.deepEqual(Object.keys(r.state.done), ['m1']);
  assert.deepEqual(Object.keys(r.state.notes), []);
});

test('text is kept as text and never interpreted', () => {
  const s = L.fresh();
  s.notes.p = { t: '<img src=x onerror=alert(1)>', ts: 1 };
  const r = L.parseImport(L.serializeState(s));
  assert.equal(r.state.notes.p.t, '<img src=x onerror=alert(1)>');
});

test('merge keeps the best of both sides', () => {
  const a = sample();
  const b = L.fresh();
  b.done = { m3: true };
  b.quiz = { m1: { best: 3, total: 5, last: 3 }, m4: { best: 2, total: 6, last: 2 } };
  b.qprog = { m3: 'cwcc--' };
  b.notes = { 'p-m1': { t: 'older', ts: 5 }, 'p-m2': { t: 'new note', ts: 9 } };
  b.cards = { c01: { k: 2, ts: 1 }, c03: { k: 1, ts: 4 } };
  b.last = 'm4';
  b.ts = 1;
  const m = L.mergeStates(a, b);
  assert.deepEqual(Object.keys(m.done).sort(), ['m1', 'm2', 'm3']);
  assert.deepEqual(m.quiz.m1, a.quiz.m1);
  assert.deepEqual(m.quiz.m4, b.quiz.m4);
  assert.equal(m.qprog.m3, 'cwcc--');
  assert.equal(m.notes['p-m1'].t, 'My flow: A -> B');
  assert.equal(m.notes['p-m2'].t, 'new note');
  assert.equal(m.cards.c01.k, 1);
  assert.equal(m.cards.c03.k, 1);
  assert.equal(m.last, 'm3');
  assert.equal(m.ts, a.ts);
  assert.equal(L.doneCount(m, ['m1', 'm2', 'm3', 'm4']), 3);
});
