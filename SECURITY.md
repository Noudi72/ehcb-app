# Security Notice: Exposed API Key (DeepL)

An accidental DeepL API key was present in the repository history. The server now reads the key from the environment (`DEEPL_API_KEY`) and rejects requests if it is missing. However, because the key appeared in Git history, treat it as compromised and rotate it.

## Immediate Actions
- Revoke the old DeepL key in your DeepL account dashboard.
- Create a new key and set it as an environment variable on your backend host:
  - Render: add `DEEPL_API_KEY` under Environment → Add Secret.
  - Local development: export `DEEPL_API_KEY` or use a local `.env` for your process manager.
- Redeploy the backend.

## Optional: Purge the key from Git history
While revoking is sufficient from an operational standpoint, you can also remove the secret from the repository history to prevent resurfacing:

1) Identify commits that contain the secret (run locally):
```
git log -S 'DEEPL_API_KEY' -- server.cjs
git log -S '294179f7-bc8d-489c-8b9f-20dd859001bc:fx'
```

2) Rewrite history (choose one tool):
- Using git filter-repo (recommended):
```
pip install git-filter-repo  # if needed
git filter-repo --invert-paths --path server.cjs --force
# or to replace the literal secret across the repo:
git filter-repo --replace-text <(printf "294179f7-bc8d-489c-8b9f-20dd859001bc:fx==REDACTED\n")
```
- Using BFG Repo-Cleaner:
```
bfg --replace-text replacements.txt
# where replacements.txt contains the line:
# 294179f7-bc8d-489c-8b9f-20dd859001bc:fx==REDACTED
```

3) Force-push and have all collaborators re-clone:
```
git push --force --all
git push --force --tags
```

Note: History rewrites affect all collaborators; communicate before proceeding. Revoking the key remains the critical step.

## Prevent future leaks
- Never hardcode secrets in source files; read from `process.env`.
- Use environment-specific config via deployment platform secrets.
- Add secrets patterns to scanners in CI (e.g., gitleaks, truffleHog).

