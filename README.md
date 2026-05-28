# Demo Fogadas EV Tracker

> [!IMPORTANT]
> **API Key for this project:** `7fec62d4274e4be05324005aa94764dc2b11a68d83249551eaf4a8532d5f4dcd`

Netlify app for tracking betting picks by tipster/AI source.

## Daily Workflow

1. Keep all old picks. Never clear `/api/state` for daily imports.
2. Add your AI picks with a `tipster` value for the source model.
3. Codex also researches from zero each day. Target volume is 8-12 picks/day when the data supports it.
4. Prefer higher-value prices: avoid very short odds unless the edge is unusually strong.
5. Score locally:

```bash
npm run picks:score -- --file data/daily-picks.sample.json
```

6. Upload with merge/upsert:

```bash
$env:BTP_API_KEY="..."
npm run picks:upload -- --file picks.json
```

The upload script preserves every existing bet. It only updates a duplicate when the same `tipster + sport + market + date` already exists.

## LLM API

Base URL:

```text
https://demofogadas.netlify.app
```

Read and analyze existing picks:

```http
GET /api/llm/tips
GET /api/llm/tips?tipster=ChatGPT&outcome=pending
GET /api/llm/analyze
```

Update results from another LLM:

```http
POST /api/llm/results
x-api-key: <BTP_API_KEY>
content-type: application/json
```

Best practice is to first call `GET /api/llm/tips?outcome=pending`, then update by `id`:

```json
{
  "results": [
    {
      "id": "existing-bet-id",
      "outcome": "win",
      "resultNotes": "Final score 3-1"
    },
    {
      "tipster": "Claude",
      "sport": "Baseball - MLB",
      "team": "Yankees ML",
      "date": "2026-05-27",
      "outcome": "lose"
    }
  ]
}
```

Result updates only change `outcome` and optional result notes. They never delete bets.

Upload picks from another LLM:

```http
POST /api/llm/tips
x-api-key: <BTP_API_KEY>
content-type: application/json
```

```json
{
  "options": {
    "defaultTipster": "ChatGPT",
    "fractionalKelly": 0.25,
    "maxStake": 3
  },
  "picks": [
    {
      "tipster": "ChatGPT",
      "sport": "Baseball - MLB",
      "team": "Example Team ML",
      "odds": 2.1,
      "modelProbability": 0.52,
      "minimumOdds": 1.96,
      "sourceSummary": "AI pick + odds source + manual validation"
    }
  ]
}
```

Analyze candidate picks without saving:

```http
POST /api/llm/analyze
x-api-key: <BTP_API_KEY>
content-type: application/json
```

```json
{
  "picks": [
    {
      "tipster": "Claude",
      "sport": "Football",
      "team": "Home Team ML",
      "odds": 1.95,
      "modelProbability": 0.55
    }
  ]
}
```

## Math

```text
breakEvenProbability = 1 / decimalOdds
expectedValue = modelProbability * decimalOdds - 1
edge = modelProbability - breakEvenProbability
kellyFraction = expectedValue / (decimalOdds - 1)
stake = fractionalKelly * bankrollUnits * kellyFraction
```

## Pick Quality Rules

- Default Codex research target: 8-12 qualified picks.
- API imports have no pick-count limit. If another LLM sends 100 picks with the API key, all 100 are processed.
- Fewer picks is acceptable when the market does not provide enough positive EV.
- Avoid low odds by default. Suggested floor: `1.55`, with a stronger practical preference for `1.70+`.
- Every saved pick should include `modelProbability`, `expectedValue`, `kellyFraction`, and `minimumOdds` when possible.
- Different AI sources must use different `tipster` names so performance can be tracked separately.
- **Duplikált tippek engedélyezése:** Nem kell kitörölni a duplikált tippeket, ha például a Grok ugyanazt a tippet hozza, mint az Antigravity. Mindkettőt meg kell tartani, és külön-külön kell elszámolni, valamint ugyanúgy kell számolni a statisztikákban is!

