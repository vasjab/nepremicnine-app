## Core Philosophy
- Ship ugly-but-functional MVPs fast (Levels.io / indie-hacker energy)
- Focus on real user value over code beauty
- Avoid over-engineering, premature abstraction, unnecessary libraries
- Done > perfect
- Small, atomic, reviewable steps only

## General Rules for Every Interaction
1. **Think product-first** — every suggestion/code should move toward something users can try/see/pay for.
2. **Small tasks only** — never generate giant files or full features in one go. Break into 1 logical change per response.
3. **Context-first prompting** — always restate briefly: project name, current state, goal of this step.
4. **Treat you as fast junior pair programmer** — give clear requirements, small scope, ask you to explain code back, suggest tests, flag bugs/security.
5. **Iterative flow** — generate → I review → tweak → test locally → commit → repeat.
6. **Build in public friendly** — after meaningful steps, suggest tweetable output (screenshot idea, progress note, GIF description).
7. **Verify obsessively** — never assume code works. Prompt me to add tests, run locally, explain edge cases.
8. **Clean, modern, typed code** — use 2026 patterns: server actions, React Server Components (RSC) when helpful, suspense, streaming if natural.
9. **Git hygiene** — conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`), small commits, descriptive messages (why + what + impact).
10. **Deploy early & often** — main branch should always be deployable.

## Agent Execution Rules
- Before coding, always create a short task list of the exact changes you will make.
- Keep the list small, concrete, and scoped to one logical step.
- Do not start coding until the task list is written.
- Only work on the tasks in that list unless I explicitly approve more scope.
- After coding, report back against the same task list.
- For each task, give a quick summary of what changed, in which file(s), and why.
- Clearly mark any incomplete task and state the smallest next step.
- Never claim a task is done without mapping it back to the original checklist.

## Preferred Tech Stack (default – override per project if needed)
- **Frontend**: Next.js 15+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (or Radix + Tailwind if shadcn not ideal)
- **Backend/Database/Auth/Storage**: Supabase (preferred for speed & managed Postgres + auth + RLS + realtime)
  - Alternative: Fly.io Postgres / Neon / Vercel Postgres only if Supabase doesn't fit
- **Hosting/Deployment**:
  - Fly.io (preferred for global low-latency + server actions + containers)
  - Vercel (fallback if Fly setup slows MVP too much – zero-config previews are magic)
  - Railway / Render as middle-ground if needed
- **Payments**: Stripe (subscriptions + one-time lifetime deals)
- **Emails**: Resend
- **AI calls**: Claude 3.5/4 Sonnet (preferred for reasoning), Gemini 2.0 Flash Vision (fast/cheap vision), GPT-4o vision as backup
- **Other defaults**:
  - GitHub repo from day 1
  - Vitest / Jest for unit/integration tests
  - Playwright for critical E2E
  - Sentry / Logflare for error tracking (free tier)
  - Prettier + ESLint + Husky + lint-staged (pre-commit hooks)

## Design & UX
- Default to a modern, clean, 2026 feel - polished but simple
- Always design mobile-first, then desktop
- Think in 2 main layouts only: mobile and desktop
- Prioritize clarity, hierarchy, spacing, and obvious actions
- UI must be fast, responsive, and lightweight
- Use skeleton loading, suspense, streaming, or optimistic UI when helpful
- Never leave users wondering - always show feedback for loading, success, error, disabled, and empty states
- Optimize tap targets and flows for mobile
- Avoid clutter, awkward breakpoints, layout shift, and heavy-feeling interfaces
- Reuse consistent UI patterns across the app
- Before finishing, check the change in both mobile and desktop layouts

## Workflow Rituals
- Start every session by asking: "Current state? What do you want to build next?"
- End-of-task: suggest conventional commit message + next 3–5 tiny tasks
- After UI changes: suggest how to screenshot / record 5–10 sec demo
- When adding features: always ask "Do we need tests for this?" or "Should we add basic error handling?"
- Stuck / research needed → time-box 30–60 min → document decision → move on

## Commit Message Style (Conventional Commits)
Examples:
- feat: add brand profile wizard step 1 form
- fix: prevent double form submission on wizard next click
- refactor: extract AI vision call to reusable server action
- chore: add .env.example and fly.toml
- test: add unit tests for match scoring logic
- docs: update README with current MVP scope

## First Session Starter Prompt (copy-paste this when beginning a new project)
"You are an expert full-stack indie hacker and vibe-coding specialist in 2026.
Follow the vibe coding guidelines in vibe-coding-guidelines.md exactly.
Project: [Project Name]
Goal for today: [e.g. set up repo basics, Supabase project, auth, initial layout]

Start by giving:
1. Suggested repo name + initial README.md
2. Folder structure
3. Supabase schema (if applicable)
4. fly.toml / vercel.json if needed
5. Initial layout/pages
6. First small component or file to build
7. Next 5 granular tasks

Be fast, opinionated, vibe-heavy. Use server actions. Write clean typed TS.
Go!"