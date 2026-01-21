import { PaginationDemo } from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FormModal from "@/components/FormModal";
import prisma from "@/lib/prisma";
// import { Drill, Prisma } from "@/generated/prisma/client";
import { Drill, Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { role } from "@/lib/data";
import { Eye, SlidersHorizontal, ArrowUpDown } from "lucide-react";

// --- TYPES ---
// Drill type is imported from Prisma, so we don't need to redefine it manually.

const columns = [
  { header: "Code", accessorKey: "code" },
  { header: "Drill Name", accessorKey: "name" },
  { header: "Category", accessorKey: "category" },
  { header: "Level", accessorKey: "level" },
  { header: "Skills", accessorKey: "primarySkills" },
  { header: "Age", accessorKey: "minAge" }, // Changed accessor for clarity
  { header: "Description", accessorKey: "description" },
  { header: "Actions", accessorKey: "actions" },
];

const Drills = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  
  // 1. GET PARAMS
  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // 2. BUILD QUERY
  const query: Prisma.DrillWhereInput = {};

  if (queryParams.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { code: { contains: queryParams.search, mode: "insensitive" } },
      { category: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  // 3. FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.drill.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.drill.count({ where: query }),
  ]);

  // 4. RENDER ROW
  const RenderRow = (item: Drill) => (
    <tr
      key={item.id}
      className="border-b hover:bg-gray-50 even:bg-slate-100 text-sm"
    >
      {/* CODE */}
      <td className="p-4 whitespace-nowrap font-mono text-xs text-gray-500">
        {item.code}
      </td>

      {/* NAME */}
      <td className="p-4 whitespace-nowrap font-semibold text-gray-700">
        {item.name}
      </td>

      {/* CATEGORY */}
      <td className="p-4 whitespace-nowrap">
        <span className="px-2 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-medium">
          {item.category}
        </span>
      </td>

      {/* LEVEL (Dynamic Color) */}
      <td className="p-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.level === "Beginner"
              ? "bg-green-100 text-green-600"
              : item.level === "Intermediate"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {item.level}
        </span>
      </td>

      {/* SKILLS */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex gap-1 flex-wrap max-w-[200px]">
          {item.primarySkills.map((skill, index) => (
            <span
              key={index}
              className="text-[10px] px-1.5 py-0.5 border border-gray-300 rounded text-gray-600"
            >
              {skill}
            </span>
          ))}
        </div>
      </td>

      {/* AGE */}
      <td className="p-4 whitespace-nowrap text-gray-600">
        {item.minAge} - {item.maxAge} yrs
      </td>

      {/* DESCRIPTION (Truncated) */}
      <td className="p-4 text-gray-500 max-w-[250px] truncate" title={item.description}>
        {item.description}
      </td>

      {/* ACTIONS */}
      <td className="p-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
            
          {/* VIEW BUTTON */}
          <Link href={`/list/drills/${item.id}`}>
            <Button className="w-7 h-7 rounded-full bg-transparent hover:bg-gray-200 p-0 flex items-center justify-center border border-gray-200">
              <Eye size={16} className="text-gray-500" />
            </Button>
          </Link>

          {/* ADMIN ACTIONS */}
          {role === "admin" && (
            <>
              <FormModal table="drills" type="update" data={item} />
              <FormModal table="drills" type="delete" id={item.id} />
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
        <h1 className="hidden md:block text-lg font-semibold">All Drills</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* SEARCH */}
          <div className="w-full md:w-auto">
            <TableSearch />
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-4 self-end md:self-center">
            
            {/* FILTER */}
            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
              <SlidersHorizontal size={14} className="text-gray-600" />
            </Button>

            {/* SORT */}
            <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200 flex items-center justify-center">
              <ArrowUpDown size={14} className="text-gray-600" />
            </Button>

            {/* CREATE */}
            {role === "admin" && (
                <FormModal table="drills" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div className="w-full overflow-x-auto">
        <Table columns={columns} data={data} renderRow={RenderRow} />
      </div>

      {/* PAGINATION */}
      <PaginationDemo page={p} count={count} />
    </div>
  );
};

export default Drills;