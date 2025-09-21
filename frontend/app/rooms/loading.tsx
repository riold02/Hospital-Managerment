export default function RoomsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Đang tải dữ liệu phòng...</p>
      </div>
    </div>
  )
}
