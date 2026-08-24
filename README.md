<div align="center">
  <a href="https://apoorvdarshan.com">
    <img src="public/android-chrome-192x192.png" width="104" height="104" alt="Apoorv Darshan profile icon" />
  </a>

  # Apoorv Darshan

  **Apoorv Darshan’s corner of the internet — apps, experiments, open source, experience, and ideas.**

  [Visit the website](https://apoorvdarshan.com) · [GitHub profile](https://github.com/apoorvdarshan) · [LinkedIn](https://www.linkedin.com/in/aopv/)
</div>

## About

This repository powers [apoorvdarshan.com](https://apoorvdarshan.com), a minimal editorial profile inspired by the clarity of a personal essay rather than a conventional portfolio dashboard.

It brings together shipped apps, games, Chrome extensions, projects, open-source contributions, live repository star counts, GitHub activity, experience, education, recognition, and links from around the web.

## Highlights

- Light and dark themes with a persistent preference
- Responsive, typography-led interface using Newsreader
- Smooth internal navigation with dedicated expanded pages
- Live merged GitHub contribution graph styled for both themes
- Repository star counts only where the GitHub profile README includes them
- Collapsible Random Facts section
- Complete favicon and installable web-app icon set
- Automatic deployment to Cloudflare Workers after pushes to `main`

## Pages

| Route | Content |
| --- | --- |
| [`/`](https://apoorvdarshan.com) | Complete profile overview |
| [`/experience`](https://apoorvdarshan.com/experience) | All professional experience |
| [`/education`](https://apoorvdarshan.com/education) | Complete education history |
| [`/projects`](https://apoorvdarshan.com/projects) | All listed projects |
| [`/open-source`](https://apoorvdarshan.com/open-source) | All open-source contributions |

## Content model

The website deliberately keeps its data sources separate:

- **GitHub profile README:** apps, games, extensions, projects, open-source work, activity, links, recognition, philosophy, and facts. The build synchronizes this content through [`scripts/sync-profile-readme.mjs`](scripts/sync-profile-readme.mjs).
- **LinkedIn profile:** experience and education. These verified snapshots live in [`src/linkedinExperience.js`](src/linkedinExperience.js) and [`src/linkedinEducation.js`](src/linkedinEducation.js).

Running the development server or creating a production build refreshes the generated GitHub snapshot automatically. If GitHub is temporarily unavailable, the committed snapshot remains usable.

## Stack

- React
- Vite
- Vanilla CSS
- Cloudflare Workers static assets
- GitHub-connected automatic deployments

## Local development

```bash
git clone https://github.com/apoorvdarshan/profile.git
cd profile
npm install
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run sync-profile` | Refresh generated content from the GitHub profile README |
| `npm run dev` | Sync content and start Vite on port 3000 |
| `npm run lint` | Run ESLint |
| `npm run build` | Sync content and create the production build |
| `npm run preview` | Preview the production build on port 3000 |
| `npm run deploy` | Build and deploy manually with Wrangler |

## Project structure

```text
public/                         Fonts, favicon, and web-app icons
scripts/sync-profile-readme.mjs  GitHub README synchronization
src/App.jsx                    Interface, routes, and page sections
src/linkedinEducation.js       Verified education snapshot
src/linkedinExperience.js      Verified experience snapshot
src/profileData.generated.json Generated GitHub profile data
src/styles.css                 Typography, themes, and responsive layout
wrangler.jsonc                 Cloudflare Workers configuration
```

## Deployment

The production site is hosted on Cloudflare Workers at [apoorvdarshan.com](https://apoorvdarshan.com). The repository is connected to Cloudflare Workers Builds, so every push to `main` runs:

```bash
npm run build
npx wrangler deploy
```

The custom domain is configured directly in [`wrangler.jsonc`](wrangler.jsonc); Workers preview URLs are disabled.
