# Mandatory Security Protocol for All Agents
> [!IMPORTANT]
> **READ BEFORE TOUCHING ANY CODE:** Review [SECURITY.md](SECURITY.md) for ecosystem security history and mandatory architectural invariants.
> - **Zero Plaintext Secrets:** Never commit database credentials or keys in code or CI workflows (always use secrets).
> - **Cryptographic HMAC:** Never use public `storeId` as an HMAC key.
> - **Authenticated Mutations:** All payouts, dispatches, and settlements require authorization.
> - **No Localhost in Public Code:** Always use canonical production subdomains (`*.1group.media`).

---


## Operational & Deployment Policy
- **Direct CLI Deployments:** Deployments to production (`onepay-prod-1group`) and staging (`onepay-dev-1group`) are executed directly via `scripts/deploy-prod.sh` and `scripts/deploy-dev.sh` (or `gcloud run deploy` / `firebase deploy`).
- **Zero GitHub Actions Overhead:** GitHub Actions workflows are intentionally disabled (`.github/workflows/*.yml.disabled`) to operate under zero-cost organization limits without requiring paid runner quotas. All build and lint verifications run locally or via agent execution prior to deployment.
