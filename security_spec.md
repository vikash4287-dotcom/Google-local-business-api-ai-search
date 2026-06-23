# Security Specification: LeadMine AI CRM Security Model

This document outlines the security architecture and test payloads for the LeadMine AI database, enforcing high-integrity attribute-based access control.

## 1. Data Invariants
*   **Privacy Isolation**: User profile records contain potentially sensitive info (e.g., email), and list queries on search history or saved leads MUST check owner identifiers. No user can read another user's leads or query history.
*   **Immutable Ownership**: The directory `/users/{userId}` is bound to auth.uid. No user can read or write others' profile documents.
*   **Bounded Content**: ID values (e.g., `userId`, `businessId`) must match strict syntax requirements (`isValidId`) and be constrained in size to prevent wallet draining.
*   **CRM State Integrity**: Statuses representing lead progress must belong to the schema-defined set of `['New', 'Contacted', 'Interested', 'Do Not Contact']`. No other state values are allowed.

---

## 2. The "Dirty Dozen" Threat Vectors (Failing Payloads)

These payloads try to breach the security constraints of our schema, and MUST be blocked by security rules:

1.  **Identity Spoofing on Create**: Attempt to write a User document at `/users/attacker` representing another user's email `victim@gmail.com`.
2.  **Foreign Record Scraping**: Requesting lists of `/users/victim_user_id/saved_businesses` as `unauthenticated` or `attacker`.
3.  **Cross-Tenant Injection**: Attempt to write a saved business lead in `/users/victim/saved_businesses/hacked1` with victim's `userId` payload field but authorized as `attacker`.
4.  **Malicious ID Poisoning**: Create document `/users/my_user_id/saved_businesses/VERY_LONG_JUNK_ID_CONTAINING_MALICIOUS_SCRIPTS_OR_OVER_128_CHARS` to cause indexes or storage overflow.
5.  **Illegal Pipeline State Injection**: Save or update a business lead with `status: "SuperInterested"` which bypasses the allowed enum states.
6.  **Fake Integrity Metric Verification**: Update a lead's business rating with value `99.9` or string `"five_stars"`, breaking type and decimal specifications.
7.  **Unsanitized Payload Fields (Shadow Fields)**: Attempt to save a lead payload containing a ghost helper field like `isAdminPrivileged: true` to bypass role checks.
8.  **Timestamp Spoofing**: Attempt to hardcode `createdAt` field as a stale date in the past rather than the mandatory `request.time`.
9.  **Stale Entity Overwrite**: Try to alter `savedAt` or change `name` of a lead on update, which are defined as immutable after creation.
10. **Query Scrape Bypass**: Run list query on `/users/victim/search_history` with a blanket query that ignores ownership.
11. **DNC Escalation Bypass**: Bypassing CRM terminal state locking by modifying fields of a lead already marked as `Do Not Contact`.
12. **Unauthorized Metadata Wipeout**: Attempting to delete a victim user's root profile or search history without credentials.

---

## 3. Threat Verification Assertion Matrix
Our Firestore security rules (`firestore.rules`) will handle these validation gates natively, ensuring mathematical safety.
