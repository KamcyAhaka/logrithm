// Maps common country/city names from GitHub's free-text location field
// to ISO 3166-1 alpha-2 country codes.
// Best-effort — unknown locations return null.

const COUNTRY_MAP: Record<string, string> = {
  // Africa
  nigeria: 'NG',
  lagos: 'NG',
  abuja: 'NG',
  ibadan: 'NG',
  kenya: 'KE',
  nairobi: 'KE',
  ghana: 'GH',
  accra: 'GH',
  'south africa': 'ZA',
  'cape town': 'ZA',
  johannesburg: 'ZA',
  egypt: 'EG',
  cairo: 'EG',
  ethiopia: 'ET',
  'addis ababa': 'ET',
  tanzania: 'TZ',
  'dar es salaam': 'TZ',
  rwanda: 'RW',
  kigali: 'RW',
  senegal: 'SN',
  dakar: 'SN',
  cameroon: 'CM',
  'ivory coast': 'CI',

  // Americas
  'united states': 'US',
  usa: 'US',
  'u.s.a': 'US',
  'u.s': 'US',
  'new york': 'US',
  'san francisco': 'US',
  seattle: 'US',
  'los angeles': 'US',
  chicago: 'US',
  austin: 'US',
  boston: 'US',
  canada: 'CA',
  toronto: 'CA',
  vancouver: 'CA',
  montreal: 'CA',
  brazil: 'BR',
  'são paulo': 'BR',
  'sao paulo': 'BR',
  'rio de janeiro': 'BR',
  argentina: 'AR',
  'buenos aires': 'AR',
  mexico: 'MX',
  'mexico city': 'MX',
  colombia: 'CO',
  bogotá: 'CO',
  chile: 'CL',
  santiago: 'CL',

  // Europe
  'united kingdom': 'GB',
  uk: 'GB',
  england: 'GB',
  london: 'GB',
  manchester: 'GB',
  edinburgh: 'GB',
  germany: 'DE',
  berlin: 'DE',
  munich: 'DE',
  hamburg: 'DE',
  france: 'FR',
  paris: 'FR',
  lyon: 'FR',
  netherlands: 'NL',
  amsterdam: 'NL',
  spain: 'ES',
  madrid: 'ES',
  barcelona: 'ES',
  italy: 'IT',
  rome: 'IT',
  milan: 'IT',
  sweden: 'SE',
  stockholm: 'SE',
  norway: 'NO',
  oslo: 'NO',
  denmark: 'DK',
  copenhagen: 'DK',
  finland: 'FI',
  helsinki: 'FI',
  poland: 'PL',
  warsaw: 'PL',
  ukraine: 'UA',
  kyiv: 'UA',
  portugal: 'PT',
  lisbon: 'PT',
  switzerland: 'CH',
  zurich: 'CH',
  austria: 'AT',
  vienna: 'AT',
  belgium: 'BE',
  brussels: 'BE',
  ireland: 'IE',
  dublin: 'IE',
  russia: 'RU',
  moscow: 'RU',

  // Asia
  india: 'IN',
  bangalore: 'IN',
  bengaluru: 'IN',
  mumbai: 'IN',
  delhi: 'IN',
  hyderabad: 'IN',
  pune: 'IN',
  chennai: 'IN',
  china: 'CN',
  beijing: 'CN',
  shanghai: 'CN',
  shenzhen: 'CN',
  japan: 'JP',
  tokyo: 'JP',
  osaka: 'JP',
  'south korea': 'KR',
  seoul: 'KR',
  singapore: 'SG',
  indonesia: 'ID',
  jakarta: 'ID',
  pakistan: 'PK',
  karachi: 'PK',
  lahore: 'PK',
  bangladesh: 'BD',
  dhaka: 'BD',
  vietnam: 'VN',
  'ho chi minh city': 'VN',
  hanoi: 'VN',
  thailand: 'TH',
  bangkok: 'TH',
  malaysia: 'MY',
  'kuala lumpur': 'MY',
  philippines: 'PH',
  manila: 'PH',
  taiwan: 'TW',
  taipei: 'TW',
  turkey: 'TR',
  istanbul: 'TR',
  ankara: 'TR',
  israel: 'IL',
  'tel aviv': 'IL',
  uae: 'AE',
  dubai: 'AE',
  'abu dhabi': 'AE',
  'saudi arabia': 'SA',
  riyadh: 'SA',

  // Oceania
  australia: 'AU',
  sydney: 'AU',
  melbourne: 'AU',
  brisbane: 'AU',
  'new zealand': 'NZ',
  auckland: 'NZ',
};

/**
 * Parses a free-text GitHub location string into an ISO country code.
 * Returns null if the location cannot be confidently mapped.
 *
 * Matching is case-insensitive and checks if any known location name
 * appears within the string (handles "Lagos, Nigeria", "Berlin, Germany" etc.)
 */
export function parseCountryCode(location: string | null): string | null {
  if (!location) return null;

  const normalized = location.toLowerCase().trim();

  // Direct match first
  if (COUNTRY_MAP[normalized]) return COUNTRY_MAP[normalized];

  // Substring match — handles "Lagos, Nigeria" → finds "nigeria" → "NG"
  for (const [key, code] of Object.entries(COUNTRY_MAP)) {
    if (normalized.includes(key)) return code;
  }

  return null;
}
