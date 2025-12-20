export const EUROPEAN_COUNTRIES = [
  { name: 'Albania', code: 'AL' },
  { name: 'Andorra', code: 'AD' },
  { name: 'Austria', code: 'AT' },
  { name: 'Belarus', code: 'BY' },
  { name: 'Belgium', code: 'BE' },
  { name: 'Bosnia and Herzegovina', code: 'BA' },
  { name: 'Bulgaria', code: 'BG' },
  { name: 'Croatia', code: 'HR' },
  { name: 'Cyprus', code: 'CY' },
  { name: 'Czech Republic', code: 'CZ' },
  { name: 'Denmark', code: 'DK' },
  { name: 'Estonia', code: 'EE' },
  { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Greece', code: 'GR' },
  { name: 'Hungary', code: 'HU' },
  { name: 'Iceland', code: 'IS' },
  { name: 'Ireland', code: 'IE' },
  { name: 'Italy', code: 'IT' },
  { name: 'Kosovo', code: 'XK' },
  { name: 'Latvia', code: 'LV' },
  { name: 'Liechtenstein', code: 'LI' },
  { name: 'Lithuania', code: 'LT' },
  { name: 'Luxembourg', code: 'LU' },
  { name: 'Malta', code: 'MT' },
  { name: 'Moldova', code: 'MD' },
  { name: 'Monaco', code: 'MC' },
  { name: 'Montenegro', code: 'ME' },
  { name: 'Netherlands', code: 'NL' },
  { name: 'North Macedonia', code: 'MK' },
  { name: 'Norway', code: 'NO' },
  { name: 'Poland', code: 'PL' },
  { name: 'Portugal', code: 'PT' },
  { name: 'Romania', code: 'RO' },
  { name: 'Russia', code: 'RU' },
  { name: 'San Marino', code: 'SM' },
  { name: 'Serbia', code: 'RS' },
  { name: 'Slovakia', code: 'SK' },
  { name: 'Slovenia', code: 'SI' },
  { name: 'Spain', code: 'ES' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Switzerland', code: 'CH' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Ukraine', code: 'UA' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Vatican City', code: 'VA' },
  // Popular non-European countries
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'Australia', code: 'AU' },
] as const;

export type Country = typeof EUROPEAN_COUNTRIES[number];

export function getCountryCode(name: string): string {
  return EUROPEAN_COUNTRIES.find(c => c.name === name)?.code ?? 'SE';
}

export function getCountryName(code: string): string {
  return EUROPEAN_COUNTRIES.find(c => c.code === code)?.name ?? 'Sweden';
}
