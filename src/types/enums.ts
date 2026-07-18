export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT'

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK'

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD'

export type ResultPolicy = 'IMMEDIATE' | 'AFTER_COMPLETION' | 'SCHEDULED'

export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED'

export type AudienceTargetType =
  | 'ALL_LECTURERS'
  | 'ALL_STUDENTS'
  | 'USER'
  | 'CLASS'

export type PollResultVisibility = 'AFTER_VOTE' | 'AFTER_EXPIRY' | 'NEVER'
