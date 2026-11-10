import { z } from 'zod';
import { VALID_TYPES, VALID_PARTICIPANTS, VALID_MAX_DURATIONS } from '../services/boredApi.js';

export const suggestionQuerySchema = z.object({
  type: z
    .string()
    .optional()
    .refine((val) => !val || VALID_TYPES.includes(val.toLowerCase()), {
      message: `Invalid type. Allowed types: ${VALID_TYPES.join(', ')}`
    }),
  participants: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return VALID_PARTICIPANTS.includes(num);
      },
      {
        message: `Invalid participants count. Allowed values: ${VALID_PARTICIPANTS.join(', ')}`
      }
    ),
  maxDuration: z
    .string()
    .optional()
    .refine((val) => !val || VALID_MAX_DURATIONS.includes(val), {
      message: `Invalid maxDuration. Allowed values: ${VALID_MAX_DURATIONS.join(', ')}`
    })
});

export const validate = (schema, source = 'auto') => (req, res, next) => {
  try {
    let data;
    if (source === 'body') {
      data = req.body;
    } else if (source === 'query') {
      data = req.query;
    } else {
      data = req.method === 'GET' ? req.query : req.body;
    }
    const parsed = schema.parse(data || {});
    req.validatedData = parsed;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors.map((e) => e.message).join('; ')
      });
    }
    next(err);
  }
};

