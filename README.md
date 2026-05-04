# Nourishi

AI-powered recipe discovery and meal planning app built with React, Vite, and Google Gemini. Runs as a PWA on any device, deployed on Vercel with a serverless backend, and can be compiled to native iOS/Android via Capacitor.

## Features

- **Recipe Search** — Natural language recipe discovery ("spicy chicken bowls", "comfort food for winter") with web-sourced results via Google Search grounding
- **Pantry Mode** — Add ingredients you have on hand, get recipes tailored to your kitchen
- **Meal Planner** — Generate 1-week, 2-week, or 1-month meal plans for goals like bulking, cutting, low-carb, vegetarian protein, balanced, or Mediterranean
- **Full Nutrition** — Every recipe and meal shows calories, protein, carbs, and fat with visual macro bars
- **Source Links** — Recipes link back to their original source when available

## Quick Start

### Prerequisites

- Node.js 20+
- A Google Gemini API key ([get one free here](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone the repo
git clone https://github.com/FabulousBernt/nourishi.git
cd nourishi

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start dev server (requires Vercel CLI for API routes)
npx vercel dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

The app uses a **Vercel serverless function** (`api/generate.js`) to proxy requests to the Google Gemini API. The API key is stored server-side and never exposed to the browser.

```
Browser  →  /api/generate  →  Google Gemini API
(React)     (Vercel fn)        (gemini-2.0-flash)
```

## Deployment

The app is deployed on Vercel at [nourishi.vercel.app](https://nourishi.vercel.app).

To deploy your own:

```bash
npm install -g vercel
vercel
vercel env add GEMINI_API_KEY production
vercel env add ALLOWED_ORIGIN production  # e.g. https://your-app.vercel.app
vercel --prod
```

## Building for Production

```bash
npm run build    # Outputs to dist/
npm run preview  # Preview the production build locally
```

## Native Mobile (iOS & Android)

Nourishi uses [Capacitor](https://capacitorjs.com/) to compile to native apps.

```bash
# First build the web app
npm run build

# Add platforms
npm run cap:add:ios      # Requires macOS + Xcode
npm run cap:add:android  # Requires Android Studio

# Sync web assets to native projects
npm run cap:sync

# Open in native IDE
npm run cap:open:ios
npm run cap:open:android
```

### iOS Requirements
- macOS with Xcode 15+
- CocoaPods (`sudo gem install cocoapods`)

### Android Requirements
- Android Studio with SDK 33+
- Java 17+

## PWA (Progressive Web App)

The app includes PWA support out of the box via `vite-plugin-pwa`. After deploying to any HTTPS host, users can "Add to Home Screen" for a native-like experience with:

- Offline caching of app shell and fonts
- Standalone display (no browser chrome)
- Custom theme color and splash screen

## Project Structure

```
nourishi/
├── api/
│   └── generate.js       # Vercel serverless function (Gemini proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── IngredientTag.jsx
│   │   ├── LoadingPulse.jsx
│   │   ├── MacroBar.jsx
│   │   ├── MealPlanDay.jsx
│   │   └── RecipeCard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── capacitor.config.ts
├── index.html
├── package.json
├── vercel.json
├── README.md
└── vite.config.js
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool & dev server
- **Google Gemini API** — AI-powered recipe search, pantry matching, and meal planning
- **Vercel** — Hosting & serverless functions
- **Capacitor 6** — Native iOS/Android compilation
- **vite-plugin-pwa** — Service worker & PWA manifest generation

## License

MIT
