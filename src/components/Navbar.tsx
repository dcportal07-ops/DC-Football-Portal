import Image from 'next/image'
import React from 'react'
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';

const Navbar = async () => {

    const user = await currentUser()
    
    // Get the role safely (handle different casing like "Player" or "PLAYER")
    const userRole = user?.publicMetadata?.role as string | undefined;
    const isPlayer = userRole?.toLowerCase() === 'player';

    return (
        <div className='flex flex-col-reverse md:flex-row items-center justify-between p-4 gap-4 bg-transparent'>
            <div className='flex flex-col md:flex-row items-center gap-4 w-full md:w-auto'>

                {/* 2. ANIMATED EXPORT/IMPORT BUTTONS */}
                <div className='flex items-center gap-3 w-full md:w-auto justify-start'>

                    {/* IMPORT BUTTON - Only show if user is NOT a player */}
                    {!isPlayer && (
                        <Link href="/import" className='flex-1 md:flex-none'>
                            <button className='
                                group flex items-center justify-center gap-2 px-4 py-2 rounded-full 
                                bg-black text-white font-bold text-xs shadow-sm w-full
                                transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95
                            '>
                                <span className='transition-transform duration-300 group-hover:translate-y-1'>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 3v13.5M8.25 12.75L12 16.5l3.75-3.75" />
                                    </svg>
                                </span>
                                <span>Import</span>
                            </button>
                        </Link>
                    )}
                </div>

            </div>


            {/* --- RIGHT SIDE: ICONS & PROFILE --- */}
            <div className='flex items-center gap-6 justify-between md:justify-end w-full md:w-auto'>

                <div className='flex gap-4'>
                    <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors'>
                        <Image src='/message.png' alt='messages' width={16} height={16} />
                    </div>

                    <div className='bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative hover:bg-gray-50 transition-colors'>
                        <Image src='/announcement.png' alt='messages' width={16} height={16} />
                        <div className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-xs text-white'>1</div>
                    </div>
                </div>

                <div className='flex items-center gap-3'>
                    <div className='flex flex-col'>
                        <span className='text-xs leading-3 font-medium'>{user?.username || user?.firstName || "User"}</span>
                        <span className='text-[10px] text-gray-500 text-right'>{user?.publicMetadata?.role as String} </span>

                    </div>
                    <UserButton />
                </div>

            </div>

        </div>
    )
}

export default Navbar