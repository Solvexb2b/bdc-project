# Enhanced Vite React TypeScript Template

Vite + React + TypeScript + Tailwind CSS template with Shadcn/ui pre-configured.

## Features

- **Linting**: TypeScript (`tsc --noEmit`), ESLint, and Stylelint
- **Shadcn/ui**: Pre-configured with all Shadcn components
- **Modern Stack**: Vite + React + TypeScript + Tailwind CSS

## Available Scripts

```bash
# Run all linting (types + JS + CSS)
npm run lint

# Individual linting
npm run lint:types # TypeScript (tsc --noEmit)
npm run lint:js    # ESLint
npm run lint:css   # Stylelint
```

## Optional Blink integration

Blink is disabled in the default build path. The app now builds without Blink dependencies installed, while Blink source code stays in the repo.

To re-enable Blink locally, install `@blinkdotnew/sdk` and set:

- `VITE_ENABLE_BLINK=true`
- `VITE_BLINK_PROJECT_ID=...`
- `VITE_BLINK_PUBLISHABLE_KEY=...`
