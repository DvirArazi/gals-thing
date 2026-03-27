# gals-thing

Minimal SvelteKit app configured for Vercel deployment.

## Local development

Install dependencies and start the dev server:

```sh
npm install
vercel env pull .env.local
npm run dev
```

The app now stores player sessions and submitted photos in Postgres, which works on Vercel and persists across deployments.

The server looks for a Postgres connection string in one of these environment variables:

- `DATABASE_URL`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEON_DATABASE_URL`

For the smoothest Vercel setup, add Neon from the Vercel Marketplace and then pull the generated env vars locally with `vercel env pull .env.local`.

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

Important: the database connection string must be configured in Vercel before the deployed app can create players or accept uploads.

## Gameplay and admin routes

- `/`: creates a player on first visit, stores a `player_session` cookie, and lets the player upload one photo per mission
- `/admin`: shows all submitted photos in a mission-by-player table with click-to-expand previews

## Continuous deployment

GitHub Actions is configured in `.github/workflows/vercel-deploy.yml` to deploy on every pushed commit:

- `main` deploys to Vercel production
- all other branches deploy to Vercel preview

Before it can run, add this GitHub repository secret:

- `VERCEL_TOKEN`: a Vercel personal or team token with access to the linked project

If this Vercel project is already connected to the GitHub repository in the Vercel dashboard, disable either the workflow or the dashboard Git integration to avoid duplicate deployments.
