'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { reverseGeocodeCoordinates, POPULAR_HUBS, WAYANAD_OFFICE } from '@/lib/geo';

export interface UserLocation {
  lat: number | null;
  lng: number | null;
  address: string;
  city: string;
}

interface LocationContextType {
  location: UserLocation;
  isQuickMode: boolean;
  isDetecting: boolean;
  isModalOpen: boolean;
  error: string | null;
  setIsModalOpen: (open: boolean) => void;
  detectCurrentLocation: () => Promise<boolean>;
  setLocation: (lat: number, lng: number, address: string, city: string) => void;
  toggleQuickMode: () => void;
  setQuickMode: (enabled: boolean) => void;
}

// Default to Spicewizz Office in Vythiri, Wayanad (673576)
const DEFAULT_LOCATION: UserLocation = {
  lat: WAYANAD_OFFICE.lat,
  lng: WAYANAD_OFFICE.lng,
  address: WAYANAD_OFFICE.address,
  city: 'Vythiri, Wayanad',
};


const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isQuickMode, setIsQuickMode] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted location from localStorage
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem('spicewizz_delivery_location');
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed.lat && parsed.lng) {
          setLocationState(parsed);
        }
      }

      const savedQuickMode = localStorage.getItem('spicewizz_quick_mode');
      if (savedQuickMode !== null) {
        setIsQuickMode(savedQuickMode === 'true');
      }
    } catch (e) {
      console.error('Failed to load saved location:', e);
    }
  }, []);

  const setLocation = (lat: number, lng: number, address: string, city: string) => {
    const newLoc: UserLocation = { lat, lng, address, city };
    setLocationState(newLoc);
    setError(null);
    try {
      localStorage.setItem('spicewizz_delivery_location', JSON.stringify(newLoc));
    } catch (e) {
      console.error('Failed to save location:', e);
    }
  };

  const toggleQuickMode = () => {
    setIsQuickMode((prev) => {
      const next = !prev;
      localStorage.setItem('spicewizz_quick_mode', String(next));
      return next;
    });
  };

  const setQuickMode = (enabled: boolean) => {
    setIsQuickMode(enabled);
    try {
      localStorage.setItem('spicewizz_quick_mode', String(enabled));
    } catch (e) {
      console.error('Failed to save quick mode:', e);
    }
  };

  const detectCurrentLocation = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return false;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            const { address, city } = await reverseGeocodeCoordinates(lat, lng);
            setLocation(lat, lng, address, city);
            setIsDetecting(false);
            resolve(true);
          } catch (err) {
            setLocation(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'My Location');
            setIsDetecting(false);
            resolve(true);
          }
        },
        (geoError) => {
          setIsDetecting(false);
          let message = 'Unable to retrieve location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message = 'Location access was denied. Please pick or search your area.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = 'Location information is currently unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            message = 'Location request timed out.';
          }
          setError(message);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isQuickMode,
        isDetecting,
        isModalOpen,
        error,
        setIsModalOpen,
        detectCurrentLocation,
        setLocation,
        toggleQuickMode,
        setQuickMode,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
