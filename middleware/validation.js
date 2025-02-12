export const validate = (scehma) => (req, res, next) => {
  const { error } = scehma.validate(req.body, { aboutEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: error.details.map((e) => e.message),
    });
  }
  next();
};
