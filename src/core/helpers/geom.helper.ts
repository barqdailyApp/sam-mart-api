export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function rad2deg(rad: number) {
  return rad * (180 / Math.PI);
}

export function randomGeo(center: number[], radius: number): object {
  const y0 = center[0];
  const x0 = center[1];
  const rd = radius / 111300;

  const u = Math.random();
  const v = Math.random();

  const w = rd * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  return {
    latitude: y + y0,
    longitude: x + x0,
  };
}

export function boundingBox(lat: number, lon: number, radius: number) {
  const r = 6371; // earth's mean radius in km
  const maxLat = lat + rad2deg(radius / r);
  const minLat = lat - rad2deg(radius / r);
  const maxLon = lon + rad2deg(radius / r / Math.cos(deg2rad(lat)));
  const minLon = lon - rad2deg(radius / r / Math.cos(deg2rad(lat)));

  return {
    maxLat,
    minLat,
    maxLon,
    minLon,
  };
}

export function distanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
    Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export function GeoPointToLatLng(point: string): LatLng {
  // POINT(30.5234 50.4501) => [50.4501, 30.5234]
  const [lat, lng] = point
    .replace('POINT(', '')
    .replace(')', '')
    .split(' ')
    .map((v) => parseFloat(v));

  return {
    lat,
    lng,
  };
}

export function calculateDistances(
  coord1: [number, number],
  coord2: [number, number],
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const radius = 6371; // Earth's radius in kilometers

  // Convert coordinates to radians
  const lat1_rad = toRadians(lat1);
  const lon1_rad = toRadians(lon1);
  const lat2_rad = toRadians(lat2);
  const lon2_rad = toRadians(lon2);

  // Haversine formula
  const dlat = lat2_rad - lat1_rad;
  const dlon = lon2_rad - lon1_rad;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = radius * c;

  return distance;
}
  
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function findNearestPoints(
  locations1: Location[],
  locations2: Location[],
): [Location, Location][] {
  const nearestPoints: [Location, Location][] = [];
 
  locations2 = locations2.filter((e) => {
    if (e != undefined) return e;
  });

 

  for (const loc1 of locations1) {
    let nearestPoint: Location | null = null;
    let minDistance = Infinity;

    for (const loc2 of locations2) {
      const distance = calculateDistances(
        [loc1.latitude, loc1.longitude],
        [loc2.latitude, loc2.longitude],
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = loc2;
      }
    }

    if (nearestPoint) {
      nearestPoints.push([loc1, nearestPoint]);
      // Remove the chosen nearest point from locations2 to avoid repetition
      locations2.splice(locations2.indexOf(nearestPoint), 1);
    }
  }

  return nearestPoints;
}


export interface LatLng {
  lat: number;
  lng: number;
} 
export class Location {
  id?: string;
  latitude: number;
  longitude: number;

  constructor(data: Location) {
    Object.assign(this, data);
  }
} 
export class SlotObject {
  biker_id:string
  slot_id:string

  constructor(data: SlotObject) {
    Object.assign(this, data);
  }
}
