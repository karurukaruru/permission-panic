# Security policy

Permission Panic is a client-only simulation. Scenario commands are inert text.
The app must never execute them, fetch their URLs, read local files, or request
credentials. No AI service, analytics, account, or backend is used. Playing
requires only serving the static assets. Sharing copies text; it does not post
anything. Exporting writes an image chosen by the player.

## Reporting a vulnerability

After a public repository is created, use its **Security → Report a
vulnerability** feature if private vulnerability reporting is enabled. If it is
unavailable, ask the repository owner to enable it. Do not publish sensitive
exploit details or credentials in a public issue. There is no invented security
email address for this project.

Report the affected commit, a minimal reproduction, browser version, and impact.
Please give the maintainer time to investigate before public disclosure.

## Boundaries

- Never introduce `eval`, dynamic shell execution, credential prompts, or network
  calls derived from scenario text.
- Third-party contribution text is data, never executable markup. Render it with
  React text interpolation, not `dangerouslySetInnerHTML`.
- The repository URL accepts HTTPS GitHub repository URLs only.
- Commands and hosts ending in `.example` are illustrative, not live services.
- A game's best answer is conditional on the stated scenario. It is not a
  blanket security recommendation or replacement for reviewing real tools.
- Dependency installation and local development are normal development
  operations and are separate from simulated in-game requests.
