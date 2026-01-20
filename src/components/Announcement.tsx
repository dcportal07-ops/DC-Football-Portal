import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const COLORS = [
  "bg-blue-50",
  "bg-yellow-50",
  "bg-purple-50",
  "bg-pink-50",
];

const Announcement = async () => {
  
  // ✅ FIX 1: Add 'await' before auth()
  // ✅ FIX 2: Removed 'userId' to fix "value never read" error
  const { sessionClaims } = await auth();
  
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // 2. FETCH DATA FROM DB
  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
  });

  return (
    <div className='bg-white p-4 rounded-xl shadow-sm h-fit'>
        <div className='flex items-center justify-between mb-4'>
            <h1 className='text-lg font-bold text-gray-800'>Announcements</h1>
            <span className='text-xs font-medium text-gray-400 hover:text-gray-800 cursor-pointer transition-colors'>
                View All
            </span>
        </div>

        <div className='flex flex-col gap-4'>
            {data.length > 0 ? (
                data.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`
                            ${COLORS[index % COLORS.length]} 
                            rounded-xl p-4 
                            cursor-pointer transition-all duration-200 
                            hover:shadow-md hover:scale-[1.01]
                        `}
                    >
                        <div className='flex items-center justify-between mb-2'>
                            <h2 className='font-semibold text-gray-700 text-sm'>{item.title}</h2>
                            <span className='text-[10px] text-gray-500 bg-white/60 px-2 py-1 rounded-md shadow-sm'>
                                {new Intl.DateTimeFormat("en-GB").format(new Date(item.date))}
                            </span>
                        </div>
                        
                        {/* <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>
                            {item.description}
                        </p> */}
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-gray-400 text-xs italic">
                    No announcements yet.
                </div>
            )}
        </div>
    </div>
  )
}

export default Announcement