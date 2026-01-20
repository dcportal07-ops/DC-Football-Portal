"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";

const TableSort = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleSort = () => {
    const params = new URLSearchParams(searchParams.toString());

    const currentSort = params.get("sort");
    const newSort = currentSort === "asc" ? "desc" : "asc";

    params.set("sort", newSort);
    params.set("page", "1"); // 🔥 reset pagination

    router.push(`?${params.toString()}`);
  };

  return (
    <Button
      onClick={toggleSort}
      className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center"
    >
      <ArrowUpDown size={14} className="text-gray-600" />
    </Button>
  );
};

export default TableSort;
