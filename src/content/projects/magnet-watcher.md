---
repo: magnet-watcher
title: Magnet Watcher
summary: Paste a magnet link and watch the video while it downloads.
description: Magnet Watcher streams videos from magnet links right in the browser. It fetches pieces from the BitTorrent swarm in order, checks each one's SHA-1 on the client, and plays the video while it downloads. Seeking is supported, and recovered videos are saved for later.
tags: [bittorrent, streaming, video, typescript, web-app]
homepage: https://wincisky.github.io/magnet-watcher/
icon: ./magnet-watcher-icon.png
---

Paste a magnet link, pick a video from the torrent's folder tree, and it starts
playing while the pieces are still arriving. Pieces are fetched in order from a
movable front that follows the player, so seeking just moves where the download
continues. Every piece is checked against its SHA-1 in the browser.

Browsers can't open TCP connections to peers, so a small VPS service probes the
swarm and serves the torrent metadata, and a Cloudflare Worker fetches the
pieces from peers. Videos are saved in the browser as they arrive, so a partial
download can be resumed later.
