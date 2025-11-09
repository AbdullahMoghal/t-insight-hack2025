'use client'

import { Search, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface OpportunityFiltersProps {
  status: string
  productArea: string
  severity: string
  sortBy: string
  searchQuery: string
  productAreas: Array<{ id: string; name: string }>
  onStatusChange: (value: string) => void
  onProductAreaChange: (value: string) => void
  onSeverityChange: (value: string) => void
  onSortByChange: (value: string) => void
  onSearchChange: (value: string) => void
  onClearFilters: () => void
}

export function OpportunityFilters({
  status,
  productArea,
  severity,
  sortBy,
  searchQuery,
  productAreas,
  onStatusChange,
  onProductAreaChange,
  onSeverityChange,
  onSortByChange,
  onSearchChange,
  onClearFilters,
}: OpportunityFiltersProps) {
  const hasActiveFilters =
    status !== 'all' ||
    productArea !== 'all' ||
    severity !== 'all' ||
    searchQuery !== ''

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-2xl shadow-xl p-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tmobile-gray-400" />
          <Input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 border-tmobile-gray-300 focus:border-[#E8258E] focus:ring-[#E8258E]/20"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tmobile-gray-400 hover:text-tmobile-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium text-tmobile-gray-700 mb-1.5 block">
              Status
            </label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="border-tmobile-gray-300 focus:border-[#E8258E] focus:ring-[#E8258E]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Area Filter */}
          <div>
            <label className="text-xs font-medium text-tmobile-gray-700 mb-1.5 block">
              Product Area
            </label>
            <Select value={productArea} onValueChange={onProductAreaChange}>
              <SelectTrigger className="border-tmobile-gray-300 focus:border-[#E8258E] focus:ring-[#E8258E]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {productAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="text-xs font-medium text-tmobile-gray-700 mb-1.5 block">
              Severity
            </label>
            <Select value={severity} onValueChange={onSeverityChange}>
              <SelectTrigger className="border-tmobile-gray-300 focus:border-[#E8258E] focus:ring-[#E8258E]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-xs font-medium text-tmobile-gray-700 mb-1.5 block">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="border-tmobile-gray-300 focus:border-[#E8258E] focus:ring-[#E8258E]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rice-desc">RICE (High to Low)</SelectItem>
                <SelectItem value="rice-asc">RICE (Low to High)</SelectItem>
                <SelectItem value="created-desc">Newest First</SelectItem>
                <SelectItem value="created-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-tmobile-gray-600 hover:text-[#E8258E] hover:bg-[#E8258E]/10"
            >
              <X className="h-3 w-3 mr-1.5" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
