export interface QueryParams {
  search?: string
  sort?: string
  order?: "asc" | "desc"
  page?: number
  pageSize?: number
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function parseQuery(searchParams: URLSearchParams): QueryParams {
  const params: QueryParams = {}

  for (const [key, value] of searchParams.entries()) {
    if (key === "page" || key === "pageSize") {
      params[key] = Number.parseInt(value) || (key === "page" ? 1 : 10)
    } else if (key === "order") {
      params[key] = value === "desc" ? "desc" : "asc"
    } else {
      params[key] = value
    }
  }

  return params
}

export function paginate<T>(data: T[], page = 1, pageSize = 10): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  }
}

export function filterData<T>(data: T[], filters: Record<string, any>): T[] {
  return data.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true

      const itemValue = (item as any)[key]
      if (typeof itemValue === "string") {
        return itemValue.toLowerCase().includes(value.toLowerCase())
      }
      return itemValue === value
    })
  })
}

export function sortData<T>(data: T[], sortBy?: string, order: "asc" | "desc" = "asc"): T[] {
  if (!sortBy) return data

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy]
    const bValue = (b as any)[sortBy]

    if (aValue < bValue) return order === "asc" ? -1 : 1
    if (aValue > bValue) return order === "asc" ? 1 : -1
    return 0
  })
}

export function createApiResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export function createErrorResponse(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}
