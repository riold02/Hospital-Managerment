import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive?: boolean
  }
  className?: string
}

export function KpiCard({ label, value, trend, className }: KpiCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null

    if (trend.value === 0) {
      return <Minus className="h-4 w-4 text-muted-foreground" />
    }

    return trend.isPositive ? (
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return "text-muted-foreground"
    return trend.isPositive ? "text-emerald-600" : "text-red-600"
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={cn("text-xs", getTrendColor())}>
            {trend.value > 0 ? "+" : ""}
            {trend.value}% từ tháng trước
          </p>
        )}
      </CardContent>
    </Card>
  )
}
