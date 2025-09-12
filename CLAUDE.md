# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Daily Expense Tracker - A single-page application (SPA) built with Vite + React and Firebase backend. Features a 3-view architecture: login form, expense tracker (mobile-first), and heatmap visualization (desktop-first). Tracks daily expenses with categories, notes, tags, and optional receipt images. Features local-first UX with optimistic updates and eventual consistency in Firestore.

Production URL: https://expense.tholapz.com

## Technology Stack

- **Frontend**: Vite + React SPA
- **Backend**: Firebase (Auth, Firestore)
- **Authentication**: Email/Password with 1+ year session persistence
- **Database**: Cloud Firestore with user-scoped collections
- **Hosting**: Firebase Hosting with custom domain
- **Testing**: Jest (unit tests), Playwright (E2E tests)
- **State Management**: React Query or simple context (lightweight approach)

## Development Commands

```bash
npm run dev          # Start development server with Vite
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

## Architecture

**SPA Architecture**: Browser SPA ↔ Firebase Hosting CDN ↔ Firebase Services (Auth + Firestore)

**3-View System**:
- **Login View**: Email/password authentication form (shown when no session)
- **Expense Tracker**: Mobile-first expense management interface (default for mobile devices)
- **Heatmap View**: Desktop-first calendar heatmap visualization (default for desktop devices)
- **View Switching**: Users can manually switch between Expense and Heatmap views
- **Device Detection**: Uses userAgent to determine initial view preference

**Data Model**: 
- Collections under `users/{uid}` for privacy
- Daily expenses stored in `users/{uid}/days/{yyyymmdd}` 
- Amounts stored in THB as integers (multiples of 100)

**Security**: Firestore rules enforce user data isolation - each user only sees their own data under their `users/{uid}` subtree.

## Environment Configuration

Environment variables prefixed with `VITE_*` for client exposure:

**Firebase Variables:**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**Application Variables:**
- `DAILY_BUDGET` - Daily budget in THB (default: 1800)

## Firebase Configuration

- Hosting configured with SPA rewrites (all routes → /index.html)
- Build output directory: `dist/`
- Firebase Emulator Suite used for local development and testing

## Testing Strategy

- **Unit Tests (Jest)**: Utilities (currency, date, CSV), simple components
- **E2E Tests (Playwright)**: User flows, increment/undo actions, daily totals, cumulative savings
- Emulator Suite used to test Firestore security rules

## Deployment

Production deployment via Firebase CLI:
1. `npm run build` - generates `dist/` folder  
2. `firebase deploy --only hosting` - deploys to Firebase Hosting
- import type using "import type {...} from '...'"