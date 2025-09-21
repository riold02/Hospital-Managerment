export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                <div className="space-y-3">
                  <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                  <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
