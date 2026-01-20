import Image from 'next/image';
import prisma from '@/lib/prisma';
import CountRadialChart from './CountRadialChart'; // Import the client component

const CountChart = async () => {
  // 1. FETCH REAL DATA
  const boys = await prisma.playerProfile.count({
    where: { gender: 'M' }
  });

  const girls = await prisma.playerProfile.count({
    where: { gender: 'F' }
  });

  const total = boys + girls;
  
  // Avoid division by zero if database is empty
  const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <div className='bg-white rounded-xl w-full h-full p-4'>
      
      {/* --- TITLE SECTION --- */}
      <div className='flex justify-between items-center'>
        <h1 className='text-lg font-semibold'>Players</h1>
        <Image src="/moreDark.png" alt="More" width={20} height={20} className='cursor-pointer'/>
      </div>

      {/* --- CHART SECTION (Client Component) --- */}
      <CountRadialChart boys={boys} girls={girls} />

      {/* --- BOTTOM LEGEND SECTION --- */}
      <div className='flex justify-center gap-16'>
        
        {/* Boys Data -> Petrol Green */}
        <div className='flex flex-col gap-1 items-center'>
            <div className='w-5 h-5 bg-[#006D77] rounded-full' />
            <h1 className='font-bold text-lg'>{boys}</h1>
            <h2 className='text-xs text-gray-500'>Boys ({boysPercentage}%)</h2>
        </div>

        {/* Girls Data -> Orange */}
        <div className='flex flex-col gap-1 items-center'>
            <div className='w-5 h-5 bg-[#F97316] rounded-full' />
            <h1 className='font-bold text-lg'>{girls}</h1>
            <h2 className='text-xs text-gray-500'>Girls ({girlsPercentage}%)</h2>
        </div>

      </div>
    </div>
  );
};

export default CountChart;