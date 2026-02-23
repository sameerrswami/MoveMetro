import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function TransitMap({ pathData }) {
    const [trainPos, setTrainPos] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const allCoords = useMemo(() => {
        if (!pathData || !pathData.segments) return [];
        const coords = [];
        pathData.segments.forEach(seg => {
            seg.stops?.forEach(stop => {
                if (stop && stop.latitude && stop.longitude) {
                    coords.push([parseFloat(stop.latitude), parseFloat(stop.longitude)]);
                }
            });
        });
        return coords;
    }, [pathData]);

    useEffect(() => {
        if (allCoords.length > 0) {
            setTrainPos(allCoords[0]);
        }
    }, [allCoords]);

    const startSimulation = () => {
        if (allCoords.length < 2) return;
        setIsSimulating(true);
        let i = 0;
        const interval = setInterval(() => {
            if (i >= allCoords.length) {
                clearInterval(interval);
                setIsSimulating(false);
                return;
            }
            setTrainPos(allCoords[i]);
            i++;
        }, 1000);
    };

    const defaultCenter = [28.6139, 77.2090];

    const trainIcon = useMemo(() => L.divIcon({
        className: 'train-marker',
        html: `<div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-metro-500 animate-pulse">
                <span class="text-lg">🚋</span>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    }), []);

    const stopIcon = (color, scale = 1) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-lg" style="background-color: ${color}; transform: scale(${scale}); border-width: ${scale > 1 ? '3px' : '2px'}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    if (!pathData) return null;

    return (
        <div className="h-[450px] w-full rounded-3xl overflow-hidden glass-card border border-white/10 relative">
            <MapContainer
                center={allCoords.length > 0 ? allCoords[0] : defaultCenter}
                zoom={12}
                style={{ height: '100%', width: '100%', background: '#1a1c23' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CARTO'
                />

                {pathData.segments?.map((segment, segIdx) => {
                    const positions = segment.stops
                        ?.filter(s => s && s.latitude && s.longitude)
                        .map(s => [parseFloat(s.latitude), parseFloat(s.longitude)]);

                    if (!positions || positions.length < 2) return null;

                    return (
                        <Polyline
                            key={`polyline-${segIdx}`}
                            positions={positions}
                            pathOptions={{
                                color: segment.route?.color || '#3b82f6',
                                weight: 6,
                                opacity: 0.8,
                                lineJoin: 'round'
                            }}
                        />
                    );
                })}

                {pathData.segments?.flatMap((segment, segIdx) =>
                    (segment.stops || [])
                        .filter(stop => stop && stop.latitude && stop.longitude)
                        .map((stop, stopIdx) => {
                            const isStart = segIdx === 0 && stopIdx === 0;
                            const isEnd = segIdx === pathData.segments.length - 1 && stopIdx === (segment.stops.length - 1);

                            return (
                                <Marker
                                    key={`marker-${stop.id}-${segIdx}-${stopIdx}`}
                                    position={[parseFloat(stop.latitude), parseFloat(stop.longitude)]}
                                    icon={stopIcon(segment.route?.color || '#3b82f6', isStart || isEnd ? 1.5 : 1)}
                                >
                                    <Popup>
                                        <div className="p-1">
                                            <p className="font-bold text-gray-900 m-0">{stop.name}</p>
                                            <p className="text-[10px] text-gray-500 m-0">{segment.route?.name}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })
                )}

                {trainPos && (
                    <Marker position={trainPos} icon={trainIcon} zIndexOffset={1000} />
                )}
            </MapContainer>

            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <button
                    onClick={startSimulation}
                    disabled={isSimulating}
                    className="bg-metro-600 hover:bg-metro-500 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2 transition-all disabled:opacity-50 mb-2"
                >
                    {isSimulating ? '🛰️ Tracking...' : '🚀 Start Ride Track'}
                </button>
                {pathData.segments?.map((segment, i) => (
                    <div key={i} className="bg-gray-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2 shadow-xl w-fit">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.route?.color }}></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{segment.route?.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
