import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ActiveBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { classesApi } from '@/features/classes/api'
import { usersApi } from '@/features/users/api'
import { queryKeys } from '@/config/query-keys'
import { formatDate } from '@/lib/format'
import { isApiError } from '@/lib/errors'
import type { ClassMember } from '@/types/domain'

interface ClassMembersPanelProps {
  classId: string
  isAdmin: boolean
}

function MemberTable({
  members,
  dateField,
  emptyTitle,
  emptyDescription,
}: {
  members: ClassMember[]
  dateField: 'assignedAt' | 'enrolledAt'
  emptyTitle: string
  emptyDescription: string
}) {
  if (members.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>{dateField === 'assignedAt' ? 'Assigned' : 'Enrolled'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.firstName} {member.lastName}
              </TableCell>
              <TableCell className="text-muted-foreground">{member.email}</TableCell>
              <TableCell>
                <ActiveBadge active={member.isActive} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(member[dateField])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AssignLecturerCard({ classId }: { classId: string }) {
  const queryClient = useQueryClient()
  const [lecturerId, setLecturerId] = useState('')

  const lecturersQuery = useQuery({
    queryKey: queryKeys.users.list({ role: 'LECTURER', assignable: true }),
    queryFn: async () => {
      const result = await usersApi.list({ role: 'LECTURER', isActive: true, limit: 100 })
      return result.data
    },
  })

  const assignMutation = useMutation({
    mutationFn: () => classesApi.assignLecturer(classId, lecturerId),
    onSuccess: () => {
      setLecturerId('')
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.lecturers(classId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      toast.success('Lecturer assigned.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to assign lecturer.')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign lecturer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="lecturer-select">Lecturer</Label>
          <Select value={lecturerId} onValueChange={setLecturerId}>
            <SelectTrigger id="lecturer-select">
              <SelectValue placeholder="Select lecturer" />
            </SelectTrigger>
            <SelectContent>
              {(lecturersQuery.data ?? []).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          disabled={!lecturerId || assignMutation.isPending}
          onClick={() => assignMutation.mutate()}
        >
          Assign lecturer
        </Button>
      </CardContent>
    </Card>
  )
}

function AssignStudentCard({ classId }: { classId: string }) {
  const queryClient = useQueryClient()
  const [studentId, setStudentId] = useState('')

  const studentsQuery = useQuery({
    queryKey: queryKeys.users.list({ role: 'STUDENT', assignable: true }),
    queryFn: async () => {
      const result = await usersApi.list({ role: 'STUDENT', isActive: true, limit: 100 })
      return result.data
    },
  })

  const enrollMutation = useMutation({
    mutationFn: () => classesApi.enrollStudent(classId, studentId),
    onSuccess: () => {
      setStudentId('')
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.students(classId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
      toast.success('Student enrolled.')
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : 'Unable to enroll student.')
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enroll student</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="student-select">Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger id="student-select">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {(studentsQuery.data ?? []).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          disabled={!studentId || enrollMutation.isPending}
          onClick={() => enrollMutation.mutate()}
        >
          Enroll student
        </Button>
      </CardContent>
    </Card>
  )
}

export function ClassLecturersPanel({ classId, isAdmin }: ClassMembersPanelProps) {
  const membersQuery = useQuery({
    queryKey: queryKeys.classes.lecturers(classId),
    queryFn: () => classesApi.listLecturers(classId),
    retry: false,
  })

  const rosterUnavailable = membersQuery.isError

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <AssignLecturerCard classId={classId} />
      ) : null}

      {membersQuery.isLoading ? <Skeleton className="h-48 w-full" /> : null}

      {rosterUnavailable ? (
        <EmptyState
          title="Lecturer roster unavailable"
          description="Ask the backend to expose GET /classes/:id/lecturers returning assigned lecturers with id, userId, firstName, lastName, email, isActive, and assignedAt."
        />
      ) : null}

      {!membersQuery.isLoading && !rosterUnavailable ? (
        <MemberTable
          members={membersQuery.data ?? []}
          dateField="assignedAt"
          emptyTitle="No lecturers assigned"
          emptyDescription={
            isAdmin
              ? 'Assign a lecturer using the form above.'
              : 'This class does not have any lecturers yet.'
          }
        />
      ) : null}
    </div>
  )
}

export function ClassStudentsPanel({ classId, isAdmin }: ClassMembersPanelProps) {
  const membersQuery = useQuery({
    queryKey: queryKeys.classes.students(classId),
    queryFn: () => classesApi.listStudents(classId),
    retry: false,
  })

  const rosterUnavailable = membersQuery.isError

  return (
    <div className="space-y-6">
      {isAdmin ? (
        <AssignStudentCard classId={classId} />
      ) : null}

      {membersQuery.isLoading ? <Skeleton className="h-48 w-full" /> : null}

      {rosterUnavailable ? (
        <EmptyState
          title="Student roster unavailable"
          description="Ask the backend to expose GET /classes/:id/students returning enrolled students with id, userId, firstName, lastName, email, isActive, and enrolledAt."
        />
      ) : null}

      {!membersQuery.isLoading && !rosterUnavailable ? (
        <MemberTable
          members={membersQuery.data ?? []}
          dateField="enrolledAt"
          emptyTitle="No students enrolled"
          emptyDescription={
            isAdmin
              ? 'Enroll students using the form above.'
              : 'This class does not have any students yet.'
          }
        />
      ) : null}
    </div>
  )
}
