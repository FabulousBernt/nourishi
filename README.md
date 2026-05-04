# 🍽 MealMuse

AI-powered recipe discovery and meal planning app built with React, Vite, and the Anthropic API. Runs as a PWA on any device and can be compiled to native iOS/Android via Capacitor.

## Features

- **Recipe Search** — Natural language recipe discovery ("spicy chicken bowls", "comfort food for winter") with web-sourced results
- **Pantry Mode** — Add ingredients you have on hand, get recipes tailored to your kitchen
- **Meal Planner** — Generate 1-week, 2-week, or 1-month meal plans for goals like bulking, cutting, low-carb, vegetarian protein, balanced, or Mediterranean
- **Full Nutrition** — Every recipe and meal shows calories, protein, carbs, and fat with visual macro bars
- **Source Links** — Recipes link back to their original source when available

## Quick Start

### Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/mealmuse.git
cd mealmuse

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env and add your VITE_ANTHROPIC_API_KEY

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## API Key Setup

The app calls the Anthropic API directly from the browser. For production, you should proxy API calls through your own backend to avoid exposing your key.

For development, create a `.env` file:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Then update `src/App.jsx` to use the env variable in the fetch headers:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
},
```

## Building for Production

```bash
npm run build    # Outputs to dist/
npm run preview  # Preview the production build locally
```

## Native Mobile (iOS & Android)

MealMuse uses [Capacitor](https://capacitorjs.com/) to compile to native apps.

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
mealmuse/
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
├── README.md
└── vite.config.js
```

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool & dev server
- **Anthropic Claude API** — AI-powered recipe search, pantry matching, and meal planning
- **Capacitor 6** — Native iOS/Android compilation
- **vite-plugin-pwa** — Service worker & PWA manifest generation

## License

MIT
