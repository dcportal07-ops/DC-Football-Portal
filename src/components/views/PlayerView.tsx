// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { currentUser } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";

// // Components
// import FormModal from "@/components/FormModal";
// import PlayerFlipCard, { FlipCardData } from "@/components/PlayerFlipCard";
// import FlipCardForm from "@/components/forms/FlipCardForm";
// import { PlayerPerformanceChart, PlayerRadarChart } from "@/components/PlayerCharts"

// // 🔥 REUSABLE COMPONENT: PLAYER VIEW
// const PlayerView = async ({ playerId }: { playerId: string }) => {
  
//   const user = await currentUser();
//   const role = user?.publicMetadata?.role as string;
//   const currentUserId = user?.id;

//   // 1. FETCH PLAYER
//   const player = await prisma.playerProfile.findUnique({
//     where: { id: playerId },
//     include: {
//       user: true,
//       team: true,
//       flipCards: { orderBy: { createdAt: "desc" }, take: 6 },
//     },
//   });

//   if (!player) return notFound();

//   // 2. FETCH COACH INFO
//   let currentCoachId = null;
//   if (role === "admin" || role === "coach") {
//     const myProfile = await prisma.coachProfile.findUnique({ where: { userId: currentUserId } });
//     currentCoachId = myProfile ? myProfile.id : (await prisma.coachProfile.findFirst())?.id;
//   }

//   // 3. FETCH ASSIGNMENTS
//   const assignments = await prisma.announcement.findMany({
//     where: {
//       audience: playerId,
//       OR: [
//         { title: { contains: "DRILL:" } },
//         { title: { contains: "HOMEWORK:" } }
//       ]
//     },
//     orderBy: { date: "desc" },
//     take: 5
//   });

//   // --- HELPER TO CALCULATE AVERAGE FROM NEW DATA STRUCTURE ---
//   const getAverage = (arr: any[]) => {
//       if(!arr || !Array.isArray(arr) || arr.length === 0) return 0;
//       const total = arr.reduce((sum, item) => sum + (Number(item.current) || 0), 0);
//       return Number((total / arr.length).toFixed(1));
//   };

//   // 4. PREPARE CHARTS & DATA
//   const latestCardRaw = player.flipCards[0]?.content;
//   const latestCard = latestCardRaw ? (latestCardRaw as unknown as FlipCardData) : null;

//   // History Chart Data
//   const performanceData = player.flipCards.slice(0, 6).reverse().map((card, index) => {
//     const content = card.content as unknown as FlipCardData;
//     return { name: `Card ${index + 1}`, score: content?.overallScore || 0 };
//   });
//   if (performanceData.length === 0) performanceData.push({ name: "Start", score: 0 });

//   // Radar Chart Data (Dashboard wala)
//   let radarData = [
//     { subject: "Technical", A: 0, fullMark: 10 },
//     { subject: "Tactical", A: 0, fullMark: 10 },
//     { subject: "Physical", A: 0, fullMark: 10 },
//     { subject: "Mental", A: 0, fullMark: 10 },
//     { subject: "Attacking", A: 0, fullMark: 10 },
//     { subject: "Defending", A: 0, fullMark: 10 },
//   ];

//   if (latestCard && latestCard.stats) {
//       // New Structure Handling
//       radarData = [
//           { subject: "Technical", A: getAverage(latestCard.stats.technical), fullMark: 10 },
//           { subject: "Tactical", A: getAverage(latestCard.stats.tactical), fullMark: 10 },
//           { subject: "Physical", A: getAverage(latestCard.stats.physical), fullMark: 10 },
//           { subject: "Mental", A: getAverage(latestCard.stats.mental), fullMark: 10 },
//           { subject: "Attacking", A: Number((latestCard.stats as any).attacking?.current) || 0, fullMark: 10 },
//           { subject: "Defending", A: Number((latestCard.stats as any).defending?.current) || 0, fullMark: 10 },
//       ];
//   }

//   return (
//     <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
//       {/* LEFT SECTION (2/3) */}
//       <div className="w-full xl:w-2/3 flex flex-col gap-4">

//         {/* HEADER */}
//         <div className="bg-[#E0F2F1] py-6 px-6 rounded-md border border-teal-100 flex flex-col md:flex-row gap-6 items-start justify-between">
//           <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start flex-1">
//             <div className="w-24 h-24 flex-shrink-0 relative">
//               <Image src={player.user.photo || "/noAvatar.png"} alt="Player" fill className="rounded-full object-cover border-4 border-white shadow-md" />
//             </div>
//             <div className="text-center sm:text-left">
//               <h1 className="text-2xl font-bold text-slate-800">{player.user.name}</h1>
//               <p className="text-sm text-gray-600 mb-2">#{player.jerseyNumber || "?"} • {player.team?.name || "No Team"}</p>
//               <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-slate-700">
//                 <span className="flex items-center gap-1">📧 {player.user.email}</span>
//                 <span className="flex items-center gap-1">📅 {new Date(player.dob).getFullYear()}</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
//             {role === "admin" && (
//               <div className="flex gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
//                 <FormModal table="players" type="update" data={{
//                     id: player.id,
//                     userId: player.user.id,
//                     username: player.user.userCode,
//                     name: player.user.name,
//                     email: player.user.email,
//                     phone: player.user.phone,
//                     img: player.user.photo,
//                     gender: player.gender,
//                     dob: player.dob,
//                     jerseyNumber: player.jerseyNumber,
//                     parentEmail: player.parentEmail,
//                     address: player.address,
//                     teamId: player.team?.id || "",
//                   }}
//                 />
//                 <FormModal table="players" type="delete" id={player.id} />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* CHARTS */}
//         {/* Dashboard Bar Chart */}
//         <PlayerPerformanceChart data={performanceData} />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* Dashboard Radar Chart */}
//           <PlayerRadarChart data={radarData} />

//           {/* COACH ASSIGNMENTS BOX */}
//           <div className="bg-white rounded-md p-4 h-[350px] shadow-sm border border-gray-100 flex flex-col">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Assignments</h3>
//               <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
//             </div>

//             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
//               {assignments.length > 0 ? assignments.map((assign) => {
//                 let messageText = assign.title.replace("DRILL:", "").replace("HOMEWORK:", "").replace("|", "");
//                 let linkUrl = assign.title.includes("DRILL") ? `/list/drills` : `/list/homework`;

//                 return (
//                   <div key={assign.id} className="p-3 bg-blue-50 border border-blue-100 rounded-lg transition hover:shadow-sm">
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">CO</div>
//                       <div className="flex-1">
//                         <p className="text-xs text-gray-800 leading-snug font-medium">{messageText}</p>
//                         <p className="text-[10px] text-gray-400 mt-1 italic">{new Date(assign.date).toLocaleDateString()}</p>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               }) : (
//                 <div className="p-4 text-center text-gray-400 text-xs italic">No assignments yet.</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SECTION (1/3) */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-4">

//         {/* FLIP CARD SECTION */}
//         <div className="flex flex-col gap-2">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-semibold text-gray-700">Performance Card</h2>
//             {(role === "admin" || role === "coach") && currentCoachId && (
//               <div className="w-auto">
//                 <FlipCardForm playerId={player.id} coachId={currentCoachId} />
//               </div>
//             )}
//           </div>
          
//           {/* THE FLIP CARD ITSELF */}
//           <PlayerFlipCard
//             data={latestCard}
//             playerName={player.user.name}
//             playerImg={player.user.photo || ""}
//             playerId={player.user.userCode}
//           />
//         </div>

//         {/* SHORTCUTS */}
//         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100 mt-4">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-600">
//             <div className="p-3 bg-teal-50 rounded-md flex flex-col items-center gap-2 hover:bg-teal-100 transition border border-teal-100 cursor-pointer">
//               <span>Upload HW</span>
//             </div>
//             <div className="p-3 bg-orange-50 rounded-md flex flex-col items-center gap-2 hover:bg-orange-100 transition border border-orange-100 cursor-pointer">
//               <span>Schedule</span>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };
// export default PlayerView;

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { FlipCardData } from "@/components/PlayerFlipCard";
import { PlayerPerformanceChart, PlayerRadarChart } from "@/components/PlayerCharts";
import PlayerCardSection from "@/components/PlayerCardSection"; 

// 🔥 IMPORT STATIC DRILLS (Make sure path is correct)
import { MASTER_DRILLS } from "@/lib/drills"; 

const PlayerView = async ({ playerId }: { playerId: string }) => {
  
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  // 1. FETCH PLAYER
  const player = await prisma.playerProfile.findUnique({
    where: { id: playerId },
    include: {
      user: true,
      team: true,
      flipCards: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });

  if (!player) return notFound();

  // 2. FETCH COACH INFO
  let currentCoachId = null;
  if (role === "admin" || role === "coach") {
    const myProfile = await prisma.coachProfile.findUnique({ where: { userId: currentUserId } });
    currentCoachId = myProfile ? myProfile.id : (await prisma.coachProfile.findFirst())?.id;
  }

  // 3. 🔥 FETCH & MERGE DRILLS (Database + Static File)
  
  // A. Get Database Drills
  const dbDrills = await prisma.drill.findMany({
    select: { 
        id: true, 
        name: true, 
        category: true, 
        level: true, 
        videoUrl: true, 
        description: true 
    }, 
    orderBy: { name: 'asc' }
  });

  // B. Convert Static Drills to same format
  const staticDrills = MASTER_DRILLS.map(d => ({
      id: d.id, // e.g. "TECH_001"
      name: d.name,
      category: d.category,
      level: d.level,
      // videoUrl logic handle karna padega agar static file mein nahi hai
      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(d.name + " soccer drill")}`, 
      description: d.description
  }));

  // C. Merge Both (Unique by Name to avoid duplicates)
  // Hum pehle DB drills rakhenge, fir Static drills jo DB mein nahi hain
  const drillMap = new Map();
  
  [...dbDrills, ...staticDrills].forEach(d => {
      if (!drillMap.has(d.name)) {
          drillMap.set(d.name, d);
      }
  });
  
  const finalDrillsList = Array.from(drillMap.values());

  console.log("Total Drills Loaded:", finalDrillsList.length); // Debugging

  // 4. FETCH ASSIGNMENTS
  const assignments = await prisma.announcement.findMany({
    where: { audience: playerId },
    orderBy: { date: "desc" },
    take: 5
  });

  // 5. CHART DATA (Same as before)
  const latestCardRaw = player.flipCards[0]?.content;
  const latestCard = latestCardRaw ? (latestCardRaw as unknown as FlipCardData) : null;

  const getAverage = (arr: any[]) => {
      if(!arr || !Array.isArray(arr) || arr.length === 0) return 0;
      const total = arr.reduce((sum, item) => sum + (Number(item.current) || 0), 0);
      return Number((total / arr.length).toFixed(1));
  };

  const performanceData = player.flipCards.slice(0, 6).reverse().map((card, index) => {
    const content = card.content as unknown as FlipCardData;
    return { name: `Card ${index + 1}`, score: content?.overallScore || 0 };
  });

  let radarData = [
    { subject: "Technical", A: 0, fullMark: 10 },
    { subject: "Tactical", A: 0, fullMark: 10 },
    { subject: "Physical", A: 0, fullMark: 10 },
    { subject: "Mental", A: 0, fullMark: 10 },
    { subject: "Attacking", A: 0, fullMark: 10 },
    { subject: "Defending", A: 0, fullMark: 10 },
  ];

  if (latestCard && latestCard.stats) {
      radarData = [
          { subject: "Technical", A: getAverage(latestCard.stats.technical), fullMark: 10 },
          { subject: "Tactical", A: getAverage(latestCard.stats.tactical), fullMark: 10 },
          { subject: "Physical", A: getAverage(latestCard.stats.physical), fullMark: 10 },
          { subject: "Mental", A: getAverage(latestCard.stats.mental), fullMark: 10 },
          { subject: "Attacking", A: Number((latestCard.stats as any).attacking?.current) || 0, fullMark: 10 },
          { subject: "Defending", A: Number((latestCard.stats as any).defending?.current) || 0, fullMark: 10 },
      ];
  }

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
      {/* LEFT SECTION (Charts & Assignments) - Same as before */}
      <div className="w-full xl:w-2/3 flex flex-col gap-4">
        {/* Profile Header */}
        <div className="bg-white py-6 px-6 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-center shadow-sm">
            <div className="w-24 h-24 relative">
              <Image src={player.user.photo || "/noAvatar.png"} alt="Player" fill className="rounded-full object-cover border-4 border-gray-50 shadow-md" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{player.user.name}</h1>
              <p className="text-sm text-gray-500 font-medium">#{player.jerseyNumber || "?"} • {player.team?.name || "No Team"}</p>
            </div>
        </div>

        <PlayerPerformanceChart data={performanceData} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlayerRadarChart data={radarData} />
          
          <div className="bg-white rounded-xl p-4 h-[300px] shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Assignments</h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {assignments.length > 0 ? assignments.map((assign) => {
                let messageText = assign.title.replace("DRILL:", "").replace("HOMEWORK:", "").split("|")[0];
                return (
                  <div key={assign.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">HW</div>
                    <div>
                        <p className="text-xs font-bold text-gray-700 leading-tight">{messageText}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(assign.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              }) : <div className="text-center text-gray-400 text-xs mt-10">No active homework</div>}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        
        {/* PASS THE MERGED LIST HERE */}
        <PlayerCardSection 
            latestCard={latestCard} 
            player={player} 
            role={role} 
            currentCoachId={currentCoachId || null}
            drillsList={finalDrillsList} // <--- Ab isme 100+ items honge
        />
        
      </div>
    </div>
  );
};

export default PlayerView;