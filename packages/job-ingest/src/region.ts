import type { Region } from "./types.js";

const COUNTRY_TO_REGION: Record<string, Region> = {
  // Europe
  AT: "europe", BE: "europe", BG: "europe", HR: "europe", CY: "europe",
  CZ: "europe", DK: "europe", EE: "europe", FI: "europe", FR: "europe",
  DE: "europe", GR: "europe", HU: "europe", IE: "europe", IT: "europe",
  LV: "europe", LT: "europe", LU: "europe", MT: "europe", NL: "europe",
  NO: "europe", PL: "europe", PT: "europe", RO: "europe", SK: "europe",
  SI: "europe", ES: "europe", SE: "europe", CH: "europe", GB: "europe",
  UK: "europe", RS: "europe", UA: "europe", IS: "europe", AL: "europe",
  // North America
  US: "north-america", CA: "north-america", MX: "north-america",
  // Asia
  JP: "asia", KR: "asia", CN: "asia", IN: "asia", SG: "asia",
  HK: "asia", TW: "asia", TH: "asia", VN: "asia", PH: "asia",
  ID: "asia", MY: "asia", IL: "asia", AE: "asia", AU: "asia", NZ: "asia",
  // South America
  BR: "other", AR: "other", CL: "other", CO: "other",
  // Africa
  ZA: "other", NG: "other", KE: "other",
};

// Map city/location strings to countries
const LOCATION_HINTS: [RegExp, string][] = [
  // European cities
  [/\b(london|manchester|bristol|edinburgh|cambridge)\b/i, "GB"],
  [/\b(berlin|munich|hamburg|frankfurt|cologne|d[uü]sseldorf)\b/i, "DE"],
  [/\b(paris|lyon|marseille|toulouse|bordeaux|nantes|sophia antipolis|grenoble|montpellier|nice)\b/i, "FR"],
  [/\b(amsterdam|rotterdam|utrecht|eindhoven|den haag|the hague)\b/i, "NL"],
  [/\b(madrid|barcelona|valencia|seville)\b/i, "ES"],
  [/\b(rome|milan|turin|florence)\b/i, "IT"],
  [/\b(prague|brno)\b/i, "CZ"],
  [/\b(vienna|wien|graz)\b/i, "AT"],
  [/\b(zurich|z[uü]rich|geneva|bern|basel)\b/i, "CH"],
  [/\b(stockholm|gothenburg|malm[oö])\b/i, "SE"],
  [/\b(copenhagen|aarhus)\b/i, "DK"],
  [/\b(oslo|bergen)\b/i, "NO"],
  [/\b(helsinki|espoo)\b/i, "FI"],
  [/\b(dublin|cork|galway)\b/i, "IE"],
  [/\b(lisbon|porto)\b/i, "PT"],
  [/\b(warsaw|krakow|wroclaw|krak[oó]w|wroc[lł]aw)\b/i, "PL"],
  [/\b(budapest)\b/i, "HU"],
  [/\b(bucharest|cluj)\b/i, "RO"],
  [/\b(brussels|antwerp|ghent)\b/i, "BE"],
  [/\b(tallinn)\b/i, "EE"],
  [/\b(riga)\b/i, "LV"],
  [/\b(vilnius)\b/i, "LT"],
  [/\b(belgrade)\b/i, "RS"],
  [/\b(zagreb)\b/i, "HR"],
  // North American cities
  [/\b(new york|nyc|san francisco|seattle|austin|denver|chicago|boston|los angeles|miami|atlanta|portland|washington|dc|dallas|houston|phoenix|philadelphia|detroit|minneapolis|nashville|raleigh|charlotte|pittsburgh|salt lake|san diego|san jose|menlo park|palo alto|mountain view|cupertino|redmond)\b/i, "US"],
  [/\b(toronto|vancouver|montreal|ottawa|calgary|edmonton|waterloo)\b/i, "CA"],
  // Asian cities
  [/\b(tokyo|osaka|kyoto)\b/i, "JP"],
  [/\b(seoul|busan)\b/i, "KR"],
  [/\b(singapore)\b/i, "SG"],
  [/\b(hong kong)\b/i, "HK"],
  [/\b(taipei)\b/i, "TW"],
  [/\b(mumbai|bangalore|bengaluru|hyderabad|delhi|pune|chennai|gurgaon|noida)\b/i, "IN"],
  [/\b(tel aviv|jerusalem|haifa)\b/i, "IL"],
  [/\b(dubai|abu dhabi)\b/i, "AE"],
  [/\b(sydney|melbourne|brisbane|perth)\b/i, "AU"],
  [/\b(auckland|wellington)\b/i, "NZ"],
  [/\b(beijing|shanghai|shenzhen|hangzhou|guangzhou)\b/i, "CN"],
  [/\b(bangkok)\b/i, "TH"],
  [/\b(jakarta)\b/i, "ID"],
  [/\b(ho chi minh|hanoi)\b/i, "VN"],
  // South American cities
  [/\b(s[aã]o paulo|rio de janeiro)\b/i, "BR"],
  [/\b(buenos aires)\b/i, "AR"],
  [/\b(santiago)\b/i, "CL"],
  [/\b(bogot[aá]|medell[ií]n)\b/i, "CO"],
  [/\b(mexico city|guadalajara|monterrey)\b/i, "MX"],
];

// Region keywords in location strings
const REGION_KEYWORDS: [RegExp, Region][] = [
  [/\b(emea|europe|eu\b|european)\b/i, "europe"],
  [/\b(united states|usa|americas|north america|us\b)\b/i, "north-america"],
  [/\b(apac|asia|pacific)\b/i, "asia"],
];

export function inferCountry(location: string): string {
  if (!location) return "";
  for (const [pattern, country] of LOCATION_HINTS) {
    if (pattern.test(location)) return country;
  }
  return "";
}

export function classifyRegion(location: string, country: string, isRemote: boolean): Region {
  // If we have a country code, use it
  if (country) {
    const upper = country.toUpperCase();
    if (COUNTRY_TO_REGION[upper]) return COUNTRY_TO_REGION[upper]!;
  }

  // Check location string for region keywords
  for (const [pattern, region] of REGION_KEYWORDS) {
    if (pattern.test(location)) return region;
  }

  // Try to infer country from location text
  const inferred = inferCountry(location);
  if (inferred && COUNTRY_TO_REGION[inferred]) return COUNTRY_TO_REGION[inferred]!;

  // If remote with no specific location, mark as remote
  if (isRemote) return "remote";

  return "other";
}
