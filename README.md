
  # Card Game Layout Design(1)

  This is a code bundle for Card Game Layout Design(1). The original project is available at https://www.figma.com/design/LfIYpmzIr7OpViazEn3Z43/Card-Game-Layout-Design-1-.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Deploying to GitHub Pages

1) Update the base path in `vite.config.ts` if your repository name is not `card-game`.
2) Push to the `main` branch.
3) In GitHub: Settings → Pages → Build and deployment → Source = GitHub Actions.
4) Wait for the "Deploy to GitHub Pages" workflow to finish. Your site will be available at:
   `https://<username>.github.io/<repo>/`

If your default branch is not `main`, update `.github/workflows/deploy.yml` accordingly.

Optional local check of the production build:

```bash
npm run build:github
npm run preview
```
  
