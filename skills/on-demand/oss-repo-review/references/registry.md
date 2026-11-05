# Registry and publishing pipeline

For npm (adapt for PyPI/crates/Homebrew taps):

```bash
npm view <pkg> version dist-tags maintainers
npm whoami && npm token list --json    # if logged in as maintainer: want []
```

If publishing uses OIDC trusted publishing, the trust policy must be scoped to the exact repo **and** exact workflow file (verify on the registry's settings page — screenshot or user confirmation). Prefer "require 2FA and disallow tokens". Any leftover publish token from a pre-OIDC era must be revoked. A token that pushes to another repo (a Homebrew tap) is fine-grained and scoped to that one repo with contents write only.
