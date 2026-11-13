/**
 * Input validators for Authentication and User management
 */

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateRegisterInput = (data) => {
  const errors = [];
  const { full_name, email, password, role } = data;

  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters long');
  }

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['student', 'instructor'].includes(role)) {
    errors.push('Registration role must be either "student" or "instructor"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLoginInput = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validateRegisterInput,
  validateLoginInput,
};

