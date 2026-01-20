import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { Team, Prisma } from "@/generated/prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

// Define the shape of data we fetch
type TeamList = Team & {
  coaches: {
    coach: {
      user: {
        name: string;
      };
    };
  }[];
};

const columns = [
  { header: "Team Name", accessorKey: "name" },
  { header: "Team Code", accessorKey: "code" },
  { header: "Age Group", accessorKey: "ageGroup" },
  { header: "Head Coach", accessorKey: "coach" }, 
  { header: "Actions", accessorKey: "actions" },
];

const Teams = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // 1. GET REAL USER & ROLE
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  // 2. GET PARAMS
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // 3. BUILD QUERY
  const query: Prisma.TeamWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { code: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  // 4. SCOPING LOGIC (Zoho Style)
  switch (role) {
    case "admin": 
      break;
    case "coach":
      // Coaches see teams they manage
      query.coaches = { some: { coach: { userId: currentUserId! } } }; 
      break;
    case "player":
      // Players see their own team
      query.players = { some: { userId: currentUserId! } }; 
      break;
    default: 
      return null;
  }

  // 5. FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.team.findMany({
      where: query,
      include: {
        coaches: {
          include: {
            coach: {
              include: {
                user: {
                  select: { name: true } 
                }
              }
            }
          }
        }
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.team.count({ where: query }),
  ]);

  // 6. RENDER ROW
  const RenderRow = (item: TeamList) => {
    const headCoachName = item.coaches[0]?.coach?.user?.name || "No Coach Assigned";

    return (
      <tr
        key={item.id}
        className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
      >
        <td className="p-4 font-semibold text-gray-700 whitespace-nowrap">
          {item.name}
        </td>
        

        <td className="p-4 whitespace-nowrap">
          <span className="px-2 py-1 bg-gray-200 rounded-md text-xs font-mono">
            {item.code}
          </span>
        </td>

        <td className="p-4 whitespace-nowrap">
          <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">
            {item.ageGroup}
          </span>
        </td>

        <td className="p-4 whitespace-nowrap text-gray-600">
           {headCoachName}
        </td>

        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
              
            {/* VIEW BUTTON - Visible to everyone */}
            <Link href={`/list/teams/${item.id}`}>
              <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
                <Eye size={16} className="text-gray-500" />
              </Button>
            </Link>

            {/* ✅ UPDATED: Allow Admin OR Coach to Edit/Delete */}
            {(role === "admin" || role === "coach") && (
              <>
                <FormModal table="teams" type="update" data={item} />
                <FormModal table="teams" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Teams</h1>

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
                <FormModal table="teams" type="create" />
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

export default Teams;