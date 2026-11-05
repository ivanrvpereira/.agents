# macOS release pipelines

Extra checks for a workflow that signs, notarizes, or ships a macOS app or CLI. They add to Pass 1 section 4 (workflows) and section 5 (credentials).

## Credentials and what each one can do

| Secret | If stolen |
| --- | --- |
| Sparkle EdDSA private key | Signs an update that every installed copy auto-installs. The highest-value secret; treat it like a root key. |
| Developer ID certificate (`.p12` + password) | Signs malware under the maintainer's name until Apple revokes it. |
| App Store Connect / notary API key (`.p8`, key ID, issuer ID) | Notarizes binaries for the team. |
| Tap push token | Rewrites the Homebrew cask or formula that users install. Scope: [registry.md](registry.md). |

Expect all of them used only in the tag-triggered release job, ideally in an environment whose deployment policy admits only release tags, with a tag ruleset that only admins bypass.

## Workflow checks

- **Tools downloaded at release time** (Sparkle's `generate_appcast`/`sign_update`, `create-dmg`, notarization helpers) run next to the keys: each download checks a pinned SHA-256 before it runs.
- **Build vs sign:** for an app with many third-party dependencies or outside contributors, build jobs produce unsigned artifacts with no secrets, and a separate signing job in the release environment checks the artifacts' SHA-256 and runs no repository build code. A small solo app can keep one job.
- **Signing keychain:** a temporary keychain is created per run and deleted in an `if: always()` step, together with any key file written to `$RUNNER_TEMP`.
- **Verification before publishing:** `codesign --verify --strict`, `xcrun stapler validate`, and `spctl --assess` (Gatekeeper) on the app, zip, and DMG; the binaries run and report the tag's version.
- **Stable identity:** the team ID and signing identifiers stay fixed: macOS ties Keychain access and privacy permissions (Accessibility, Input Monitoring) to them, and a change makes every user grant them again.
- **Minimum macOS:** set explicitly (`-mmacosx-version-min`, deployment target) and checked on the built binaries (`vtool -show-build`), so a toolchain bump that raises it fails the build.
- **Publish order:** the GitHub release exists before the appcast or tap points at it. When the appcast is committed to the default branch with the workflow token, that branch cannot require pull requests on a personal-account repo (see SKILL.md section 2).
- **Dry run:** a workflow without secrets builds and packages unsigned on pull requests that touch the release files, and checks the cask or formula (`brew style`, `brew audit --strict`) in a throwaway tap.
