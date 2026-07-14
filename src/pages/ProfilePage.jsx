import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';

import FormInput from '../components/FormInput';
import Button from '../components/Button';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidation';
import { User, LogOut, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, handleLogout, updateUserProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim())       tempErrors.name = t('profilePage.validation.nameRequired');
    if (!email) {
      tempErrors.email = t('profilePage.validation.emailRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) tempErrors.email = t('profilePage.validation.emailInvalid');
    }

    if (password && !validatePassword(password).valid) {
      tempErrors.password = t('profilePage.validation.passwordInvalid');
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = t('profilePage.validation.passwordsNoMatch');
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = updateUserProfile({ name, email, password });
    if (!result.ok) {
      setErrors({ email: result.error });
      addToast(result.error || t('profilePage.toast.updateFailed'), 'error');
      return;
    }
    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
    addToast(t('profilePage.toast.profileUpdated'), 'success');
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoutAction = () => {
    if (window.confirm("Are you sure you want to log out of your workspace session?")) {
      handleLogout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-content">
        <div style={styles.header}>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>{t('profilePage.title')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>{t('profilePage.subtitle')}</p>
        </div>

        <div style={styles.layout}>
          <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                <User size={36} color="var(--accent-lime)" />
              </div>
              <h3 style={{ color: 'var(--text-white)', marginTop: '16px' }}>{user.name}</h3>
              <span style={styles.roleLabel}>{t('profilePage.workspace', { role: user.role.toUpperCase() })}</span>
            </div>

            <div style={styles.divider}></div>

            <Button onClick={handleLogoutAction} variant="secondary" style={styles.logoutBtn} icon={<LogOut size={16} />}>
              {t('profilePage.signOut')}
            </Button>
          </div>

          <div className="card" style={{ flex: 1.8, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>{t('profilePage.accountCredentials')}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
              {t('profilePage.updateSettingsHint')}
            </p>

            {success && (
              <div style={styles.successBanner}>
                <CheckCircle size={16} color="var(--success)" />
                <span>{t('profilePage.credentialsUpdatedBanner')}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <FormInput
                label={t('profilePage.fullNameLabel')}
                id="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />

              <FormInput
                label={t('profilePage.emailAddressLabel')}
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label={t('profilePage.newPasswordOptional')}
                    id="pwd-input"
                    type="password"
                    placeholder={t('profilePage.minCharsPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                  <PasswordStrengthIndicator password={password} onValidationChange={setPasswordValid} />
                </div>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label={t('profilePage.confirmNewPasswordLabel')}
                    id="cpwd-input"
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <Button type="submit" variant="lime" style={{ marginTop: '12px' }} disabled={password.length > 0 && !passwordValid}>
                {t('profilePage.saveProfileChanges')}
              </Button>
            </form>
          </div>
        </div>
      </div>
  );
}

const styles = {
  header: {
    marginBottom: '32px',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '12px 0',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-darker)',
    border: '2px solid var(--border-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: '11px',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--accent-lime)',
    padding: '4px 10px',
    borderRadius: '9999px',
    marginTop: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '24px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '14px',
    marginBottom: '24px',
  }
};
