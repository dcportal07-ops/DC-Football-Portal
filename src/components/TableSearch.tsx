"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { useRouter, useSearchParams } from 'next/navigation';

const TableSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // 1. Hook to read current URL params

  // 2. Initialize state with the URL value (if it exists)
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  const placeholders = [
    "Find a coach...",
    "Lookup coach...",
    "Search by email...",
  ];

  // 3. Sync state with URL changes (Fixes Browser Back Button)
  useEffect(() => {
    const currentSearch = searchParams.get("search");
    setSearchValue(currentSearch || "");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);

    // 4. Logic to add or remove search param
    if (searchValue.trim()) {
      params.set("search", searchValue);
    } else {
      params.delete("search"); // Delete param if input is empty
    }

    // Reset to page 1 on new search
    params.set("page", "1");

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <div className='flex flex-col-reverse md:flex-row items-center justify-between p-4 gap-4 bg-transparent'>
        <div className='flex items-center gap-2 w-full md:w-auto'>
            <Image 
              src='/search.png' 
              alt='search' 
              width={20} 
              height={20} 
              className='opacity-50 hidden md:block'
            />
            <div className='w-full md:w-[300px] lg:w-[400px]'> 
              {/* 5. Pass 'value' to make it a Controlled Component */}
              <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={handleChange}
                  onSubmit={onSubmit}
                  // Important: You must pass the value to your custom input
                  // If your custom input doesn't accept 'value', you need to update it
                  // to accept a 'value' prop.
                  // value={searchValue} <--- ADD THIS IF YOUR COMPONENT SUPPORTS IT
              />
            </div>
        </div>
    </div>
  )
}

export default TableSearch;