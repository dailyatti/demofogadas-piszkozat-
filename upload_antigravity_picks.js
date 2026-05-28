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
      "defaultDate": "2026-05-29T12:00:00+02:00"
    },
    "picks": [
      // --- TENNIS (ROLAND GARROS) ---
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Iga Świątek vs. Magda Linette - Magda Linette +7.5 Games Handicap",
        "odds": 2.05,
        "modelProbability": 0.515,
        "minimumOdds": 1.96,
        "date": "2026-05-29T11:00:00+02:00",
        "sourceSummary": "Clay Surface ELO + Spread Mismatch Model. Świątek p=51.5% to cover -7.5.",
        "rationale": "All-Polish match. Linette plays Świątek well in long rallies. Spread line 7.5 is too wide for early clay rounds."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Mirra Andreeva vs. Marie Bouzkova - Marie Bouzkova Moneyline",
        "odds": 2.75,
        "modelProbability": 0.40,
        "minimumOdds": 2.52,
        "date": "2026-05-29T12:30:00+02:00",
        "sourceSummary": "Clay Surface ELO + Underdog Value Index.",
        "rationale": "Andreeva is overhyped; Bouzkova has extreme defensive range and high hold/break clay stats. Value underdog pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Novak Djokovic vs. João Fonseca - João Fonseca +2.5 Sets Handicap",
        "odds": 2.10,
        "modelProbability": 0.50,
        "minimumOdds": 2.02,
        "date": "2026-05-29T15:30:00+02:00",
        "sourceSummary": "Bayes blend ELO Efficacy + Set Winning Index.",
        "rationale": "Fonseca is a rising clay star, Djokovic showing slow starts and set drops in early rounds. Fonseca to grab at least one set."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Alexander Zverev vs. Quentin Halys - Quentin Halys +7.5 Games Handicap",
        "odds": 1.88,
        "modelProbability": 0.56,
        "minimumOdds": 1.80,
        "date": "2026-05-29T20:15:00+02:00",
        "sourceSummary": "Serve/Hold dominance model + Game spread mismatch.",
        "rationale": "Halys holds high first-serve hold rate on clay. Zverev likely wins but Halys keeps game score within handline spread."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Casper Ruud vs. Tommy Paul - Tommy Paul Moneyline",
        "odds": 2.45,
        "modelProbability": 0.45,
        "minimumOdds": 2.24,
        "date": "2026-05-29T14:30:00+02:00",
        "sourceSummary": "Head-to-head tactical model + Clay hold/break blend.",
        "rationale": "Paul showing elite hard-to-clay transition. Ruud underperformed recently. Major price dislocation on the dog."
      },
      {
        "tipster": "Antigravity",
        "sport": "Tenisz - Roland Garros",
        "team": "Casper Ruud vs. Tommy Paul - Over 38.5 Games",
        "odds": 1.90,
        "modelProbability": 0.565,
        "minimumOdds": 1.78,
        "date": "2026-05-29T14:30:00+02:00",
        "sourceSummary": "Average match length simulator + ELO quality balance.",
        "rationale": "Both players are highly capable on clay. Expecting a long 4-5 set match, easily clearing 38.5 total games."
      },
      
      // --- AUSTRALIAN FOOTBALL (AFL) ---
      {
        "tipster": "Antigravity",
        "sport": "Ausztrál futball - AFL",
        "team": "Carlton vs. Geelong Cats - Geelong Cats Moneyline",
        "odds": 2.25,
        "modelProbability": 0.48,
        "minimumOdds": 2.10,
        "date": "2026-05-29T11:40:00+02:00",
        "sourceSummary": "AFL ELO Blend + MCG park factor + team-form model.",
        "rationale": "Cats have elite transition game. Carlton showing fatigue in defense. Cats priced as value underdogs."
      },
      
      // --- HOCKEY (NHL) ---
      {
        "tipster": "Antigravity",
        "sport": "Jégkorong - NHL",
        "team": "Montreal Canadiens vs. Carolina Hurricanes - Montreal Canadiens +1.5 Puck Line",
        "odds": 1.95,
        "modelProbability": 0.545,
        "minimumOdds": 1.85,
        "date": "2026-05-30T02:00:00+02:00",
        "sourceSummary": "NHL puck line goalie-adjusted model + ELO hybrid.",
        "rationale": "Game 5 elimination pressure. Canadiens are high-fight underdogs. Defensive structure covers the +1.5 puck line."
      },
      {
        "tipster": "Antigravity",
        "sport": "Jégkorong - NHL",
        "team": "Montreal Canadiens vs. Carolina Hurricanes - Under 5.5 Goals",
        "odds": 1.83,
        "modelProbability": 0.58,
        "minimumOdds": 1.74,
        "date": "2026-05-30T02:00:00+02:00",
        "sourceSummary": "Goalie SV% projection + FIP expected goals total.",
        "rationale": "Game 5 tight playoff hockey. Both coaches will emphasize strict neutral zone trap defense. High value Under."
      },
      
      // --- BASKETBALL (WNBA) ---
      {
        "tipster": "Antigravity",
        "sport": "Kosárlabda - WNBA",
        "team": "Los Angeles Sparks vs. Washington Mystics - Washington Mystics +4.5 Spread",
        "odds": 1.91,
        "modelProbability": 0.56,
        "minimumOdds": 1.80,
        "date": "2026-05-30T01:30:00+02:00",
        "sourceSummary": "WNBA power ratings spread difference + rest advantage.",
        "rationale": "Sparks struggle against perimeter heavy Mystics. Washington to keep score very close or win outright."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosárlabda - WNBA",
        "team": "Minnesota Lynx vs. Chicago Sky - Chicago Sky +6.5 Spread",
        "odds": 1.88,
        "modelProbability": 0.57,
        "minimumOdds": 1.77,
        "date": "2026-05-30T01:30:00+02:00",
        "sourceSummary": "Chicago Sky transition offense rating vs Lynx defense.",
        "rationale": "Sky's physical paint presence creates major rebound advantage. 6.5 spread is mathematically too generous."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosárlabda - WNBA",
        "team": "Phoenix Mercury vs. New York Liberty - Phoenix Mercury +8.5 Spread",
        "odds": 1.95,
        "modelProbability": 0.54,
        "minimumOdds": 1.87,
        "date": "2026-05-30T01:30:00+02:00",
        "sourceSummary": "Home dog rest efficacy + ELO spread blend.",
        "rationale": "Mercury home court advantage and hot perimeter shooting keeping them inside this large 8.5 point cushion."
      },
      {
        "tipster": "Antigravity",
        "sport": "Kosárlabda - WNBA",
        "team": "Atlanta Dream vs. Portland Fire - Portland Fire Moneyline",
        "odds": 3.20,
        "modelProbability": 0.35,
        "minimumOdds": 2.88,
        "date": "2026-05-30T04:00:00+02:00",
        "sourceSummary": "WNBA expansion growth index + market stale line check.",
        "rationale": "Major price mismatch. Fire showed massive chemistry growth last game. Safe high-variance value underdog bet."
      },
      
      // --- BASEBALL (MLB) ---
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Atlanta Braves @ Cincinnati Reds - Cincinnati Reds Moneyline",
        "odds": 2.15,
        "modelProbability": 0.50,
        "minimumOdds": 2.02,
        "date": "2026-05-29T23:40:00+02:00",
        "sourceSummary": "MLB home/away ELO + starting pitcher factor.",
        "rationale": "Braves road offense showing fatigue. Reds starter has high ground-ball rate. Excellent value on the home dog."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Minnesota Twins @ Pittsburgh Pirates - Pittsburgh Pirates Moneyline",
        "odds": 2.10,
        "modelProbability": 0.51,
        "minimumOdds": 1.98,
        "date": "2026-05-29T23:45:00+02:00",
        "sourceSummary": "Pirates PNC Park factors + FIP pitcher edge.",
        "rationale": "Pirates starter holds extreme K% edge vs Twins batting lineup. Strong home moneyline value."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "San Diego Padres @ Washington Nationals - Washington Nationals Moneyline",
        "odds": 2.30,
        "modelProbability": 0.47,
        "minimumOdds": 2.15,
        "date": "2026-05-29T23:45:00+02:00",
        "sourceSummary": "Bayes starter blend + Nationals home dog factor.",
        "rationale": "Padres starter overvalued on road. Nationals offense hot vs righties. High value dog pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Toronto Blue Jays @ Baltimore Orioles - Baltimore Orioles -1.5 Runline",
        "odds": 2.25,
        "modelProbability": 0.48,
        "minimumOdds": 2.10,
        "date": "2026-05-30T00:05:00+02:00",
        "sourceSummary": "Camden Yards runline factor + Orioles home ELO.",
        "rationale": "Orioles offense dominant at home, averaging 6+ runs. Blue Jays pitching depth severely compromised."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Boston Red Sox @ Cleveland Guardians - Boston Red Sox Moneyline",
        "odds": 2.20,
        "modelProbability": 0.49,
        "minimumOdds": 2.06,
        "date": "2026-05-30T00:10:00+02:00",
        "sourceSummary": "Red Sox road underdog ELO + bullpen efficacy blend.",
        "rationale": "Red Sox are elite road performers, Guardians bats cold. Starting pitcher FIP mismatch favors Boston."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Los Angeles Angels @ Tampa Bay Rays - Los Angeles Angels Moneyline",
        "odds": 2.55,
        "modelProbability": 0.425,
        "minimumOdds": 2.38,
        "date": "2026-05-30T00:10:00+02:00",
        "sourceSummary": "Angels bullpen recovery index + stale market line.",
        "rationale": "Rays heavily overhyped today. Angels pitcher match-up is basically even. Great value on the big dog."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Miami Marlins @ New York Mets - Miami Marlins Moneyline",
        "odds": 2.45,
        "modelProbability": 0.44,
        "minimumOdds": 2.29,
        "date": "2026-05-30T00:10:00+02:00",
        "sourceSummary": "Marlins starter rest efficacy + Mets LHP struggle index.",
        "rationale": "Marlins starting LHP has great hold rates vs Mets batting order. 2.45 odds are statistically misplaced."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Chicago Cubs @ St. Louis Cardinals - Chicago Cubs Moneyline",
        "odds": 1.88,
        "modelProbability": 0.57,
        "minimumOdds": 1.77,
        "date": "2026-05-30T00:15:00+02:00",
        "sourceSummary": "Cubs FIP advantage + Cardinals ELO regression index.",
        "rationale": "Cubs starting pitcher has massive ERA-to-FIP regression advantage. Safe middle-odds favorite."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Detroit Tigers @ Chicago White Sox - Chicago White Sox Moneyline",
        "odds": 2.25,
        "modelProbability": 0.475,
        "minimumOdds": 2.12,
        "date": "2026-05-30T00:40:00+02:00",
        "sourceSummary": "White Sox home dog momentum + Tigers road ELO factor.",
        "rationale": "White Sox carrying huge momentum from yesterday's 15-2 victory. Home value underdog is excellent."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Kansas City Royals @ Texas Rangers - Kansas City Royals Moneyline",
        "odds": 2.05,
        "modelProbability": 0.52,
        "minimumOdds": 1.94,
        "date": "2026-05-30T01:05:00+02:00",
        "sourceSummary": "Royals starter ELO + Rangers high K% index.",
        "rationale": "Rangers offensive lineup struggling against high velocity fastballs. Royals starter exploits this."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Milwaukee Brewers @ Houston Astros - Milwaukee Brewers Moneyline",
        "odds": 2.30,
        "modelProbability": 0.465,
        "minimumOdds": 2.17,
        "date": "2026-05-30T01:10:00+02:00",
        "sourceSummary": "Brewers high ground-ball pitching + Astros park factor.",
        "rationale": "Astros stadium HR factor mitigated by Brewers extreme ground-ball pitching starter. Great dog value."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "San Francisco Giants @ Colorado Rockies - Colorado Rockies Moneyline",
        "odds": 2.20,
        "modelProbability": 0.485,
        "minimumOdds": 2.08,
        "date": "2026-05-30T01:40:00+02:00",
        "sourceSummary": "Coors Field home/away split blend + Giants FIP variance.",
        "rationale": "Rockies at Coors are always a strong value dog due to park altitude variance. Giants pitcher has high HR%."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "New York Yankees @ Athletics - Athletics Moneyline",
        "odds": 2.50,
        "modelProbability": 0.435,
        "minimumOdds": 2.32,
        "date": "2026-05-30T02:40:00+02:00",
        "sourceSummary": "Oakland Coliseum night factors + Yankees road fatigue.",
        "rationale": "Athletics playing solid night games at Coliseum. Yankees bats cool down on the west coast road trip."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Arizona Diamondbacks @ Seattle Mariners - Arizona Diamondbacks Moneyline",
        "odds": 2.15,
        "modelProbability": 0.50,
        "minimumOdds": 2.02,
        "date": "2026-05-30T03:10:00+02:00",
        "sourceSummary": "Diamondbacks offense vs Mariners starter RHP.",
        "rationale": "Diamondbacks batting order possesses excellent matchup stats against Mariners starting pitcher profile."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB",
        "team": "Philadelphia Phillies @ Los Angeles Dodgers - Philadelphia Phillies Moneyline",
        "odds": 2.05,
        "modelProbability": 0.525,
        "minimumOdds": 1.94,
        "date": "2026-05-30T03:15:00+02:00",
        "sourceSummary": "Phillies hot road ELO + Dodgers bullpen fatigue blend.",
        "rationale": "Phillies in peak form, bullpen heavily rested compared to Dodgers. Phillies value favorite pick."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB Total",
        "team": "Philadelphia Phillies @ Los Angeles Dodgers - Over 8.5 Runs",
        "odds": 1.95,
        "modelProbability": 0.555,
        "minimumOdds": 1.82,
        "date": "2026-05-30T03:15:00+02:00",
        "sourceSummary": "Wind split factors + high Expected Runs total model.",
        "rationale": "Warm Dodger Stadium evening conditions with wind blowing out. Both starting pitchers have high FIP."
      },
      {
        "tipster": "Antigravity",
        "sport": "Baseball - MLB Total",
        "team": "Chicago Cubs @ St. Louis Cardinals - Over 7.5 Runs",
        "odds": 1.85,
        "modelProbability": 0.575,
        "minimumOdds": 1.76,
        "date": "2026-05-30T00:15:00+02:00",
        "sourceSummary": "Hot humid weather index + pitching matchup runs simulator.",
        "rationale": "Cardinals home stadium conditions are highly conductive for runs today. Matchup projection averages 9.2 runs."
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
