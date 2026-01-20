"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import FormModal from '@/components/FormModal';

const UserActions = () => {
  // Default image when nothing is hovered
  const [currentImage, setCurrentImage] = useState("/default-team.png"); 
  
  // You can customize these images. Make sure they exist in your /public folder!
  const images = {
    default: "/default-team.png", // A generic team or logo image
    coach: "/coach-illustration.png",
    player: "/player-illustration.png",
    team: "/team-illustration.png",
  };

  return (
    <div className="mb-6">
      
      {/* --- DYNAMIC IMAGE AREA --- */}
      <div className="w-full h-32 mb-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center border border-gray-100 relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out">
           {/* We use key={currentImage} to trigger a fade animation on change */}
           <div key={currentImage} className="relative w-24 h-24 animate-in fade-in zoom-in duration-300">
              <Image 
                src={currentImage} 
                alt="Preview" 
                fill 
                className="object-contain drop-shadow-lg"
              />
           </div>
        </div>
        <p className="absolute bottom-2 text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            {currentImage === images.default}
        </p>
      </div>

      {/* --- ANIMATED BUTTONS --- */}
      <div className='flex justify-between items-center gap-2'>
        
        {/* COACH BUTTON */}
        <div 
          onMouseEnter={() => setCurrentImage(images.coach)}
          onMouseLeave={() => setCurrentImage(images.default)}
          className="group flex-1"
        >
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-pink-50 border-2 border-pink-100 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:bg-pink-100 hover:border-pink-300 active:scale-95">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:rotate-12 transition-transform duration-300">
                {/* Passing custom styling to FormModal via wrapper */}
                <FormModal table="coaches" type="create" />
            </div>
            <span className="text-xs font-bold text-pink-700 uppercase tracking-wide group-hover:text-pink-900">Coach</span>
          </div>
        </div>

        {/* PLAYER BUTTON */}
        <div 
          onMouseEnter={() => setCurrentImage(images.player)}
          onMouseLeave={() => setCurrentImage(images.default)}
          className="group flex-1"
        >
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-yellow-50 border-2 border-yellow-100 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:bg-yellow-100 hover:border-yellow-300 active:scale-95">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:-rotate-12 transition-transform duration-300">
                <FormModal table="players" type="create" />
            </div>
            <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide group-hover:text-yellow-900">Player</span>
          </div>
        </div>

        {/* TEAM BUTTON */}
        <div 
          onMouseEnter={() => setCurrentImage(images.team)}
          onMouseLeave={() => setCurrentImage(images.default)}
          className="group flex-1"
        >
          <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 border-2 border-blue-100 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg hover:bg-blue-100 hover:border-blue-300 active:scale-95">
             <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FormModal table="teams" type="create" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide group-hover:text-blue-900">Team</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserActions;