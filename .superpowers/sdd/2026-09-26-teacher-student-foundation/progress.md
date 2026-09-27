# SDD ledger — plan: docs/superpowers/plans/2026-09-26-teacher-student-foundation.md

Setup ruling: Execute in the shared workspace without worktree or commits — the user explicitly requested no Git operations — cost if wrong: changes are not isolated by Git, so verification and scoped edits are mandatory.
Scope ruling: Include removal of legacy member, membership, masterclass, resource, checkout and billing domains after copying the Formules/prix visual structure into the student CRUD — explicitly added by the user after plan approval — cost if wrong: the old reference UI is no longer available, so the student screens and production build are the acceptance evidence.
Pre-flight: Task 1 produces roles and permissions consumed by Tasks 3–5; names are consistent.
Pre-flight: Task 2 produces CourseLevel::ordered and catalogue fields consumed by the later sessions milestone; no conflict.
Pre-flight: Task 3 produces CreateStudent, relations and policy consumed by Task 4; signatures are consistent.
Pre-flight: Task 4 produces routes and props consumed by Task 5; names are consistent.

Task 1: complete (no commits by user request, tests: RoleAccessTest → 6 passed, 12 assertions).

Task 2: complete (no commits by user request, tests: CourseLevelSeederTest → 2 passed, 5 assertions).

Task 3: complete (no commits by user request, tests: StudentManagementTest → 7 passed, 43 assertions).

Task 4: complete (no commits by user request, tests: StudentManagementTest → 7 passed, 43 assertions).

Task 5: complete (no commits by user request, checks: TypeScript passed; production Vite build passed).

Task 6: complete (no commits by user request, tests: full Laravel suite → 56 passed, 2 skipped, 222 assertions; PHPStan → 0 errors).

Scope cleanup: complete (legacy-removal and role tests → 10 passed, 40 assertions; membership, billing, masterclass, resources and Formules/prix removed after visual copy).

Final review: self-review (subagents not requested). No Critical or Important findings remain.

Final: fixed inconsistent student factory display name — test_student_factory_keeps_the_display_name_consistent RED→GREEN, full suite 57 passed / 2 skipped / 224 assertions.

Final: minor (deferred): React Compiler reports the known TanStack Table incompatible-library warning in the pre-existing shared DataTable; ESLint has 0 errors and deliberately skips compiler memoization for that hook.

Finalization ruling: keep the shared workspace as-is with no Git integration — explicit user instruction — cost if wrong: there is no isolated commit or branch checkpoint.
