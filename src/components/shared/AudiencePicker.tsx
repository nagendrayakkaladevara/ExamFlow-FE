import type { UserRole } from '@/types/enums'
import type { AudienceTargetType } from '@/types/enums'
import { useClassOptions } from '@/hooks/useClassOptions'
import { usersApi } from '@/features/users/api'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/config/query-keys'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface AudienceValue {
  targetType: AudienceTargetType
  targetId?: string | null
}

interface AudiencePickerProps {
  role: UserRole
  value: AudienceValue[]
  onChange: (value: AudienceValue[]) => void
}

const ADMIN_TARGETS: AudienceTargetType[] = [
  'ALL_LECTURERS',
  'ALL_STUDENTS',
  'CLASS',
  'USER',
]

const LECTURER_TARGETS: AudienceTargetType[] = ['CLASS', 'USER']

function targetLabel(type: AudienceTargetType): string {
  switch (type) {
    case 'ALL_LECTURERS':
      return 'All lecturers'
    case 'ALL_STUDENTS':
      return 'All students'
    case 'CLASS':
      return 'Specific class'
    case 'USER':
      return 'Specific user'
  }
}

export function AudiencePicker({ role, value, onChange }: AudiencePickerProps) {
  const { classes } = useClassOptions()
  const usersQuery = useQuery({
    queryKey: queryKeys.users.list({ scope: 'audience' }),
    queryFn: async () => {
      const result = await usersApi.list({ isActive: true, limit: 100 })
      return result.data
    },
    enabled: role === 'ADMIN' && value.some((v) => v.targetType === 'USER'),
  })

  const allowedTargets = role === 'ADMIN' ? ADMIN_TARGETS : LECTURER_TARGETS

  function addTarget(type: AudienceTargetType) {
    if (value.some((v) => v.targetType === type && type !== 'CLASS' && type !== 'USER')) {
      return
    }
    onChange([...value, { targetType: type, targetId: null }])
  }

  function updateTarget(index: number, patch: Partial<AudienceValue>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeTarget(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {allowedTargets.map((type) => (
          <Button key={type} type="button" variant="outline" size="sm" onClick={() => addTarget(type)}>
            Add {targetLabel(type)}
          </Button>
        ))}
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">Choose at least one audience.</p>
      ) : null}

      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={`${item.targetType}-${index}`} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label>Audience</Label>
              <Badge variant="secondary">{targetLabel(item.targetType)}</Badge>
            </div>

            {item.targetType === 'CLASS' ? (
              <div className="flex-1 space-y-1">
                <Label htmlFor={`class-${index}`}>Class</Label>
                <select
                  id={`class-${index}`}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={item.targetId ?? ''}
                  onChange={(e) => updateTarget(index, { targetId: e.target.value || null })}
                >
                  <option value="">Select class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}{cls.code ? ` (${cls.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {item.targetType === 'USER' && role === 'ADMIN' ? (
              <div className="flex-1 space-y-1">
                <Label htmlFor={`user-${index}`}>User</Label>
                <select
                  id={`user-${index}`}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  value={item.targetId ?? ''}
                  onChange={(e) => updateTarget(index, { targetId: e.target.value || null })}
                >
                  <option value="">Select user</option>
                  {(usersQuery.data ?? []).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role.toLowerCase()})
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {item.targetType === 'USER' && role === 'LECTURER' ? (
              <div className="flex-1 space-y-1">
                <Label htmlFor={`user-id-${index}`}>Student ID</Label>
                <Input
                  id={`user-id-${index}`}
                  value={item.targetId ?? ''}
                  onChange={(e) => updateTarget(index, { targetId: e.target.value || null })}
                  placeholder="Student user ID"
                />
              </div>
            ) : null}

            <Button type="button" variant="ghost" size="sm" onClick={() => removeTarget(index)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
