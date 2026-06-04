import apiClient from './client';

export async function searchCities(query: string): Promise<string[]> {
  const { data } = await apiClient.get<{ cities: string[] }>('/address/cities', {
    params: { q: query },
  });
  return data.cities;
}

export async function searchStreets(city: string, query: string): Promise<string[]> {
  const { data } = await apiClient.get<{ streets: string[] }>('/address/streets', {
    params: { city, q: query },
  });
  return data.streets;
}

export async function lookupZipCode(
  zipCode: string
): Promise<{ city: string; street: string } | null> {
  const { data } = await apiClient.get<{ city: string; street: string } | null>(
    '/address/zip',
    { params: { q: zipCode } }
  );
  return data;
}
