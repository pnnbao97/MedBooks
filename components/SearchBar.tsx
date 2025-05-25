"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const SearchBar = () => {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    if (name) {
      router.push(`/books?search=${name}`);
    }
  };

  return (
    <form
      className="flex items-center justify-between gap-4 bg-gray-100 p-2 rounded-md flex-1 text-dark-400"
      onSubmit={handleSearch}
    >
      <input
        type="text"
        name="name"
        placeholder="Tìm kiếm sách"
        className="flex-1 bg-transparent outline-none"
      />
      <Button className="cursor-pointer bg-white">
        <Image src="/search.png" alt="Search" width={16} height={16} />
      </Button>
    </form>
  );
};

export default SearchBar;