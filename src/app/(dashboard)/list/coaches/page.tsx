import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
import { CoachProfile, Prisma, User, Team } from "@/generated/prisma/client"; // Added Team type if needed
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Eye } from "lucide-react";

// 1. IMPORT CLERK & CUSTOM COMPONENTS
import { currentUser } from "@clerk/nextjs/server";
import TableSort from "@/components/TableSort";
import TableFilter from "@/components/TableFilter";

// --- TYPES ---
// Adjusted type to match the include query exactly
type CoachList = CoachProfile & {
  user: User;
  teams: { 
    teamId: string;
    team: { 
      id: string; 
      name: string; 
    } 
  }[];
  specialties: { 
    specialty: { 
      name: string 
    } 
  }[];
};

// --- COLUMNS CONFIG ---
const columns = [
  { header: "Info", accessorKey: "name" },
  { header: "Email", accessorKey: "email" },
  { header: "Phone", accessorKey: "phone" },
  {
    header: "Coach ID",
    accessorKey: "userCode",
    className: "hidden md:table-cell",
  },
  // {
  //   header: "Specialty",
  //   accessorKey: "specialties",
  //   className: "hidden lg:table-cell",
  // },
  {
    header: "Team",
    accessorKey: "teams",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessorKey: "actions",
  },
];

// --- MAIN COMPONENT ---
const Coaches = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // 2. GET REAL USER & ROLE
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 3. GET PARAMS
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;
  // Extract Sort Order
  const sortOrder = queryParams.sort === "asc" ? "asc" : "desc";

  // 4. BUILD PRISMA QUERY
  const query: Prisma.CoachProfileWhereInput = {};

  // --- URL PARAMS LOGIC ---
  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          // Filter by Team
          case "classId": 
          case "teamId":
            query.teams = {
              some: {
                teamId: value,
              },
            };
            break;
          // Search Logic
          case "search":
            query.user = {
              OR: [
                { name: { contains: value, mode: "insensitive" } },
                { email: { contains: value, mode: "insensitive" } },
              ],
            };
            break;
          default:
            break;
        }
      }
    }
  }

  // 5. FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.coachProfile.findMany({
      where: query,
      include: {
        user: true, 
        teams: {
          include: {
            team: true, // Fetching full team object to get Names AND IDs
          },
        },
        specialties: {
          include: {
            specialty: true, 
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      // Sort by User Name
      orderBy: {
        user: {
            name: sortOrder
        }
      }
    }),
    prisma.coachProfile.count({ where: query }),
  ]);

  // 6. RENDER ROW FUNCTION
  const RenderRow = (item: CoachList) => (
    <tr
      key={item.id}
      className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
    >
      {/* INFO */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Image
            src={item.user.photo || "/noAvatar.png"}
            alt={item.user.name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{item.user.name}</h3>
            <p className="text-xs text-gray-500">{item.user.role}</p>
          </div>
        </div>
      </td>

      <td className="p-4">{item.user.email}</td>
      <td className="p-4">{item.user.phone || "-"}</td>
      <td className="p-4 hidden md:table-cell">{item.user.userCode}</td>

      {/* SPECIALTIES */}
      {/* <td className="p-4 hidden lg:table-cell">
        <div className="flex flex-wrap gap-1">
          {item.specialties.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700"
            >
              {s.specialty.name}
            </span>
          ))}
        </div>
      </td> */}

      {/* TEAMS */}
      <td className="p-4 hidden lg:table-cell">
        <div className="flex flex-col gap-1">
          {item.teams.map((t, idx) => (
            <span key={idx} className="text-xs font-semibold text-gray-700">
              {t.team.name}
            </span>
          ))}
        </div>
      </td>

      {/* ACTIONS */}
      <td className="p-4">
        <div className="flex items-center gap-2">
            
          {/* VIEW BUTTON - Visible to Everyone */}
          <Link href={`/list/coaches/${item.id}`}>
            <Button className="w-7 h-7 rounded-full hover:bg-gray-200 p-0 bg-transparent flex items-center justify-center border border-gray-200">
               <Eye size={16} className="text-gray-500" />
            </Button>
          </Link>

          {/* 🔒 ADMIN ACTIONS - Only Admin */}
          {role === "admin" && (
            <>
              {/* 🔥 DATA FLATTENING HAPPENS HERE */}
              <FormModal 
                table="coaches" 
                type="update" 
                data={{
                  id: item.id,                   // Coach Profile ID
                  userId: item.user.id,          // User ID
                  username: item.user.userCode,  // Map userCode to username
                  name: item.user.name,          // Flatten name
                  email: item.user.email,        // Flatten email
                  phone: item.user.phone || "",
                  img: item.user.photo,
                  
                  // Flatten Teams: Extract IDs ["team-id-1", "team-id-2"]
                  teams: item.teams.map((t) => t.team.id),
                }} 
              />
              <FormModal table="coaches" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // 7. RENDER PAGE
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Coaches</h1>

        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <TableSearch />
          </div>

          <div className="flex items-center gap-4 self-end md:self-center">
            
            {/* ✅ FILTER & SORT (Visible to Everyone) */}
            <TableFilter />
            <TableSort />

            {/* 🔒 CREATE MODAL (Admin Only) */}
            {role === "admin" && (
                <FormModal table="coaches" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto">
         <Table columns={columns} data={data} renderRow={RenderRow} />
      </div>

      {/* PAGINATION */}
      <PaginationDemo page={p} count={count} />
    </div>
  );
};

export default Coaches;