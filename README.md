# The Plateful

AI-powered recipe discovery and meal planning app built with React, Vite, and Cerebras AI. Runs as a PWA on any device, deployed on Vercel with a serverless backend, and can be compiled to native iOS/Android via Capacitor.

## Features

- **Recipe Search** — Natural language recipe discovery with AI-generated and web-sourced results via TheMealDB
- **Pantry Mode** — Add ingredients you have on hand, get recipes tailored to your kitchen
- **Meal Planner** — Generate 1-week meal plans for goals like bulking, cutting, low-carb, vegetarian protein, balanced, Mediterranean, family-friendly, or quick meals
- **Full Nutrition** — Every recipe and meal shows calories, protein, carbs, and fat with visual macro bars
- **PDF & Calendar Export** — Export meal plans as printable PDFs or import into your calendar app
- **Content Moderation** — Client and server-side content filtering with AI prompt hardening
- **Security Hardened** — XSS prevention, input sanitization, rate limiting, CORS, security headers

## Quick Start

### Prerequisites

- Node.js 20+
- A Cerebras API key

### Setup

```bash
# Clone the repo
git clone https://github.com/FabulousBernt/nourishi.git
cd nourishi

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your CEREBRAS_API_KEY

# Start dev server (requires Vercel CLI for API routes)
npx vercel dev
```

## Deployment

The app is deployed on Vercel at [theplateful.app](https://theplateful.app).

To deploy your own:

```bash
npm install -g vercel
vercel
vercel env add CEREBRAS_API_KEY production
vercel env add ALLOWED_ORIGIN production  # e.g. https://your-app.vercel.app
vercel --prod
```

## CI/CD

- **GitHub Actions** — Lint, test (83 tests), and npm audit on every PR/push to main
- **OWASP ZAP** — Weekly baseline security scan against production
- **Dependabot** — Automated dependency vulnerability PRs

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool & dev server
- **Cerebras AI** — AI-powered recipe generation and nutrition estimation
- **TheMealDB** — Web recipe database
- **Vercel** — Hosting & serverless functions
- **Capacitor 8** — Native iOS/Android compilation
- **Vitest** — Test framework with React Testing Library
- **ESLint 9** — Code linting

## License

MIT
