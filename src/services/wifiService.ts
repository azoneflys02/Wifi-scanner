import { Hotspot, UserLocation } from '../types';

/**
 * Fetches hotspots from OpenStreetMap via Overpass API
 * specifically looking for places that usually have WiFi or internet access
 */
export async function fetchNearbyHotspots(location: UserLocation): Promise<Hotspot[]> {
  const radius = 2000; // 2km
  const { lat, lng } = location;

  // Overpass query for cafes, libraries, and places with internet access
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"cafe|library|fast_food|coworking"](around:${radius},${lat},${lng});
      way["amenity"~"cafe|library|fast_food|coworking"](around:${radius},${lat},${lng});
      node["internet_access"="wlan"](around:${radius},${lat},${lng});
      way["internet_access"="wlan"](around:${radius},${lat},${lng});
    );
    out body;
    >;
    out skel qt;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Overpass API error');
    const data = await response.json();

    return data.elements
      .filter((el: any) => el.lat || (el.center && el.center.lat))
      .map((el: any) => {
        const hotspotLat = el.lat || el.center.lat;
        const hotspotLng = el.lon || el.center.lon;
        
        // Simple distance calculation
        const dist = Math.sqrt(
          Math.pow(hotspotLat - lat, 2) + Math.pow(hotspotLng - lng, 2)
        ) * 111320; // rough meters

        return {
          id: el.id.toString(),
          name: el.tags?.name || el.tags?.operator || 'Public Hotspot',
          type: (el.tags?.amenity || 'public') as any,
          lat: hotspotLat,
          lng: hotspotLng,
          address: el.tags?.['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` : undefined,
          distance: Math.round(dist),
          tags: el.tags
        };
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error fetching hotspots:', error);
    return [];
  }
}
