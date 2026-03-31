/**
 * Lightweight validation helpers
 */

export function validatePreferences(data) {
  const errors = [];
  if (data.skills && !Array.isArray(data.skills)) errors.push('skills must be an array');
  if (data.budget_min != null && isNaN(Number(data.budget_min))) errors.push('budget_min must be a number');
  if (data.budget_max != null && isNaN(Number(data.budget_max))) errors.push('budget_max must be a number');
  if (data.hourly_rate_min != null && isNaN(Number(data.hourly_rate_min))) errors.push('hourly_rate_min must be a number');
  if (data.hourly_rate_max != null && isNaN(Number(data.hourly_rate_max))) errors.push('hourly_rate_max must be a number');
  if (data.experience_level && !['ENTRY_LEVEL', 'INTERMEDIATE', 'EXPERT'].includes(data.experience_level)) {
    errors.push('experience_level must be ENTRY_LEVEL, INTERMEDIATE, or EXPERT');
  }
  if (data.job_type && !['HOURLY', 'FIXED'].includes(data.job_type)) {
    errors.push('job_type must be HOURLY or FIXED');
  }
  if (data.risk_tolerance != null && ![1, 2, 3].includes(Number(data.risk_tolerance))) {
    errors.push('risk_tolerance must be 1, 2, or 3');
  }
  return { valid: errors.length === 0, errors };
}

export function validateFeedback(data) {
  const errors = [];
  if (!data.feedback || !['GOOD', 'BAD'].includes(data.feedback)) {
    errors.push('feedback must be GOOD or BAD');
  }
  return { valid: errors.length === 0, errors };
}
