const GOV_SEARCH_BASE = 'https://data.gov.il/api/3/action/datastore_search';

const CITIES_RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';

interface GovRecord {
  [key: string]: unknown;
}

interface GovSearchResponse {
  success: boolean;
  result: { records: GovRecord[]; total: number };
}

let citiesCache: string[] | null = null;
const streetsCache = new Map<string, string[]>();

async function govSearch(
  resourceId: string,
  filters?: Record<string, string>,
  offset = 0,
  limit = 1000
): Promise<{ records: GovRecord[]; total: number }> {
  const params = new URLSearchParams({
    resource_id: resourceId,
    limit: String(limit),
    offset: String(offset),
  });
  if (filters) params.set('filters', JSON.stringify(filters));

  const response = await fetch(`${GOV_SEARCH_BASE}?${params}`, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Gov API error: ${response.status}`);

  const data: GovSearchResponse = await response.json();
  if (!data.success) throw new Error('Gov API returned unsuccessful response');

  return { records: data.result.records, total: data.result.total };
}

async function fetchAllRecords(
  resourceId: string,
  filters?: Record<string, string>
): Promise<GovRecord[]> {
  const limit = 1000;
  const first = await govSearch(resourceId, filters, 0, limit);
  const all: GovRecord[] = [...first.records];

  let offset = limit;
  while (all.length < first.total) {
    const page = await govSearch(resourceId, filters, offset, limit);
    all.push(...page.records);
    if (page.records.length === 0) break;
    offset += limit;
  }

  return all;
}

export async function searchCities(query: string): Promise<string[]> {
  if (!query || query.trim().length < 2) return [];

  if (!citiesCache) {
    const records = await fetchAllRecords(CITIES_RESOURCE_ID);
    const names = records
      .map((r) => (r['שם_ישוב'] as string)?.trim())
      .filter((n): n is string => Boolean(n));
    citiesCache = [...new Set(names)].sort();
  }

  const q = query.trim();
  return citiesCache.filter((city) => city.includes(q)).slice(0, 10);
}

export async function searchStreets(city: string, query: string): Promise<string[]> {
  if (!city || !query || query.trim().length < 2) return [];

  const cityKey = city.trim();

  if (!streetsCache.has(cityKey)) {
    // City names in the gov DB are stored with a trailing space
    let records = await fetchAllRecords(STREETS_RESOURCE_ID, { 'שם_ישוב': cityKey + ' ' });
    if (records.length === 0) {
      records = await fetchAllRecords(STREETS_RESOURCE_ID, { 'שם_ישוב': cityKey });
    }

    const streets = records
      .map((r) => (r['שם_רחוב'] as string)?.trim())
      .filter((n): n is string => Boolean(n));

    streetsCache.set(cityKey, [...new Set(streets)].sort());
  }

  const q = query.trim();
  return (streetsCache.get(cityKey) || [])
    .filter((street) => street.includes(q))
    .slice(0, 10);
}

export async function lookupZipCode(
  _zipCode: string
): Promise<{ city: string; street: string } | null> {
  // Zip lookup not yet supported — the streets resource has no zip field.
  return null;
}
