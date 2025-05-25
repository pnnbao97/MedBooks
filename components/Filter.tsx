'use client'

import React, { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter as FilterIcon, X, ChevronDown, ChevronUp } from 'lucide-react'

interface MedicalSpecialty {
  value: string;
  label: string;
}

interface CurrentFilters {
  specialty?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  sort?: string;
  search?: string;
}

interface FilterProps {
  medicalSpecialties: MedicalSpecialty[];
  currentFilters: CurrentFilters;
}

const Filter: React.FC<FilterProps> = ({ medicalSpecialties, currentFilters }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(currentFilters.search || '')
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice?.toString() || '')
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice?.toString() || '')
  const [isExpanded, setIsExpanded] = useState(false)

  // Create URL with updated parameters
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([name, value]) => {
        if (value === null || value === '' || value === undefined) {
          params.delete(name)
        } else {
          params.set(name, value)
        }
      })
      
      return params.toString()
    },
    [searchParams]
  )

  // Update URL and navigate
  const updateFilters = (updates: Record<string, string | null>) => {
    const queryString = createQueryString(updates)
    const url = queryString ? `${pathname}?${queryString}` : pathname
    router.push(url)
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: searchQuery || null })
  }

  // Handle specialty change
  const handleSpecialtyChange = (value: string) => {
    if (value === 'all') {
      updateFilters({ specialty: null })
    } else {
      updateFilters({ specialty: value })
    }
  }

  // Handle price filter
  const handlePriceFilter = () => {
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null
    })
  }

  // Handle availability change
  const handleAvailabilityChange = (value: string) => {
    updateFilters({ availability: value === 'all' ? null : value })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    updateFilters({ sort: value === 'newest' ? null : value })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
    updateFilters({
      specialty: null,
      minPrice: null,
      maxPrice: null,
      availability: null,
      sort: null,
      search: null
    })
  }

  // Count active filters
  const activeFiltersCount = Object.values(currentFilters).filter(value => 
    value !== undefined && value !== null && value !== ''
  ).length

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Tìm kiếm sách theo tên, tác giả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
          >
            Tìm
          </Button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Bộ lọc</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Mở rộng
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentFilters.specialty && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {medicalSpecialties.find(s => s.value === currentFilters.specialty)?.label}
              <button
                onClick={() => updateFilters({ specialty: null })}
                className="ml-1 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {currentFilters.availability && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {currentFilters.availability === 'in-stock' ? 'Có sẵn' : 
               currentFilters.availability === 'preorder' ? 'Đặt trước' : currentFilters.availability}
              <button
                onClick={() => updateFilters({ availability: null })}
                className="ml-1 hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {(currentFilters.minPrice || currentFilters.maxPrice) && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Giá: {currentFilters.minPrice ? `${currentFilters.minPrice.toLocaleString()}đ` : '0đ'} - {currentFilters.maxPrice ? `${currentFilters.maxPrice.toLocaleString()}đ` : '∞'}
              <button
                onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
                className="ml-1 hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Medical Specialty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chuyên khoa
            </label>
            <Select 
              value={currentFilters.specialty || 'all'} 
              onValueChange={handleSpecialtyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn chuyên khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                {medicalSpecialties.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá (VNĐ)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-sm"
              />
              <Input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <Button
              onClick={handlePriceFilter}
              size="sm"
              className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Áp dụng
            </Button>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tình trạng
            </label>
            <Select 
              value={currentFilters.availability || 'all'} 
              onValueChange={handleAvailabilityChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn tình trạng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="in-stock">Có sẵn</SelectItem>
                <SelectItem value="preorder">Đặt trước</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <Select 
              value={currentFilters.sort || 'newest'} 
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                <SelectItem value="title-az">Tên A → Z</SelectItem>
                <SelectItem value="title-za">Tên Z → A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

export default Filter