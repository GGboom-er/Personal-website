# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally

No test runner or linter is configured.

## Architecture

This is a React portfolio/showcase website built with Vite, TypeScript, and Tailwind CSS v4. The site features an Apple-style "liquid glass" aesthetic with dynamic blur and glow effects.

### Core Structure

- **Entry point**: `index.tsx` renders `App.tsx` into `#root`
- **Main layout** (`App.tsx`): Two-panel layout with sidebar navigation and main content area
  - Top section: `Showcase` component displaying the active project's details
  - Bottom section: `ProjectList` showing project cards with glass effects

### Key Patterns

**State Management**: `GlassSettingsContext` (`contexts/GlassSettingsContext.tsx`) manages all UI settings (blur, opacity, glow effects, etc.) via React Context. Settings are defined in `LayoutSettings` interface from `types.ts`.

**Data Source**: Project data is loaded from `data/projects.json` via `constants.ts`. The `Project` interface in `types.ts` defines the structure.

**Responsive Design**: `useBreakpoint` hook (`hooks/useBreakpoint.ts`) provides responsive state with breakpoints: xs/sm (mobile), md (tablet), lg/xl/2xl (desktop). Mobile view shows `BottomTabBar` instead of `Sidebar`.

**Asset Paths**: Use `getAssetPath()` from `utils/assetPath.ts` for all image/asset references to handle GitHub Pages deployment base path correctly.

### Glass Effect Components (`components/glass/`)

- `GlassCard` - Card with frosted glass background
- `GlowBorder` - Animated gradient border with glow
- `ImageFrame` - Image container with blur edge effects

## Deployment

Configured for GitHub Pages at `/Personal-website/` base path (set dynamically in `vite.config.ts` for production builds).
