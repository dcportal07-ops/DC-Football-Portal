import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
// import { Announcement, Prisma } from "@/generated/prisma/client";
import { Announcement, Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
// 1. Import Clerk's server-side user helper
import { auth, currentUser } from "@clerk/nextjs/server";
 

const columns = [
  { header: "Title", accessorKey: "title" },
  { header: "Audience", accessorKey: "audience" },
  { header: "Date", accessorKey: "date" },
  { header: "Actions", accessorKey: "actions" },
];

const Announcements = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  // 2. Fetch the current user and their role
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  // 1. GET PARAMS
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // 2. BUILD QUERY
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams.search) {
    query.title = { contains: queryParams.search, mode: "insensitive" };
  }

  // 3. FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: 'desc' }, 
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // 4. RENDER ROW
  const RenderRow = (item: Announcement) => (
    <tr
      key={item.id}
      className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
    >
      <td className="p-4 whitespace-nowrap font-semibold text-gray-700">
        {item.title}
      </td>

      <td className="p-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${
            item.audience === "All"
              ? "bg-blue-100 text-blue-600"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {item.audience}
        </span>
      </td>

      <td className="p-4 whitespace-nowrap text-gray-600">
        {new Date(item.date).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>

      {/* ACTIONS: Check the REAL role here */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
           {/* Only show these buttons if the actual user is an admin */}
           {role === "admin" && (
            <>
                <FormModal table="announcements" type="update" data={item} />
                <FormModal table="announcements" type="delete" id={item.id} />
            </>
           )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>

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

            {/* CREATE BUTTON: Check real role here as well */}
            {role === "admin" && (
                <FormModal table="announcements" type="create" />
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

export default Announcements;