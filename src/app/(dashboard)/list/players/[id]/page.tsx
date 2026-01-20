// import React from "react";
// import Image from "next/image";
// import { notFound } from "next/navigation";
// import { currentUser } from "@clerk/nextjs/server";
// import prisma from "@/lib/prisma";
// import Link from "next/link";

// // Components
// import FormModal from "@/components/FormModal";
// import PlayerFlipCard, { FlipCardData } from "@/components/PlayerFlipCard";
// import FlipCardForm from "@/components/forms/FlipCardForm";
// import { PlayerPerformanceChart, PlayerRadarChart } from "@/components/PlayerCharts"




// const SingleStudentPage = async ({ params }: { params: { id: string } }) => {
//   const { id } = params;
//   const user = await currentUser();
//   const role = user?.publicMetadata?.role as string;
//   const currentUserId = user?.id;

//   // 1. FETCH PLAYER
//   const player = await prisma.playerProfile.findUnique({
//     where: { id },
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

//   // 3. FETCH ASSIGNMENTS (From Announcement Title)
//   const assignments = await prisma.announcement.findMany({
//     where: {
//       audience: id,
//       OR: [
//         { title: { contains: "DRILL:" } },
//         { title: { contains: "HOMEWORK:" } } // ✅ Check for Homework
//       ]
//     },
//     orderBy: { date: "desc" },
//     take: 5
//   });


//   // 4. PREPARE CHARTS & DATA
//   const latestCardRaw = player.flipCards[0]?.content;
//   const latestCard = latestCardRaw ? (latestCardRaw as unknown as FlipCardData) : null;

//   const performanceData = player.flipCards.slice(0, 6).reverse().map((card, index) => {
//     const content = card.content as unknown as FlipCardData;
//     return { name: `Card ${index + 1}`, score: content?.overallScore || 0 };
//   });
//   if (performanceData.length === 0) performanceData.push({ name: "Start", score: 0 });

//   let radarData = [
//     { subject: "Technical", A: 0, fullMark: 10 },
//     { subject: "Tactical", A: 0, fullMark: 10 },
//     { subject: "Physical", A: 0, fullMark: 10 },
//     { subject: "Mental", A: 0, fullMark: 10 },
//   ];
//   if (latestCard && latestCard.stats) {
//     radarData = latestCard.stats.map(s => ({
//       subject: s.name,
//       A: s.value,
//       fullMark: 10
//     }));
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

//           {/* Admin Edit/Delete */}
//           <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
//             {role === "admin" && (
//               <div className="flex gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
//                 <FormModal
//                   table="players"
//                   type="update"
//                   data={{
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
//         <PlayerPerformanceChart data={performanceData} />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <PlayerRadarChart data={radarData} />

//           {/* ✅ COACH ASSIGNMENTS BOX */}
//           <div className="bg-white rounded-md p-4 h-[350px] shadow-sm border border-gray-100 flex flex-col">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Coach Assignments</h3>
//               <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
//             </div>

//             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">

//               {assignments.length > 0 ? assignments.map((assign) => {
//                 // Parse Tag: "Message |TAG:ID"
//                 let messageText = assign.title;
//                 let linkUrl = "";

//                 if (assign.title.includes("|DRILL:")) {
//                   const parts = assign.title.split("|DRILL:");
//                   messageText = parts[0];
//                   linkUrl = `/list/drills/${parts[1]}`;
//                 } else if (assign.title.includes("|HOMEWORK:")) {
//                   const parts = assign.title.split("|HOMEWORK:");
//                   messageText = parts[0];
//                   linkUrl = `/list/homework/${parts[1]}`; // ✅ Link to Homework Page
//                 }

//                 return (
//                   <div key={assign.id} className="p-3 bg-blue-50 border border-blue-100 rounded-lg transition hover:shadow-sm">
//                     <div className="flex items-start gap-3">
//                       <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">CO</div>
//                       <div className="flex-1">
//                         <p className="text-xs text-gray-800 leading-snug font-medium">{messageText}</p>
//                         <p className="text-[10px] text-gray-400 mt-1 italic">{new Date(assign.date).toLocaleDateString()}</p>

//                         {linkUrl && (
//                           <Link href={linkUrl} className="inline-flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition font-medium mt-2">
//                             View ↗
//                           </Link>
//                         )}
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
//             <h2 className="text-lg font-semibold text-gray-700">Player Smart Card</h2>
//             {(role === "admin" || role === "coach") && currentCoachId && (
//               <div className="w-auto">
//                 <FlipCardForm playerId={player.id} coachId={currentCoachId} />
//               </div>
//             )}
//           </div>
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

// export default SingleStudentPage;


import PlayerView from "@/components/views/PlayerView";

const SingleStudentPage = async ({ params }: { params: { id: string } }) => {
  return <PlayerView playerId={params.id} />;
};

export default SingleStudentPage;