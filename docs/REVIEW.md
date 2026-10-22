# Product and implementation review

## What this is useful for

A small, shareable puzzle about the human approval step in AI coding tools.
The practical lesson is to relate an operation to its scope, data and authorization.
The strongest demo moment is the hidden npm lifecycle hook: an ordinary-looking
test request leads to a simulated credential incident if approved without review.

This is a short game, not an agent security product. Its ten fixed requests have
limited replay value. No real-user playtest, educational-effectiveness study,
retention data, conversion rate or prediction of GitHub stars is available.
Publishing gives us something concrete to test with people; it does not establish
that the project will become popular.

## Changes after review

1. **Decision clarity:** removed the sidebar, session IDs, redundant badges, fake
   window chrome and decorative log. One column now holds the task, operation,
   evidence and three buttons. Main actions fit the checked mobile viewport.
2. **Fair scoring:** removed the deduction for optional inspection. Reading
   evidence should not be punished. Correct decisions earn 100 points; a correct
   guess that skipped necessary evidence gets 60.
3. **Readable inspection:** every request has a plain-language finding. The raw
   technical evidence remains available in an expandable section.
4. **Accurate outcomes:** denying the malicious test does not claim tests actually
   ran. The success text says the secrets stayed local.
5. **Accessible hiding:** changed the skip link to a standard clipped-hidden
   pattern so it does not leak into full-page captures while offscreen.
6. **Failure recovery:** verified both successful PNG export and null-encoder
   failure, plus clipboard success / rejection fallback.
7. **Deployment gate:** Pages now runs browser checks before uploading its build.
8. **Promotion:** replaced screenshot-and-label collage posters with an original
   Allow-key concept campaign. Actual screenshots and edited real gameplay remain
   distinct. The 12-second clip ends at the real 800-point, 90%-accuracy result.

## Content checks

The npm lifecycle-hook behavior and `--ignore-scripts` boundary were cross-checked
against primary npm documentation:

- https://docs.npmjs.com/cli/test/
- https://docs.npmjs.com/cli/commands/npm-ci/
- https://github.com/npm/cli/blob/latest/docs/lib/content/using-npm/scripts.md

These questions assume the explicitly described environment. They do not assert
that every invocation of a named command is universally safe or unsafe.

## What still needs human feedback

- Can a first-time player explain the second request's risk after inspecting it?
- Does the distinction between final-answer accuracy and evidence-based scoring
  feel fair?
- Do any requests depend on unstated assumptions?
- Does the incident make players curious enough to finish and share a card?

Those are open product questions, not claims made by passing software tests.
