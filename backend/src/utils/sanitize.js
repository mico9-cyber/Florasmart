export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function safeTrim(value = '') {
  return String(value).trim();
}

