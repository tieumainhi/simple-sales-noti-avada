import { z } from 'zod';
import { ALLOW_SHOW_OPTIONS, POSITIONS } from '@functions/const/salesPopSettings';
import { validate } from './validate';

const updateSchema = z.object({
  position: z.enum(POSITIONS).optional(),
  hideTimeAgo: z.boolean().optional(),
  truncateProductName: z.boolean().optional(),
  displayDuration: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional(),
  firstDelay: z
    .number()
    .int()
    .min(0)
    .max(60)
    .optional(),
  popsInterval: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional(),
  maxPopsDisplay: z
    .number()
    .int()
    .min(1)
    .max(80)
    .optional(),
  includedUrls: z.string().optional(),
  excludedUrls: z.string().optional(),
  allowShow: z.enum(ALLOW_SHOW_OPTIONS).optional()
});

export const validateUpdateSettings = validate(updateSchema);
