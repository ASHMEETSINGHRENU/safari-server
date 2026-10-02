// Single source of truth for required secrets. Import this instead of reading
// process.env directly, so a missing secret fails at boot rather than silently
// falling back to a value that is published in the repo.
// dotenv must be loaded before the reads below: ESM imports are evaluated
// before any module body runs, so app.js calling dotenv.config() is too late.
import 'dotenv/config';

const require_ = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[config] ${key} is required but not set. Refusing to start with an insecure default.`);
  }
  return value;
};

export const JWT_SECRET = require_('JWT_SECRET');
export const MONGO_URI = require_('MONGO_URI');
