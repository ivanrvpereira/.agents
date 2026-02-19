# AGENTS.md Review Checklist

Use this checklist when auditing an existing AGENTS.md file.

## Structure & Size

- [ ] Root file is under 300 lines (ideally 30-60) and under ~2.5k tokens
- [ ] Uses progressive disclosure — links to detailed docs instead of embedding everything
- [ ] Scoped sub-files exist for major subsystems in monorepos/multi-package projects
- [ ] No duplication between root and sub-files or between root and rules files
- [ ] No section exceeds 20 lines (candidate for extraction to a separate file)

## Six Essential Sections

- [ ] **Commands & tools**: Runnable commands with full syntax and flags
- [ ] **Testing & validation**: How to verify work (test, typecheck, lint commands)
- [ ] **Project structure**: Directory layout with purposes and access levels
- [ ] **Code style**: Concrete examples (file paths, DO/DON'T), not just prose
- [ ] **Git workflow**: Commit format, branching, PR process
- [ ] **Boundaries**: Three-tier system (always/ask-first/never)

## Content Quality

- [ ] Tech stack includes specific versions, not just framework names
- [ ] Commands are copy-paste ready (no placeholders, no "use the linter")
- [ ] Examples reference actual project files, not hypothetical paths
- [ ] Every line is universally applicable (no task-specific content in root)
- [ ] No vague personas or generic instructions ("You are a helpful...")
- [ ] No instructions the model would follow by default (wasted tokens)
- [ ] No lines compressible 50%+ without losing meaning
- [ ] No contradicting instructions between files
- [ ] Code style is delegated to tools/hooks where possible

## Boundaries & Safety

- [ ] "Never commit secrets" or equivalent is present
- [ ] Read-only directories are identified (vendor, node_modules, etc.)
- [ ] Destructive actions require explicit approval
- [ ] Production/deployment actions gated behind "ask first"

## Maintenance

- [ ] File references actual project paths (not stale or hypothetical)
- [ ] Commands match current tooling (package manager, test runner, etc.)
- [ ] No stale references — mentioned files, commands, and patterns still exist in the codebase
- [ ] Verification commands actually run successfully
- [ ] No embedded code snippets that could go stale — uses file:line refs instead
- [ ] Instructions are DRY — no repeated rules across files

## Scoring Guide

Rate each section 0-2:
- **0**: Missing or completely inadequate
- **1**: Present but incomplete or vague
- **2**: Comprehensive and specific

| Section | Score |
|---------|-------|
| Commands & tools | /2 |
| Testing & validation | /2 |
| Project structure | /2 |
| Code style examples | /2 |
| Git workflow | /2 |
| Boundaries | /2 |
| Brevity & focus | /2 |
| Progressive disclosure | /2 |
| Context efficiency | /2 |
| Maintenance & freshness | /2 |
| **Total** | **/20** |

- **16-20**: Strong — minor tweaks only
- **10-15**: Adequate — some sections need work
- **5-9**: Weak — significant gaps
- **0-4**: Missing or fundamentally flawed
