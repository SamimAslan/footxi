export interface Badge {
  name: string;
  price: number;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  team: string;
  league: string;
  leagueSlug: string;
  season: string;
  type: "home" | "away" | "third" | "retro";
  kitType: "fans" | "player" | "retro";
  image: string;
  backImage?: string;
  sizes?: string[];
  badges: Badge[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

/** Get stable product ID (works for both static and DB products) */
export function getProductId(p: Product): string {
  return p._id || p.id || "";
}

export interface League {
  name: string;
  slug: string;
  country: string;
  logo: string;
  teams: string[];
}

// All prices in CHF (Swiss Franc) - converted to user's currency at display time
export const PRICING = {
  fans: 1,
  player: 30,
  retro: 33,
  customNameNumber: 5,
  cargo: {
    standard: { price: 5, days: "15-30" },
    express: { price: 20, days: "7-15" },
  },
  additionalItem: 3,
  discount: {
    tier1: { min: 3, max: 6, percent: 5 },
    tier2: { min: 7, max: 15, percent: 10 },
  },
  badgePrice: 3,
};

export const leagues: League[] = [
  {
    name: "La Liga",
    slug: "la-liga",
    country: "Spain",
    logo: "/leagues/la-liga.png",
    teams: ["Barcelona", "Real Madrid", "Atletico Madrid", "Sevilla", "Real Betis", "Real Sociedad", "Villarreal", "Athletic Bilbao", "Valencia", "Girona", "Celta Vigo", "Osasuna", "Getafe", "Mallorca", "Las Palmas", "Alaves", "Rayo Vallecano", "Leganes", "Espanyol", "Valladolid", "Levante", "Real Oviedo"],
  },
  {
    name: "Premier League",
    slug: "premier-league",
    country: "England",
    logo: "/leagues/premier-league.png",
    teams: ["Manchester United", "Manchester City", "Liverpool", "Arsenal", "Chelsea", "Tottenham", "Newcastle United", "Aston Villa", "Brighton", "West Ham", "Crystal Palace", "Brentford", "Fulham", "Bournemouth", "Wolverhampton", "Everton", "Nottingham Forest", "Leicester City", "Ipswich Town", "Southampton"],
  },
  {
    name: "Serie A",
    slug: "serie-a",
    country: "Italy",
    logo: "/leagues/serie-a.png",
    teams: ["AC Milan", "Inter Milan", "Juventus", "Napoli", "Roma", "Lazio", "Atalanta", "Fiorentina", "Bologna", "Torino", "Genoa", "Cagliari", "Udinese", "Parma", "Como", "Hellas Verona", "Lecce", "Cremonese", "Pisa", "Sassuolo"],
  },
  {
    name: "Bundesliga",
    slug: "bundesliga",
    country: "Germany",
    logo: "/leagues/bundesliga.png",
    teams: ["Bayern Munich", "Borussia Dortmund", "RB Leipzig", "Bayer Leverkusen", "Stuttgart", "Eintracht Frankfurt", "Wolfsburg", "Freiburg", "Hoffenheim", "Werder Bremen", "Union Berlin", "Borussia Mönchengladbach", "Augsburg", "Mainz 05", "Heidenheim", "St. Pauli", "Holstein Kiel", "Bochum", "Hamburg", "FC Köln"],
  },
  {
    name: "Ligue 1",
    slug: "ligue-1",
    country: "France",
    logo: "/leagues/ligue-1.png",
    teams: ["Paris Saint-Germain", "Marseille", "Lyon", "Monaco", "Lille", "Nice", "Lens", "Toulouse", "Nantes", "Auxerre", "Angers", "Le Havre", "RC Strasbourg", "Lorient", "Metz", "Paris FC"],
  },
  {
    name: "Super Lig",
    slug: "super-lig",
    country: "Turkey",
    logo: "/leagues/super-lig.png",
    teams: ["Galatasaray", "Fenerbahce", "Besiktas", "Trabzonspor"],
  },
  {
    name: "Primeira Liga",
    slug: "primeira-liga",
    country: "Portugal",
    logo: "/leagues/primeira-liga.png",
    teams: ["Benfica", "Porto", "Sporting CP"],
  },
  {
    name: "Eredivisie",
    slug: "eredivisie",
    country: "Netherlands",
    logo: "/leagues/eredivisie.png",
    teams: ["Ajax", "PSV", "Feyenoord"],
  },
];

function teamSlug(team: string): string {
  return team.toLowerCase().replace(/\s+/g, "-");
}

function getBadgesForTeam(team: string, league: string): Badge[] {
  const leagueBadge: Badge = { name: `${league} Badge`, price: PRICING.badgePrice };
  
  const clTeams = [
    "Barcelona", "Real Madrid", "Manchester City", "Liverpool", "Arsenal",
    "Bayern Munich", "Inter Milan", "Paris Saint-Germain", "AC Milan",
    "Borussia Dortmund", "Juventus", "Benfica", "Porto", "PSV",
    "Atletico Madrid", "Bayer Leverkusen", "Galatasaray",
  ];

  const badges: Badge[] = [leagueBadge];

  if (clTeams.includes(team)) {
    badges.push({ name: "Champions League Badge", price: PRICING.badgePrice });
  }

  return badges;
}

function generateProducts(): Product[] {
  const products: Product[] = [];
  let id = 1;

  const featuredTeams = [
    "Barcelona", "Real Madrid", "Manchester United", "Liverpool",
    "AC Milan", "Bayern Munich", "Paris Saint-Germain", "Galatasaray",
  ];

  for (const league of leagues) {
    for (const team of league.teams) {
      const types: Array<{ type: Product["type"]; kitType: Product["kitType"] }> = [
        { type: "home", kitType: "fans" },
        { type: "away", kitType: "fans" },
        { type: "third", kitType: "fans" },
        { type: "home", kitType: "player" },
      ];

      for (const { type, kitType } of types) {
        products.push({
          id: `${id++}`,
          name: `${team} ${type.charAt(0).toUpperCase() + type.slice(1)} Kit 25/26`,
          team,
          league: league.name,
          leagueSlug: league.slug,
          season: "2025/26",
          type,
          kitType,
          image: `/kits/${teamSlug(team)}-${type}.jpg`,
          badges: getBadgesForTeam(team, league.name),
          isNewArrival: (id % 3 === 0),
          isFeatured: featuredTeams.includes(team) && type === "home" && kitType === "fans",
        });
      }

      // Add a retro kit for some teams
      if (featuredTeams.includes(team)) {
        products.push({
          id: `${id++}`,
          name: `${team} Retro Kit`,
          team,
          league: league.name,
          leagueSlug: league.slug,
          season: "Retro",
          type: "retro",
          kitType: "retro",
          image: `/kits/${teamSlug(team)}-retro.jpg`,
          badges: getBadgesForTeam(team, league.name),
          isFeatured: false,
        });
      }
    }
  }

  return products;
}

export const products = generateProducts();

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByLeague(leagueSlug: string): Product[] {
  return products.filter((p) => p.leagueSlug === leagueSlug);
}

export function getProductsByTeam(team: string): Product[] {
  return products.filter((p) => p.team === team);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getLeagueBySlug(slug: string): League | undefined {
  return leagues.find((l) => l.slug === slug);
}

export function getBasePrice(kitType: Product["kitType"]): number {
  return PRICING[kitType];
}
