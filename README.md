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

## Continuous deployment

GitHub Actions is configured in `.github/workflows/vercel-deploy.yml` to deploy on every pushed commit:

- `main` deploys to Vercel production
- all other branches deploy to Vercel preview

Before it can run, add this GitHub repository secret:

- `VERCEL_TOKEN`: a Vercel personal or team token with access to the linked project

If this Vercel project is already connected to the GitHub repository in the Vercel dashboard, disable either the workflow or the dashboard Git integration to avoid duplicate deployments.
