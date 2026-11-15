<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Branch cleanup after a PR merge

After a PR merges, remove the local branch and its worktree.

1. Confirm the branch is merged into `main`.
2. Check the worktree for uncommitted changes.
3. Remove the worktree with `git worktree remove <path>`.
4. Delete the local branch with `git branch -d`.
5. Use `git branch -D` only when the branch is merged and its upstream is stale.
6. Keep the remote branch unless the user asks to remove it.
