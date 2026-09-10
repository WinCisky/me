---
repo: md-preview
title: Markdown Preview
summary: A tiny web editor with live markdown rendering.
description: A minimal, in-browser markdown editor with live preview and synced scrolling. No build step, no account, and the document never leaves the tab.
tags: [markdown, editor, browser, developer-tools]
icon: ./md-preview-icon.png
preview: ./md-preview.webp
---

A minimal markdown editor that renders while you type, with no build step and no
account required. Paste a document on the left, read the formatted output on the
right. Everything stays in the browser, so the document never leaves the tab.

Keeping the two panes in sync took some work once scroll synchronisation came
in: mapping source lines to rendered blocks needs the parser to expose position
data, not just HTML.
