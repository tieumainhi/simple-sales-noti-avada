import * as yup from 'yup';
import { validate } from './validate';

const statusSchema = yup.mixed().oneOf(['active', 'inactive', 'cancelled']);
const trimmedString = yup
  .string()
  .transform((value, originalValue) =>
    typeof originalValue === 'string' ? originalValue.trim() : originalValue
  );

const createSchema = yup.object({
  name: trimmedString
    .min(2, 'Name must be 2-100 chars')
    .max(100)
    .required('Name is required'),
  amount: yup
    .number()
    .strict(true)
    .required('Amount is required')
    .min(0, 'Amount must be >= 0'),
  status: statusSchema.optional()
});

const updateSchema = yup.object({
  id: yup
    .string()
    .strict(true)
    .required('ID is required')
    .min(1),
  name: trimmedString
    .min(2)
    .max(100)
    .optional(),
  amount: yup
    .number()
    .strict(true)
    .min(0)
    .optional(),
  status: statusSchema.optional()
});

export const validateCreateSubscription = validate(createSchema);
export const validateUpdateSubscription = validate(updateSchema);
