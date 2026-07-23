import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartTheme } from '@/features/analytics/components/chart-theme'
import type { AdminTrends } from '@/types/domain'
import { formatPercent } from '@/lib/format'

interface AdminTrendChartProps {
  data: AdminTrends
}

function formatMetricLabel(metric: AdminTrends['metric']) {
  switch (metric) {
    case 'submissions':
      return 'Submissions'
    case 'averageScore':
      return 'Average score'
    case 'completion':
      return 'Completion rate'
  }
}

export function AdminTrendChart({ data }: AdminTrendChartProps) {
  const chartData = data.points.map((point) => ({
    label: format(parseISO(point.periodStart), 'MMM d'),
    value: data.metric === 'completion' ? point.value * 100 : point.value,
    periodStart: point.periodStart,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatMetricLabel(data.metric)} over time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.grid }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value:
                    data.metric === 'completion' || data.metric === 'averageScore'
                      ? '%'
                      : 'Count',
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
                  const formatted =
                    data.metric === 'completion'
                      ? formatPercent(numeric / 100)
                      : data.metric === 'averageScore'
                        ? `${numeric.toFixed(1)}%`
                        : numeric
                  return [formatted, formatMetricLabel(data.metric)]
                }}
              />
              <Bar dataKey="value" fill={chartTheme.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
