import { useCallback } from 'react';

export default function useGeolocation() {
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('Not supported')); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  const reverseGeocodeCity = useCallback(async (loc) => {
    if (!loc) return 'Unknown Location';
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&zoom=10`);
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || 'Unknown Location';
    } catch { return 'Unknown Location'; }
  }, []);

  return { getLocation, reverseGeocodeCity };
}