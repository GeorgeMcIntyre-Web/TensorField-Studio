# TensorField Studio (v0.1)

A web-based interactive playground for visualizing tensors in solid mechanics and general relativity.

## Overview

This application allows users to:
1. **Sandbox:** Define 3x3 symmetric tensors and visualize their eigenstructure as 3D glyphs.
2. **Mechanics:** Visualize stress fields on simple geometries (Cantilever Beam, Plate with Hole).
3. **Relativity:** Explore toy metric tensors and visualize light cone structures in curved spacetime.

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **3D Engine:** Babylon.js
- **State Management:** Zustand
- **Testing:** Vitest (Unit), Playwright (E2E)

## Phase 4 Features

### Insights Panel
A dynamic overlay provides real-time engineering explanations of the current scene. It interprets tensor definiteness, beam loading conditions, and spacetime curvature in plain language.

### Snapshot System
Users can save their current configuration (mode + parameters) to a local list.
- **Export:** Copies a JSON representation of the snapshot to the clipboard.
- **Import:** Restores a state from a valid JSON string.

## Runtime Notes
- This project uses **strict relative imports** (e.g. `./components/MyComponent`). No import aliases (like `@/`) are used to ensure maximum compatibility with simple browser-based build environments.
- `tests/e2e/sanity.spec.ts` acts as the primary canary test to ensure the application renders correctly and is not blank.

## Getting Started

1. `npm install`
2. `npm run dev` for local development server.
3. `npm run test:unit` for math verification.
4. `npm run test:e2e` for UI automation tests.

## Math Assumptions (v0.1)

- **Tensors:** Restricted to 3x3 symmetric real tensors for this version.
- **Beam:** Euler-Bernoulli beam theory (small deflections, linear elastic).
- **Plate:** Kirsch solution for infinite plate (Plane stress approximation).
- **Relativity:** Weak-field static approximations for visualization (Schwarzschild-like isotropic coordinates).

## License
MIT