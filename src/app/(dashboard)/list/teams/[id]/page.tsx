import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  Users,
  Trophy,
  Calendar,
  Activity,
  MessageSquare,
  Plus,
  Shield,
  Target,
  Hash,
  Landmark // Icon for Club
} from "lucide-react";
import FormModal from "@/components/FormModal";
import { TeamRadarChart, TeamPerformanceChart } from "@/components/TeamCharts";

const CARD_STYLE = "bg-white p-6 rounded-xl shadow-sm border border-gray-100";

const SingleTeamPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 1. FETCH TEAM DATA (Include Club)
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      club: true, // ✅ Include Club Details
      coaches: {
        include: {
          coach: { include: { user: true } }
        }
      },
      players: {
        include: {
          user: true,
          evaluations: true 
        }
      },
      events: {
        where: { startTime: { gte: new Date() } },
        orderBy: { startTime: 'asc' },
        take: 1
      }
    }
  });

  if (!team) return notFound();

  // 2. CALCULATE STATS
  const headCoach = team.coaches[0]?.coach; 
  const nextMatch = team.events[0];
  
  // Calculate Average Rating
  const roster = team.players.map(p => {
    const totalScore = p.evaluations.reduce((sum, ev) => {
        const ratings = ev.overallJson as any; 
        return sum + (Number(ratings?.overall) || 0);
    }, 0);
    const avgRating = p.evaluations.length > 0 ? (totalScore / p.evaluations.length).toFixed(1) : "-";
    
    return {
        id: p.id,
        name: p.user.name,
        pos: "PL",
        matches: p.evaluations.length,
        goals: 0, 
        rating: avgRating
    };
  });

  // Calculate Team DNA
  const dnaStats = { Technical: 0, Tactical: 0, Possession: 0, Physicality: 0, Discipline: 0 };
  let dnaCount = 0;

  team.players.forEach(p => {
      p.evaluations.forEach(ev => {
          const r = ev.ratingsJson as any;
          dnaStats.Technical += Number(r?.technical) || 0;
          dnaStats.Tactical += Number(r?.tactical) || 0;
          dnaStats.Possession += Number(r?.passing) || 0; 
          dnaStats.Physicality += Number(r?.physical) || 0;
          dnaStats.Discipline += Number(r?.discipline) || 0;
          dnaCount++;
      });
  });

  const teamAttributes = [
    { subject: "Technical", A: dnaCount ? Math.round(dnaStats.Technical / dnaCount) : 60, fullMark: 100 },
    { subject: "Tactical", A: dnaCount ? Math.round(dnaStats.Tactical / dnaCount) : 60, fullMark: 100 },
    { subject: "Possession", A: dnaCount ? Math.round(dnaStats.Possession / dnaCount) : 60, fullMark: 100 },
    { subject: "Physical", A: dnaCount ? Math.round(dnaStats.Physicality / dnaCount) : 60, fullMark: 100 },
    { subject: "Discipline", A: dnaCount ? Math.round(dnaStats.Discipline / dnaCount) : 60, fullMark: 100 },
  ];

  return (
    <div className="flex-1 p-4 flex flex-col xl:flex-row gap-6">
      
      {/* --- LEFT SECTION (2/3) --- */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        
        {/* HEADER CARD */}
        <div className={CARD_STYLE}>
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border-2 border-teal-100">
                    <Shield size={32} />
                 </div>
                 
                 <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1"><Hash size={14}/> {team.code}</span>
                        <span className="flex items-center gap-1 text-orange-600"><Users size={14}/> {team.ageGroup}</span>
                    </div>
                 </div>
              </div>

              {/* Admin Actions */}
              {role === "admin" && (
                <div className="flex gap-2">
                  <FormModal table="teams" type="update" data={team} />
                  <FormModal table="teams" type="delete" id={team.id} />
                </div>
              )}
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Trophy size={20}/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Record</p>
                    <p className="text-sm font-bold text-gray-800">0W - 0D - 0L</p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Calendar size={20}/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Next Match</p>
                    <p className="text-sm font-bold text-gray-800 truncate">
                        {nextMatch ? new Date(nextMatch.startTime).toLocaleDateString() : "No Match Scheduled"}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity size={20}/></div>
                 <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Active Players</p>
                    <p className="text-sm font-bold text-gray-800">{team.players.length}</p>
                 </div>
              </div>
           </div>
        </div>

        {/* ROSTER TABLE */}
        <div className={CARD_STYLE}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-700">Active Roster</h2>
                <Link href={`/list/players?teamId=${team.id}`} className="text-xs text-blue-500 font-medium hover:underline">See All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3">Player Name</th>
                            <th className="px-4 py-3 text-center">Pos</th>
                            <th className="px-4 py-3 text-center">Evals</th>
                            <th className="px-4 py-3 text-center">Goals</th>
                            <th className="px-4 py-3 text-right">Avg Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roster.length > 0 ? roster.map((player) => (
                            <tr key={player.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                    <Link href={`/list/players/${player.id}`} className="hover:text-blue-600">{player.name}</Link>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{player.pos}</span>
                                </td>
                                <td className="px-4 py-3 text-center">{player.matches}</td>
                                <td className="px-4 py-3 text-center">{player.goals}</td>
                                <td className="px-4 py-3 text-right font-bold text-teal-600">{player.rating}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-400">No players assigned yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* RECENT MATCH PERFORMANCE CHART */}
        <TeamPerformanceChart />
      </div>

      {/* --- RIGHT SECTION (1/3) --- */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        
        {/* TEAM DNA (RADAR) */}
        <TeamRadarChart data={teamAttributes} />

        {/* ✅ CLUB AFFILIATION CARD */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Club Affiliation</h2>
            {team.club ? (
                <Link href={`/list/club/${team.club.id}`} className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200">
                        <Image 
                            src={team.club.logo || "/football-club.png"} 
                            alt="Club" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{team.club.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{team.club.code}</p>
                    </div>
                    <div className="p-2 text-gray-400 group-hover:text-blue-500">
                        <Landmark size={18} />
                    </div>
                </Link>
            ) : (
                <div className="flex items-center gap-3 p-2 text-gray-400 italic">
                    <div className="p-2 bg-gray-100 rounded-full"><Landmark size={16}/></div>
                    <span className="text-sm">Independent Team</span>
                </div>
            )}
        </div>

        {/* STAFF CARD */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Coaching Staff</h2>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
                    <Image 
                        src={headCoach?.user.photo || "/noAvatar.png"} 
                        alt="Coach" 
                        fill 
                        className="object-cover"
                    />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-800">{headCoach ? headCoach.user.name : "Unassigned"}</h3>
                    <p className="text-xs text-gray-500">Head Coach</p>
                </div>
                {headCoach && (
                    <Link href={`/list/coaches/${headCoach.id}`} className="ml-auto p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <Target size={16} className="text-gray-400 hover:text-teal-600"/>
                    </Link>
                )}
            </div>
        </div>

        {/* ACTIONS */}
        <div className={CARD_STYLE}>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
                <Link href={`/list/events?teamId=${team.id}`} className="p-3 bg-blue-50 rounded-md text-xs text-blue-600 hover:bg-blue-100 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Schedule Session</span>
                    </div>
                    <span className="text-blue-400 group-hover:text-blue-600 font-bold">+</span>
                </Link>
                <Link href={`/list/announcements?audience=${team.id}`} className="p-3 bg-teal-50 rounded-md text-xs text-teal-600 hover:bg-teal-100 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        <span>Message Team</span>
                    </div>
                    <span className="text-teal-400 group-hover:text-teal-600 font-bold">→</span>
                </Link>
                <Link href={`/list/players`} className="p-3 bg-orange-50 rounded-md text-xs text-orange-600 hover:bg-orange-100 flex items-center justify-between group transition-colors">
                    <div className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Add Player</span>
                    </div>
                    <span className="text-orange-400 group-hover:text-orange-600 font-bold">+</span>
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SingleTeamPage;