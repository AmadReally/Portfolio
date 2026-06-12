---
title: Building a Terminal Portfolio with Next.js
date: 2026-05-28
tags: nextjs, portfolio, github-api, css
---

# Building a Terminal Portfolio with Next.js

This portfolio started as a clone experiment and became something custom.

## Stack

- **Next.js 16** with `output: 'export'` for static GitHub Pages hosting
- **Framer Motion** for animations
- **GitHub API** pre-fetched at build time via a Node.js script
- **GitHub Actions** for CI/CD — push to main, live in 60 seconds

## Constraints

### No API routes in static export

Next.js static export means zero server-side code at runtime. All GitHub data — repos, contributions, commit history — gets fetched by a Node.js script during the build and written to `public/api/github.json` as a static file.

### Live data without a backend

The contributions calendar and activity log use build-time data. But the events feed merges in client-side via `api.github.com/users/AmadReally/events` so recent pushes show up without a rebuild.

## Features worth noting

The terminal center panel has real commands: try `matrix`, `game snake`, `game rocket`, or `secret`. The ASCII avatar is generated live from my GitHub profile picture using the Canvas API.

## Deployment

GitHub Actions builds the Next.js app, runs the GitHub data fetcher, and uploads the `out/` directory as a Pages artifact. No extra config needed — the workflow handles basePath automatically.
