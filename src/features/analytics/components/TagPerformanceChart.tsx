import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { chartTheme } from '@/features/analytics/components/chart-theme'
import { formatPercent } from '@/lib/format'
import type { StudentTagAnalytics } from '@/types/domain'

interface TagPerformanceChartProps {
  tags: StudentTagAnalytics['byTag']
}

function truncateLabel(label: string, maxLength = 18) {
  return label.length > maxLength ? `${label.slice(0, maxLength)}…` : label
}

export function TagPerformanceChart({ tags }: TagPerformanceChartProps) {
  const data = tags
    .filter((tag) => tag.correctRate != null)
    .map((tag) => ({
      tagId: tag.tagId,
      label: truncateLabel(tag.tagName),
      fullName: tag.tagName,
      correctRate: (tag.correctRate ?? 0) * 100,
      attemptCount: tag.attemptCount,
    }))

  if (data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.grid }}
                tickLine={false}
                interval={0}
                angle={data.length > 4 ? -25 : 0}
                textAnchor={data.length > 4 ? 'end' : 'middle'}
                height={data.length > 4 ? 56 : 30}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: chartTheme.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                label={{
                  value: 'Correct rate',
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
                  return [formatPercent(numeric / 100), 'Correct rate']
                }}
                labelFormatter={(_, payload) => {
                  const item = payload?.[0]?.payload as { fullName?: string } | undefined
                  return item?.fullName ?? ''
                }}
              />
              <Bar dataKey="correctRate" fill={chartTheme.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
