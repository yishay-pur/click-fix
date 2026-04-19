import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'שדה חובה')
  .email('כתובת אימייל לא תקינה');

export const phoneSchema = z
  .string()
  .min(1, 'שדה חובה')
  .regex(/^05\d{8}$/, 'מספר טלפון לא תקין (לדוגמה: 0501234567)');

export const passwordSchema = z
  .string()
  .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
  .regex(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה באנגלית')
  .regex(/[0-9]/, 'סיסמה חייבת להכיל לפחות מספר אחד');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'שדה חובה'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
    lastName: z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
    email: emailSchema,
    // phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'שדה חובה'),
    // city: z.string().optional(),
    // gender: z.enum(['male', 'female', 'other']).optional(),
    // acceptTerms: z.boolean().refine((val) => val === true, {
    //   message: 'יש לאשר את התקנון'
    // })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  });

export const professionalRegisterSchema = z
  .object({
    // Step 1 - Personal details
    firstName: z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
    lastName: z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'שדה חובה'),

    // Step 2 - Professional details
    categoryId: z.string().min(1, 'יש לבחור תחום'),
    yearsOfExperience: z.number().min(0).optional(),
    description: z
      .string()
      .max(500, 'התיאור ארוך מדי (מקסימום 500 תווים)')
      .optional(),
    serviceAreas: z.array(z.string()).min(1, 'יש לבחור לפחות אזור שירות אחד'),

    // Step 3 - Certificates (validated separately during file upload)

    // Step 4 - Working hours and services
    workingHours: z
      .array(
        z.object({
          day: z.enum([
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
          ]),
          isWorking: z.boolean(),
          startTime: z.string().optional(),
          endTime: z.string().optional(),
        }),
      )
      .refine(
        (hours) => {
          return hours.every((h) => {
            if (h.isWorking) {
              return h.startTime && h.endTime && h.startTime < h.endTime;
            }
            return true;
          });
        },
        { message: 'שעות עבודה לא תקינות' },
      ),

    // Services are managed via local state, not react-hook-form

    // Step 5 - Terms
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'יש לאשר את התקנון',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  });

export const reviewSchema = z.object({
  ratings: z.object({
    reliability: z.number().min(1, 'יש לדרג אמינות').max(5),
    service: z.number().min(1, 'יש לדרג שירות').max(5),
    availability: z.number().min(1, 'יש לדרג זמינות').max(5),
    price: z.number().min(1, 'יש לדרג מחיר').max(5),
    professionalism: z.number().min(1, 'יש לדרג מקצועיות').max(5),
  }),
  content: z
    .string()
    .min(10, 'הביקורת קצרה מדי (מינימום 10 תווים)')
    .max(1000, 'הביקורת ארוכה מדי (מקסימום 1000 תווים)'),
});

export const quoteRequestSchema = z.object({
  professionalId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.array(z.string()), z.number()]),
    }),
  ),
  description: z.string().max(500, 'התיאור ארוך מדי').optional(),
  urgency: z.enum(['low', 'medium', 'high']),
  responseMethod: z.enum(['system', 'phone']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfessionalRegisterFormData = z.infer<
  typeof professionalRegisterSchema
>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;
