import * as yup from 'yup';
import { ALLOW_SHOW_OPTIONS, POSITIONS } from '@functions/const/salesPopSettings';
import { validate } from './validate';

const updateSchema = yup.object({
  position: yup
    .mixed()
    .oneOf(POSITIONS)
    .optional(),
  hideTimeAgo: yup
    .boolean()
    .strict(true)
    .optional(),
  truncateProductName: yup
    .boolean()
    .strict(true)
    .optional(),
  displayDuration: yup
    .number()
    .strict(true)
    .integer()
    .min(1)
    .max(20)
    .optional(),
  firstDelay: yup
    .number()
    .strict(true)
    .integer()
    .min(0)
    .max(60)
    .optional(),
  popsInterval: yup
    .number()
    .strict(true)
    .integer()
    .min(1)
    .max(30)
    .optional(),
  maxPopsDisplay: yup
    .number()
    .strict(true)
    .integer()
    .min(1)
    .max(80)
    .optional(),
  includedUrls: yup
    .string()
    .strict(true)
    .optional(),
  excludedUrls: yup
    .string()
    .strict(true)
    .optional(),
  allowShow: yup
    .mixed()
    .oneOf(ALLOW_SHOW_OPTIONS)
    .optional()
});

export const validateUpdateSettings = validate(updateSchema);
