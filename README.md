# Payments analysis for business analysts

A free, interactive course on card payments for people who are moving into business analysis in payments, cards and finance.

Live site: https://panipanda.github.io/payments-ba-course/

## What is inside

- 12 modules: the payments ecosystem, the payment lifecycle, fees and currencies, the card and tokens, ISO 8583, 3-D Secure and SCA, chargebacks, reconciliation and settlement, a national scheme case study (Dina), risk and compliance, the analyst craft, and a final project.
- 13 interactive trainers: matching roles, a payment simulator, a fee calculator, a Luhn checker, an ISO 8583 builder and bitmap decoder, a 3-D Secure flow, a chargeback timeline, a reconciliation lab, anti-fraud scoring, a requirements clinic and an acceptance criteria builder.
- 71 quiz questions with explanations, a 20-question final exam, 20 screening flashcards and a glossary of 64 terms.
- A "Sources" block at the end of each module with public documentation.

## Your progress stays with you

Progress and notes stay in your browser (in `localStorage`, under the key `payments-ba-course.v1`). Nothing is sent anywhere. There are no accounts, cookies, servers, databases or analytics, and the site makes no requests to other sites (the fonts are served from this repository).

What is saved: completed modules, quiz answers and best scores, flashcard marks, the text of practice answers and self-check ticks, and the module you opened last.

What is not saved on purpose: input in the trainers and an unfinished final exam.

Limits you should know about:

- Progress belongs to one browser profile on one device. It does not sync between your phone and your laptop.
- It is lost if you clear site data, close a private window or switch browsers. Safari may clear site data on its own after about a week without a visit.
- Use **Export progress** on the home page to download `progress.json`, and **Import progress** to restore it anywhere. Import merges the file with the progress already in the browser and ignores anything it does not recognize.
- Do not type anything confidential in the practice fields, such as employer data or real card numbers.

If the browser blocks site storage, the course still works and the header says "Progress is not saved".

## Run it locally

There is no build step. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

or any static server, for example `python -m http.server`.

The site uses plain `<script>` tags and no network requests, so it also works when opened as a file.

## Tests

```
node --test
```

The tests check the structure of the course data, the pure logic (Luhn, ISO 8583 bitmap, fees, reconciliation, anti-fraud scoring), the progress export and import, and that no non-English text, long dashes or personal traces are present in tracked files. They run on every push through GitHub Actions.

## Structure

```
index.html              page shell and metadata
assets/                 styles and fonts (IBM Plex, SIL OFL)
js/lib.js               pure functions and the progress state logic
js/core.js              state, router, quizzes, practice, flashcards, exam, glossary
js/widgets.js           the 13 trainers
js/start.js             starts the app after all content is loaded
content/en/             course text: modules, flashcards, glossary, sources
tests/                  node:test suites
```

The text lives in `content/en/` on its own, so another language can be added next to it without changing the code.

## Disclaimer

This is educational material. It is not affiliated with Visa, Mastercard, EMVCo, the PCI Security Standards Council or the National Bank of Serbia, and the names of schemes and standards are used only to describe how things work. Rules, fees, deadlines and regulations change, and numbers in examples are for teaching. Check facts against the official documents before relying on them at work. Last reviewed: November 2026.

## License

Code: MIT (`LICENSE`). Course text: CC BY 4.0 (`LICENSE-CONTENT.md`). Fonts: SIL OFL 1.1.
