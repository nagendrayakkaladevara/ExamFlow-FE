import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { DateRangePreset } from '@/features/analytics/hooks/useDateRangeFilter'

interface DateRangeFilterProps {
  preset: DateRangePreset
  onPresetChange: (preset: DateRangePreset) => void
  customFrom: string
  customTo: string
  onCustomFromChange: (value: string) => void
  onCustomToChange: (value: string) => void
}

export function DateRangeFilter({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full max-w-xs space-y-1">
        <Label htmlFor="date-range-preset">Date range</Label>
        <Select value={preset} onValueChange={(value) => onPresetChange(value as DateRangePreset)}>
          <SelectTrigger id="date-range-preset">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {preset === 'custom' ? (
        <>
          <div className="w-full max-w-xs space-y-1">
            <Label htmlFor="date-from">From</Label>
            <Input
              id="date-from"
              type="datetime-local"
              value={customFrom}
              onChange={(event) => onCustomFromChange(event.target.value)}
            />
          </div>
          <div className="w-full max-w-xs space-y-1">
            <Label htmlFor="date-to">To</Label>
            <Input
              id="date-to"
              type="datetime-local"
              value={customTo}
              onChange={(event) => onCustomToChange(event.target.value)}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
