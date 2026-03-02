# Working with AI

Interactive quiz website and research data for measuring the applicability of generative AI to occupations, based on the paper ["Working with AI"](https://arxiv.org/abs/2507.07935) by Tomlinson et al. (Microsoft Research, 2025).

## Overview

- **Research data**: CSV files at the repository root containing AI applicability scores for 787 US occupations (SOC codes), derived from Bing Copilot consumer usage data (Jan–Sep 2024)
- **Interactive website**: A vanilla HTML/CSS/JS single-page application under `website/` that presents a 10-question quiz to estimate how applicable AI is to a user's occupation

## Project Structure

```
├── website/                    # SPA quiz website (deployed to GitHub Pages)
│   ├── index.html              # Main HTML shell with three screens
│   ├── package.json            # Node.js project config (Vite dev dependency)
│   ├── vite.config.js          # Vite configuration
│   ├── css/
│   │   └── styles.css          # All styles, animations, responsive rules
│   └── js/
│       ├── app.js              # SPA logic: navigation, transitions, score animation
│       ├── questions.js        # 10 quiz questions, weights, scoring formula
│       └── occupations.js      # 787 occupation scores (auto-generated from CSV)
├── ai_applicability_scores.csv # Final AI applicability score per SOC occupation
├── iwa_metrics.csv             # Per-IWA metrics (share, completion, impact)
├── soc_metrics.csv             # IWA metrics aggregated to occupation level
├── soc_to_iwas.csv             # SOC → IWA mapping
├── soc_iwa_weights.csv         # O*NET relevance/importance weights
├── soc_iwa_nonphysical_weights.csv  # Same, zeroing out physical tasks
├── physical_tasks.csv          # Binary physical/non-physical task classification
└── .github/workflows/deploy.yml # GitHub Actions: deploy website/ to GitHub Pages
```

## Key Technologies and Frameworks

- **Vanilla HTML5 + CSS3 + ES Modules** — no runtime framework dependencies
- **Vite** for dev server (HMR) and production builds
- **Google Fonts**: Plus Jakarta Sans (display) + DM Sans (body)
- **CSS custom properties** for theming; CSS animations for transitions and effects
- **GitHub Actions** with Vite build + `actions/deploy-pages@v4` for deployment

## Development Workflow

### Local Development
```bash
cd website
npm install           # first time only
npm run dev           # start Vite dev server with HMR
```
Open `http://localhost:5173`. Vite provides hot module replacement — edits reflect instantly.

### Production Build
```bash
cd website
npm run build         # outputs to website/dist/
npm run preview       # preview the production build locally
```

### Regenerating Occupation Data
If `ai_applicability_scores.csv` is updated, regenerate the JS data file:
```bash
python3 -c "
import csv
rows = []
with open('ai_applicability_scores.csv') as f:
    for r in csv.DictReader(f):
        rows.append((r['SOC Code'], r['title'], round(float(r['ai_applicability_score']), 4)))
rows.sort(key=lambda x: x[2], reverse=True)
lines = ['// Auto-generated from ai_applicability_scores.csv',
         '// AI Applicability Scores for {} SOC occupations'.format(len(rows)),
         '// Score range: 0.0 (lowest) to ~0.49 (highest)',
         'export const occupations = [']
for soc, title, score in rows:
    lines.append('  {{soc:\"{}\",title:\"{}\",score:{}}},'.format(soc, title, score))
lines += ['];', '']
print('\n'.join(lines))
" > website/js/occupations.js
```

### Deployment
Pushes to `main` that modify `website/**` auto-deploy to GitHub Pages via the workflow at `.github/workflows/deploy.yml`. The workflow runs `npm ci && npm run build` then deploys `website/dist/`. Manual deploys can be triggered from the Actions tab.

## How Scoring Works

### Paper's Methodology
The paper computes an **AI Applicability Score** per occupation by:
1. Classifying Bing Copilot conversations into IWAs (Intermediate Work Activities)
2. Computing per-IWA metrics: share, completion rate, impact scope
3. Aggregating to occupations using O*NET importance weights
4. Averaging user-side (full weights) and AI-side (non-physical weights) scores

Score range: 0.0 (orderlies, physical roles) to ~0.49 (interpreters, writers).

### Quiz Approximation
The quiz in `website/js/questions.js` estimates a similar score from 10 work-characteristic questions:
- Each question maps to a dimension (writing, research, physical labor, etc.)
- Positive-weight questions: higher answer → higher AI applicability
- Inverse questions (physical labor, precision handwork): higher answer → lower score
- Final score is normalized to 0–0.50 range to match the paper's scale, displayed as 0–100

To adjust questions or weights, edit `website/js/questions.js`. Key properties:
- `weight`: contribution magnitude (0–1)
- `inverse`: if true, high answer reduces the score
- `computeScore()`: the aggregation formula
- `getScoreLabel()`: threshold-based labeling (Very Low → Very High)
- `getTimelineEstimate()`: maps score to estimated AI transformation year range

### Timeline Estimation
The result screen includes an estimated replacement timeline, based on:
- **Metaculus community forecasts** (~1,700 forecasters, continuously updated):
  Weakly general AI expected by ~2028, general AI by ~2033
  (https://metaculus.com/questions/3479/ and /5121/)
- The quiz score (0–0.50) is interpolated within these forecasted timelines
- Higher applicability → sooner estimated transformation; lower → later
- Displayed as a range (optimistic / median / conservative years)
- Includes a clear caveat that this is speculative, not a prediction of job displacement

To adjust timeline estimates, edit `getTimelineEstimate()` in `website/js/questions.js`.

## Coding Guidelines

- **Vite** for dev/build tooling — keep the SPA as vanilla HTML/CSS/JS (no runtime frameworks)
- **CSS custom properties** in `:root` for all colors, fonts, spacing, radii
- **Mobile-first** responsive design with breakpoints at 480px and 768px
- **`prefers-reduced-motion`** media query disables animations
- **ES modules** (`type="module"`) for JS — import/export, no bundler
- **Semantic HTML** with ARIA labels on screen sections
- Keep occupation data sorted by score descending in `occupations.js`

## Security Considerations

- No server-side code, no API calls, no user data collection
- All data is embedded client-side; no external requests except Google Fonts
- LocalStorage used only for saving quiz progress (answers array + question index)

## Pull Request Guidelines

- Test the website with `cd website && npm run dev` (or `npm run build && npm run preview`)
- Verify responsive layout on mobile viewport (Chrome DevTools)
- Ensure the full quiz flow works: landing → 10 questions → result with gauge animation → timeline → occupation explorer
- Validate GitHub Actions YAML syntax if modifying the workflow
