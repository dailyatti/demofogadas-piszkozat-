async function main() {
  const url = "https://demofogadas.netlify.app/api/llm/tips";
  const apiKey = "7fec62d4274e4be05324005aa94764dc2b11a68d83249551eaf4a8532d5f4dcd";
  
  const payload = {
    "options": {
      "defaultTipster": "Antigravity",
      "fractionalKelly": 0.25,
      "maxStake": 3,
      "minStake": 0.25,
      "bankrollUnits": 100,
      "defaultDate": "2026-05-28T12:00:00+02:00"
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
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Detroit Tigers vs Los Angeles Angels - Detroit Tigers ML",
        "odds": 1.76,
        "modelProbability": 0.59,
        "minimumOdds": 1.72,
        "sourceSummary": "Grok value pick + pitching matchup + market odds check",
        "rationale": "Jack Flaherty at home and a stronger Tigers pitching matchup. Grok estimate p=59.0%, breakeven=56.82%, EV=+3.84%."
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Detroit Tigers vs Los Angeles Angels - Detroit Tigers -1.5 Runline",
        "odds": 1.95,
        "modelProbability": 0.535,
        "minimumOdds": 1.89,
        "sourceSummary": "Grok value pick + runline market + home favorite profile",
        "rationale": "Runline value on a strong home favorite with pitching edge. Grok estimate p=53.5%, breakeven=51.28%, EV=+4.33%."
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Minnesota Twins vs Chicago White Sox - Minnesota Twins ML",
        "odds": 1.88,
        "modelProbability": 0.56,
        "minimumOdds": 1.81,
        "sourceSummary": "Grok value pick + offensive matchup + underdog price",
        "rationale": "Twins offense profile creates underdog value. Grok estimate p=56.0%, breakeven=53.19%, EV=+5.28%."
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Chicago White Sox vs Minnesota Twins - Chicago White Sox ML",
        "odds": 1.78,
        "modelProbability": 0.585,
        "minimumOdds": 1.73,
        "sourceSummary": "Grok value pick + home favorite angle + market odds check",
        "rationale": "Home favorite value on the White Sox side per Grok's matchup read. Grok estimate p=58.5%, breakeven=56.18%, EV=+4.13%."
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Atlanta Braves vs Boston Red Sox - Atlanta Braves ML",
        "odds": 1.80,
        "modelProbability": 0.585,
        "minimumOdds": 1.73,
        "sourceSummary": "Grok value pick + pitching edge + favorite price",
        "rationale": "Braves pitching advantage makes the favorite price playable. Grok estimate p=58.5%, breakeven=55.56%, EV=+5.30%."
      },
      {
        "tipster": "Grok",
        "sport": "Baseball - MLB",
        "team": "Detroit Tigers vs Los Angeles Angels - Over 8.5 Runs",
        "odds": 1.90,
        "modelProbability": 0.55,
        "minimumOdds": 1.84,
        "sourceSummary": "Grok value pick + bullpen weakness + Comerica Park total",
        "rationale": "Weaker bullpen setup and game environment support the over. Grok estimate p=55.0%, breakeven=52.63%, EV=+4.50%."
      },
      {
        "tipster": "Grok",
        "sport": "Tenisz - Roland Garros",
        "team": "Jannik Sinner vs Juan Manuel Cerundolo - Jannik Sinner -1.5 Sets",
        "odds": 1.85,
        "modelProbability": 0.57,
        "minimumOdds": 1.77,
        "sourceSummary": "Grok value pick + clay form + set handicap market",
        "rationale": "Sinner's clay dominance supports the set handicap. Grok estimate p=57.0%, breakeven=54.05%, EV=+5.45%."
      },
      {
        "tipster": "Grok",
        "sport": "Tenisz - Roland Garros",
        "team": "Aryna Sabalenka match - Aryna Sabalenka -1.5 Sets",
        "odds": 1.80,
        "modelProbability": 0.58,
        "minimumOdds": 1.75,
        "sourceSummary": "Grok value pick + WTA favorite profile + set spread",
        "rationale": "Strong favorite profile in a women's draw matchup. Grok estimate p=58.0%, breakeven=55.56%, EV=+4.40%."
      },
      {
        "tipster": "Grok",
        "sport": "Tenisz - Roland Garros",
        "team": "Hurkacz vs Tiafoe / Berrettini vs Rinderknech - Over 2.5 Sets",
        "odds": 2.05,
        "modelProbability": 0.51,
        "minimumOdds": 1.99,
        "sourceSummary": "Grok value pick + clay matchup volatility + sets total",
        "rationale": "Clay matchup dynamics create value on a longer match. Grok estimate p=51.0%, breakeven=48.78%, EV=+4.55%."
      },
      {
        "tipster": "Grok",
        "sport": "Tenisz - Roland Garros",
        "team": "Nuno Borges vs Miomir Kecmanovic - Nuno Borges +1.5 Sets",
        "odds": 1.92,
        "modelProbability": 0.545,
        "minimumOdds": 1.85,
        "sourceSummary": "Grok value pick + clay specialist underdog/fight angle",
        "rationale": "Borges profiles as a live clay underdog on the set spread. Grok estimate p=54.5%, breakeven=52.08%, EV=+4.64%."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Elsa Jacquemot +7.5 game handicap vs Sabalenka",
        "odds": 2.04,
        "modelProbability": 0.636,
        "minimumOdds": 1.59,
        "sourceSummary": "Dimers: +14.6% edge, 63.6% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Sabalenka vs Jacquemot Over 16.5 games",
        "odds": 1.91,
        "modelProbability": 0.646,
        "minimumOdds": 1.56,
        "sourceSummary": "Dimers: +12.3% edge, 64.6% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Gauff vs Sherif Over 17.5 games",
        "odds": 1.95,
        "modelProbability": 0.57,
        "minimumOdds": 1.77,
        "sourceSummary": "Dimers: +5.8% edge, 57% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Luciano Darderi -5.5 games vs Comesana",
        "odds": 1.91,
        "modelProbability": 0.566,
        "minimumOdds": 1.79,
        "sourceSummary": "Dimers: +4.2% edge, 56.6% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Kasatkina vs Bandecchi Over 18.5 games",
        "odds": 1.85,
        "modelProbability": 0.583,
        "minimumOdds": 1.74,
        "sourceSummary": "Dimers: +4.2% edge, 58.3% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Auger-Aliassime vs Burruchaga Under 37.5 games",
        "odds": 1.85,
        "modelProbability": 0.577,
        "minimumOdds": 1.75,
        "sourceSummary": "Dimers: +3.5% edge, 57.7% valoszinuseg",
        "rationale": "Mai EV shortlist pick. Fogadas elott friss odds ellenorzes szukseges, mert armozgassal az EV eltunhet."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Tenisz",
        "team": "Frances Tiafoe ML vs Hurkacz",
        "odds": 2.25,
        "modelProbability": 0.4635,
        "minimumOdds": 2.18,
        "sourceSummary": "OddsChecker + Matchstat: Tiafoe +125, kb. 46.35% implied esely",
        "rationale": "Kis line-shopping value a mai EV shortlistben. Fogadas elott friss odds ellenorzes szukseges."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "FK Atyrau ML vs Tobol Kostanay",
        "odds": 3.25,
        "modelProbability": 0.51,
        "minimumOdds": 1.98,
        "sourceSummary": "Forebet: 51% hazai esely, Kelly 29% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "Quwa Al Jawiya ML vs Naft Maysan",
        "odds": 2.00,
        "modelProbability": 0.66,
        "minimumOdds": 1.53,
        "sourceSummary": "Forebet: 66% vendeg esely, Kelly 32% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "Assyriska FF ML vs Vasalunds IF",
        "odds": 2.75,
        "modelProbability": 0.64,
        "minimumOdds": 1.58,
        "sourceSummary": "Forebet: 64% hazai esely, Kelly 43% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "Casa Pia vs Uniao Torreense Draw",
        "odds": 3.00,
        "modelProbability": 0.50,
        "minimumOdds": 2.02,
        "sourceSummary": "Forebet: 50% dontetlen esely, Kelly 25% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "JJK Jyvaskyla vs OLS Oulu Draw",
        "odds": 3.80,
        "modelProbability": 0.44,
        "minimumOdds": 2.30,
        "sourceSummary": "Forebet: 44% dontetlen esely, Kelly 24% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "Ordabasy vs Kairat Draw",
        "odds": 3.20,
        "modelProbability": 0.46,
        "minimumOdds": 2.20,
        "sourceSummary": "Forebet: 46% dontetlen esely, Kelly 21% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "FC Jazz vs SalPa Salo Draw",
        "odds": 3.70,
        "modelProbability": 0.39,
        "minimumOdds": 2.59,
        "sourceSummary": "Forebet: 39% dontetlen esely, Kelly 16% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "Parma U19 ML vs Fiorentina U19",
        "odds": 3.60,
        "modelProbability": 0.39,
        "minimumOdds": 2.59,
        "sourceSummary": "Forebet: 39% vendeg esely, Kelly 16% jel",
        "rationale": "Mai EV shortlist pick. A megadott shortlist szovege szerint rogzitve."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Foci",
        "team": "FK Okzhetpes vs FK Aktobe Draw",
        "odds": 3.10,
        "modelProbability": 0.39,
        "minimumOdds": 2.59,
        "sourceSummary": "Forebet: 39% dontetlen esely, Kelly 10% jel",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Baseball - MLB",
        "team": "Angels vs Tigers Over 9.0 runs",
        "odds": 2.00,
        "modelProbability": 0.53,
        "minimumOdds": 1.91,
        "sourceSummary": "MLB probable pitchers: Rodriguez 10.61 ERA, Flaherty 5.94 ERA; over odds kb. 2.00",
        "rationale": "Mindket kezdodobonal magas ERA szerepelt a shortlistben. Fogadas elott friss odds es pitcher ellenorzes szukseges."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Baseball - MLB",
        "team": "Chicago White Sox -1.5 vs Twins",
        "odds": 2.58,
        "modelProbability": 0.42,
        "minimumOdds": 2.41,
        "sourceSummary": "MLB probable pitchers: Davis Martin 7-1, 2.04 ERA; runline 2.55+ korul",
        "rationale": "Runline value pick a mai EV shortlistbol. Fogadas elott friss odds es pitcher ellenorzes szukseges."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Baseball - MLB",
        "team": "Atlanta Braves -1.5 vs Red Sox",
        "odds": 2.25,
        "modelProbability": 0.47,
        "minimumOdds": 2.15,
        "sourceSummary": "MLB probable pitchers: Chris Sale 7-3, 1.89 ERA; Braves runline kb. 2.25",
        "rationale": "Runline value pick a mai EV shortlistbol. Fogadas elott friss odds es pitcher ellenorzes szukseges."
      },
      {
        "tipster": "ChatGPT Extended",
        "sport": "Kosarlabda",
        "team": "Bahcesehir Koleji ML vs Trabzonspor",
        "odds": 2.12,
        "modelProbability": 0.53,
        "minimumOdds": 1.91,
        "sourceSummary": "Forebet: Bahcesehirt favorizalja 53%-kal; odds kb. 2.12",
        "rationale": "Mai EV shortlist pick. Szingli tipp 0.25-0.5 unit merettel."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Baseball - MLB",
        "team": "Minnesota Twins @ Chicago White Sox - Chicago White Sox Moneyline",
        "odds": 1.88,
        "modelProbability": 0.5747,
        "minimumOdds": 1.74,
        "date": "2026-05-28T20:10:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 1.88, modell odds 1.74, EV +8.0%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 57.47%, piaci breakeven 53.19%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Baseball - MLB",
        "team": "Chicago Cubs @ Pittsburgh Pirates - Pittsburgh Pirates -1.5 Run Line",
        "odds": 2.30,
        "modelProbability": 0.4975,
        "minimumOdds": 2.01,
        "date": "2026-05-29T00:40:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.30, modell odds 2.01, EV +14.4%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 49.75%, piaci breakeven 43.48%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Baseball - MLB",
        "team": "Atlanta Braves @ Boston Red Sox - Over 7.0 Runs",
        "odds": 1.91,
        "modelProbability": 0.5650,
        "minimumOdds": 1.77,
        "date": "2026-05-28T22:10:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 1.91, modell odds 1.77, EV +7.9%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 56.50%, piaci breakeven 52.36%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Baseball - MLB",
        "team": "Toronto Blue Jays @ Baltimore Orioles - Over 8.5 Runs",
        "odds": 1.91,
        "modelProbability": 0.5556,
        "minimumOdds": 1.80,
        "date": "2026-05-29T00:35:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 1.91, modell odds 1.80, EV +6.1%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 55.56%, piaci breakeven 52.36%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Baseball - MLB",
        "team": "Texas Rangers @ Houston Astros - Houston Astros Moneyline",
        "odds": 2.28,
        "modelProbability": 0.4808,
        "minimumOdds": 2.08,
        "date": "2026-05-29T02:05:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.28, modell odds 2.08, EV +9.6%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 48.08%, piaci breakeven 43.86%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Arthur Rinderknech vs Matteo Berrettini - Rinderknech wins and both players win a set",
        "odds": 2.75,
        "modelProbability": 0.40,
        "minimumOdds": 2.50,
        "date": "2026-05-28T14:30:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.75, modell odds 2.50, EV +10.0%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 40.00%, piaci breakeven 36.36%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Iva Jovic vs Emma Navarro - Both players win at least one set",
        "odds": 2.20,
        "modelProbability": 0.5128,
        "minimumOdds": 1.95,
        "date": "2026-05-28T15:30:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.20, modell odds 1.95, EV +12.8%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 51.28%, piaci breakeven 45.45%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Moise Kouame vs Adolfo Daniel Vallejo - Moise Kouame Moneyline",
        "odds": 3.49,
        "modelProbability": 0.3509,
        "minimumOdds": 2.85,
        "date": "2026-05-28T16:00:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 3.49, modell odds 2.85, EV +22.5%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 35.09%, piaci breakeven 28.65%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Diane Parry vs Ann Li - Diane Parry Moneyline",
        "odds": 2.98,
        "modelProbability": 0.4255,
        "minimumOdds": 2.35,
        "date": "2026-05-28T17:30:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.98, modell odds 2.35, EV +26.8%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 42.55%, piaci breakeven 33.56%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Jan-Lennard Struff vs Jaime Faria - Jan-Lennard Struff Moneyline",
        "odds": 2.50,
        "modelProbability": 0.4651,
        "minimumOdds": 2.15,
        "date": "2026-05-28T14:00:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 2.50, modell odds 2.15, EV +16.3%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 46.51%, piaci breakeven 40.00%."
      },
      {
        "tipster": "Gemini DeepResearch",
        "sport": "Tenisz - Roland Garros",
        "team": "Aryna Sabalenka vs Elsa Jacquemot - Aryna Sabalenka -7.5 Games Handicap",
        "odds": 1.80,
        "modelProbability": 0.6061,
        "minimumOdds": 1.65,
        "date": "2026-05-28T15:00:00+02:00",
        "sourceSummary": "Gemini DeepResearch: piaci odds 1.80, modell odds 1.65, EV +9.1%",
        "rationale": "Gemini DeepResearch value pick. Modell odds alapjan becsult valoszinuseg 60.61%, piaci breakeven 55.56%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Amerikai Foci - UFL",
        "team": "Dallas Renegades at St. Louis Battlehawks - St. Louis Battlehawks -6.5",
        "odds": 1.85,
        "modelProbability": 0.58,
        "minimumOdds": 1.72,
        "date": "2026-05-30T02:00:00+02:00",
        "sourceSummary": "UFL Week 10 regular season matchup at The Dome at America's Center, St. Louis.",
        "rationale": "Battlehawks are strong at home, expected ELO p=58.0%, breakeven=54.05%, EV=+7.3%. Recommended Kelly 8.5% stake. Antigravity value pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Amerikai Foci - UFL",
        "team": "Houston Gamblers at Birmingham Stallions - Birmingham Stallions -9.5",
        "odds": 1.95,
        "modelProbability": 0.54,
        "minimumOdds": 1.85,
        "date": "2026-05-30T21:00:00+02:00",
        "sourceSummary": "UFL Week 10 regular season matchup at Protective Stadium, Birmingham.",
        "rationale": "Stallions are league powerhouse, model projects cover ELO p=54.0%, breakeven=51.28%, EV=+5.3%. Recommended Kelly 5.5% stake. Antigravity value pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Amerikai Foci - UFL",
        "team": "Orlando Storm at DC Defenders - Over 44.5 Points",
        "odds": 1.90,
        "modelProbability": 0.55,
        "minimumOdds": 1.82,
        "date": "2026-05-31T18:00:00+02:00",
        "sourceSummary": "UFL Week 10 regular season matchup at Audi Field, Washington D.C.",
        "rationale": "Both defenses show fatigue, points projection 47.5, model p=55.0%, breakeven=52.63%, EV=+4.5%. Recommended Kelly 5.0% stake. Antigravity value pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Amerikai Foci - UFL",
        "team": "Louisville Kings at Columbus Aviators - Columbus Aviators Moneyline",
        "odds": 2.10,
        "modelProbability": 0.51,
        "minimumOdds": 1.96,
        "date": "2026-06-01T00:00:00+02:00",
        "sourceSummary": "UFL Week 10 regular season matchup at Historic Crew Stadium, Columbus.",
        "rationale": "Columbus has home turf advantage and value pricing, model p=51.0%, breakeven=47.62%, EV=+7.1%. Recommended Kelly 6.5% stake. Antigravity value pick."
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
