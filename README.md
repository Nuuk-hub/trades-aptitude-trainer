# Manitoba Hydro Trades Aptitude Trainer

An independent English-language practice site for trades applicants. The site includes 400 original questions: 160 Verbal Comprehension, 80 Mechanical Comprehension, 80 Numerical Reasoning and 80 Technical Understanding. Each question has five options and one keyed answer. All mechanical questions include labelled SVG diagrams with text descriptions.

## Open or publish

For a quick desktop preview, unzip the package and open `index.html` in a normal browser window. Use a hosted HTTPS URL for day-to-day practice and reliable origin-based progress storage.

1. Create a public GitHub repository on the free plan. Upload the files **inside** the ZIP to the repository root, including `.nojekyll`. Only upload the trainer files, since the repository and published site are public.
2. Open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
3. After deployment, open the Pages URL shown in Settings. It will typically be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Open and bookmark that address in Microsoft Edge on the iPad.

The site uses relative asset paths and hash navigation. It needs no build step, account, database, external font, or API call. See [GitHub’s publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Use the trainer

- **Practice** lets you choose a section, difficulty and set length. Check each answer to see the explanation. An incorrect item can recur after several questions in the same set. Review Mistakes gives priority to due or recently missed items. Correct recall schedules later reviews at approximately 1, 3, 7, 14 and 30 days. Misses reset the interval. Practice Weak Areas emphasizes topics with higher error rates.
- **Exam Simulation** gives each section a separate countdown. Set the question counts and minutes before beginning. Use Next / Skip or the question navigator to revisit items within a section. Submitting or running out of time locks the section, then the next section waits for you to begin. Feedback is available after the final section, with correct counts, unanswered counts, percentages, and explanations for missed and skipped items.
- **Generate New Questions** in Numerical Reasoning creates new variants locally from 16 arithmetic templates. The offset is saved, so consecutive sets use new parameter values. Generated mistakes can enter spaced review.
- Progress, the current session and the latest simulation results live in browser storage at the site address. Use the same browser and URL each time. Clearing site data or closing a private session may clear progress.

## Source alignment and timing

The two supplied Manitoba Hydro documents were used as references:

- **Trade Recruitment Prep Guide.pdf** (Written Ability Tests Preparation Booklet, pp. 1–7) informed verbal vocabulary and sentence formats, diagram-based mechanical reasoning, numerical word problems and passage-based technical questions. The drill uses the booklet’s suggested pacing and example counts: 8 verbal in 3 minutes, 4 mechanical in 2 minutes, 6 numerical in 3 minutes, and 4 technical in 2 minutes.
- **Testing Tips Trades.pdf** (pp. 1–2) informed separately timed sections, breaks, skip-and-return navigation and an A–E answer grid. It says the administrator supplies the actual time limits and question counts.

The trainer uses fresh items and diagrams. The official samples, logos and source PDFs are excluded from the site package. The extended preset uses 16/12/12/12 questions and 6 minutes per section as adjustable trainer defaults. The simulation reports scores without an official pass threshold.

## Maintain and verify

- `verbal.js`, `mechanical-concepts.js`, and `technical-scenarios.js` contain authored answer sets. The first option on each row is the key. `bank.js` assigns stable IDs and shuffles answer positions deterministically. `diagrams.js` draws the mechanical schematics. Keep existing item IDs and option order stable when publishing updates to preserve in-progress sessions.
- `node verify.cjs` checks the 400-item split, stable and unique IDs, distinct options, keyed answers for the calculation items, 80 diagram outputs, and 1,600 generated numeric variants. It also checks that the AI stub is disabled.
- `node verify.cjs --browser` adds Playwright flow tests. Install Playwright and its Chromium browser for this optional check. Set `BROWSER_EXECUTABLE` to use an existing desktop Chromium binary, and `PLAYWRIGHT_MODULE` if Playwright is installed outside this folder. The test intercepts requests at a mock project URL and serves files from this directory. The app itself needs no test dependencies.
- Browser verification used desktop Chromium at 820 × 1180, 1180 × 820 and 390 × 844. Physical iPad Edge remains to be verified.

## Future AI generation

`generation.ai()` is an asynchronous provider stub that returns a disabled status and an empty list. The UI displays it as unavailable and the static site makes no requests. Keep provider credentials in a separate server-side service if this feature is enabled later. Have that service return draft questions to a review queue. Require a schema check, unique IDs, answer and explanation review, and vetted diagram descriptors before publishing. Render question text as text and use the existing diagram functions for allowed diagram types.
