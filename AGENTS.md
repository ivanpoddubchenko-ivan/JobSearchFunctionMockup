# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx`, wrapped in `BrowserRouter`, into the `#root` element
- `src/App.tsx` - Route definitions (`/`, `/login`, and `/profile`) and the `AuthProvider` wrapper. Not the usual starting point for UI work — see `src/pages/` instead
- `src/pages/Dashboard.tsx` - The `/` route (job listings, filters), gated behind auth via `RequireAuth`
- `src/pages/LoginPage.tsx` - The `/login` route: split-screen shell (image panel + mode tabs) rendering either `RegisterWizard` or `SignInForm`
- `src/pages/Profile.tsx` - The `/profile` route: account page with a vertical tab nav (General / Saved / Settings), gated behind auth via `RequireAuth`
- `src/components/login/` - Login-page-only pieces: `RegisterWizard.tsx` (2-step signup), `SignInForm.tsx`, `DateOfBirthField.tsx`, `PasswordField.tsx`, `ImagePanel.tsx`
- `src/components/shared.tsx` - Shared UI atoms and CSS-var tokens (`v`, `Logo`, `ThemeToggle`, `Badge`, `JobCard`, `JobDetail`, `UserMenu`, `useTheme`) reused by both pages
- `src/components/RequireAuth.tsx` - Route guard; renders nothing while the session is loading, then redirects to `/login` when there is no authenticated user
- `src/context/AuthContext.tsx` - Real auth state (`AuthProvider` / `useAuth`) backed by Supabase Auth: `signUp`, `signIn`, `logout`, session restored via `supabase.auth.getSession()` and kept in sync via `onAuthStateChange`
- `src/lib/supabaseClient.ts` - The single Supabase client instance, reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from env
- `src/data/jobs.ts` - Hardcoded mock data: `JOBS`, `ROLES`, `SECTORS`, `TYPES` (jobs/tracker are still mocked — only auth is real). Each `JOBS` entry also carries numeric `postedDaysAgo`/`salaryMin` fields (used for sorting) alongside the existing display fields
- `src/assets/login/` - Login page brand assets (BHMP Network logo, background photo)
- `src/index.css` - Global CSS entrypoint, Tailwind CSS v4 import, light/dark theme CSS variables, and the `.login-image-panel` responsive rule
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19, React DOM 19, React Router 7 (`react-router-dom`), and `@supabase/supabase-js` for auth
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Environment

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`) in `.env.local` for `src/lib/supabaseClient.ts` to initialize — without them the app throws on load.

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
