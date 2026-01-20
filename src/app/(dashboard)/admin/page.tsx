import Announcements from '@/components/Announcement'
import AttendenceChart from '@/components/AttendenceChart'
import CountChart from '@/components/CountChart'
import CsvAuditLog from '@/components/CsvAuditLog'
import EventCalander from '@/components/EventCalander'
import FlipCardLeaderboard from '@/components/FlipCardLeaderboard'
import RadarComparison from '@/components/RadarComparison'
import UserCard from '@/components/UserCard'
import UserManagement from '@/components/UserManagement'
import React from 'react'
import prisma from '@/lib/prisma'

const Admin = async () => {
  
  // 1. FETCH EVENTS FROM DB
  const eventsData = await prisma.event.findMany({
      orderBy: { startTime: 'desc' }, // Latest events first
      take: 10 // Optional: Limit to recent 10 to keep admin page fast
  });

  // 2. TRANSFORM DATA (Date -> String)
  const events = eventsData.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startTime.toISOString(),
    end: event.endTime.toISOString(),
    teamId: event.teamId
  }));

  return (
    <div className='p-4 flex gap-3 flex-col md:flex-row'>

      {/* --- LEFT SECTION --- */}
      <div className='w-full md:w-2/3 flex flex-col gap-4'>
        
        {/* Top Cards */}
        <div className='flex gap-4 justify-between flex-wrap'>
          <UserCard type='Players' />
          <UserCard type='Coach' />
          <UserCard type='Evalutions' />
          <UserCard type='Teams' />
          <UserCard type='FlipCards generated So Far' />
        </div>

        {/* Mid-charts */}
        <div className='flex gap-4 flex-col lg:flex-row'>
          {/* CountChart */}
          <div className='w-full lg:w-1/3 h-[450px]'><CountChart /></div>
          {/* AttendenceChart */}
          <div className='w-full lg:w-2/3 h-[450px]'><AttendenceChart /></div>
        </div>

        {/* Bottom-Charts */}
        <div><RadarComparison /></div>
        <div><CsvAuditLog/></div>
      </div>


      {/* --- RIGHT SECTION --- */}
      <div className='w-full lg:w-1/3 flex flex-col gap-8'>
        
        {/* ✅ Pass Real Events Data */}
        <EventCalander events={events}/>
        
        <Announcements/>
        <UserManagement/>
        <FlipCardLeaderboard/>
      </div>

    </div>
  )
}

export default Admin