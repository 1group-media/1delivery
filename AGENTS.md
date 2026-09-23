# Mandatory Security Protocol for All Agents
> [!IMPORTANT]
> **READ BEFORE TOUCHING ANY CODE:** Review [SECURITY.md](SECURITY.md) for ecosystem security history and mandatory architectural invariants.
> - **Zero Plaintext Secrets:** Never commit database credentials or keys in code or CI workflows (always use secrets).
> - **Cryptographic HMAC:** Never use public `storeId` as an HMAC key.
> - **Authenticated Mutations:** All payouts, dispatches, and settlements require authorization.
> - **No Localhost in Public Code:** Always use canonical production subdomains (`*.1group.media`).

---

