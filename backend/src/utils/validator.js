const validator = require("validator");

const validate = (data) => {
  const { firstName, emailId, password } = data;

  // Required fields
  if (!firstName || !emailId || !password) {
    throw new Error("Some field is missing");
  }

  // First name length
  if (firstName.length < 3) {
    throw new Error("First name must be at least 3 characters");
  }

  // Email validation
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email");
  }

  // Password validation (match frontend rule)
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return true;
};

module.exports = validate;
