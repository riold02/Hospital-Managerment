export default function MedicineLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>

      <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
      <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
    </div>
  )
}
