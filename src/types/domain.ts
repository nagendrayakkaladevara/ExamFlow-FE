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
    status: string
  }[]
  trend: {
    submittedAt: string
    percentage: number | null
  }[]
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
  rankings: {
    rank: number | null
    studentId: string
    studentName?: string | null
    firstName?: string | null
    lastName?: string | null
    email?: string | null
    status?: string | null
    score: number | null
    maxScore: number | null
    submittedAt: string | null
  }[]
}

export interface AdminOverview {
  usersByRole: Partial<Record<UserRole, number>>
  activeClasses: number
  totalAssignments: number
  completedSubmissions: number
  averageCompletionRate: number
}

export interface UploadResult {
  url: string
  blobKey: string
}

export type { PublicUser }
