---
repo: stg-email
title: stg-email
summary: A simple solution for testing emails before going into production.
icon: https://raw.githubusercontent.com/WinCisky/stg-email/refs/heads/main/static/favicon.ico
preview: ./stg-email.webp
---

Point a staging environment at a throwaway inbox and read what it actually
sends. You add an inbox, the app polls the mail API for it, and messages
render in a list or full-page view; enough to check a template or a signup
flow without wiring a real mailbox into staging.

The frontend is a static SvelteKit project talking to a small hosted mail API,
Inboxes are identified by a credential
pair kept client-side rather than by an account system.
