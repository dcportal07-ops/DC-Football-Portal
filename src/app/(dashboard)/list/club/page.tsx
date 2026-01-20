import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image"; // For the Club Logo

// --- 1. DEFINE TYPE ---
// Adjust this to match your actual Prisma 'Club' model
type ClubList = {
  id: string;
  name: string;
  code: string;
  logo: string | null; // The photo field
  createdAt: Date;
  _count?: {
    teams: number; // Count how many teams belong to this club
  };
};

const columns = [
  { header: "Club Name", accessorKey: "name" },
  { header: "Code", accessorKey: "code" },
  { header: "Teams Count", accessorKey: "teams" }, // Optional stat
  { header: "Created At", accessorKey: "createdAt" }, 
  { header: "Actions", accessorKey: "actions" },
];

const ClubListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // 1. GET USER & ROLE
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  // 2. PARAMS
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // 3. BUILD QUERY
  const query: Prisma.ClubWhereInput = {}; // Ensure 'Club' exists in your Prisma Client

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { code: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  // 4. SCOPING (Optional: Restrict visibility if needed)
  // For now, Admins and Coaches can see all clubs, or you can add logic here.
  if (role !== "admin" && role !== "coach") {
      // return null; // Uncomment to hide from players/parents
  }

  // 5. FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.club.findMany({
      where: query,
      include: {
        _count: {
          select: { teams: true } // Fetch count of teams
        }
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: 'asc' }
    }),
    prisma.club.count({ where: query }),
  ]);

  // 6. RENDER ROW
  const RenderRow = (item: ClubList) => {
    return (
      <tr
        key={item.id}
        className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
      >
        {/* CLUB NAME & LOGO */}
        <td className="p-4 flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
               <Image 
                 src={item.logo || "/football-club.png"} // Fallback image
                 alt={item.name} 
                 fill 
                 className="object-cover"
               />
            </div>
            <div className="flex flex-col">
               <span className="font-semibold text-gray-800">{item.name}</span>
            </div>
        </td>

        <td className="p-4 whitespace-nowrap">
          <span className="px-2 py-1 bg-gray-200 rounded-md text-xs font-mono text-gray-700">
            {item.code}
          </span>
        </td>

        <td className="p-4 whitespace-nowrap">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
            {item._count?.teams || 0} Teams
          </span>
        </td>

        <td className="p-4 whitespace-nowrap text-gray-500 text-xs">
           {new Date(item.createdAt).toLocaleDateString()}
        </td>

        <td className="p-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
              
            {/* VIEW */}
            <Link href={`/list/club/${item.id}`}>
              <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
                <Eye size={16} className="text-gray-500" />
              </Button>
            </Link>

            {/* EDIT / DELETE (Admin & Coach only) */}
            {(role === "admin" || role === "coach") && (
              <>
                {/* Ensure your FormModal supports 'clubs' table and 'logo' field */}
                <FormModal table="clubs" type="update" data={item} />
                <FormModal table="clubs" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">Club Management</h1>

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

            {/* CREATE BUTTON */}
            {(role === "admin" || role === "coach") && (
                <FormModal table="clubs" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
        <Table columns={columns} data={data} renderRow={RenderRow} />
      </div>

      <PaginationDemo page={p} count={count} />
    </div>
  );
};

export default ClubListPage;