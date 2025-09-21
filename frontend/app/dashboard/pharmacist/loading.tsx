export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-80 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-60 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
