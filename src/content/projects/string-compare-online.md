---
repo: string-compare-online
title: String Compare
summary: Side-by-side diff for two chunks of text.
icon: https://raw.githubusercontent.com/WinCisky/string-compare-online/refs/heads/main/static/favicon.ico
# preview: ./string-compare-online.png
---

A focused diff tool: two text areas, one result. Useful for comparing config
files, log lines or minified snippets when a full diff tool is overkill.

The interesting part was the diff itself — a Myers implementation small enough to
stay readable, with word-level highlighting layered on top of the line diff.
