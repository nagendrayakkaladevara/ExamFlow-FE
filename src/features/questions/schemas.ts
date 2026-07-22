import { z } from 'zod'

export const questionTypeSchema = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'FILL_BLANK',
])

export const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD'])

export const questionOptionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
})

export const questionFormSchema = z
  .object({
    type: questionTypeSchema,
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(255, 'Title must be at most 255 characters'),
    description: z.string().trim(),
    defaultMarks: z
      .number({ error: 'Marks must be a number' })
      .positive('Marks must be greater than 0'),
    difficulty: difficultySchema,
    explanation: z.string().optional(),
    subject: z
      .string()
      .max(150, 'Subject must be at most 150 characters')
      .optional(),
    topic: z.string().max(150, 'Topic must be at most 150 characters').optional(),
    correctText: z.string().optional(),
    tagIds: z.array(z.string().uuid()),
    // Option text length is validated in superRefine for MCQ types only.
    // FILL_BLANK keeps stale options in form state while those fields are hidden.
    options: z.array(
      z.object({
        optionText: z.string(),
        isCorrect: z.boolean(),
      }),
    ),
    imageUrl: z.string().nullable().optional(),
    imageBlobKey: z
      .string()
      .max(512, 'Image key must be at most 512 characters')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'FILL_BLANK') {
      if (!data.correctText?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['correctText'],
          message: 'Correct answer is required for fill-in-the-blank questions',
        })
      }
      return
    }

    if (!data.options.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Add at least one answer option',
      })
      return
    }

    data.options.forEach((option, index) => {
      if (!option.optionText.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['options', index, 'optionText'],
          message: 'Option text is required',
        })
      }
    })

    const correctCount = data.options.filter((option) => option.isCorrect).length

    if (data.type === 'SINGLE_CHOICE' && correctCount !== 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Single choice must have exactly one correct option',
      })
    }

    if (data.type === 'MULTIPLE_CHOICE' && correctCount < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Multiple choice must have at least one correct option',
      })
    }
  })

export type QuestionFormValues = z.infer<typeof questionFormSchema>

export const questionTypeOptions = [
  {
    value: 'SINGLE_CHOICE' as const,
    label: 'Single choice',
    description: 'Students pick exactly one correct option.',
  },
  {
    value: 'MULTIPLE_CHOICE' as const,
    label: 'Multiple choice',
    description: 'Students can select one or more correct options.',
  },
  {
    value: 'FILL_BLANK' as const,
    label: 'Fill in the blank',
    description: 'Students type a short text answer.',
  },
] as const

export const difficultyOptions = [
  { value: 'EASY' as const, label: 'Easy' },
  { value: 'MEDIUM' as const, label: 'Medium' },
  { value: 'HARD' as const, label: 'Hard' },
] as const
