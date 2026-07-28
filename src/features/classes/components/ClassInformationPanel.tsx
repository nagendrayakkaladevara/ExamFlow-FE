import type { ReactNode } from 'react'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ClassRecord } from '@/types/domain'

function InfoField({
  label,
  children,
  className,
  valueClassName,
}: {
  label: string
  children: ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={cn('px-4 py-4 md:px-0 md:py-0', className)}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className={cn('mt-1 text-sm font-medium text-foreground', valueClassName)}>
        {children}
      </dd>
    </div>
  )
}

export function ClassInformationPanel({ classData }: { classData: ClassRecord }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 md:px-6 md:py-4">
        <h2 className="text-base font-semibold">Class information</h2>
      </div>
      <dl className="divide-y divide-border md:grid md:grid-cols-2 md:gap-4 md:divide-y-0 md:p-6">
        <InfoField label="Name">{classData.name}</InfoField>
        <InfoField label="Code">{classData.code ?? '—'}</InfoField>
        <InfoField label="Status" valueClassName="font-normal">
          <ActiveBadge active={classData.isActive} />
        </InfoField>
        <InfoField label="Last updated">{formatDateTime(classData.updatedAt)}</InfoField>
        {classData.description ? (
          <InfoField
            label="Description"
            className="md:col-span-2"
            valueClassName="font-normal leading-relaxed"
          >
            {classData.description}
          </InfoField>
        ) : null}
      </dl>
    </section>
  )
}
