import { Badge } from '@/components/ui/badge'

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? 'default' : 'secondary'}>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: string }) {
  return <Badge variant="outline">{role.toLowerCase()}</Badge>
}
