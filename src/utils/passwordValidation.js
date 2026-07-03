const COMMON_WEAK_PASSWORDS = new Set([
  'password12345', 'password1234', 'password123', 'password12', 'password1',
  '123456789012', '12345678901', '1234567890',
  'qwerty123456', 'qwerty12345', 'qwerty1234',
  'letmein12345', 'letmein1234', 'letmein123',
  'admin123456', 'admin12345', 'admin1234',
  'welcome12345', 'welcome1234', 'welcome123',
  'monkey123456', 'monkey12345', 'monkey1234',
  'dragon123456', 'dragon12345', 'dragon1234',
  'master123456', 'master12345', 'master1234',
  'login123456', 'login12345', 'login1234',
  'abc12345678', 'abc1234567', 'abc123456',
  'iloveyou123', 'iloveyou12', 'iloveyou1',
  'passw0rd123', 'passw0rd12', 'passw0rd1',
  'sunshine123', 'princess12', 'football12',
  'shadow12345', 'trustno112', 'hello12345',
  'charlie1234', 'donald1234', 'batman1234',
  'access12345', 'whatever12', 'qwerty1234',
  'florasmart12', 'florasmart1',
]);

export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 12 characters',
    test: (pw) => pw.length >= 12,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter',
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter',
    test: (pw) => /[a-z]/.test(pw),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (pw) => /[0-9]/.test(pw),
  },
  {
    id: 'special',
    label: 'At least one special character',
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pw),
  },
  {
    id: 'common',
    label: 'Not a commonly used password',
    test: (pw) => !COMMON_WEAK_PASSWORDS.has(pw.toLowerCase()),
  },
];

export function validatePassword(password) {
  if (!password) {
    return { valid: false, rules: PASSWORD_RULES.map((r) => ({ ...r, passed: false })), score: 0 };
  }

  const rules = PASSWORD_RULES.map((r) => ({
    ...r,
    passed: r.test(password),
  }));

  const passedCount = rules.filter((r) => r.passed).length;
  const score = Math.round((passedCount / rules.length) * 100);
  const valid = rules.every((r) => r.passed);

  return { valid, rules, score };
}
