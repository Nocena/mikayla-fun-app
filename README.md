# Mikayla Fun App

An Electron application with a modern UI featuring a left sidebar and right content panel with browser functionality.

## Features

- Left sidebar navigation menu
- Right panel with component switching
- Browser tab functionality (Chrome-like)
- Modern ES modules (import/export)
- TypeScript with strict mode
- Modular component architecture
- DRY principles applied

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will:
- Start Vite dev server for React (port 5173)
- Watch and compile TypeScript files for Electron main process
- Start Electron when ready

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

## Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts     # Main entry point
│   └── preload.ts  # Preload script
└── renderer/       # React application
    ├── components/ # React components
    ├── constants/  # Constants and configs
    ├── types/      # TypeScript types
    ├── App.tsx     # Main app component
    └── index.tsx   # React entry point
```

## Architecture

- **Modular Components**: Each component is in its own file (max 100-150 lines)
- **Type Safety**: Full TypeScript support with strict mode
- **ES Modules**: Modern import/export syntax (no require)
- **DRY Principle**: Reusable components and utilities
- **Build Tools**: Vite for React bundling, TypeScript compiler for Electron main process
- **Component Structure**: 
  - Sidebar with menu items
  - Content panel that switches views
  - Browser view with Chrome-like tabs
  - Each component is self-contained with its own CSS

## Component Breakdown

- **Sidebar**: Navigation menu with active state management
- **ContentPanel**: Router-like component that switches between views
- **BrowserView**: Main browser interface with tab management
- **BrowserTabs**: Tab bar component (Chrome-like)
- **BrowserContent**: Address bar and iframe for web content
- **Views**: HomeView, BrowserView, SettingsView

