// import { PaginationDemo } from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import FormModal from "@/components/FormModal";
// import prisma from "@/lib/prisma";
// import { Evaluation, PlayerProfile, CoachProfile, Prisma, User } from "@/generated/prisma/client";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { currentUser } from "@clerk/nextjs/server"; // Fixed import
// import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";

// // --- TYPES ---
// interface OverallScores {
//   technical: number;
//   tactical: number;
//   physical: number;
//   mental: number;
//   attacking: number;
//   defending: number;
// }

// type EvaluationList = Evaluation & {
//   player: PlayerProfile & { user: User };
//   coach: CoachProfile & { user: User };
// };

// const columns = [
//   { header: "Date", accessorKey: "createdAt" },
//   { header: "Player Name", accessorKey: "player" },
//   { header: "Coach", accessorKey: "coach" },
//   { header: "Technical", accessorKey: "technical" },
//   { header: "Tactical", accessorKey: "tactical" },
//   { header: "Physical", accessorKey: "physical" },
//   { header: "Mental", accessorKey: "mental" },
//   { header: "Attacking", accessorKey: "attacking" },
//   { header: "Defending", accessorKey: "defending" },
//   { header: "Note", accessorKey: "note" },
//   { header: "Actions", accessorKey: "actions" },
// ];

// const Evaluations = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | undefined };
// }) => {
  
//   // 1. GET PARAMS
//   const { page, ...queryParams } = searchParams;
//   const p = page ? parseInt(page) : 1;

//   // 2. GET USER ROLE
//   const user = await currentUser();
//   const role = user?.publicMetadata?.role as string;

//   // 3. BUILD QUERY
//   const query: Prisma.EvaluationWhereInput = {};

//   if (queryParams.search) {
//     query.player = {
//       user: {
//         name: { contains: queryParams.search, mode: "insensitive" },
//       },
//     };
//   }

//   // 4. FETCH DATA
//   const [data, count] = await prisma.$transaction([
//     prisma.evaluation.findMany({
//       where: query,
//       include: {
//         player: { include: { user: true } },
//         coach: { include: { user: true } },
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//       orderBy: { createdAt: "desc" }, // Most recent first
//     }),
//     prisma.evaluation.count({ where: query }),
//   ]);

//   // 5. RENDER ROW
//   const RenderRow = (item: EvaluationList) => {
//     // Cast the JSON field
//     const scores = item.overallJson as unknown as OverallScores;

//     // ✅ HELPER: Format Score (75 -> 7.5)
//     const formatScore = (val: number | undefined | null) => {
//       if (val === undefined || val === null) return "-";
//       const num = Number(val);
//       // If score is > 10 (e.g. 70), divide by 10. If it's already 7, leave it.
//       return (num > 10 ? num / 10 : num).toFixed(1);
//     };

//     return (
//       <tr
//         key={item.id}
//         className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
//       >
//         {/* DATE */}
//         <td className="p-4 whitespace-nowrap text-gray-600">
//           {new Date(item.createdAt).toLocaleDateString()}
//         </td>

//         {/* PLAYER NAME */}
//         <td className="p-4 whitespace-nowrap font-semibold text-blue-600">
//           {item.player.user.name}
//         </td>

//         {/* COACH NAME */}
//         <td className="p-4 whitespace-nowrap text-gray-600">
//           {item.coach?.user?.name || "Unknown"}
//         </td>

//         {/* --- SCORES --- */}
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">
//             {formatScore(scores?.technical)}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
//             {formatScore(scores?.tactical)}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-medium">
//             {formatScore(scores?.physical)}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-medium">
//             {formatScore(scores?.mental)}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 font-medium">
//             {formatScore(scores?.attacking)}
//           </span>
//         </td>
//         <td className="p-4 whitespace-nowrap">
//           <span className="px-2 py-1 rounded bg-red-50 text-red-700 font-medium">
//             {formatScore(scores?.defending)}
//           </span>
//         </td>

//         {/* NOTE */}
//         <td className="p-4 min-w-[200px] max-w-[300px] truncate text-gray-600" title={item.note || ""}>
//           {item.note || "-"}
//         </td>

//         {/* ACTIONS */}
//         <td className="p-4 whitespace-nowrap">
//           <div className="flex items-center gap-2">
//             <Link href={`/list/evaluations/${item.id}`}>
//               <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
//                 <Eye size={16} className="text-gray-500" />
//               </Button>
//             </Link>

//             {role === "admin" && (
//               <>
//                 <FormModal table="evaluations" type="update" data={item} />
//                 <FormModal table="evaluations" type="delete" id={item.id} />
//               </>
//             )}
//           </div>
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* HEADER */}
//       <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">All Evaluations</h1>

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

//             {role === "admin" && (
//                 <FormModal table="evaluations" type="create" />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="w-full overflow-x-auto">
//         <Table columns={columns} data={data} renderRow={RenderRow} />
//       </div>

//       {/* PAGINATION */}
//       <PaginationDemo page={p} count={count} />
//     </div>
//   );
// };

// export default Evaluations;








import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { Evaluation, PlayerProfile, CoachProfile, User } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { currentUser } from "@clerk/nextjs/server"; 
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";

// --- TYPES ---
interface OverallScores {
  technical: number;
  tactical: number;
  physical: number;
  mental: number;
  attacking: number;
  defending: number;
}

type EvaluationList = Evaluation & {
  player: PlayerProfile & { user: User };
  coach: CoachProfile & { user: User };
};

const columns = [
  { header: "Date", accessorKey: "createdAt" },
  { header: "Player Name", accessorKey: "player" },
  { header: "Coach", accessorKey: "coach" },
  { header: "Technical", accessorKey: "technical" },
  { header: "Tactical", accessorKey: "tactical" },
  { header: "Physical", accessorKey: "physical" },
  { header: "Mental", accessorKey: "mental" },
  { header: "Attacking", accessorKey: "attacking" },
  { header: "Defending", accessorKey: "defending" },
  { header: "Note", accessorKey: "note" },
  { header: "Actions", accessorKey: "actions" },
];

const Evaluations = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.EvaluationWhereInput = {};

  if (queryParams.search) {
    query.player = { user: { name: { contains: queryParams.search, mode: "insensitive" } } };
  }

  // 🔥 SCOPING LOGIC
  switch (role) {
    case "admin": 
      break; // See all
    case "coach":
      query.coach = { userId: currentUserId! }; // See evaluations created BY this coach
      break;
    case "player":
      query.player = { userId: currentUserId! }; // See evaluations FOR this player
      break;
    default: 
      return null;
  }

  const [data, count] = await prisma.$transaction([
    prisma.evaluation.findMany({
      where: query,
      include: { player: { include: { user: true } }, coach: { include: { user: true } } },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { createdAt: "desc" },
    }),
    prisma.evaluation.count({ where: query }),
  ]);

  // 5. RENDER ROW
  const RenderRow = (item: EvaluationList) => {
    const scores = item.overallJson as unknown as OverallScores;

    const formatScore = (val: number | undefined | null) => {
      if (val === undefined || val === null) return "-";
      const num = Number(val);
      return (num > 10 ? num / 10 : num).toFixed(1);
    };

    return (
      <tr
        key={item.id}
        className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
      >
        <td className="p-4 whitespace-nowrap text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </td>
        <td className="p-4 whitespace-nowrap font-semibold text-blue-600">
          {item.player.user.name}
        </td>
        <td className="p-4 whitespace-nowrap text-gray-600">
          {item.coach?.user?.name || "Unknown"}
        </td>

        {/* SCORES */}
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">{formatScore(scores?.technical)}</span></td>
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">{formatScore(scores?.tactical)}</span></td>
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-purple-50 text-purple-700 font-medium">{formatScore(scores?.physical)}</span></td>
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-green-50 text-green-700 font-medium">{formatScore(scores?.mental)}</span></td>
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-orange-50 text-orange-700 font-medium">{formatScore(scores?.attacking)}</span></td>
        <td className="p-4 whitespace-nowrap"><span className="px-2 py-1 rounded bg-red-50 text-red-700 font-medium">{formatScore(scores?.defending)}</span></td>

        <td className="p-4 min-w-[200px] max-w-[300px] truncate text-gray-600" title={item.note || ""}>
          {item.note || "-"}
        </td>

        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Link href={`/list/evaluations/${item.id}`}>
              <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
                <Eye size={16} className="text-gray-500" />
              </Button>
            </Link>

            {/* ✅ UPDATED: Allow Admin OR Coach to Edit/Delete */}
            {(role === "admin" || role === "coach") && (
              <>
                <FormModal table="evaluations" type="update" data={item} />
                {/* <FormModal table="evaluations" type="delete" id={item.id} /> */}
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
        <h1 className="hidden md:block text-lg font-semibold">All Evaluations</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <TableSearch />
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
              <SlidersHorizontal size={14} className="text-gray-600" />
            </Button>

            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
              <ArrowUpDown size={14} className="text-gray-600" />
            </Button>

            {/* ✅ UPDATED: Allow Admin OR Coach to Create */}
            {(role === "admin" || role === "coach") && (
                <FormModal table="evaluations" type="create" />
            )}
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

export default Evaluations;