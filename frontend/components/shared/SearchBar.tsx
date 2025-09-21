"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
  defaultValue?: string
}

export function SearchBar({
  placeholder = "Tìm kiếm...",
  onSearch,
  debounceMs = 300,
  className,
  defaultValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs])

  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  const handleClear = () => {
    setQuery("")
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
