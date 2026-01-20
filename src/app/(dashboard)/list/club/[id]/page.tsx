import FormModal from "@/components/FormModal";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Users, Shield, Calendar, Trophy } from "lucide-react";

const SingleClubPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 1. FETCH CLUB with TEAMS & COACHES
  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      teams: {
        include: {
          coaches: {
             include: {
                 coach: {
                     include: { user: true }
                 }
             }
          },
          _count: { select: { players: true } } // Count players in each team
        }
      }
    },
  });

  if (!club) return notFound();

  // 2. CALCULATE STATS
  const totalTeams = club.teams.length;
  // Calculate unique coaches across all teams in this club
  const allCoaches = club.teams.flatMap(t => t.coaches.map(c => c.coach.id));
  const totalCoaches = new Set(allCoaches).size;
  const totalPlayers = club.teams.reduce((acc, team) => acc + (team._count?.players || 0), 0);

  return (
    <div className="flex-1 p-4 flex flex-col gap-6">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-6">
              {/* BIG CLUB LOGO */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
                <Image
                  src={club.logo || "/football-club.png"}
                  alt={club.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold text-gray-800">{club.name}</h1>
                  <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-mono border border-gray-200">
                          {club.code}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                         Est. {new Date(club.createdAt).getFullYear()}
                      </span>
                  </div>
              </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
             {(role === "admin" || role === "coach") && (
                 <>
                   <FormModal table="clubs" type="update" data={club} />
                   <FormModal table="clubs" type="delete" id={club.id} />
                 </>
             )}
          </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Shield size={24}/></div>
              <div><h2 className="text-2xl font-bold text-gray-800">{totalTeams}</h2><p className="text-xs text-gray-500 uppercase">Teams</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-full text-orange-600"><Users size={24}/></div>
              <div><h2 className="text-2xl font-bold text-gray-800">{totalPlayers}</h2><p className="text-xs text-gray-500 uppercase">Players</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-full text-purple-600"><Trophy size={24}/></div>
              <div><h2 className="text-2xl font-bold text-gray-800">{totalCoaches}</h2><p className="text-xs text-gray-500 uppercase">Coaches</p></div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-full text-green-600"><Calendar size={24}/></div>
              <div><h2 className="text-xl font-bold text-gray-800">Active</h2><p className="text-xs text-gray-500 uppercase">Status</p></div>
          </div>
      </div>

      {/* --- TEAMS LIST SECTION --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
          <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Club Teams</h2>
              {/* Optional: Add "Create Team" button pre-linked to this club if desired */}
          </div>

          {club.teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {club.teams.map((team) => {
                      const headCoach = team.coaches[0]?.coach?.user?.name || "No Coach";
                      return (
                        <Link href={`/list/teams/${team.id}`} key={team.id} className="group">
                           <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all bg-gray-50/50">
                               <div className="flex justify-between items-start mb-2">
                                   <div className="flex flex-col">
                                       <span className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                                          {team.name}
                                       </span>
                                       <span className="text-xs text-gray-400 font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded w-max mt-1">
                                          {team.code}
                                       </span>
                                   </div>
                                   <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-md">
                                     {team.ageGroup}
                                   </span>
                               </div>

                               <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
                                   <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">⚽</div>
                                       <span className="text-xs">{team._count.players} Players</span>
                                   </div>
                                   <span className="text-xs font-medium text-gray-500">Coach: {headCoach}</span>
                               </div>
                           </div>
                        </Link>
                      );
                  })}
              </div>
          ) : (
              <div className="text-center py-10 text-gray-400 italic bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  No teams added to this club yet.
              </div>
          )}
      </div>

    </div>
  );
};

export default SingleClubPage;