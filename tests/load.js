'use strict';
/* Test helper: loads the browser scripts into an isolated vm context, the same files in the same order as index.html. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const FILES = [
  'js/lib.js', 'js/core.js', 'js/widgets.js',
  'content/en/modules-1-4.js', 'content/en/modules-5-8.js', 'content/en/modules-9-12.js',
  'content/en/cards.js', 'content/en/glossary.js', 'content/en/sources.js'
];

function loadCourse() {
  const src = FILES.map(f => fs.readFileSync(path.join(root, f), 'utf8')).join('\n;\n');
  return vm.runInNewContext(src + '\n;({COURSE,CARDS,GLOSS,WIDGETS,SOURCES})', {});
}

module.exports = { root, FILES, loadCourse };
