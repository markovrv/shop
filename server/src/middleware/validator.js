import { z } from 'zod';

// Схемы валидации Zod
const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense'], {
    errorMap: () => ({ message: 'Type must be one of: asset, liability, equity, income, expense' })
  }),
  initialBalance: z.number().optional().default(0)
});

export const createAccountSchema = accountSchema;
export const updateAccountSchema = accountSchema.partial();

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  description: z.string().min(1, 'Description is required').max(500),
  debitAccountId: z.number().int().positive('Debit account ID must be a positive integer'),
  creditAccountId: z.number().int().positive('Credit account ID must be a positive integer'),
  amount: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().positive('Сумма должна быть положительным числом.').multipleOf(0.01, 'В сумме должно быть только два дробных знака после запятой')),
  document: z.string().nullable().optional()
});

export const createEntrySchema = entrySchema;
export const updateEntrySchema = entrySchema
  .partial(); // Разрешаем изменять все поля, включая счета

// Middleware для валидации
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Объединяем body, params и query для валидации
      const inputData = {
        ...req.body,
        ...req.params,
        ...req.query
      };

      const validatedData = schema.parse(inputData);
      
      // Сохраняем валидированные данные в req.validated
      req.validated = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.path.join('.')] = err.message;
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: errors
        });
      }
      
      next(error);
    }
 };
};