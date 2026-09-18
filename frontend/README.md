# FarmVerse — Unified Smart Agriculture Frontend

One React + Vite application combining all 10 FarmVerse modules under a single
design system (the dark glass-morphism UI originally built for Pages 6–10).

## Modules

| # | Module                      | Route / Tab   | Notes |
|---|------------------------------|---------------|-------|
| 1 | User Authentication          | `/login`, `/create-account`, `/forgot-password` | Demo-only auth (localStorage), no real backend |
| 2 | Farmer & Farm Management     | Dashboard → Farmers | Full CRUD, search, filters, mock data |
| 3 | Crop Management              | Dashboard → Crops | Full CRUD, search, filters, mock data |
| 4 | Soil Monitoring              | Dashboard → Soil | Newly built — moisture/pH gauges, NPK levels, recommendations |
| 5 | Weather Monitoring           | Dashboard → Weather | Location selector, alerts, 7-day forecast, irrigation advisory |
| 6 | Irrigation Management        | Dashboard → Irrigation | Original master design |
| 7 | Fertilizer Recommendation    | Dashboard → Fertilizer | Original master design |
| 8 | Pest & Disease Detection     | Dashboard → Pest / Disease | Original master design |
| 9 | Crop Yield Prediction        | Dashboard → Yield | Added to match master design |
| 10| Market Price Tracking        | Dashboard → Market | Added to match master design; prices shown in ₹ |

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`). You'll land on
`/login` — any email containing `@` and a password of 6+ characters will sign
you in (this is a frontend-only demo, there is no real authentication server).

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Structure

```
src/
├── components/
│   ├── Navigation.jsx          # Sidebar (all 9 dashboard modules + logout)
│   ├── DashboardHeader.jsx     # Page header per active tab
│   └── common/                 # Modal, ConfirmDialog, Toast, StatCard
├── context/
│   └── ToastContext.jsx
├── pages/
│   ├── auth/                   # Login, CreateAccount/ForgotPassword, shared shell
│   ├── FarmerManagement.jsx
│   ├── CropManagement.jsx
│   ├── SoilMonitoring.jsx
│   ├── WeatherMonitoring.jsx
│   ├── Irrigation.jsx
│   ├── Fertilizer.jsx
│   ├── PestDetection.jsx
│   ├── DiseaseDetection.jsx
│   ├── CropYieldPrediction.jsx
│   └── MarketPriceTracking.jsx
├── services/                   # In-memory mock data services (no backend calls)
│   ├── farmerService.js
│   ├── cropService.js
│   └── weatherService.js
├── App.jsx                     # Routing (auth) + tab-based dashboard
├── main.jsx                    # Router + Toast provider setup
└── index.css                   # Single shared design system for all 10 pages
```

## Notes on integration

- Pages 1–5 (previously two separate projects, TypeScript + Tailwind) were
  rewritten in plain JSX using the same CSS variables, `glass-card`,
  `btn`, `badge`, `form-input`, and table/modal/toast styles as Pages 6–10,
  so the whole app now reads as one consistent product.
- Soil Monitoring (module 4) was not present in either uploaded project and
  was built from scratch to match the master design.
- All data is mocked in-memory (`src/services/*.js`) — no backend/API calls
  are made, so the app runs standalone.
- All visible prices use the ₹ symbol; JavaScript template-literal syntax
  (e.g. `${variable}`) was left untouched.
