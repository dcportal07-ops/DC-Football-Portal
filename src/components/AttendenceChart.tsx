import prisma from '@/lib/prisma';
import AttendanceChartClient from './AttendanceChartClient';

const AttendanceChart = async () => {
  const today = new Date();
  
  // 1. CALCULATE START OF WEEK (Monday)
  // detailed math to get the Monday of the current week
  const dayOfWeek = today.getDay(); 
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust if today is Sunday (0)
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() + diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // 2. FETCH EVENTS FOR THIS WEEK
  const events = await prisma.event.findMany({
    where: {
      startTime: {
        gte: startOfWeek,
        lte: endOfWeek
      }
    }
  });

  // 3. PROCESS DATA FOR CHART
  // Initialize map for Mon-Fri
  const daysMap = {
    Mon: { present: 0, absent: 0 },
    Tue: { present: 0, absent: 0 },
    Wed: { present: 0, absent: 0 },
    Thu: { present: 0, absent: 0 },
    Fri: { present: 0, absent: 0 },
    Sat: { present: 0, absent: 0 },
    Sun: { present: 0, absent: 0 },
  };

  // Loop through events and increment counts
  events.forEach(event => {
    const dayName = event.startTime.toLocaleDateString('en-US', { weekday: 'short' });
    // @ts-ignore - Check if day exists in map to be safe
    if (daysMap[dayName]) {
       // @ts-ignore
       daysMap[dayName].present += 1;
    }
  });

  // Convert Map to Array for Recharts
  const data = Object.keys(daysMap).map(day => ({
    name: day,
    // @ts-ignore
    Present: daysMap[day].present,
    // @ts-ignore
    Absent: daysMap[day].absent // Will be 0 for now as per schema limitations
  }));

  return (
    <div className='w-full h-full'>
       <AttendanceChartClient data={data} />
    </div>
  );
};

export default AttendanceChart;