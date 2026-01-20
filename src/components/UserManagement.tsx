import React from 'react';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import FormModal from '@/components/FormModal';
// Importing icons directly to use them visually if needed, 
// though FormModal likely handles the actual icon rendering.
import { Edit, Trash2 } from 'lucide-react'; 

const UserManagement = async () => {
  
  // 1. FETCH DATA
  const coachesData = await prisma.coachProfile.findMany({
    take: 4,
    orderBy: { user: { createdAt: 'desc' } },
    include: { user: true }
  });

  const coaches = coachesData.map(coach => ({
    id: coach.id,
    name: coach.user.name,
    email: coach.user.email || "No Email",
    role: "Coach", 
    avatar: coach.user.photo || "/noAvatar.png",
  }));

  const roleColors: Record<string, string> = {
    "Manager": "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
    "Coach": "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
    "Standard": "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
  };

  // Common style for action button wrappers to ensure they are perfectly round and centered
  const actionIconWrapper = "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200";

  return (
    <div className='bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-full flex flex-col'>
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className='text-xl font-extrabold text-gray-900 tracking-tight'>User Management</h1>
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
            Admin Access
        </span>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className='flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar'>
        
        {/* Action Item: Coach */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer min-w-[70px]">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
                <FormModal table="coaches" type="create" />
            </div>
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors">Coach</span>
        </div>

        {/* Action Item: Player */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer min-w-[70px]">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/30 group-hover:scale-105 transition-transform duration-300">
                <FormModal table="players" type="create" />
            </div>
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-teal-600 transition-colors">Player</span>
        </div>

        {/* Action Item: Team */}
        <div className="flex flex-col items-center gap-2 group cursor-pointer min-w-[70px]">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 group-hover:scale-105 transition-transform duration-300">
                <FormModal table="teams" type="create" />
            </div>
            <span className="text-[11px] font-bold text-gray-500 group-hover:text-orange-600 transition-colors">Team</span>
        </div>

      </div>

      {/* RECENT COACHES LIST */}
      <div className="flex items-center justify-between mb-4">
        <h2 className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Recently Active</h2>
        <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
      </div>
      
      <div className='flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar'>
        {coaches.length > 0 ? (
            coaches.map((coach) => (
            <div 
                key={coach.id} 
                // Removed hover:border-blue-100 for a cleaner look, kept subtle shadow
                className='group flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:shadow-gray-200/50 transition-all duration-300'
            >
                
                {/* LEFT: Avatar & Info */}
                <div className='flex items-center gap-3 overflow-hidden'>
                    <div className='relative'>
                        <div className='w-12 h-12 rounded-full bg-gray-100 relative overflow-hidden border-2 border-white shadow-sm'>
                            <Image src={coach.avatar} alt={coach.name} fill className="object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="min-w-0">
                        <h3 className='font-bold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors'>
                            {coach.name}
                        </h3>
                        <p className='text-xs text-gray-400 truncate max-w-[140px]'>
                            {coach.email}
                        </p>
                    </div>
                </div>

                {/* RIGHT: Role & Actions */}
                <div className='flex flex-col items-end gap-2'>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleColors[coach.role] || roleColors["Standard"]}`}>
                        {coach.role}
                    </span>
                    
                    {/* ✅ PROFESSIONAL ACTION BUTTONS */}
                    <div className='flex items-center gap-1'> 
                        
                        {/* Edit Button Wrapper */}
                        <div className={`${actionIconWrapper} text-gray-400 hover:bg-blue-50 hover:text-blue-600`}>
                            <FormModal table="coaches" type="update" data={coach} />
                        </div>

                        {/* Delete Button Wrapper */}
                        <div className={`${actionIconWrapper} text-gray-400 hover:bg-red-50 hover:text-red-600`}>
                            <FormModal table="coaches" type="delete" id={coach.id} />
                        </div>

                    </div>
                </div>

            </div>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-400 text-sm font-medium">No coaches found.</p>
            </div>
        )}
      </div>

    </div>
  )
}

export default UserManagement;