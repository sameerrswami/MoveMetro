import React from 'react';

export default function RoutePreview({ data }) {
    if (!data) return null;

    return (
        <div className="glass-card p-6 animate-slide-up h-full flex flex-col">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-white font-heading tracking-tight">Route Preview</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                        Computed via {data.algorithm} Optimizer
                    </p>
                </div>
            </div>

            {/* Journey summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider text-center">Travel Time</p>
                    <p className="text-2xl font-black text-white text-center">{data.totalTime}<span className="text-xs font-normal text-gray-500 ml-1">m</span></p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider text-center">Stations</p>
                    <p className="text-2xl font-black text-white text-center">{data.totalStops}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-wider text-center">Transfers</p>
                    <p className="text-2xl font-black text-white text-center">{data.totalTransfers}</p>
                </div>
                <div className="bg-accent-500/10 rounded-2xl p-4 border border-accent-500/20 shadow-inner">
                    <p className="text-[10px] text-accent-500 uppercase font-bold mb-1 tracking-wider text-center">Total Fare</p>
                    <p className="text-2xl font-black text-white text-center">₹{data.fare}</p>
                </div>
            </div>


            {/* Timeline View */}
            <div className="flex-1 space-y-0 relative pl-4">
                <div className="absolute left-[1.35rem] top-3 bottom-3 w-0.5 bg-gradient-to-b from-metro-500/50 via-gray-700/30 to-accent-500/50 rounded-full"></div>

                {data.segments?.map((segment, i) => (
                    <div key={i} className="relative pb-8 last:pb-2">
                        {/* Bullet */}
                        <div
                            className="absolute -left-[0.35rem] top-1.5 w-3 h-3 rounded-full border-2 border-gray-900 z-10 shadow-lg"
                            style={{ backgroundColor: segment.route?.color || '#5c7cfa' }}
                        ></div>

                        <div className="ml-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    {segment.route?.name || `Line ${i + 1}`}
                                </span>
                                <div
                                    className="px-2 py-0.5 rounded text-[9px] font-black text-white"
                                    style={{ backgroundColor: segment.route?.color || '#666' }}
                                >
                                    {(segment.route?.name?.split(' ')[0] || 'L').toUpperCase()}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {segment.stops?.map((stop, j) => (
                                    <div
                                        key={j}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${j === 0 || j === segment.stops.length - 1
                                            ? 'bg-white/10 border-white/20 text-white font-bold'
                                            : 'bg-white/5 border-white/5 text-gray-400 text-xs'
                                            }`}
                                    >
                                        <span className="text-sm">{stop.name || stop.code || stop}</span>
                                    </div>
                                ))}
                            </div>

                            {segment.isInterchange && (
                                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
                                    <span className="text-xs">🔄</span>
                                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Interchange</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
