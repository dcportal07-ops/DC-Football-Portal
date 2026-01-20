// import React from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import prisma from "@/lib/prisma";
// import FormModal from "@/components/FormModal";
// import { CoachMiddleCharts, CoachDemographicsChart } from "@/components/CoachCharts";

// // --- COLORS ---
// const TEAL = "#006D77";
// const ORANGE = "#F97316";

// const SingleTeacherPage = async ({ params }: { params: { id: string } }) => {
//   const { id } = params;

//   // 1. FETCH COACH DATA WITH DEEP RELATIONS
//   const coach = await prisma.coachProfile.findUnique({
//     where: { id },
//     include: {
//       user: true,
//       teams: {
//         include: {
//           team: {
//             include: {
//               _count: { select: { players: true } },
//               events: {
//                  where: { startTime: { gte: new Date() } },
//                  take: 3,
//                  orderBy: { startTime: 'asc' }
//               },
//               players: { 
//                 select: { gender: true } 
//               }
//             }
//           }
//         }
//       },
//       evaluations: true 
//     },
//   });

//   if (!coach) return notFound();

//   // 2. CALCULATE KPIS & CHARTS DATA (Unchanged logic)
//   let boysCount = 0;
//   let girlsCount = 0;

//   coach.teams.forEach(t => {
//       t.team.players.forEach(p => {
//           if (p.gender === 'M') boysCount++;
//           else if (p.gender === 'F') girlsCount++;
//       });
//   });

//   const demographicsData = [
//     { name: "Boys", value: boysCount, fill: TEAL },
//     { name: "Girls", value: girlsCount, fill: ORANGE },
//   ];

//   let skillsTotal = { Technical: 0, Tactical: 0, Physical: 0, Mental: 0, Teamwork: 0, Discipline: 0 };
//   let evalCount = coach.evaluations.length;

//   if (evalCount > 0) {
//       coach.evaluations.forEach(ev => {
//           const ratings = ev.ratingsJson as any; 
//           skillsTotal.Technical += Number(ratings?.technical) || 0;
//           skillsTotal.Tactical += Number(ratings?.tactical) || 0;
//           skillsTotal.Physical += Number(ratings?.physical) || 0;
//           skillsTotal.Mental += Number(ratings?.mental) || 0;
//           skillsTotal.Teamwork += Number(ratings?.teamwork) || 0;
//           skillsTotal.Discipline += Number(ratings?.discipline) || 0;
//       });
//   }

//   const skillsData = [
//     { subject: "Technical", A: evalCount ? Math.round(skillsTotal.Technical / evalCount) : 60, fullMark: 100 },
//     { subject: "Tactical", A: evalCount ? Math.round(skillsTotal.Tactical / evalCount) : 65, fullMark: 100 },
//     { subject: "Physical", A: evalCount ? Math.round(skillsTotal.Physical / evalCount) : 70, fullMark: 100 },
//     { subject: "Mental", A: evalCount ? Math.round(skillsTotal.Mental / evalCount) : 75, fullMark: 100 },
//     { subject: "Teamwork", A: evalCount ? Math.round(skillsTotal.Teamwork / evalCount) : 80, fullMark: 100 },
//     { subject: "Discipline", A: evalCount ? Math.round(skillsTotal.Discipline / evalCount) : 85, fullMark: 100 },
//   ];

//   const performanceData = [
//     { name: "Week 1", score: evalCount > 0 ? 65 : 0 },
//     { name: "Week 2", score: evalCount > 1 ? 72 : 0 },
//     { name: "Week 3", score: evalCount > 2 ? 68 : 0 },
//     { name: "Week 4", score: evalCount > 3 ? 85 : 0 },
//     { name: "Week 5", score: evalCount > 4 ? 78 : 0 },
//     { name: "Week 6", score: evalCount > 5 ? 90 : 0 },
//   ];

//   const totalPlayers = coach.teams.reduce((sum, t) => sum + t.team._count.players, 0);
//   const totalSessions = coach.teams.reduce((sum, t) => sum + t.team.events.length, 0);
  
//   const upcomingEvents = coach.teams
//     .flatMap(t => t.team.events.map(evt => ({ ...evt, teamName: t.team.name })))
//     .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
//     .slice(0, 3);

//   return (
//     <div className="flex-1 p-4 flex flex-col xl:flex-row gap-4">
//       {/* LEFT SECTION (2/3) */}
//       <div className="w-full xl:w-2/3 flex flex-col gap-4">

//         {/* TOP: PROFILE & KPIS */}
//         <div className="flex flex-col lg:flex-row gap-4">

//           {/* USER CARD */}
//           <div className="bg-[#E0F2F1] py-6 px-6 rounded-md flex-1 flex flex-col sm:flex-row gap-6 min-w-[300px] border border-teal-100 items-center sm:items-start">
            
//             {/* Image */}
//             <div className="w-32 h-32 flex-shrink-0 relative">
//               <Image
//                 src={coach.user.photo || "/noAvatar.png"}
//                 alt="Coach"
//                 fill
//                 className="rounded-full object-cover border-4 border-white shadow-md"
//               />
//             </div>

//             {/* Content */}
//             <div className="flex-1 flex flex-col justify-between gap-4 w-full">
//               <div className="text-center sm:text-left">
//                 <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mb-2">
//                   <h1 className="text-xl font-bold text-slate-800">{coach.user.name}</h1>
                  
//                   {/* 🔥 UPDATED FORM MODAL - FLATTENING DATA HERE */}
//                   <FormModal 
//                     table="coaches" 
//                     type="update" 
//                     data={{
//                       id: coach.id,               // Coach Profile ID
//                       username: coach.user.userCode, // Map userCode -> username
//                       name: coach.user.name,      // Flatten name
//                       email: coach.user.email,    // Flatten email
//                       phone: coach.user.phone || "", // Handle potential null
//                       img: coach.user.photo,
//                       // Flatten Teams: Convert object array to ID array ["id1", "id2"]
//                       teams: coach.teams.map((t) => t.team.id),
//                     }} 
//                   />

//                   <span className="text-[10px] bg-white px-2 py-1 rounded-full text-slate-500 border border-slate-200 font-semibold whitespace-nowrap">
//                     Coach ID: {coach.user.userCode}
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-600 leading-relaxed">
//                   Managing {coach.teams.length} Teams. Focus on player development.
//                 </p>
//               </div>

//               {/* Contact Info */}
//               <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-700 justify-center sm:justify-start">
//                 <div className="flex items-center gap-2">
//                   <Image src="/mail.png" alt="" width={14} height={14} className="opacity-60" />
//                   <span className="truncate">{coach.user.email}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Image src="/phone.png" alt="" width={14} height={14} className="opacity-60" />
//                   <span>{coach.user.phone || "No Phone"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* KPI CARDS GRID */}
//           <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
//             <div className="bg-white p-4 rounded-md flex flex-col justify-center w-full shadow-sm border border-gray-100">
//               <h1 className="text-2xl font-bold text-[#006D77]">{totalPlayers}</h1>
//               <span className="text-sm text-gray-400 font-medium">Total Players</span>
//             </div>
//             <div className="bg-white p-4 rounded-md flex flex-col justify-center w-full shadow-sm border border-gray-100">
//               <h1 className="text-2xl font-bold text-[#F97316]">{coach.teams.length}</h1>
//               <span className="text-sm text-gray-400 font-medium">Teams</span>
//             </div>
//             <div className="bg-white p-4 rounded-md flex flex-col justify-center w-full shadow-sm border border-gray-100">
//               <h1 className="text-2xl font-bold text-[#006D77]">{totalSessions}</h1>
//               <span className="text-sm text-gray-400 font-medium">Sessions</span>
//             </div>
//             <div className="bg-white p-4 rounded-md flex flex-col justify-center w-full shadow-sm border border-gray-100">
//               <h1 className="text-2xl font-bold text-[#F97316]">4.8</h1>
//               <span className="text-sm text-gray-400 font-medium">Rating</span>
//             </div>
//           </div>
//         </div>

//         {/* MIDDLE: CHARTS SECTION */}
//         <CoachMiddleCharts skillsData={skillsData} performanceData={performanceData} />

//       </div>

//       {/* RIGHT SECTION (1/3) */}
//       <div className="w-full xl:w-1/3 flex flex-col gap-4">

//         {/* MY TEAMS */}
//         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">My Teams</h2>
//           <div className="flex flex-col gap-3">
//             {coach.teams.map((t) => (
//               <Link href={`/list/teams/${t.team.id}`} key={t.team.id} className="block transition-transform hover:scale-[1.02]">
//                 <div className="p-4 rounded-md border flex items-center justify-between bg-teal-50 text-[#006D77] border-teal-100 hover:shadow-md cursor-pointer">
//                   <div>
//                     <h3 className="font-bold text-sm">{t.team.name}</h3>
//                     <p className="text-[10px] opacity-80">{t.team.ageGroup}</p>
//                   </div>
//                   <div className="text-right">
//                     <h4 className="font-bold text-sm">{t.team._count.players} Players</h4>
//                     <p className="text-[10px] font-medium opacity-80 text-blue-600">View Team →</p>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//             {coach.teams.length === 0 && <p className="text-xs text-gray-500">No teams assigned yet.</p>}
//           </div>
//           <Link href="/list/teams" className="block text-center text-xs text-gray-400 font-medium mt-3 hover:text-gray-600">Manage All Teams</Link>
//         </div>

//         {/* SHORTCUTS */}
//         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-600">
//             <Link href="/list/events" className="p-3 bg-teal-50 rounded-md flex flex-col items-center gap-2 hover:bg-teal-100 transition border border-teal-100">
//               <Image src="/calendar.png" alt="" width={20} height={20} />
//               <span>Schedule</span>
//             </Link>
//             <Link href="/list/assignments" className="p-3 bg-orange-50 rounded-md flex flex-col items-center gap-2 hover:bg-orange-100 transition border border-orange-100">
//               <Image src="/subject.png" alt="" width={20} height={20} />
//               <span>Assign</span>
//             </Link>
//             <Link href="/list/evaluations" className="p-3 bg-blue-50 rounded-md flex flex-col items-center gap-2 hover:bg-blue-100 transition border border-blue-100">
//               <Image src="/result.png" alt="" width={20} height={20} />
//               <span>Evaluate</span>
//             </Link>
//           </div>
//         </div>

//         {/* UPCOMING SCHEDULE */}
//         <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
//           <h2 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Training</h2>
//           <div className="flex flex-col gap-4">
//             {upcomingEvents.length > 0 ? upcomingEvents.map((evt, index) => (
//               <div key={index} className={`flex flex-col gap-1 p-3 rounded-md border-l-4 bg-gray-50 ${index % 2 === 0 ? 'border-l-[#006D77]' : 'border-l-[#F97316]'}`}>
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-semibold text-gray-700 text-sm">{evt.title}</h3>
//                   <span className="text-xs text-gray-400">{new Date(evt.startTime).toLocaleDateString()}</span>
//                 </div>
//                 <div className="flex justify-between text-xs text-gray-500">
//                    <span>{evt.teamName}</span>
//                    <span>{new Date(evt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
//                 </div>
//               </div>
//             )) : <p className="text-xs text-gray-500">No upcoming events.</p>}
//           </div>
//           <Link href="/list/calendar" className="block text-center text-xs text-[#006D77] font-medium mt-4 hover:underline">See Full Calendar</Link>
//         </div>

//         {/* DEMOGRAPHICS CHART */}
//         <CoachDemographicsChart data={demographicsData} />

//       </div>
//     </div>
//   );
// };

// export default SingleTeacherPage;

import CoachView from "@/components/views/CoachView";

const SingleTeacherPage = async ({ params }: { params: { id: string } }) => {
  return <CoachView coachId={params.id} />;
};

export default SingleTeacherPage;