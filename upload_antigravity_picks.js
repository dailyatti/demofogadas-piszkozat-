async function main() {
  const url = "https://demofogadas.netlify.app/api/llm/tips";
  const apiKey = "7fec62d4274e4be05324005aa94764dc2b11a68d83249551eaf4a8532d5f4dcd";
  
  const payload = {
    "options": {
      "defaultTipster": "Antigravity",
      "fractionalKelly": 0.25,
      "maxStake": 3,
      "minStake": 0.25,
      "bankrollUnits": 100
    },
    "picks": [
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "New York Yankees vs Boston Red Sox - Boston Red Sox ML",
        "odds": 1.91,
        "modelProbability": 0.56,
        "minimumOdds": 1.81,
        "sourceSummary": "AI ELO Blend + Pitcher Edge (B. Bello RHP vs N. Cortes LHP) + Tippmixpro baseline",
        "rationale": "Yankees have Cortes LHP vs Bello RHP at Fenway. Red Sox ELO blended p=56.0%, breakeven=52.36%, EV=+6.96%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Los Angeles Dodgers vs San Francisco Giants - Los Angeles Dodgers ML",
        "odds": 1.80,
        "modelProbability": 0.59,
        "minimumOdds": 1.72,
        "sourceSummary": "Glasnow RHP vs Webb RHP + Dodgers Run-Diff model + ELO blend",
        "rationale": "Glasnow RHP gives Dodgers a solid pitcher edge over Logan Webb. True prob p=59.0%, breakeven=55.56%, EV=+6.20%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Chicago Cubs vs St. Louis Cardinals - Chicago Cubs ML",
        "odds": 1.95,
        "modelProbability": 0.54,
        "minimumOdds": 1.87,
        "sourceSummary": "J. Steele LHP vs M. Mikolas RHP + FIP mismatch model",
        "rationale": "Justin Steele LHP holds a strong FIP edge over Mikolas RHP. Cubs true prob p=54.0%, breakeven=51.28%, EV=+5.30%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Houston Astros vs Seattle Mariners - Seattle Mariners ML",
        "odds": 1.77,
        "modelProbability": 0.60,
        "minimumOdds": 1.69,
        "sourceSummary": "G. Kirby RHP vs F. Valdez LHP + T-Mobile Park factor + ELO blend",
        "rationale": "Kirby at home has a huge park-adjusted FIP edge. True prob p=60.0%, breakeven=56.50%, EV=+6.20%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Atlanta Braves vs New York Mets - Atlanta Braves ML",
        "odds": 1.83,
        "modelProbability": 0.58,
        "minimumOdds": 1.75,
        "sourceSummary": "M. Fried LHP vs K. Senga RHP + Mets LHP matchup model + ELO blend",
        "rationale": "Max Fried LHP exploits Mets high K% vs lefties. Braves true prob p=58.0%, breakeven=54.64%, EV=+6.14%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Labdarúgás - La Liga",
        "team": "Girona vs Sevilla - Girona ML",
        "odds": 2.05,
        "modelProbability": 0.53,
        "minimumOdds": 1.91,
        "sourceSummary": "Poisson Model (xG: 1.7 vs 1.5) + ELO Hybrid Blend (1750 vs 1720)",
        "rationale": "Girona has strong home form and slight xG/ELO advantage. True prob p=53.0%, breakeven=48.78%, EV=+8.65%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Jannik Sinner vs Richard Gasquet - Jannik Sinner ML",
        "odds": 1.75,
        "modelProbability": 0.61,
        "minimumOdds": 1.66,
        "sourceSummary": "Clay Surface ELO (2180 vs 1920) + Serve/Return Hold-Break Model",
        "rationale": "Sinner clay court dominance and superior return game. Sinner true prob p=61.0%, breakeven=57.14%, EV=+6.75%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Aryna Sabalenka vs Paula Badosa - Aryna Sabalenka ML",
        "odds": 1.85,
        "modelProbability": 0.58,
        "minimumOdds": 1.74,
        "sourceSummary": "Clay Surface ELO (2120 vs 1950) + Serve/Return Hold-Break Model",
        "rationale": "Sabalenka hard court transition to clay with deep runs. True prob p=58.0%, breakeven=54.05%, EV=+7.30%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosarlabda - NBA",
        "team": "Boston Celtics vs Indiana Pacers - Boston Celtics +3.5 Spread",
        "odds": 1.91,
        "modelProbability": 0.565,
        "minimumOdds": 1.79,
        "sourceSummary": "NBA Spread-Implied Win Probability + Matchup Pacing Model + ELO blend",
        "rationale": "Celtics strong defense and high volume outside shooting. True prob p=56.5%, breakeven=52.36%, EV=+7.91%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosarlabda - NBA",
        "team": "Phoenix Suns vs Minnesota Timberwolves - Phoenix Suns +5.5 Spread",
        "odds": 1.91,
        "modelProbability": 0.555,
        "minimumOdds": 1.82,
        "sourceSummary": "NBA Spread-Implied Win Probability + ELO Hybrid Pacing Model",
        "rationale": "Suns high offensive ceiling and perimeter shooting depth. True prob p=55.5%, breakeven=52.36%, EV=+6.00%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosarlabda - WNBA",
        "team": "Phoenix Mercury vs Las Vegas Aces - Phoenix Mercury +7.5 Spread",
        "odds": 1.91,
        "modelProbability": 0.545,
        "minimumOdds": 1.85,
        "sourceSummary": "WNBA Spread-Implied Win Probability + Rest Advantage ELO Model",
        "rationale": "Mercury pace adjustment and home court support. True prob p=54.5%, breakeven=52.36%, EV=+4.10%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Labdarúgás - MLS",
        "team": "LAFC vs Houston Dynamo - Draw X",
        "odds": 3.90,
        "modelProbability": 0.285,
        "minimumOdds": 3.55,
        "sourceSummary": "Dixon-Coles xG Poisson model (LAFC 1.45 xG vs Houston 1.35 xG)",
        "rationale": "High variance match-up with elevated draw probability. True prob p=28.5%, breakeven=25.64%, EV=+11.15%."
      }
    ]
  };

  console.log("Uploading Antigravity picks to:", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error("HTTP error:", res.status, await res.text());
      return;
    }
    const data = await res.json();
    console.log("Upload response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
