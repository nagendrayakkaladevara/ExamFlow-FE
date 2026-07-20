import { z } from 'zod'

export const pollResultVisibilitySchema = z.enum(['AFTER_VOTE', 'AFTER_EXPIRY', 'NEVER'])

export const pollFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim(),
    publishAt: z.string().min(1, 'Publish date is required'),
    expireAt: z.string().min(1, 'Expiry date is required'),
    resultVisibility: pollResultVisibilitySchema,
    audiences: z
      .array(
        z.object({
          targetType: z.enum(['ALL_LECTURERS', 'ALL_STUDENTS', 'USER', 'CLASS']),
          targetId: z.string().nullable().optional(),
        }),
      )
      .min(1, 'Select at least one audience'),
    options: z.array(
      z.object({
        optionText: z.string(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const filledOptions = data.options.filter((option) => option.optionText.trim())

    if (filledOptions.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Add at least two options',
      })
    }
  })

export type PollFormValues = z.infer<typeof pollFormSchema>

export const pollResultVisibilityOptions = [
  { value: 'AFTER_VOTE' as const, label: 'After voting' },
  { value: 'AFTER_EXPIRY' as const, label: 'After poll expires' },
  { value: 'NEVER' as const, label: 'Admin only' },
]
