'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCourse } = require('./load');

const { COURSE, CARDS, GLOSS, WIDGETS, SOURCES } = loadCourse();

test('twelve modules with unique ids in order', () => {
  assert.equal(COURSE.length, 12);
  assert.deepEqual(Array.from(COURSE, m => m.id), ['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10','m11','m12']);
});

test('every module has the required parts', () => {
  for (const m of COURSE) {
    for (const k of ['short', 'title', 'lead', 'body']) assert.ok(typeof m[k] === 'string' && m[k].length > 0, m.id + ' ' + k);
    for (const k of ['learn', 'takeaways', 'quiz']) assert.ok(Array.isArray(m[k]) && m[k].length > 0, m.id + ' ' + k);
    assert.ok(Number.isInteger(m.day) && m.day >= 1 && m.day <= 7, m.id + ' day');
    assert.ok(m.minutes > 0, m.id + ' minutes');
    const p = m.practice;
    assert.ok(p && p.id && p.title && p.brief && p.template && p.model, m.id + ' practice');
    assert.ok(Array.isArray(p.checks) && p.checks.length > 0, m.id + ' checks');
  }
});

test('practice ids are unique', () => {
  const ids = COURSE.map(m => m.practice.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('thirteen trainers exist and every {{w:name}} points to one', () => {
  const names = Object.keys(WIDGETS);
  assert.equal(names.length, 13);
  for (const n of names) {
    assert.equal(typeof WIDGETS[n].init, 'function', n);
    assert.ok(WIDGETS[n].title, n);
  }
  const used = new Set();
  for (const m of COURSE) {
    for (const mt of m.body.matchAll(/\{\{w:([\w-]+)\}\}/g)) {
      assert.ok(WIDGETS[mt[1]], m.id + ' uses unknown trainer ' + mt[1]);
      used.add(mt[1]);
    }
  }
  assert.deepEqual([...used].sort(), [...names].sort(), 'every trainer is used by a module');
});

test('quiz questions are well formed (71 in total)', () => {
  let total = 0;
  for (const m of COURSE) {
    for (const q of m.quiz) {
      total++;
      const t = q.type || 'mc';
      assert.ok(q.q && q.why, m.id + ' question needs text and an explanation');
      if (t === 'mc') {
        assert.ok(Array.isArray(q.o) && q.o.length >= 2, m.id + ' mc options');
        assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length, m.id + ' mc answer index');
        assert.equal(new Set(q.o).size, q.o.length, m.id + ' duplicate options');
      } else if (t === 'num') {
        assert.equal(typeof q.ans, 'number', m.id + ' num answer');
      } else if (t === 'order') {
        assert.ok(Array.isArray(q.items) && q.items.length >= 2, m.id + ' order items');
      } else {
        assert.fail(m.id + ' unknown question type ' + t);
      }
    }
  }
  assert.equal(total, 71);
});

test('answer key did not change while editing the text', () => {
  const key = {};
  for (const m of COURSE) key[m.id] = Array.from(m.quiz, q => (q.type || 'mc') === 'mc' ? 'mc' + q.a : (q.type === 'num' ? 'num' + q.ans : 'order' + q.items.length));
  assert.deepEqual(key, require('./answer-key.json'));
});

test('flashcards: unique ids, 20 cards, question and answer present', () => {
  const ids = CARDS.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(CARDS.length, 20);
  for (const c of CARDS) assert.ok(c.tag && c.q && c.a, c.id);
});

test('glossary: unique terms with a definition', () => {
  assert.ok(GLOSS.length >= 60);
  const terms = GLOSS.map(g => g.en);
  assert.equal(new Set(terms).size, terms.length);
  for (const g of GLOSS) assert.ok(g.en && g.d, g.en);
});

test('every module has https sources', () => {
  for (const m of COURSE) {
    const list = SOURCES[m.id];
    assert.ok(Array.isArray(list) && list.length > 0, m.id + ' sources');
    for (const s of list) assert.ok(s.t && /^https:\/\//.test(s.u), m.id + ' ' + s.u);
  }
});
