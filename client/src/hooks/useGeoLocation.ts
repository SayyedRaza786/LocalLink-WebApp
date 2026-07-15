import { useState } from 'react';
import toast from 'react-hot-toast';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useGeoLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getCoordinates = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setLoading(false);
        toast.success('Successfully retrieved location coordinates!');
      },
      (err) => {
        let msg = 'Failed to retrieve location coordinates';
        if (err.code === 1) {
          msg = 'Location access permission was denied. Please input your city manually.';
        } else if (err.code === 2) {
          msg = 'Location position unavailable';
        } else if (err.code === 3) {
          msg = 'Location retrieval timeout';
        }
        setError(msg);
        setLoading(false);
        toast.error(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    getCoordinates,
    clearLocation,
  };
};
export default useGeoLocation;
