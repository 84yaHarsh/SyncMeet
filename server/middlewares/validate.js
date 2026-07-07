/**
 * Generic Express middleware factory for validating request data with Zod.
 * Usage: validate({ params: paramsSchema, body: bodySchema, query: querySchema })
 */
const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    next();
  } catch (error) {
    const issues = error?.issues?.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })) || [{ message: 'Invalid request data' }];

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: issues,
    });
  }
};

module.exports = { validate };
