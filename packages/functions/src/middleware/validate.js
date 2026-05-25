/**
 * Generic Yup validation middleware factory for Koa.
 *
 * @example
 * import * as yup from 'yup';
 * import {validate} from './validate';
 *
 * const createSchema = yup.object({ name: yup.string().min(2).max(100) });
 * export const validateCreate = validate(createSchema);
 *
 * // routes/api.js
 * router.post('/items', validateCreate, controller.create);
 */

/**
 * Format Yup errors into a readable string
 * @param {yup.ValidationError} error
 * @returns {string}
 */
function formatYupError(error) {
  return error.inner.length ? error.inner.map(issue => issue.message).join(', ') : error.message;
}

/**
 * Create Koa validation middleware from a Yup schema
 * @param {yup.Schema} schema - Yup schema to validate against
 * @returns {Function} Koa middleware
 */
export function validate(schema) {
  return async function validateBody(ctx, next) {
    const body = ctx.req?.body ?? ctx.request?.body ?? {};
    let data;

    try {
      data = await schema.validate(body, {
        abortEarly: true, // Stop validation on first error
        stripUnknown: true
      });
    } catch (error) {
      ctx.status = 400;
      ctx.body = { success: false, error: formatYupError(error) };
      return;
    }

    // Replace body with parsed/transformed data (trimmed, stripped unknown fields)
    ctx.req.body = data;
    ctx.request.body = data;

    return next();
  };
}
