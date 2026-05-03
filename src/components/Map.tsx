import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Hotspot, UserLocation } from '../types';
import { Wifi, Home, Coffee, Library, Zap } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  center: UserLocation;
  hotspots: Hotspot[];
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
}

function ChangeView({ center }: { center: UserLocation }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

const getIcon = (type: string) => {
  const color = type === 'cafe' ? '#38bdf8' : type === 'library' ? '#818cf8' : '#4ade80';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; color: #0f172a; padding: 7px; border-radius: 14px; box-shadow: 0 0 15px ${color}44;" class="flex items-center justify-center border-2 border-[#1e293b]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/></svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-sky-400 opacity-20 rounded-full animate-ping"></div>
    <div style="background-color: #38bdf8; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 10px #38bdf8;"></div>
  </div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const MapView: React.FC<MapViewProps> = ({ center, hotspots, selectedHotspotId, onSelectHotspot }) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ChangeView center={center} />
      
      <Marker position={[center.lat, center.lng]} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {hotspots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.lat, spot.lng]}
          icon={getIcon(spot.type)}
          eventHandlers={{
            click: () => onSelectHotspot(spot.id),
          }}
        >
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-sm">{spot.name}</h3>
              <p className="text-xs text-neutral-500 capitalize">{spot.type}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
