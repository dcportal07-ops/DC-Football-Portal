"use client";
import Image from 'next/image';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface CountRadialChartProps {
  boys: number;
  girls: number;
}

const CountRadialChart = ({ boys, girls }: CountRadialChartProps) => {
  const total = boys + girls;
  
  // Prepare data for the chart
  // Note: We use a placeholder for "Total" max value (e.g., total count) to make the rings scale correctly
  const data = [
    {
      name: 'Total',
      count: total,
      fill: 'white', 
    },
    {
      name: 'Girls',
      count: girls,
      fill: '#F97316', 
    },
    {
      name: 'Boys',
      count: boys,
      fill: '#006D77', 
    },
  ];

  return (
    <div className='relative w-full h-[75%]'>
      <ResponsiveContainer>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="40%" 
          outerRadius="100%" 
          barSize={32} 
          data={data}
        >
          <RadialBar
            background
            dataKey="count"
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Absolute Centered Image/Icon */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <Image src="/maleFemale.png" alt="" width={50} height={50} className='opacity-80' />
      </div>
    </div>
  );
};

export default CountRadialChart;