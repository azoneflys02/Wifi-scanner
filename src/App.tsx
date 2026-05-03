import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, 
  Navigation, 
  Search, 
  Coffee, 
  Library, 
  Laptop, 
  MapPin, 
  Signal, 
  RefreshCw,
  Info,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { MapView } from './components/Map';
import { fetchNearbyHotspots } from './services/wifiService';
import { Hotspot, UserLocation } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_LOCATION: UserLocation = { lat: 40.7128, lng: -74.0060 }; // NYC

export default function App() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          loadHotspots(loc);
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(DEFAULT_LOCATION);
          loadHotspots(DEFAULT_LOCATION);
        }
      );
    } else {
      setUserLocation(DEFAULT_LOCATION);
      loadHotspots(DEFAULT_LOCATION);
    }
  }, []);

  const loadHotspots = async (loc: UserLocation) => {
    setLoading(true);
    const data = await fetchNearbyHotspots(loc);
    setHotspots(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    if (!userLocation) return;
    setIsRefreshing(true);
    await loadHotspots(userLocation);
    setIsRefreshing(false);
  };

  const selectedHotspot = hotspots.find(h => h.id === selectedId);

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'library': return <Library className="w-4 h-4" />;
      case 'fast_food': return <Wifi className="w-4 h-4" />;
      default: return <Laptop className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-[#f8fafc] overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] border-b border-[#334155] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-lg tracking-tight">WiFi.Scan <span className="text-[#38bdf8] font-normal">v2.4</span></h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-[#334155] rounded-full transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -360 }}
            animate={{ x: 0 }}
            exit={{ x: -360 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className={cn(
              "fixed lg:relative z-40 w-full max-w-[360px] h-full bg-[#0f172a] flex flex-col pt-16 lg:pt-0 p-6 gap-6",
              "lg:shadow-none bg-opacity-95"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="hidden lg:block">
                <h1 className="font-bold text-2xl tracking-tighter text-[#f8fafc]">WiFi.Scan <span className="text-[#38bdf8] font-normal">v2.4</span></h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Scanning Active</span>
                </div>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  "p-3 bg-[#1e293b] border border-[#334155] rounded-2xl hover:bg-[#334155] transition-all active:scale-95 group",
                  isRefreshing && "animate-spin"
                )}
              >
                <RefreshCw className="w-5 h-5 text-[#38bdf8]" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bento-card p-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Latency</p>
                <p className="text-xl font-black text-white px-0.5">14ms</p>
                <div className="mt-2 text-[10px] font-bold text-emerald-400">+2%</div>
              </div>
              <div className="bento-card p-4">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Active</p>
                <p className="text-xl font-black text-white px-0.5">{hotspots.length}</p>
                <div className="mt-2 text-[10px] font-bold text-[#38bdf8]">Scanning</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 gap-4 flex flex-col custom-scrollbar">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 bg-[#1e293b] rounded-[24px] border border-[#334155] animate-pulse" />
                ))
              ) : hotspots.length > 0 ? (
                hotspots.map((spot) => (
                  <motion.div
                    key={spot.id}
                    layoutId={spot.id}
                    onClick={() => setSelectedId(spot.id)}
                    className={cn(
                      "bento-card cursor-pointer group relative hover:scale-[1.02] active:scale-[0.98]",
                      selectedId === spot.id 
                        ? "border-[#38bdf8] ring-1 ring-[#38bdf8]/50 bg-[#1e293b]" 
                        : "hover:border-[#334155]/80"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <div className={cn(
                         "p-2 rounded-xl transition-colors",
                         selectedId === spot.id ? "bg-[#38bdf8] text-[#0f172a]" : "bg-[#334155] text-[#38bdf8]"
                       )}>
                         {getHotspotIcon(spot.type)}
                       </div>
                       <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Distance</span>
                         <span className="text-sm font-bold text-[#f8fafc] tabular-nums">
                           {spot.distance}m
                         </span>
                       </div>
                    </div>
                    <h3 className={cn(
                      "font-bold text-base tracking-tight mb-1 truncate",
                      selectedId === spot.id ? "text-[#38bdf8]" : "text-white"
                    )}>{spot.name}</h3>
                    <p className="text-xs text-neutral-400 font-medium capitalize opacity-60">
                      {spot.type.replace('_', ' ')} • Unsecured
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="bento-card flex flex-col items-center justify-center py-12 text-center border-dashed">
                  <Search className="w-10 h-10 text-neutral-600 mb-4" />
                  <p className="text-neutral-400 font-bold">No hotspots detected</p>
                  <button onClick={handleRefresh} className="mt-4 text-xs font-bold text-[#38bdf8] uppercase tracking-widest hover:underline">Retry Scan</button>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#1e293b] rounded-[24px] border border-[#334155]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Network Load</span>
                <span className="text-xs font-bold text-emerald-400">LOW</span>
              </div>
              <div className="h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden">
                <div className="h-full w-[15%] bg-emerald-400 rounded-full signal-glow"></div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content (Map) */}
      <main className="flex-1 relative h-full">
        <div className="absolute inset-0 z-0">
          {userLocation ? (
            <MapView 
              center={userLocation} 
              hotspots={hotspots}
              selectedHotspotId={selectedId}
              onSelectHotspot={setSelectedId}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-[#0f172a]">
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-[#38bdf8] animate-spin" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Initializing Radar</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Hotspot Detail Card - Bento Style */}
        <AnimatePresence>
          {selectedId && selectedHotspot && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-8 left-8 right-8 lg:left-auto lg:right-8 lg:w-[420px] z-30"
            >
              <div className="bento-card border-[#38bdf8] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <button 
                    onClick={() => setSelectedId(null)}
                    className="p-2 hover:bg-[#334155] rounded-full text-neutral-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-[#38bdf8] rounded-[22px] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                    <div className="text-[#0f172a]">
                       {getHotspotIcon(selectedHotspot.type)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#38bdf8] uppercase tracking-[0.2em] mb-1">Network Identity</p>
                    <h2 className="text-2xl font-black text-white tracking-tighter leading-none">{selectedHotspot.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-[#0f172a]/50 rounded-[20px] border border-[#334155]/50">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 opacity-60">Radius</p>
                    <p className="text-2xl font-black text-white tabular-nums">{selectedHotspot.distance}<span className="text-xs font-normal text-neutral-500 ml-1">m</span></p>
                  </div>
                  <div className="p-4 bg-[#0f172a]/50 rounded-[20px] border border-[#334155]/50">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1 opacity-60">Status</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <div className="h-2 w-full bg-emerald-400 rounded-full signal-glow"></div>
                       <div className="h-2 w-full bg-emerald-400 rounded-full signal-glow"></div>
                       <div className="h-2 w-full bg-emerald-400 rounded-full signal-glow"></div>
                       <div className="h-2 w-full bg-[#1e293b] rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#0f172a]/30 rounded-[20px] border border-[#334155]/30">
                     <div className="p-2 bg-[#334155] rounded-xl">
                       <Zap className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">Signal Secure</p>
                       <p className="text-[10px] text-neutral-500 font-medium">Public authentication available</p>
                     </div>
                  </div>
                  
                  <button className="w-full py-5 bento-accent font-black text-sm uppercase tracking-[0.2em] hover:bg-[#7dd3fc] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(56,189,248,0.25)]">
                    Initiate Connection
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#38bdf8] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle Button (Floating) */}
        {!sidebarOpen && (
          <motion.button
            initial={{ scale: 0, x: -50 }}
            animate={{ scale: 1, x: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="absolute top-8 left-8 z-30 p-5 bg-[#1e293b] border border-[#334155] rounded-[24px] shadow-2xl flex items-center gap-4 hover:bg-[#334155] transition-all"
          >
            <div className="p-2 bg-[#38bdf8] rounded-xl">
               <Wifi className="w-6 h-6 text-[#0f172a]" />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">Open Scan</span>
          </motion.button>
        )}
      </main>

      <style>{`
        .leaflet-container {
          background-color: #0f172a !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          color: #f8fafc !important;
          border-radius: 16px !important;
          border: 1px solid #334155 !important;
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          background: #1e293b !important;
          border: 1px solid #334155 !important;
        }
      `}</style>
    </div>
  );
}
