# gals-thing

Minimal SvelteKit app configured for Vercel deployment.

## Local development

Install dependencies and start the dev server:

```sh
npm install
npm run dev
```

## Production build

Create a production build locally:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Deploy to Vercel

This project uses `@sveltejs/adapter-vercel`, which is the recommended adapter for SvelteKit on Vercel.

If the repo is not linked yet:

```sh
vercel link
```

Create a preview deployment:

```sh
vercel
```

Create a production deployment:

```sh
vercel --prod
```
