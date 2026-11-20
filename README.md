# Trades Aptitude Trainer

An independent English-language educational project for trades applicants, developed with AI assistance using question formats from preparation materials. The site includes 400 practice questions: 160 Verbal Comprehension, 80 Mechanical Comprehension, 80 Numerical Reasoning and 80 Technical Understanding. Each question has five options and one keyed answer. All mechanical questions include labelled SVG diagrams with text descriptions.

This project is not affiliated with any employer or testing provider and does not reproduce actual recruitment test questions.

## Open or publish

For a quick desktop preview, unzip the package and open `index.html` in a normal browser window. Use a hosted HTTPS URL for day-to-day practice and reliable origin-based progress storage.

1. Create a public GitHub repository on the free plan. Upload the files **inside** the ZIP to the repository root, including `.nojekyll`. Only upload the trainer files, since the repository and published site are public.
2. Open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/(root)`, then save.
3. After deployment, open the Pages URL shown in Settings. It will typically be `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`. Open and bookmark that address in Microsoft Edge on the iPad.

The site uses relative asset paths and hash navigation. It needs no build step, account, database, external font, or API call. See [GitHub’s publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Use the trainer

- **Vocabulary Cards** opens a separate English-language vocabulary page. It includes 766 words and phrases with contextual Russian translations and English definitions, plus 119 examples with Russian translations. All verbal answer terms are covered. **Learn** reveals cards and lets you mark words for another review. **Practice** uses 120 synonym/antonym pairs or English-meaning choices. Each answer word in relation practice has its own meaning button. **My words** stores items marked for review, and the library supports English or Russian search.
- **Listen** uses the browser’s speech synthesis and selects an English voice when available. Voice availability and audio output depend on the device. Speech requests were tested in desktop Chromium. Audible playback on physical iPad Edge remains to be checked.
- Vocabulary progress uses its own browser-storage key, separate from test progress. Opening help during a practice question keeps that word in My words. Study these words at any time and remove them manually in the word library when ready. Review-again cards can repeat once in the current set.
- **Hide word** removes a word from the normal library and from vocabulary session targets in this browser. **Undo** is available for 10 seconds. Use **Show → Hidden words → Restore word** to bring it back later. Hiding retains the word’s learning history and My words membership. **I know this** records a successful answer independently of hiding. A vocabulary reset also clears hidden-word choices.

- **Practice** lets you choose a section, difficulty and set length. Check each answer to see the explanation. An incorrect item can recur after several questions in the same set. Review Mistakes is available immediately and retains questions until you remove them. It prioritizes uncorrected items, then items practised least recently. Practice Weak Areas emphasizes topics with higher error rates.
- New sessions track first attempts and retries separately, and show the first incorrect answer, correct answer, explanation and retry status after practice. Earlier saved sessions retain their aggregate scores because their first answers were not recorded.
- In verbal practice, tap an underlined word in the question or below an answer to open a Russian translation and English definition. Add to My words saves it in Vocabulary Cards. Word help is available during practice.
- **Reset progress** is available in the footer of both pages. Select Test progress, Vocabulary progress or Everything, then confirm the precise deletion. Cancel leaves progress in place. The reset removes only the selected application storage.
- **Exam Simulation** gives each section a separate countdown. Set the question counts and minutes before beginning. Use Next / Skip or the question navigator to revisit items within a section. Submitting or running out of time locks the section, then the next section waits for you to begin. Feedback is available after the final section, with correct counts, unanswered counts, percentages, and explanations for missed and skipped items.
- **Generate New Questions** in Numerical Reasoning creates new variants locally from 16 arithmetic templates. The offset is saved, so consecutive sets use new parameter values. Generated mistakes can enter the review list.
- Progress, the current session and the latest simulation results live in browser storage at the site address. Use the same browser and URL each time. Clearing site data or closing a private session may clear progress.

## Source alignment and timing

Preparation materials informed the exercise formats and suggested short-drill pacing:

- Preparation-booklet exercises informed verbal vocabulary and sentence formats, diagram-based mechanical reasoning, numerical word problems and passage-based technical questions. The short drill uses 8 verbal questions in 3 minutes, 4 mechanical in 2 minutes, 6 numerical in 3 minutes, and 4 technical in 2 minutes.
- General testing guidance informed separately timed sections, breaks, skip-and-return navigation and an A–E answer grid. Actual recruitment test limits are provided by the test administrator.

The exercises and diagrams were developed for this educational project with AI assistance. The extended preset uses 16/12/12/12 questions and 6 minutes per section as adjustable trainer defaults. Scores describe practice performance. The project has no employer-specific pass threshold.

## Maintain and verify

- `verbal.js`, `mechanical-concepts.js`, and `technical-scenarios.js` contain authored answer sets. The first option on each row is the key. `bank.js` assigns stable IDs and shuffles answer positions deterministically. `diagrams.js` draws the mechanical schematics. Keep existing item IDs and option order stable when publishing updates to preserve in-progress sessions.
- `node verify.cjs` checks the 400-item split, stable and unique IDs, distinct options, keyed answers for the calculation items, 80 diagram outputs, and 1,600 generated numeric variants. It also checks that the AI stub is disabled.
- `node verify-vocabulary.cjs` verifies vocabulary coverage and browser flows, including saved vocabulary sessions, immediate review, help use, speech requests, translation search and preservation of existing test progress. It uses the same optional Playwright setup described below.
- `node verify-update.cjs` checks migration of earlier progress, persistent review lists, first and retry attempt results, translations from verbal questions, reset scopes and cancellation. It tests resets using disposable browser storage.
- `node verify-library.cjs` checks hidden words, Undo, restoration, saved-session filtering, matching learning buttons, added-word feedback and footer presentation.
- `node verify.cjs --browser` adds Playwright flow tests. Install Playwright and its Chromium browser for this optional check. Set `BROWSER_EXECUTABLE` to use an existing desktop Chromium binary, and `PLAYWRIGHT_MODULE` if Playwright is installed outside this folder. The test intercepts requests at a mock project URL and serves files from this directory. The app itself needs no test dependencies.
- Browser verification used desktop Chromium at 820 × 1180, 1180 × 820 and 390 × 844. Physical iPad Edge remains to be verified.

## Future AI generation

`generation.ai()` is an asynchronous provider stub that returns a disabled status and an empty list. The UI displays it as unavailable and the static site makes no requests. Keep provider credentials in a separate server-side service if this feature is enabled later. Have that service return draft questions to a review queue. Require a schema check, unique IDs, answer and explanation review, and vetted diagram descriptors before publishing. Render question text as text and use the existing diagram functions for allowed diagram types.
