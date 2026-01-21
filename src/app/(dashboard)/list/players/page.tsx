import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Image from "next/image"; 
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { PlayerProfile, Team, User } from "@/generated/prisma/client";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import TableSort from "@/components/TableSort";
import TableFilter from "@/components/TableFilter";

type PlayerList = PlayerProfile & { 
  user: User; 
  team: Team | null; 
};

const columns = [
  { header: "Info", accessorKey: "name" },
  { header: "Player ID", accessorKey: "userCode", className: "hidden md:table-cell" },
  { header: "Gender", accessorKey: "gender", className: "hidden md:table-cell" },
  { header: "Team", accessorKey: "team", className: "hidden md:table-cell" },
  { header: "Jersey ", accessorKey: "jerseyNumber", className: "hidden md:table-cell" },
  { header: "Parent Email", accessorKey: "parentEmail", className: "hidden md:table-cell" },
  { header: "DOB", accessorKey: "dob", className: "hidden md:table-cell" },
  { header: "Address", accessorKey: "address", className: "hidden md:table-cell" },
  { header: "Created", accessorKey: "createdAt", className: "hidden md:table-cell" },
  { header: "Actions", accessorKey: "actions" },
];

const Players = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  const sortOrder = queryParams.sort === "asc" ? "asc" : "desc";

  const query: Prisma.PlayerProfileWhereInput = {};

  if (queryParams.search) {
    query.user = {
      OR: [
        { name: { contains: queryParams.search, mode: "insensitive" } },
        { email: { contains: queryParams.search, mode: "insensitive" } },
      ],
    };
  }

  // 🔥 ZOHO-STYLE FILTERING
  switch (role) {
    case "admin":
      break; // See all
    case "coach":
      // See only players in teams assigned to this coach
      query.team = {
        coaches: {
          some: {
            coach: { userId: currentUserId! }
          }
        }
      };
      break;
    case "player":
      query.userId = currentUserId!;
      break;
    default:
      return null;
  }

  const [data, count] = await prisma.$transaction([
    prisma.playerProfile.findMany({
      where: query,
      include: { user: true, team: true },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { user: { name: sortOrder } }
    }),
    prisma.playerProfile.count({ where: query }),
  ]);

  const RenderRow = (item: PlayerList) => (
    <tr key={item.id} className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm">
      <td className="p-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <Image
            src={item.user.photo || "/noAvatar.png"}
            alt={item.user.name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
          <div>
            <h3 className="font-semibold">{item.user.name}</h3>
            <p className="text-xs text-gray-500">{item.user.email}</p>
          </div>
        </div>
      </td>
      <td className="p-4 hidden md:table-cell">{item.user.userCode}</td>
      <td className="p-4 hidden md:table-cell">{item.gender}</td>
      <td className="p-4 hidden md:table-cell">{item.team?.name || "Unassigned"}</td>
      <td className="p-4 hidden md:table-cell">{item.jerseyNumber}</td>
      <td className="p-4 hidden md:table-cell">{item.parentEmail || "-"}</td>
      <td className="p-4 hidden md:table-cell">{new Date(item.dob).toLocaleDateString()}</td>
      <td className="p-4 hidden md:table-cell">{item.address}</td>
      <td className="p-4 hidden md:table-cell">{new Date(item.user.createdAt).toLocaleDateString()}</td>
      
      {/* ACTIONS COLUMN */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Link href={`/list/players/${item.id}`}>
            <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
              <Eye size={16} className="text-gray-500" />
            </Button>
          </Link>
          
          {/* ✅ UPDATED: Allow Admin OR Coach to Edit/Delete */}
          {(role === "admin" || role === "coach") && (
            <>
              <FormModal table="players" type="update" data={item} /> 
              <FormModal table="players" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="hidden md:block text-lg font-semibold">
            {role === "player" ? "My Profile" : "All Players"}
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto"><TableSearch /></div>
          <div className="flex items-center gap-4 self-end md:self-center">
            <TableFilter />
            <TableSort />
            
            {/* ✅ UPDATED: Allow Admin OR Coach to Create */}
            {(role === "admin" || role === "coach") && (
                <FormModal table="players" type="create" />
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

export default Players;