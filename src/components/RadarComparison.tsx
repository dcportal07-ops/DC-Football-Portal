"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Legend, Tooltip 
} from 'recharts';
import { getAllPlayers, getPlayerDates, getComparisonData } from '@/lib/actions'; 
import { Loader2, Search } from 'lucide-react';

// Types
type PlayerOption = { 
  id: string; 
  user: { name: string }; 
  team: { name: string } | null 
};
type DateOption = { id: string; date: string };

const RadarComparison = () => {
    // --- STATE ---
    const [players, setPlayers] = useState<PlayerOption[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search State
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
    
    const [availableDates, setAvailableDates] = useState<DateOption[]>([]);
    const [dateA, setDateA] = useState<string>("");
    const [dateB, setDateB] = useState<string>("");

    const [chartData, setChartData] = useState<any[]>([]);
    const [deltas, setDeltas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);

    // 1. Load Players on Mount
    useEffect(() => {
        const fetchPlayers = async () => {
            const data = await getAllPlayers();
            setPlayers(data);
            if(data.length > 0) setSelectedPlayerId(data[0].id);
            setLoading(false);
        };
        fetchPlayers();
    }, []);

    // 🔍 Filter Players based on Search
    const filteredPlayers = useMemo(() => {
        return players.filter(p => 
            p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.team?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [players, searchTerm]);

    // 2. Load Dates when Player Changes
    useEffect(() => {
        if(!selectedPlayerId) return;

        const fetchDates = async () => {
            // Keep chart loading while we switch players
            setChartLoading(true);
            const dates = await getPlayerDates(selectedPlayerId);
            setAvailableDates(dates);
            
            // Default: Compare Most Recent (B) vs Previous (A)
            if(dates.length >= 2) {
                setDateB(dates[0].date); 
                setDateA(dates[1].date); 
            } else if (dates.length === 1) {
                setDateB(dates[0].date);
                setDateA(dates[0].date); // Same date if only 1 exists
            } else {
                setDateA("");
                setDateB("");
                setChartData([]);
                setDeltas([]);
                setChartLoading(false);
            }
        };
        fetchDates();
    }, [selectedPlayerId]);

    // 3. Load Comparison Data when Dates Change
    useEffect(() => {
        if(!selectedPlayerId || !dateA || !dateB) {
            setChartLoading(false);
            return;
        }

        const fetchData = async () => {
            setChartLoading(true);
            const result = await getComparisonData(selectedPlayerId, dateA, dateB);
            
            // Format data specifically for Recharts to ensure it renders
            // Recharts hates undefined values, so we ensure 0 fallback
            const safeChartData = result.chartData.map(item => ({
                subject: item.subject,
                A: item.A || 0,
                B: item.B || 0,
                fullMark: 100
            }));

            setChartData(safeChartData);
            setDeltas(result.deltas);
            setChartLoading(false);
        };
        fetchData();
    }, [selectedPlayerId, dateA, dateB]);

    // --- RENDER ---
    return (
        <div className='bg-white p-6 rounded-2xl w-full h-full shadow-sm border border-gray-100 min-h-[500px] flex flex-col'>

            {/* HEADER & SEARCH */}
            <div className='mb-6 space-y-4'>
                <h2 className='text-xl font-bold text-gray-800'>Performance Comparison</h2>
                
                {/* 🔍 SEARCH BAR */}
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search student by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>

                {/* PLAYER DROPDOWN */}
                <div className='flex flex-col gap-1'>
                    <label className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Select Player</label>
                    <select
                    title='a'
                        className='w-full bg-white border border-gray-200 text-gray-700 font-medium rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#006D77]/20 focus:border-[#006D77] transition-all cursor-pointer'
                        value={selectedPlayerId}
                        onChange={(e) => {
                            setSelectedPlayerId(e.target.value);
                            setSearchTerm(""); // Optional: clear search on select
                        }}
                    >
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map((player) => (
                                <option key={player.id} value={player.id}>
                                    {player.user.name} {player.team ? `(${player.team.name})` : ''}
                                </option>
                            ))
                        ) : (
                            <option disabled>No players found</option>
                        )}
                    </select>
                </div>
            </div>

            {/* DATE SELECTORS */}
            <div className='flex gap-4 mb-6'>
                <div className='flex-1 flex flex-col gap-1'>
                    <label className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Previous (A)</label>
                    <select
                    title='a'
                        value={dateA}
                        onChange={(e) => setDateA(e.target.value)}
                        className='w-full bg-[#006D77]/10 border border-[#006D77] text-[#006D77] font-bold rounded-xl p-2.5 outline-none text-sm'
                        disabled={availableDates.length === 0}
                    >
                        {availableDates.length === 0 && <option>No Data</option>}
                        {availableDates.map(d => <option key={d.id} value={d.date}>{d.date}</option>)}
                    </select>
                </div>

                <div className='flex-1 flex flex-col gap-1'>
                    <label className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>Current (B)</label>
                    <select
                    title='b'
                        value={dateB}
                        onChange={(e) => setDateB(e.target.value)}
                        className='w-full bg-[#F97316]/10 border border-[#F97316] text-[#F97316] font-bold rounded-xl p-2.5 outline-none text-sm'
                        disabled={availableDates.length === 0}
                    >
                         {availableDates.length === 0 && <option>No Data</option>}
                         {availableDates.map(d => <option key={d.id} value={d.date}>{d.date}</option>)}
                    </select>
                </div>
            </div>

            {/* CHART AREA */}
            <div className="flex-1 min-h-[350px] relative">
                {loading || chartLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    </div>
                ) : chartData.length > 0 ? (
                    <>
                        {/* RADAR CHART */}
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 600 }} />
                                {/* IMPORTANT: Ensure domain matches your scoring (0-10 or 0-100) */}
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                
                                <Radar 
                                    name="Previous (A)" 
                                    dataKey="A" 
                                    stroke="#006D77" 
                                    strokeWidth={3} 
                                    fill="#006D77" 
                                    fillOpacity={0.3} 
                                />
                                <Radar 
                                    name="Current (B)" 
                                    dataKey="B" 
                                    stroke="#F97316" 
                                    strokeWidth={3} 
                                    fill="#F97316" 
                                    fillOpacity={0.3} 
                                />
                                <Legend />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>

                        {/* DELTAS LIST */}
                        {deltas.length > 0 && (
                            <div className="mt-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Progress Report</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                    {deltas.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-1 last:border-0">
                                            <span className="text-gray-600 font-medium">{item.name}</span>
                                            <span className={`font-bold ${item.isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {item.absolute > 0 ? '+' : ''}{item.absolute} <span className="opacity-60 text-xs">({item.percentage})</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <p>No evaluation data found for this player.</p>
                        <p className="text-xs mt-1">Create an evaluation to see stats.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RadarComparison;