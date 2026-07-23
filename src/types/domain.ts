import type {
  AudienceTargetType,
  DifficultyLevel,
  PollResultVisibility,
  PollTag,
  QuestionType,
  ResultPolicy,
  SubmissionStatus,
  UserRole,
} from '@/types/enums'
import type { PublicUser } from '@/types/auth'

export interface ClassRecord {
  id: string
  name: string
  code: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClassMember {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  assignedAt?: string
  enrolledAt?: string
}

export interface TagRecord {
  id: string
  name: string
  createdAt: string
}

export interface QuestionOption {
  id: string
  optionText: string
  isCorrect?: boolean
  sortOrder: number
}

export interface QuestionRecord {
  id: string
  type: QuestionType
  title: string
  description: string
  explanation: string | null
  defaultMarks: number
  difficulty: DifficultyLevel
  subject: string | null
  topic: string | null
  imageUrl: string | null
  imageBlobKey: string | null
  createdAt: string
  updatedAt: string
  options?: QuestionOption[]
  tags?: { id: string; name: string }[]
  correctText?: string | null
}

export interface AssignmentRecord {
  id: string
  classId: string
  lecturerId: string
  title: string
  description: string | null
  startAt: string
  endAt: string
  durationMinutes: number
  resultPolicy: ResultPolicy
  resultDeclareAt: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  /** Present on list/detail responses for students when they have started or submitted. */
  mySubmission?: Pick<SubmissionRecord, 'status' | 'submittedAt'> | null
}

export interface AssignmentQuestion {
  id: string
  questionId: string
  marks: number
  sortOrder: number
  question: {
    id: string
    type: QuestionType
    title: string
    description: string
    difficulty: DifficultyLevel
    subject: string | null
    topic: string | null
    imageUrl: string | null
    options: { id: string; optionText: string; sortOrder: number; isCorrect?: boolean }[]
    correctText?: string | null
  }
}

export interface AssignmentDetail extends AssignmentRecord {
  questions: AssignmentQuestion[]
}

export interface SubmissionRecord {
  id: string
  assignmentId: string
  studentId: string
  status: SubmissionStatus
  startedAt: string
  endsAt: string
  submittedAt: string | null
  score: number | null
  maxScore: number
  correctCount: number | null
  incorrectCount: number | null
  createdAt: string
  updatedAt: string
}

export interface AttemptAnswer {
  assignmentQuestionId: string
  answer: { selectedOptionIds?: string[]; text?: string } | null
}

export interface AttemptRecord {
  submission: SubmissionRecord
  answers: AttemptAnswer[]
}

export interface AssignmentResult {
  submissionId: string
  status: SubmissionStatus
  score: number
  maxScore: number
  correctCount: number
  incorrectCount: number
  submittedAt: string
  answers: {
    assignmentQuestionId: string
    answer: Record<string, unknown> | null
    isCorrect: boolean
    marksAwarded: number
    explanation: string | null
    correctText: string | null
    title: string
    description: string
    type: QuestionType
    imageUrl: string | null
    options: { id: string; optionText: string; isCorrect: boolean }[]
  }[]
}

export interface AudienceRecord {
  targetType: AudienceTargetType
  targetId: string | null
}

export interface LastEditedBy {
  id: string
  name: string
}

export interface CircularRecord {
  id: string
  title: string
  description: string
  coverImageUrl: string | null
  publishAt: string
  isPublished: boolean
  createdAt: string
  lastEditedBy: LastEditedBy | null
  lastEditedAt: string | null
  audiences: AudienceRecord[]
}

export interface PollOption {
  id: string
  optionText: string
  sortOrder: number
}

export interface PollListItem {
  id: string
  title: string
  postedBy: string
  optionsLabel: string
  expireAt: string
  tags: PollTag[]
}

export interface PollRecord {
  id: string
  title: string
  description: string | null
  publishAt: string
  expireAt: string
  resultVisibility: PollResultVisibility
  isPublished: boolean
  createdAt: string
  options: PollOption[]
  audiences: AudienceRecord[]
  tags?: PollTag[]
}

export interface PollResults {
  pollId: string
  totalVotes: number
  options: { optionId: string; optionText: string; votes: number }[]
}

export interface AnalyticsDateParams {
  from?: string
  to?: string
}

export type AssignmentRosterStatus = 'all' | 'completed' | 'pending'

export interface AssignmentRosterParams extends AnalyticsDateParams {
  status?: AssignmentRosterStatus
  sort?: 'score' | 'name' | 'submittedAt'
  page?: number
  limit?: number
}

export type AssignmentRosterSubmissionStatus =
  | null
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'AUTO_SUBMITTED'

export interface AssignmentRosterRow {
  rank: number | null
  studentId: string
  firstName: string
  lastName: string
  email: string
  status: AssignmentRosterSubmissionStatus
  score: number | null
  maxScore: number | null
  submittedAt: string | null
}

export interface StudentAnalytics {
  totalAttempts: number
  averageScore: number | null
  recent: {
    assignmentId: string
    title: string
    score: number | null
    maxScore: number | null
    correctCount: number | null
    incorrectCount: number | null
    percentage: number | null
    submittedAt: string | null
    status: 'SUBMITTED' | 'AUTO_SUBMITTED'
  }[]
  trend: {
    submittedAt: string
    percentage: number
  }[]
}

export interface StudentTagAnalytics {
  byTag: {
    tagId: string
    tagName: string
    attemptCount: number
    correctCount: number
    correctRate: number | null
  }[]
  weakTopics: {
    tagId: string
    tagName: string
    attemptCount: number
    correctCount: number
    correctRate: number | null
  }[]
}

export interface LecturerSummary {
  classes: {
    classId: string
    className: string
    studentCount: number
    assignmentCount: number
    completedSubmissions: number
    completionRate: number
    passed: number
    failed: number
    highestScore: number | null
    lowestScore: number | null
    averageScore: number | null
  }[]
  totals: {
    classCount: number
    uniqueStudentCount: number
    assignmentCount: number
    completedSubmissions: number
    completionRate: number
    passed: number
    failed: number
    averageScore: number | null
  }
}

export interface LecturerClassAnalytics {
  classId: string
  studentCount: number
  assignmentCount: number
  completedSubmissions: number
  completionRate: number
  passed: number
  failed: number
  highestScore: number | null
  lowestScore: number | null
  averageScore: number | null
}

export interface LecturerAssignmentAnalytics {
  assignmentId: string
  title: string
  enrolled: number
  submitted: number
  completionRate: number
  rankings: AssignmentRosterRow[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export interface AssignmentQuestionAnalytics {
  assignmentQuestionId: string
  title: string
  type: QuestionType
  marks: number
  sortOrder: number
  attemptCount: number
  correctCount: number
  incorrectCount: number
  skippedCount: number
  correctRate: number | null
  topWrongAnswers: {
    optionText: string
    count: number
    percentage: number
  }[]
  tags: { tagId: string; tagName: string }[]
}

export interface AdminOverview {
  usersByRole: Partial<Record<UserRole, number>>
  activeClasses: number
  totalAssignments: number
  completedSubmissions: number
  averageCompletionRate: number
}

export interface AdminClassAnalytics {
  classId: string
  className: string
  studentCount: number
  assignmentCount: number
  completionRate: number
  averageScore: number | null
  assignments: {
    assignmentId: string
    title: string
    enrolled: number
    submitted: number
    completionRate: number
    averageScore: number | null
  }[]
}

export interface ActivityFeed {
  items: {
    id: string
    type:
      | 'ASSIGNMENT_PUBLISHED'
      | 'USER_REGISTERED'
      | 'CLASS_CREATED'
      | 'SUBMISSION_COMPLETED'
    actorName: string
    resourceLabel: string
    occurredAt: string
  }[]
  nextCursor: string | null
}

export interface AdminTrends {
  metric: 'completion' | 'submissions' | 'averageScore'
  interval: 'day' | 'week' | 'month'
  from: string
  to: string
  points: {
    periodStart: string
    periodEnd: string
    value: number
  }[]
}

export interface AdminAlert {
  classId: string
  className: string
  assignmentId: string
  assignmentTitle: string
  completionRate: number
  threshold: number
}

export interface UploadResult {
  url: string
  blobKey: string
}

export type { PublicUser }
