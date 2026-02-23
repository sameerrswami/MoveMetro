import React from 'react';

export default function MetroMap({ className = '' }) {
    // Interchanges: Rajiv Chowk (Blue/Yellow), Kashmere Gate (Yellow/Red)

    return (
        <div className={`glass-card p-6 overflow-hidden relative ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white font-heading tracking-tight">System Map</h2>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Live Network Status</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#0052A5]"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Blue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#FFCC00]"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Yellow</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#E42313]"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Red</span>
                    </div>
                </div>
            </div>

            <div className="relative aspect-[16/9] w-full min-h-[300px]">
                <svg viewBox="0 0 800 450" className="w-full h-full drop-shadow-2xl">
                    {/* Definitions for Glow */}
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Lines */}
                    {/* Blue Line: Horizontal-ish */}
                    <path
                        d="M 50 250 L 200 250 L 350 250 L 500 250 L 650 250 L 750 250"
                        fill="none"
                        stroke="#0052A5"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ filter: 'url(#glow)', opacity: 0.8 }}
                    />

                    {/* Yellow Line: Vertical-ish */}
                    <path
                        d="M 500 50 L 500 150 L 500 250 L 500 350 L 500 400"
                        fill="none"
                        stroke="#FFCC00"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ filter: 'url(#glow)', opacity: 0.8 }}
                    />

                    {/* Red Line: Diagonal-ish */}
                    <path
                        d="M 350 50 L 425 100 L 500 150 L 575 200 L 650 250"
                        fill="none"
                        stroke="#E42313"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ filter: 'url(#glow)', opacity: 0.8 }}
                    />

                    {/* Stations - Shared */}
                    {/* Rajiv Chowk (Blue & Yellow) @ 500,250 */}
                    <circle cx="500" cy="250" r="12" fill="#111" stroke="white" strokeWidth="3" />
                    <text x="515" y="270" fill="white" fontSize="14" fontWeight="bold">Rajiv Chowk (Interchange)</text>

                    {/* Kashmere Gate (Yellow & Red) @ 500,150 */}
                    <circle cx="500" cy="150" r="12" fill="#111" stroke="white" strokeWidth="3" />
                    <text x="515" y="145" fill="white" fontSize="14" fontWeight="bold">Kashmere Gate (Interchange)</text>

                    {/* Blue Line Stations */}
                    <circle cx="50" cy="250" r="6" fill="white" />
                    <text x="40" y="280" fill="#666" fontSize="10">Dwarka 21</text>

                    <circle cx="200" cy="250" r="6" fill="white" />
                    <text x="190" y="280" fill="#666" fontSize="10">Dwarka</text>

                    <circle cx="350" cy="250" r="6" fill="white" />
                    <text x="340" y="280" fill="#666" fontSize="10">Rajouri Garden</text>

                    <circle cx="650" cy="250" r="6" fill="white" />
                    <text x="660" y="270" fill="#666" fontSize="10">Barakhamba Rd</text>

                    <circle cx="750" cy="250" r="6" fill="white" />
                    <text x="730" y="280" fill="#666" fontSize="10">Noida City Centre</text>

                    {/* Yellow Line Stations */}
                    <circle cx="500" cy="50" r="6" fill="white" />
                    <text x="515" y="55" fill="#666" fontSize="10">Samaypur Badli</text>

                    <circle cx="500" cy="350" r="6" fill="white" />
                    <text x="515" y="355" fill="#666" fontSize="10">Hauz Khas</text>

                    <circle cx="500" cy="420" r="6" fill="white" />
                    <text x="515" y="425" fill="#666" fontSize="10">HUDA City Centre</text>

                    {/* Red Line Stations */}
                    <circle cx="350" cy="50" r="6" fill="white" />
                    <text x="310" y="45" fill="#666" fontSize="10">Dilshad Garden</text>

                    <circle cx="425" cy="100" r="6" fill="white" />
                    <text x="380" y="95" fill="#666" fontSize="10">Welcome</text>

                    {/* New Delhi @ 500,190? Let's put it on Yellow line */}
                    <circle cx="500" cy="190" r="6" fill="white" />
                    <text x="515" y="195" fill="#666" fontSize="10">New Delhi</text>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border-2 border-white bg-[#111]"></div>
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">Interchange</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
