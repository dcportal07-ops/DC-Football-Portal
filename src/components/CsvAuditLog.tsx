"use client";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// Type definition for consistency
type LogEntry = {
  id: string;
  action: string;
  filename: string;
  status: 'SUCCESS' | 'FAILED';
  rowCount: number;
  createdAt: string;
  user: {
    name: string;
    photo: string | null;
    role: string;
  };
};

const CsvAuditLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Data Fetching
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/logs');
        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to load logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Calculate Success Count for Stats
  const successCount = logs.filter(l => l.status === 'SUCCESS').length;
  const failCount = logs.filter(l => l.status === 'FAILED').length;

  return (
    <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col'>
      
      {/* --- HEADER & STATS --- */}
      <div className='flex justify-between items-start mb-6'>
        <div>
            <h1 className='text-xl font-bold text-gray-800'>Import History</h1>
            <p className='text-xs text-gray-500 mt-1'>Track recent data uploads</p>
        </div>
        
        {/* Quick Stats Box */}
        <div className='flex gap-2'>
            <div className='px-3 py-1 bg-green-50 rounded-lg flex flex-col items-center border border-green-100'>
                <span className='text-[10px] text-green-600 font-bold uppercase'>Success</span>
                <span className='text-sm font-bold text-green-700'>{successCount}</span>
            </div>
            <div className='px-3 py-1 bg-red-50 rounded-lg flex flex-col items-center border border-red-100'>
                <span className='text-[10px] text-red-500 font-bold uppercase'>Failed</span>
                <span className='text-sm font-bold text-red-700'>{failCount}</span>
            </div>
        </div>
      </div>

      {/* --- LOG LIST --- */}
      <div className='flex flex-col gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar'>
        
        {loading ? (
            <p className="text-center text-gray-400 text-sm py-10">Loading logs...</p>
        ) : logs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No imports found.</p>
        ) : (
            logs.map((log) => (
                <div 
                    key={log.id} 
                    className='group flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-gray-50/50'
                >
                    {/* 1. Icon Section (Green for Success, Red for Fail) */}
                    <div className={`
                        w-10 h-10 min-w-[40px] rounded-full flex items-center justify-center
                        ${log.status === 'SUCCESS' ? 'bg-[#E3FCEF] text-green-700' : 'bg-red-100 text-red-600'}
                    `}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5M8.25 12.75L12 16.5l3.75-3.75" />
                        </svg>
                    </div>

                    {/* 2. Main Details */}
                    <div className='flex-1'>
                        <div className='flex justify-between items-start'>
                            <h3 className='text-sm font-bold text-gray-800'>{log.action}</h3>
                            <span className='text-[10px] text-gray-400'>
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                        </div>
                        
                        {/* Filename & Row Count */}
                        <div className='flex items-center gap-2 mt-1'>
                            <code className='text-xs bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 font-mono max-w-[150px] truncate'>
                                {log.filename || "Unknown file"}
                            </code>
                            <span className={`text-[10px] font-medium ${log.status === 'FAILED' ? 'text-red-500' : 'text-green-600'}`}>
                                • {log.status === 'SUCCESS' ? `${log.rowCount} rows added` : 'Failed'}
                            </span>
                        </div>

                        {/* User Info */}
                        <div className='flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/60'>
                            <div className='w-4 h-4 relative rounded-full overflow-hidden bg-gray-200'>
                                <Image 
                                    src={log.user?.photo || '/no-avatar.png'} 
                                    alt="user" 
                                    fill
                                    className='object-cover'
                                />
                            </div>
                            <span className='text-xs text-gray-500'>
                                by <span className='font-medium text-gray-700'>{log.user?.name || "Unknown"}</span>
                                <span className='ml-1 text-[10px] text-gray-400'>({log.user?.role})</span>
                            </span>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

export default CsvAuditLog