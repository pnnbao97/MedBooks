'use client'
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePathname, useSearchParams, useRouter } from 'next/navigation';


// Danh sách các chuyên ngành y khoa
const SPECIALTIES = [
  { value: "internal-medicine", label: "Nội khoa" },
  { value: "surgery", label: "Ngoại khoa" },
  { value: "obgyn", label: "Sản phụ khoa" },
  { value: "pediatrics", label: "Nhi khoa" },
  { value: "cardiology", label: "Tim mạch" },
  { value: "neurology", label: "Thần kinh" },
  { value: "gastro", label: "Tiêu hóa" },
  { value: "respiratory", label: "Hô hấp" },
  { value: "orthopedic", label: "Chỉnh hình" },
  { value: "EY", label: "Nhãn khoa" },
  { value: "ENT", label: "Tai mũi họng" },
];

const Filter = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // Hàm xử lý khi chọn chuyên ngành
  const handleSpecialtyChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('spec', value);
    replace(`/list?${params.toString()}`);
  };

  // Hàm xử lý cho các bộ lọc khác (nếu cần)
  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    replace(`/list?${params.toString()}`);
  };

  return (
    <div className="mt-12 flex justify-between">
      <div className="flex gap-6 flex-wrap">
        <Select onValueChange={handleSpecialtyChange}>
          <SelectTrigger className="w-[150px] bg-gray-200 rounded-3xl font-semibold">
            <SelectValue placeholder="Chuyên ngành" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px] w-full rounded-md">
              <div className="p-2">
                {SPECIALTIES.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </div>
            </ScrollArea>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('price', value)}>
          <SelectTrigger className="w-[150px] bg-gray-200 rounded-3xl font-semibold">
            <SelectValue placeholder="Giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high-price">Từ cao đến thấp</SelectItem>
            <SelectItem value="low-price">Từ thấp đến cao</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => handleFilterChange('preorder', value)}>
          <SelectTrigger className="w-[150px] bg-gray-200 rounded-3xl font-semibold">
            <SelectValue placeholder="Preorder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preorder">Preorder</SelectItem>
            <SelectItem value="completed">Đã hoàn thiện</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className=""></div>
    </div>
  );
};

export default Filter;