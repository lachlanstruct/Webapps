# Structural Tools — Cantilever Wall & Footing Overturning Calculator

A professional, responsive, client-side web application for checking the overturning stability of a cantilever wall and rectangular concrete footing under uniform horizontal wind pressure.

This tool is designed as the foundation module of a broader **Structural Tools** web suite, featuring a modular architecture, dynamic SVG engineering graphics, transparent equation substitution, full offline PWA capabilities, and Vitest-verified pure deterministic calculation routines.

---

## 1. Engineering Basis

All calculations are evaluated on a **1.0 metre continuous strip** perpendicular to the cross-section plane ($L = 1.0\text{ m}$).

### Variable Definitions & Units

| Variable | Description | Standard SI Unit |
| :--- | :--- | :--- |
| $p$ | Characteristic uniform wind pressure | $\text{kPa}$ ($\text{kN/m}^2$) |
| $C$ | Aerodynamic / pressure multiplier coefficient | Dimensionless |
| $p_d$ | Design wind pressure ($p \times C$) | $\text{kPa}$ ($\text{kN/m}^2$) |
| $w$ | Uniform horizontal line load per metre run ($p_d \times 1\text{ m}$) | $\text{kN/m}$ |
| $z$ | Wall height measured from **top of footing** to top of wall | $\text{m}$ |
| $t$ | Wall thickness | $\text{m}$ |
| $B$ | Footing width perpendicular to the wall run | $\text{m}$ |
| $D$ | Footing depth measured vertically from top to bottom of footing | $\text{m}$ |
| $x_{\text{wall}}$ | Wall centroid coordinate from **left footing edge** | $\text{m}$ |
| $\gamma_f$ | Concrete footing unit weight (default: $24.0\text{ kN/m}^3$) | $\text{kN/m}^3$ |
| $\gamma_w$ | Wall material unit weight (default: $24.0\text{ kN/m}^3$) | $\text{kN/m}^3$ |
| $H$ | Total horizontal resultant wind force ($w \times z$) | $\text{kN/m}$ |
| $M_{\text{wall}}$ | Cantilever bending moment at wall base ($w z^2 / 2$) | $\text{kNm/m}$ |
| $M_{HD}$ | Shear transfer moment through footing depth ($H \times D$) | $\text{kNm/m}$ |
| $M_{OT}$ | Wind overturning moment about active bottom toe | $\text{kNm/m}$ |
| $W_f$ | Footing self-weight ($\gamma_f B D$) | $\text{kN/m}$ |
| $M_{R,f}$ | Footing resisting moment about active bottom toe | $\text{kNm/m}$ |
| $W_{\text{wall}}$ | Wall self-weight ($\gamma_w t z$) | $\text{kN/m}$ |
| $L_{\text{wall}}$ | Lever arm from wall centroid to active overturning toe | $\text{m}$ |
| $M_{R,\text{wall}}$ | Wall resisting moment about active bottom toe | $\text{kNm/m}$ |
| $M_R$ | Total resisting moment ($M_{R,f} + M_{R,\text{wall}}$) | $\text{kNm/m}$ |
| $FS_{OT}$ | Overturning stability ratio ($M_R / M_{OT}$) | Ratio |

---

### Governing Mathematical Equations

#### 1. Wind Line Load
$$p_d = p \times C$$
$$w = p_d \times 1.0\text{ m} = p_d\text{ (kN/m per metre run)}$$

#### 2. Horizontal Resultant Force
$$H = w \times z$$
The resultant force acts horizontally at a height of $\frac{z}{2}$ above the top of the footing.

#### 3. Overturning Moment About Footing Base ($M_{OT}$)
Overturning is checked about the **bottom of the footing at the active overturning toe**. The vertical lever arm from the bottom of the footing to the wind line of action is $D + \frac{z}{2}$.
$$M_{OT} = H \times \left(D + \frac{z}{2}\right) = w z \left(D + \frac{z}{2}\right)$$

##### Shear & Moment Transfer Decomposition
The overturning moment is identically equal to the sum of the cantilever base moment and the moment produced by transferring horizontal base shear $H$ through footing depth $D$:
$$M_{\text{wall}} = \frac{w z^2}{2}$$
$$M_{HD} = H \times D$$
$$M_{OT} = M_{\text{wall}} + M_{HD}$$

#### 4. Footing Self-Weight & Resisting Moment ($M_{R,f}$)
$$W_f = \gamma_f \times B \times D \times 1.0\text{ m}$$
Since the footing is rectangular, its centroid is located at $B / 2$ from either edge:
$$M_{R,f} = W_f \times \frac{B}{2} = \frac{\gamma_f D B^2}{2}$$

#### 5. Wall Self-Weight & Resisting Moment ($M_{R,\text{wall}}$)
When enabled:
$$W_{\text{wall}} = \gamma_w \times t \times z \times 1.0\text{ m}$$

The resisting lever arm $L_{\text{wall}}$ depends on wind direction:
- **Left to Right Wind ($\rightarrow$):** Active overturning toe is the **Right edge** ($x = B$).
  $$L_{\text{wall}} = B - x_{\text{wall}}$$
- **Right to Left Wind ($\leftarrow$):** Active overturning toe is the **Left edge** ($x = 0$).
  $$L_{\text{wall}} = x_{\text{wall}}$$

Wall resisting moment:
$$M_{R,\text{wall}} = W_{\text{wall}} \times L_{\text{wall}}$$

When wall self-weight is disabled: $W_{\text{wall}} = 0$ and $M_{R,\text{wall}} = 0$.

#### 6. Total Resisting Moment ($M_R$)
$$M_R = M_{R,f} + M_{R,\text{wall}}$$

#### 7. Overturning Factor of Safety Ratio ($FS_{OT}$)
$$FS_{OT} = \frac{M_R}{M_{OT}}$$

If the user enters a required minimum ratio $FS_{\text{req}}$ (e.g. $1.50$), the tool assesses:
- $\text{PASS}$ if $FS_{OT} \ge FS_{\text{req}}$
- $\text{FAIL}$ if $FS_{OT} < FS_{\text{req}}$
- If no ratio is entered, the ratio is presented neutrally without regulatory pass/fail assertions.

---

## 2. Project Architecture & Extensibility

```
├── public/
│   ├── icon.svg                      # Scalable brand vector icon
│   ├── pwa-192x192.png               # PWA standard manifest icon
│   ├── pwa-512x512.png               # PWA high-res manifest icon
│   ├── pwa-maskable-512x512.png      # Android adaptive maskable icon
│   └── apple-touch-icon.png          # iOS Safari touch icon
├── src/
│   ├── calculations/                 # PURE DETERMINISTIC ENGINES (No UI / DOM)
│   │   ├── overturning.ts            # Mathematical equations & input validation
│   │   └── overturning.test.ts       # 11 Vitest automated test suites
│   ├── components/
│   │   ├── calculators/
│   │   │   └── cantilever-wall/
│   │   │       ├── CantileverWallCalculator.tsx  # Top calculator container & inputs
│   │   │       ├── EngineeringDiagram.tsx        # Dynamic SVG elevation & FBD
│   │   │       ├── ResultSummaryCard.tsx         # Metric cards & copy summary
│   │   │       ├── CalculationDetails.tsx        # Transparent substituted equations
│   │   │       └── QuickResultsStickyBar.tsx     # Responsive mobile sticky bar
│   │   ├── common/
│   │   │   ├── NumberInput.tsx       # Decimal keyboard input with validation
│   │   │   ├── UnitToggle.tsx        # Metres (m) / Millimetres (mm) switch
│   │   │   ├── PWAInstallButton.tsx  # In-app PWA install trigger & iOS guide
│   │   │   ├── OfflineIndicator.tsx  # Network status toast
│   │   │   └── ThemeToggle.tsx       # Dark / Light mode switcher
│   │   └── layout/
│   │       ├── AppLayout.tsx         # Multi-calculator layout shell
│   │       ├── Sidebar.tsx           # Category navigation (Foundations, Beams, Loads)
│   │       ├── Header.tsx            # App bar & quick controls
│   │       └── Footer.tsx            # Engineering disclaimer & versioning
│   ├── hooks/
│   │   ├── usePWAInstall.ts          # beforeinstallprompt & standalone detection
│   │   ├── useOnlineStatus.ts        # window online/offline listeners
│   │   └── useTheme.ts               # Theme state & localStorage persistence
│   ├── types/
│   │   └── navigation.ts             # Registry of calculators & categories
│   ├── App.tsx                       # Root view router
│   ├── main.tsx                      # Vite React entry point
│   └── index.css                     # Tailwind CSS v4 entry
├── vite.config.ts                    # Vite + VitePWA + Base path configuration
├── tsconfig.json                     # Strict TypeScript configuration
└── package.json
```

### Adding New Calculators Later

To add a new calculator (e.g. `Beam Reactions` or `Tributary Area`):

1. **Create the pure calculation engine**:
   Create `src/calculations/beam-reactions.ts` and `src/calculations/beam-reactions.test.ts`. Ensure all formulas are pure functions with unit tests.
2. **Create the UI components**:
   Create `src/components/calculators/beam-reactions/BeamReactionsCalculator.tsx` using the reusable `NumberInput`, `ResultSummaryCard`, and layout primitives.
3. **Register the tool in navigation**:
   In `src/types/navigation.ts`, change the item's `status` from `'coming_soon'` to `'active'`.
4. **Wire in `src/App.tsx`**:
   Add the condition in `App.tsx` to render the new component when `activeCalcId === 'beam-reactions'`.

---

## 3. Running Locally

### Prerequisites
- Node.js 18+ (tested on Node 22)
- npm or pnpm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### Run Automated Unit Tests
```bash
npm run test
```
Executes all 11 Vitest test suites checking the default specification case, concrete unit weight shifts, centred and edge wall positions, wind direction reversals, and the $M_{OT}$ shear transfer equivalence identity.

### Production Build & Linting
```bash
npm run lint
npm run build
```

---

## 4. Free Static Deployment

This app runs entirely in the user's browser with zero backend requirements.

### A. Cloudflare Pages
1. Push your repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository.
4. Set the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Cloudflare Pages provides free global CDN hosting, SSL, and instant rollbacks.

### B. GitHub Pages
The project uses `base: './'` in `vite.config.ts`, ensuring that all asset references resolve properly even when served under a sub-path such as `https://<username>.github.io/<repo-name>/`.

1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment**, select **GitHub Actions**.
3. Create a workflow file at `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 5. Progressive Web App (PWA) & Offline Use

- **Offline-Ready**: All calculations and assets are precached by the service worker via Workbox. No internet connection is needed once cached.
- **Home Screen Install**: Android and Desktop browsers can install the application via the in-app **Install App** button.
- **iOS Safari Guide**: Provides step-by-step instructions for saving to the iOS home screen via the Share sheet.
- **Status Indicator**: An unobtrusive floating badge notifies the user if connection drops while reassuring them that calculations remain active.

---

## 6. Engineering Disclaimer

*Engineering calculation aid only. Verify inputs, assumptions, load combinations and applicable design standards independently.*
