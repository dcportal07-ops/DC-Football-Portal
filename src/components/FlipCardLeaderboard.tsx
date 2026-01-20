"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// --- TROPHY ICONS ---
const GoldTrophy = () => (
  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100 border-2 border-yellow-300 shadow-sm p-1.5">
    <span className="text-lg">🥇</span>
  </div>
);
const SilverTrophy = () => (
  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-300 shadow-sm p-1.5">
    <span className="text-lg">🥈</span>
  </div>
);
const BronzeTrophy = () => (
  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 border-2 border-orange-200 shadow-sm p-1.5">
    <span className="text-lg">🥉</span>
  </div>
);

// --- MAIN COMPONENT ---
const FlipCardLeaderboard = () => {
  const [loaded, setLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Trigger bar animation on mount
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const leaders = [
    { rank: 1, name: "Emma Davis", score: 98, cards: 1450, avatar: "/noAvatar.png", barColor: "bg-[#FAE27C]" },
    { rank: 2, name: "Liam Chen", score: 85, cards: 1240, avatar: "/noAvatar.png", barColor: "bg-gray-300" },
    { rank: 3, name: "Sophia Wilson", score: 72, cards: 1089, avatar: "/noAvatar.png", barColor: "bg-orange-200" },
    { rank: 4, name: "Noah Brown", score: 65, cards: 950, avatar: "/noAvatar.png", barColor: "bg-blue-200" },
    { rank: 5, name: "Ava Martinez", score: 50, cards: 820, avatar: "/noAvatar.png", barColor: "bg-blue-100" },
    { rank: 6, name: "James Bond", score: 45, cards: 700, avatar: "/noAvatar.png", barColor: "bg-gray-100" },
  ];

  const displayedPlayers = isExpanded ? leaders : leaders.slice(0, 3);

  return (
    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col'>
      
      {/* HEADER */}
      <div className='flex justify-between items-center mb-6'>
        <div>
            <h1 className='text-xl font-bold text-gray-800'>🏆 Top Performers</h1>
            <p className='text-xs text-gray-500'>Highest homework completion scores</p>
        </div>
      </div>

      {/* LEADERBOARD LIST */}
      <div className='flex flex-col gap-5 flex-1'>
        {displayedPlayers.map((player) => (
            <div key={player.rank} className='flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300'>
                
                {/* RANK ICON */}
                <div className='flex-shrink-0'>
                    {player.rank === 1 ? <GoldTrophy /> : 
                     player.rank === 2 ? <SilverTrophy /> : 
                     player.rank === 3 ? <BronzeTrophy /> : 
                     (
                        <div className='w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-100 bg-gray-50 text-gray-500 text-sm font-bold shadow-sm'>
                            {player.rank}
                        </div>
                     )}
                </div>

                {/* AVATAR */}
                <div className="relative w-10 h-10">
                    <Image 
                        src={player.avatar} 
                        alt={player.name} 
                        fill
                        className='rounded-full border border-gray-100 object-cover'
                    />
                </div>

                {/* NAME & BAR */}
                <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-center mb-1'>
                        <h3 className='text-sm font-bold text-gray-700 truncate'>{player.name}</h3>
                        <span className='text-xs font-bold text-gray-500 whitespace-nowrap ml-2'>{player.cards} XP</span>
                    </div>
                    
                    <div className='w-full h-2 bg-gray-50 rounded-full overflow-hidden'>
                        <div 
                            className={`h-full rounded-full ${player.barColor} transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: loaded ? `${player.score}%` : '0%' }}
                        ></div>
                    </div>
                </div>

            </div>
        ))}
      </div>

      {/* FOOTER BUTTON */}
      <div className='mt-6 pt-4 border-t border-gray-100 text-center'>
        <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors uppercase tracking-wider'
        >
            {isExpanded ? "Show Less" : "View Full Leaderboard"}
        </button>
      </div>

    </div>
  )
}

export default FlipCardLeaderboard;