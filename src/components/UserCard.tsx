import prisma from "@/lib/prisma";
import Image from "next/image";
import React from "react";

const UserCard = async ({ type }: { type: string }) => {
  
  // 1. DATA FETCHING LOGIC
  let count = 0;
  const normalizedType = type.toLowerCase();

  try {
    if (normalizedType.includes("player")) {
      count = await prisma.playerProfile.count();
    } else if (normalizedType.includes("coach")) {
      count = await prisma.coachProfile.count();
    } else if (normalizedType.includes("evalu")) { 
      count = await prisma.evaluation.count(); 
    } else if (normalizedType.includes("flip")) {
      count = await prisma.flipCard.count(); 
    } else if (normalizedType.includes("team")) { 
      count = await prisma.team.count(); 
    }
  } catch (err) {
    console.log(`Error fetching count for ${type}:`, err);
    count = 0; 
  }

  // 2. ICON MAPPING
  const iconMap: Record<string, string> = {
    players: "/player-icon.png",
    coach: "/coach-icon.png",
    evaluations: "/chart-icon.png",
    flipcards: "/cards-icon.png",
    teams: "/default-team.png", // Ensure you have this icon in public folder
    default: "/more.png",
  };

  const iconKey = Object.keys(iconMap).find(k => normalizedType.includes(k)) || "default";
  const hoverIcon = iconMap[iconKey];

  // ✅ 3. DATE LOGIC (Today's Date)
  // Format: "22 Dec 2025" or "22/12/2025"
  const dateString = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return (
    <div
      className="
        rounded-2xl
        odd:bg-[#006D77] even:bg-[#F97316]
        p-4 flex-1 min-w-[200px]
        relative overflow-hidden group cursor-pointer
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
    "
    >
      {/* Header Section */}
      <div className="flex justify-between items-center relative z-10">
        {/* ✅ DYNAMIC DATE BADGE */}
        <span className="text-[10px] bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-gray-800 font-bold shadow-sm">
          {dateString}
        </span>
        
        <Image
          src="/more.png"
          alt="more"
          width={20}
          height={20}
          className="brightness-0 invert opacity-80"
        />
      </div>

      {/* Text Content */}
      <div className="relative z-10">
        <h1 className="text-2xl font-bold my-4 text-white">
          {count.toLocaleString()}
        </h1>
        <h2 className="capitalize text-sm font-medium text-gray-100 tracking-wide">
          {type}
        </h2>
      </div>

      {/* Animated Hover Image */}
      <div
        className="
            absolute right-2 bottom-2 w-16 h-16
            opacity-0 translate-y-4 scale-90
            group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-110
            transition-all duration-500 ease-out
        "
      >
        <Image
          src={hoverIcon}
          alt={`${type} icon`}
          fill
          className="object-contain drop-shadow-lg brightness-0 invert"
        />
      </div>
    </div>
  );
};

export default UserCard;