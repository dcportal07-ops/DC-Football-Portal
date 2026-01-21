// import { PaginationDemo } from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import FormModal from "@/components/FormModal";
// import prisma  from "@/lib/prisma";
// import { 
//   Assignment, 
//   CoachProfile, 
//   PlayerProfile, 
//   Prisma, 
//   User 
// } from "@/generated/prisma/client";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { role } from "@/lib/data";
// import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";

// // --- 1. UPDATE INTERFACE TO MATCH YOUR JSON ---
// interface DrillItemJson {
//   code: string; // "TEC_006"
//   sets: string; // "3"
//   reps: string; // "10"
// }

// type AssignmentList = Assignment & {
//   player: PlayerProfile & { user: User };
//   coach: CoachProfile & { user: User };
// };

// const columns = [
//   { header: "Date", accessorKey: "createdAt" },
//   { header: "Player", accessorKey: "player" },
//   { header: "Coach", accessorKey: "coach" },
//   { header: "Template", accessorKey: "template" },
//   { header: "Focus", accessorKey: "skillFocus" },
//   { header: "Ratings", accessorKey: "ratings" },
//   { header: "Drill Details", accessorKey: "drillItems" },
//   { header: "Time", accessorKey: "estimatedTimeMin" },
//   { header: "Feedback", accessorKey: "coachFeedback" },
//   { header: "Status", accessorKey: "status" },
//   { header: "Actions", accessorKey: "actions" },
// ];

// const Assignments = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | undefined };
// }) => {
  
//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page) : 1;

//   // --- QUERY ---
//   const query: Prisma.AssignmentWhereInput = {};

//   if (queryParams.search) {
//     query.OR = [
//       { 
//         player: { 
//           user: { name: { contains: queryParams.search, mode: "insensitive" } } 
//         } 
//       },
//       { template: { contains: queryParams.search, mode: "insensitive" } },
//     ];
//   }

//   // --- FETCH ASSIGNMENTS ---
//   const [data, count] = await prisma.$transaction([
//     prisma.assignment.findMany({
//       where: query,
//       include: {
//         player: { include: { user: true } }, 
//         coach: { include: { user: true } },  
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//       orderBy: { createdAt: 'desc' }, 
//     }),
//     prisma.assignment.count({ where: query }),
//   ]);

//   // --- NEW LOGIC: FETCH DRILL NAMES ---
//   // 1. Collect all unique drill codes from the fetched assignments
//   const allDrillCodes = new Set<string>();
//   data.forEach((assignment) => {
//     const items = assignment.drillItems as unknown as DrillItemJson[];
//     if (Array.isArray(items)) {
//       items.forEach((item) => {
//         if (item.code) allDrillCodes.add(item.code);
//       });
//     }
//   });

//   // 2. Fetch the Drill Names for these codes
//   const drillInfo = await prisma.drill.findMany({
//     where: {
//       code: { in: Array.from(allDrillCodes) }
//     },
//     select: {
//       code: true,
//       name: true
//     }
//   });

//   // 3. Create a lookup map (Code -> Name)
//   const drillMap = new Map<string, string>();
//   drillInfo.forEach(d => drillMap.set(d.code, d.name));


//   // --- RENDER ---
//   const RenderRow = (item: AssignmentList) => {
//     // Cast the JSON
//     const drills = (item.drillItems as unknown as DrillItemJson[]) || [];

//     return (
//       <tr
//         key={item.id}
//         className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm align-top"
//       >
//         <td className="p-4 whitespace-nowrap text-gray-600">
//           {new Date(item.createdAt).toLocaleDateString()}
//         </td>
//         <td className="p-4 whitespace-nowrap font-semibold text-blue-600">
//           {item.player.user.name}
//         </td>
//         <td className="p-4 whitespace-nowrap text-gray-600">
//           {item.coach.user.name}
//         </td>
//         <td className="p-4 whitespace-nowrap font-medium text-gray-700">
//           {item.template}
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
//             {item.skillFocus}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap text-center">
//           <div className="flex items-center gap-2 border px-2 py-1 rounded bg-white w-fit">
//             <span className="text-gray-500">{item.currentRating}</span>
//             <span className="text-gray-400">➜</span>
//             <span className="font-bold text-green-600">{item.goalRating}</span>
//           </div>
//         </td>

//         {/* --- FIXED DRILL RENDERING --- */}
//         <td className="p-4 min-w-[300px]">
//           <ul className="list-disc list-inside space-y-1">
//             {drills.length > 0 ? (
//               drills.map((drill, idx) => {
//                 // Lookup name from map, fallback to code if not found
//                 const drillName = drillMap.get(drill.code) || drill.code || "Unknown Drill";
                
//                 return (
//                   <li key={idx} className="text-xs text-gray-700">
//                     <span className="font-semibold">{drillName}</span>
//                     <span className="text-gray-500 ml-1">
//                       {/* Use 'sets' and 'reps' keys from your JSON */}
//                       ({drill.sets || 0} • {drill.reps || 0})
//                     </span>
//                   </li>
//                 );
//               })
//             ) : (
//               <li className="text-xs text-gray-400 italic">No drills assigned</li>
//             )}
//           </ul>
//         </td>

//         <td className="p-4 whitespace-nowrap text-gray-600">
//           {item.estimatedTimeMin}m
//         </td>
//         <td className="p-4 min-w-[200px] max-w-[250px] truncate text-xs text-gray-600 italic" title={item.coachFeedback || ""}>
//           "{item.coachFeedback || "No feedback"}"
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span
//             className={`px-2 py-1 rounded text-xs font-semibold ${
//               item.status === "SENT"
//                 ? "bg-green-100 text-green-700"
//                 : item.status === "PENDING"
//                 ? "bg-yellow-100 text-yellow-700"
//                 : "bg-gray-100 text-gray-700"
//             }`}
//           >
//             {item.status}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <div className="flex items-center gap-2">
//             <Link href={`/list/homework/${item.id}`}>
//               <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
//                 <Eye size={16} className="text-gray-500" />
//               </Button>
//             </Link>

//             {role === "admin"&& (
//               <>
//                 <FormModal table="homework" type="update" data={item} />
//                 <FormModal table="homework" type="delete" id={item.id} />
//               </>
//             )}
//           </div>
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">All Assignments</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <div className="w-full md:w-auto">
//             <TableSearch />
//           </div>
//           <div className="flex items-center gap-4 self-end md:self-center">
//             <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
//               <SlidersHorizontal size={14} className="text-gray-600" />
//             </Button>
//             <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
//               <ArrowUpDown size={14} className="text-gray-600" />
//             </Button>
//             {role === "admin"  &&  (
//                 <FormModal table="homework" type="create" />
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="w-full overflow-x-auto">
//         <Table columns={columns} data={data} renderRow={RenderRow} />
//       </div>
//       <PaginationDemo page={p} count={count} />
//     </div>
//   );
// };

// export default Assignments;

import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { Assignment, CoachProfile, PlayerProfile, User, Prisma } 
from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

interface DrillItemJson {
  code: string;
  sets: string;
  reps: string;
}

type AssignmentList = Assignment & {
  player: PlayerProfile & { user: User };
  coach: CoachProfile & { user: User };
};

const columns = [
  { header: "Date", accessorKey: "createdAt" },
  { header: "Player", accessorKey: "player" },
  { header: "Coach", accessorKey: "coach" },
  { header: "Template", accessorKey: "template" },
  { header: "Focus", accessorKey: "skillFocus" },
  { header: "Ratings", accessorKey: "ratings" },
  { header: "Drill Details", accessorKey: "drillItems" },
  { header: "Time", accessorKey: "estimatedTimeMin" },
  { header: "Status", accessorKey: "status" },
  { header: "Actions", accessorKey: "actions" },
];

const Assignments = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AssignmentWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { player: { user: { name: { contains: queryParams.search, mode: "insensitive" } } } },
      { template: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  // 🔥 SCOPING LOGIC
  switch (role) {
    case "admin":
      break; 
    case "coach":
      query.coach = { userId: currentUserId! }; // Assignments BY this coach
      break;
    case "player":
      query.player = { userId: currentUserId! }; // Assignments FOR this player
      break;
    default:
      return null;
  }

  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        player: { include: { user: true } }, 
        coach: { include: { user: true } },  
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: 'desc' }, 
    }),
    prisma.assignment.count({ where: query }),
  ]);

  // Drill Name Fetching Logic (Same as before)
  const allDrillCodes = new Set<string>();
  data.forEach((assignment) => {
    const items = assignment.drillItems as unknown as DrillItemJson[];
    if (Array.isArray(items)) {
      items.forEach((item) => { if (item.code) allDrillCodes.add(item.code); });
    }
  });

  const drillInfo = await prisma.drill.findMany({
    where: { code: { in: Array.from(allDrillCodes) } },
    select: { code: true, name: true }
  });
  const drillMap = new Map<string, string>();
  drillInfo.forEach(d => drillMap.set(d.code, d.name));

  const RenderRow = (item: AssignmentList) => {
    const drills = (item.drillItems as unknown as DrillItemJson[]) || [];

    return (
      <tr key={item.id} className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm align-top">
        <td className="p-4 whitespace-nowrap text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</td>
        <td className="p-4 whitespace-nowrap font-semibold text-blue-600">{item.player.user.name}</td>
        <td className="p-4 whitespace-nowrap text-gray-600">{item.coach.user.name}</td>
        <td className="p-4 whitespace-nowrap font-medium text-gray-700">{item.template}</td>
        <td className="p-4 whitespace-nowrap"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">{item.skillFocus}</span></td>
        <td className="p-4 whitespace-nowrap text-center">
          <div className="flex items-center gap-2 border px-2 py-1 rounded bg-white w-fit">
            <span className="text-gray-500">{item.currentRating}</span>
            <span className="text-gray-400">➜</span>
            <span className="font-bold text-green-600">{item.goalRating}</span>
          </div>
        </td>
        <td className="p-4 min-w-[300px]">
          <ul className="list-disc list-inside space-y-1">
            {drills.length > 0 ? (
              drills.map((drill, idx) => {
                const drillName = drillMap.get(drill.code) || drill.code || "Unknown Drill";
                return (
                  <li key={idx} className="text-xs text-gray-700">
                    <span className="font-semibold">{drillName}</span>
                    <span className="text-gray-500 ml-1">({drill.sets || 0} • {drill.reps || 0})</span>
                  </li>
                );
              })
            ) : <li className="text-xs text-gray-400 italic">No drills</li>}
          </ul>
        </td>
        <td className="p-4 whitespace-nowrap text-gray-600">{item.estimatedTimeMin}m</td>
        <td className="p-4 whitespace-nowrap">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "SENT" ? "bg-green-100 text-green-700" : item.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
            {item.status}
          </span>
        </td>
        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Link href={`/list/homework/${item.id}`}>
              <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
                <Eye size={16} className="text-gray-500" />
              </Button>
            </Link>
            {(role === "admin" || role === "coach") && (
              <>
                <FormModal table="homework" type="update" data={item} />
                <FormModal table="homework" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="hidden md:block text-lg font-semibold">{role === "player" ? "My Homework" : "All Assignments"}</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto"><TableSearch /></div>
          <div className="flex items-center gap-4 self-end md:self-center">
            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center"><SlidersHorizontal size={14} className="text-gray-600" /></Button>
            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center"><ArrowUpDown size={14} className="text-gray-600" /></Button>
            {role !== "player" && <FormModal table="homework" type="create" />}
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <Table columns={columns} data={data} renderRow={RenderRow} />
      </div>
      <PaginationDemo page={p} count={count} />
    </div>
  );
};

export default Assignments;