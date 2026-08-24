---
repo: md-preview
title: Markdown Preview
summary: A tiny web editor with live markdown rendering.
icon: https://raw.githubusercontent.com/WinCisky/md-preview/refs/heads/main/public/favicon.ico
---

A minimal markdown editor that renders while you type, with no build step and no
account required. Paste a document on the left, read the formatted output on the
right.

## Why

Most online editors are heavy, ad-ridden, or want your files on their servers.
This one keeps everything in the browser: the document never leaves the tab.

## What I learned

Keeping the two panes in sync is deceptively tricky once you add scroll
synchronisation — mapping source lines to rendered blocks needs the parser to
expose position data, not just HTML.
