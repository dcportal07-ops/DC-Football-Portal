"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const TableFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "All") {
      params.delete("audience"); // 🔥 important
    } else {
      params.set("audience", value);
    }

    params.set("page", "1"); // 🔥 reset pagination
    router.push(`?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-8 h-8 rounded-full bg-transparent hover:bg-gray-200 p-0 border border-gray-200">
          <SlidersHorizontal size={14} className="text-gray-600" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 bg-white">
        <DropdownMenuItem onClick={() => handleFilterChange("All")}>
          All Audiences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterChange("Coach")}>
          Coach
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterChange("Player")}>
          Player
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TableFilter;
