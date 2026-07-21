import { ChevronDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { TagRecord } from '@/types/domain'

interface QuestionBankFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  tags: TagRecord[]
  selectedTags: string[]
  onToggleTag: (tagId: string) => void
  onRemoveTag: (tagId: string) => void
  onClearTags: () => void
}

export function QuestionBankFilterBar({
  search,
  onSearchChange,
  tags,
  selectedTags,
  onToggleTag,
  onRemoveTag,
  onClearTags,
}: QuestionBankFilterBarProps) {
  const selectedTagRecords = tags.filter((tag) => selectedTags.includes(tag.id))

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search questions…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between sm:w-56">
              <span>
                {selectedTags.length === 0
                  ? 'Filter by tags'
                  : `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`}
              </span>
              <ChevronDown className="size-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags available</p>
            ) : (
              tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => onToggleTag(tag.id)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedTagRecords.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {selectedTagRecords.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
              {tag.name}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-muted"
                aria-label={`Remove ${tag.name} filter`}
                onClick={() => onRemoveTag(tag.id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            onClick={onClearTags}
          >
            Clear all
          </Button>
        </div>
      ) : null}
    </div>
  )
}
