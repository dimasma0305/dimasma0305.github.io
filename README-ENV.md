# Environment Variables Guide

## Overview
This project uses environment variables to manage configuration settings like URLs, API keys, and other environment-specific values.

## Environment Files

### `.env` (Created)
Contains environment variables that are loaded by Next.js automatically.

```bash
NEXT_PUBLIC_BASE_URL=https://dimasma0305.github.io
NEXT_PUBLIC_BASE_PATH=/blog
```

### Other Environment Files You Can Use

- `.env.local` - Local development (ignored by git, highest priority)
- `.env.development` - Development environment
- `.env.production` - Production environment
- `.env.test` - Test environment

## Environment Variable Types

### Public Variables (Client-side)
Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser:

```bash
NEXT_PUBLIC_BASE_URL=https://dimasma0305.github.io
NEXT_PUBLIC_BASE_PATH=/blog
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Private Variables (Server-side only)
Variables without the prefix are only available on the server:

```bash
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
API_SECRET=your-api-secret
```

## Usage in Code

### In React Components (Client-side)
```typescript
// Only NEXT_PUBLIC_ variables work here
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const basePath = process.env.NEXT_PUBLIC_BASE_PATH
```

### In Server Components/API Routes
```typescript
// Both public and private variables work here
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const secretKey = process.env.SECRET_KEY
```

### With Fallbacks (Recommended)
```typescript
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
const fullUrl = `${baseUrl}${basePath}`
```

## Current Implementation

In `app/page.tsx`, we use environment variables for:

```typescript
// Environment variables with fallbacks
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://dimasma0305.github.io"
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/blog"
const fullUrl = `${baseUrl}${basePath}`

export const metadata: Metadata = {
  // ... other metadata
  alternates: {
    canonical: fullUrl,
  },
  openGraph: {
    url: fullUrl,
    images: [
      {
        url: `${fullUrl}/og-image.jpg`,
        // ...
      },
    ],
  },
  // ...
}
```

## Best Practices

1. **Always use fallbacks** for critical variables
2. **Use NEXT_PUBLIC_ prefix** only for variables that need to be accessible in the browser
3. **Keep sensitive data private** (no NEXT_PUBLIC_ prefix)
4. **Use .env.local** for local development secrets
5. **Add .env.local to .gitignore** (already done)

## Environment Loading Order

Next.js loads environment variables in this order (later ones override earlier ones):

1. `.env`
2. `.env.local`
3. `.env.development` / `.env.production` / `.env.test`
4. `.env.development.local` / `.env.production.local` / `.env.test.local`

## Deployment

For deployment platforms:

### Vercel
Set environment variables in the Vercel dashboard under Project Settings > Environment Variables.

### Netlify
Set environment variables in Site Settings > Environment Variables.

### GitHub Pages (Current)
Since GitHub Pages only serves static files, only `NEXT_PUBLIC_` variables work and must be set during build time.

## Verification

To verify environment variables are loaded:
```bash
npm run build
```

Look for "- Environments: .env" in the build output. 