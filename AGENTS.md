# Repository Guidelines

## Project Structure & Module Organization
- `src/app` holds Next.js routes (chat, optimize, samples, runs) plus `globals.css`.
- `src/components`, `src/hooks`, `src/lib` provide shared UI, hooks, and utilities (import via `@/*` alias).
- `cli/` contains the TypeScript entrypoints for the `dspyground` CLI bundled by tsup; `templates/` are the files copied during `dspyground init`.
- `data/` ships starter datasets (`runs.json`, `samples.json`, `tools.ts`); `public/` stores static assets.
- `scripts/` has release helpers like `prepare-standalone.mjs` and `clean-sensitive.mjs`.

## Build, Test, and Development Commands
- `pnpm dev` (or `npm run dev`): start the Next.js app on http://localhost:3000.
- `pnpm dev:cli`: run the CLI in watch mode with tsx.
- `pnpm build`: clean, bundle the CLI, build the web app, and prepare the standalone output.
- `pnpm lint`: run ESLint with the Next.js/TypeScript rules.
- `pnpm start`: serve the production build.
- `pnpm test:metrics`: placeholder hook for evaluating metric logic; add the script target before use.

## Coding Style & Naming Conventions
- TypeScript, strict mode on; prefer functional React components.
- Indentation: 2 spaces; keep imports ordered (external → internal `@/*`).
- Components in `PascalCase.tsx`; hooks start with `use`; utility modules use `camelCase.ts`.
- Rely on ESLint (`eslint.config.mjs`) for rule enforcement; run `pnpm lint --fix` before committing.
- Keep prompts/config in `dspyground.config.ts`; avoid hardcoding secrets.

## Testing Guidelines
- No default framework is wired; when adding tests, co-locate `.test.tsx/.test.ts` beside the source or in `src/__tests__`.
- Favor Vitest + React Testing Library for UI logic and Playwright for page flows; mock AI calls and persist only anonymized sample data.
- Update `data/*.json` fixtures when behavior changes and document new manual steps in PRs.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects (e.g., `add sidebar toggle`, `fix cli init path`); keep bodies for rationale and breaking notes.
- For PRs: include a concise summary, key screenshots or CLI output, affected commands, and any config/env variables required.
- Call out UI/UX changes and CLI surface changes separately; list verification steps (`pnpm lint`, `pnpm dev` smoke check, added tests).

## Security & Configuration Tips
- Required env: `OPENROUTER_API_KEY` (default provider); optional `AI_GATEWAY_API_KEY` if you switch back to Vercel Gateway; optional `OPENAI_API_KEY` and `OPENAI_BASE_URL` for voice feedback/alt endpoints.
- Never commit `.dspyground/` runtime data or API keys; use `scripts/clean-sensitive.mjs` before packaging standalones.
