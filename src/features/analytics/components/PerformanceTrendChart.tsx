import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartTheme } from '@/features/analytics/components/chart-theme'

interface PerformanceTrendChartProps {
  points: { submittedAt: string; percentage: number }[]
}

export function PerformanceTrendChart({ points }: PerformanceTrendChartProps) {
  const data = points.map((point) => ({
    label: format(parseISO(point.submittedAt), 'MMM d'),
    percentage: point.percentage,
    submittedAt: point.submittedAt,
  }))

  if (data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.grid }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                label={{
                  value: 'Score %',
                  angle: -90,
                  position: 'insideLeft',
                  fill: chartTheme.axis,
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  color: chartTheme.tooltipText,
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => {
                  const numeric = typeof value === 'number' ? value : Number(value ?? 0)
                  return [`${numeric}%`, 'Score']
                }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as { submittedAt?: string } | undefined
                  return item?.submittedAt
                    ? format(parseISO(item.submittedAt), 'MMM d, yyyy · h:mm a')
                    : ''
                }}
              />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke={chartTheme.primary}
                strokeWidth={2}
                dot={{ r: 3, fill: chartTheme.primary }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
