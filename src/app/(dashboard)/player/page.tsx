import Announcement from '@/components/Announcement'
import BigCalendar from '@/components/BigCalender'
import FlipCardLeaderboard from '@/components/FlipCardLeaderboard'
import React from 'react'
import prisma from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

const Player = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 1. FETCH EVENTS
  const eventsData = await prisma.event.findMany();
  
  // 2. FETCH TEAMS (✅ NEW)
  const teamsData = await prisma.team.findMany({
      select: { id: true, name: true } // Only need ID and Name
  });

  const events = eventsData.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime.toISOString(),
    end: event.endTime.toISOString(),
    teamId: event.teamId // Include teamId if you want to show it later
  }));

  return (
    <div className='p-4 flex gap-4 flex-col xl:flex-row'> 
      <div className='w-full xl:w-2/3'>
        <div className='h-full bg-white p-4 rounded-md shadow-sm border border-gray-100'>
          <h1 className='text-xl font-semibold mb-4 text-gray-700'>Schedule Player</h1>
          
          {/* ✅ PASS TEAMS DATA */}
          <BigCalendar initialEvents={events} userRole={role} teams={teamsData} />
          
        </div>
      </div>
      <div className='w-full lg:w-1/3 flex flex-col gap-8'>
        <Announcement/>
        <FlipCardLeaderboard/>
      </div>
    </div>
  )
}

export default Player