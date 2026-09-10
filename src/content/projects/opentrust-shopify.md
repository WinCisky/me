---
repo: OpentrustShopifyApp
title: Opentrust Shopify
summary: A Shopify app to collect and display product reviews.
description: A Shopify app that collects and displays product reviews inside a merchant's store, built on Polaris and App Bridge with a theme app extension for the storefront.
tags: [shopify, reviews, polaris, app-bridge, e-commerce]
icon: ./opentrust-icon.png
---

A Shopify app that collects and displays product reviews inside a merchant's
store. The embedded admin side is built on Polaris and App Bridge and talks to
the Admin API for orders and products, while a theme app extension renders the
review listing on the storefront itself.

Most of the work sat in the boundaries rather than the features: the OAuth
install flow, the mandatory GDPR webhooks, and keeping the embedded frontend
authenticated inside Shopify's iframe.
