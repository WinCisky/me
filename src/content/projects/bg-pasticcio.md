---
repo: bg-pasticcio
title: bg-pasticcio
summary: Omarchy shell plugin that swaps your wallpaper on a timer.
description: bg-pasticcio is an Omarchy shell plugin that changes your desktop background on a timer, pulling images from any HTTP JSON endpoint. A panel next to the clock turns it on, sets the feed and keeps or discards the image on screen. The images you keep are reused when you're offline.
tags: [omarchy, hyprland, wallpaper, bash, qml, linux]
homepage: https://omarchyplugins.com/plugin.html?id=ssimo.bg-pasticcio
icon: ./bg-pasticcio-icon.png
preview: ./bg-pasticcio-1280.webp
---

An Omarchy 4 shell plugin that changes your desktop background on a timer,
pulling images from an HTTP JSON endpoint. An icon next to the clock opens a
panel to switch it on, point it at a feed, and keep or discard the current
image. Only the images you keep are saved to disk, and those are what it cycles
through when the endpoint is offline.

It ships turned off, pointing at `bg.ssimo.dev`, a feed of CC0 wallpapers.
Turning it off again puts back your original wallpaper. It's plain bash and
QML, with no build step.
