## Development Guidelines

Optimize for fast, focused iteration.

### Scope of Changes

* Keep every change as small and targeted as possible.
* Only modify files and code that are directly relevant to the current task.
* Do not perform unrelated refactoring, cleanup, formatting, or architectural changes unless explicitly requested.
* Prefer incremental changes over broad rewrites.

### Package Manager

* Use `pnpm` as the package manager for this project.
* Always invoke `pnpm` directly.
* Do **not** use `npm`, `yarn`, or other package managers unless explicitly requested.
* Do **not** invoke pnpm through Corepack commands such as `corepack pnpm`, `corepack prepare`, or `corepack enable` unless explicitly required by the user.
* Use commands such as:

  * `pnpm install`
  * `pnpm add <package>`
  * `pnpm remove <package>`
  * `pnpm run <script>`
  * `pnpm exec <command>`
  * `pnpm dlx <package>`
* Respect the existing `pnpm-lock.yaml` and do not replace or regenerate it unnecessarily.
* Do not change the project's package-manager configuration unless the task specifically requires it.

### Third-Party Libraries and Integrations

* When installing or integrating a third-party library, framework, CLI, or tool, follow the **official documentation and officially recommended installation method** whenever available.
* Prefer the current official setup instructions over custom, inferred, or improvised integration approaches.
* Do not manually recreate configuration that the library's official CLI or setup command is intended to generate.
* Do not bypass an official installer or CLI by manually adding packages and configuration unless there is a clear technical reason to do so.
* For tools such as `shadcn`, use the installation and initialization flow documented by the official project.
* Respect the project's existing framework, package manager, directory structure, aliases, and configuration when following official setup instructions.
* If the official documentation provides different instructions for different frameworks or versions, use the instructions that match the current project.
* Do not copy setup instructions from outdated examples, old blog posts, cached knowledge, or unrelated project templates when current official documentation is available.
* If the official setup process conflicts with the existing project configuration, diagnose the conflict first instead of silently replacing configuration or inventing a workaround.
* Avoid introducing custom wrappers, compatibility hacks, or alternative installation flows unless they are necessary and clearly justified.

### Validation Strategy

* Do **not** run the full test suite after every change.
* Do **not** automatically run full builds, full E2E tests, or browser-based visual tests unless explicitly requested.
* For normal iterative development, use only the minimum validation necessary for the current change.
* Prefer targeted checks related to the files, components, or functionality being modified.
* For small UI changes, do not automatically open the browser, take screenshots, or perform visual regression checks.

Run comprehensive validation only when:

* the user explicitly requests it;
* a major feature or refactor has been completed;
* the change affects shared or core infrastructure;
* targeted validation is not sufficient to establish confidence;
* a larger task has reached a meaningful completion checkpoint.

When comprehensive validation is appropriate, run the relevant combination of:

* lint
* type checking
* tests
* build
* E2E tests
* browser or visual checks

### Dependencies and Cache

* Do not frequently delete `node_modules`, lock files, package-manager caches, or other dependency caches as a troubleshooting step.
* Do not reinstall dependencies unless there is clear evidence of a dependency or installation problem.
* Preserve existing lock files unless changing dependencies requires updating them.
* Prefer diagnosing the actual error before clearing caches or reinstalling packages.
* Reuse the existing development environment whenever possible.
* Do not run `pnpm store prune` or clear the pnpm store as a routine troubleshooting step.
* Do not delete `pnpm-lock.yaml` to resolve ordinary dependency issues.

### Git Workflow

* After completing each user-requested change, create a Git commit for that change.
* Keep each commit focused on the current task and avoid including unrelated modifications.
* Review the changed files before committing.
* Do not commit secrets, credentials, local environment files, generated temporary files, or unrelated workspace changes.
* Use concise and descriptive commit messages that clearly explain the change.
* Prefer one logical change per commit.
* Do not squash, amend, rebase, reset, or rewrite existing Git history unless explicitly requested.
* Do not push commits to a remote repository unless explicitly requested.
* If the working tree already contains unrelated user changes, preserve them and commit only the files or hunks related to the current task whenever possible.

### General Principle

Use the smallest reasonable change and the smallest reasonable validation.

Avoid expensive, destructive, or environment-altering operations unless they are necessary or explicitly requested by the user.

Prefer direct, predictable project commands over environment-management wrappers.

Prefer official installation and integration procedures over custom or improvised setup.

Keep Git history incremental, focused, and easy to review.
