'use client'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export type SortOption =
  | 'default'
  | 'price-asc'
  | 'price-desc'
  | 'change-asc'
  | 'change-desc'
export type FilterOption = 'all' | 'gainers' | 'losers'

interface FilterBarProps {
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
  filter: FilterOption
  onFilterChange: (value: FilterOption) => void
}

export function FilterBar({
  sortBy,
  onSortChange,
  filter,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Sort Select */}
      <div className="flex-1">
        <Label
          htmlFor="sort"
          className="text-sm font-medium mb-2 block"
        >
          Sort by
        </Label>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger id="sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Market Cap (Default)</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="change-asc">24h Change: Low to High</SelectItem>
            <SelectItem value="change-desc">24h Change: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Select */}
      <div className="flex-1">
        <Label
          htmlFor="filter"
          className="text-sm font-medium mb-2 block"
        >
          Filter
        </Label>
        <Select
          value={filter}
          onValueChange={(value) => onFilterChange(value as FilterOption)}
        >
          <SelectTrigger id="filter">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assets</SelectItem>
            <SelectItem value="gainers">Gainers (24h)</SelectItem>
            <SelectItem value="losers">Losers (24h)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
