"use client"
import Image from 'next/image';
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AttendanceChartProps {
    data: {
        name: string;
        Present: number;
        Absent: number;
    }[]
}

const AttendanceChartClient = ({ data }: AttendanceChartProps) => {
    return (
        <div className='bg-white rounded-xl p-4 h-full'>

            {/* --- HEADER --- */}
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-lg font-semibold'>Weekly Events</h1>
                <Image src='/moreDark.png' alt='Options' width={20} height={20} className='cursor-pointer opacity-60 hover:opacity-100' />
            </div>

            {/* --- CHART --- */}
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    barSize={20}
                >
                    <CartesianGrid vertical={false} stroke="#ddd" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#d1d5db", fontSize: 12 }}
                        dy={10}
                    />

                    <YAxis
                        allowDecimals={false} // Don't show 1.5 events
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#d1d5db", fontSize: 12 }}
                    />

                    <Tooltip
                        contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }}
                        itemStyle={{ color: "#000" }}
                        cursor={{ fill: 'transparent' }}
                    />

                    <Legend
                        align="left"
                        verticalAlign="top"
                        wrapperStyle={{ paddingTop: "20px", paddingBottom: "40px" }}
                    />
                    
                    <Bar
                        dataKey="Present"
                        name="Scheduled" // Renamed for clarity since we are counting Events
                        fill="#006D77" 
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                    
                    <Bar
                        dataKey="Absent"
                        name="Cancelled" // Placeholder label
                        fill="#F97316"
                        legendType="circle"
                        radius={[10, 10, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AttendanceChartClient