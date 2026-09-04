# AGENTS.md

## Project Instructions

You are working in this repository as the primary coding agent.

Before making changes:

1. Read `CONTEXT.md` to understand the current project state.
2. Inspect the relevant source files before modifying them.
3. Follow the existing architecture and coding patterns.
4. Prefer small, focused changes over large rewrites.
5. Do not modify unrelated files.
6. Do not introduce new dependencies unless necessary.

## Project Context

`CONTEXT.md` is the persistent project memory.

It contains:

- Current objectives
- Current implementation state
- Important decisions
- Completed work
- Work in progress
- Known issues
- Next steps
- Important files

Always read `CONTEXT.md` at the beginning of a new session, before doing anything else, even if no task has been given yet.

After completing substantial work, update `CONTEXT.md` so that another fresh session can continue without relying on the previous conversation.

## Coding Rules

- Follow the existing project's style and conventions.
- Reuse existing utilities and abstractions where appropriate.
- Keep changes minimal and maintainable.
- Avoid speculative abstractions.
- Don't rewrite working code without a clear reason.
- Preserve backwards compatibility unless explicitly asked otherwise.

## Verification

Before considering a task complete:

1. Run the relevant tests.
2. Run the project's formatter/linter when applicable.
3. Check `git diff`.
4. Verify that no unrelated files were modified.

If tests cannot be run, explain why.

## Git

Do not create commits unless explicitly asked.

Do not reset, revert, or discard user changes unless explicitly asked.

Never overwrite uncommitted work.

## Communication

Before implementing a complex change:

- Explain the intended approach briefly.
- Identify important assumptions.
- Ask for clarification if requirements are ambiguous.

After implementation:

- Summarize what changed.
- Mention tests/checks performed.
- Mention anything remaining to be done.

