import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit3, Trash2, Eye, X, AlertCircle, CheckCircle2, ShieldAlert, ToggleLeft, ToggleRight, RefreshCw, Users, Flower2 } from 'lucide-react';
import { adminService } from '../services/adminService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import { useTranslation } from 'react-i18next';

export default function AdminUserManagement() {
  const { t } = useTranslation();
  const addToast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', role: 'FLORIST' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers();
      setUsers(res?.data || []);
    } catch (err) {
      addToast(err?.message || t('adminUserManagement.toast.loadFailed'), 'error');
    } finally { setLoading(false); }
  };

  const buildQuery = () => {
    const params = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    if (statusFilter) params.status = statusFilter;
    return params;
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers(buildQuery());
      setUsers(res?.data || []);
    } catch (err) {
      addToast(err?.message || t('adminUserManagement.toast.searchFailed'), 'error');
    } finally { setLoading(false); }
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    loadUsers();
  };

  const openAddForm = (role) => {
    setEditingUser(null);
    setFormData({ fullName: '', email: '', phone: '', role });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setFormData({ fullName: user.fullName, email: user.email, phone: user.phone || '', role: user.roles?.[0] || 'FLORIST' });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const closeForm = () => {
    setFormModalOpen(false);
    setEditingUser(null);
    setFormData({ fullName: '', email: '', phone: '', role: 'FLORIST' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = t('adminUserManagement.validation.nameRequired');
    if (!formData.email.trim()) errors.email = t('adminUserManagement.validation.emailRequired');
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = t('adminUserManagement.validation.emailInvalid');
    if (!editingUser && !formData.role) errors.role = t('adminUserManagement.validation.roleRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, { fullName: formData.fullName, phone: formData.phone });
        addToast(t('adminUserManagement.toast.accountUpdated'), 'success');
      } else {
        const res = await adminService.createUser(formData);
        addToast(t('adminUserManagement.toast.accountCreated', { tempPassword: res?.data?.tempPassword || 'check logs' }), 'success');
      }
      closeForm();
      await loadUsers();
    } catch (err) {
      addToast(err?.message || t('adminUserManagement.toast.operationFailed'), 'error');
    } finally { setSubmitting(false); }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      addToast(t('adminUserManagement.toast.accountDeleted'), 'success');
      setDeleteModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      addToast(err?.message || t('adminUserManagement.toast.deleteFailed'), 'error');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user.id);
      addToast(t('adminUserManagement.toast.statusChanged', { action: user.isActive ? 'deactivated' : 'activated' }), 'success');
      await loadUsers();
    } catch (err) {
      addToast(err?.message || t('adminUserManagement.toast.statusChangeFailed'), 'error');
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    const matchesRole = !roleFilter || u.roles?.includes(roleFilter.toUpperCase());
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading && users.length === 0) return <LoadingSpinner text="Loading accounts..." />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t('adminUserManagement.title')}</h1>
          <p style={styles.subtitle}>{t('adminUserManagement.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="lime" icon={<Flower2 size={16} />} onClick={() => openAddForm('FLORIST')}>{t('adminUserManagement.addFlorist')}</Button>
          <Button variant="secondary" icon={<Users size={16} />} onClick={() => openAddForm('GARDENER')}>{t('adminUserManagement.addGardener')}</Button>
        </div>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" placeholder={t('adminUserManagement.searchPlaceholder')} value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            style={styles.searchInput}
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
          <option value="">{t('admin.users.allRoles')}</option>
          <option value="florist">{t('adminUserManagement.florist')}</option>
          <option value="gardener">{t('adminUserManagement.gardener')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="">{t('adminUserManagement.allStatus')}</option>
          <option value="active">{t('adminUserManagement.active')}</option>
          <option value="inactive">{t('adminUserManagement.inactive')}</option>
        </select>
        <button onClick={handleSearch} style={styles.filterBtn}>{t('adminUserManagement.search')}</button>
        <button onClick={resetFilters} style={styles.resetBtn}><RefreshCw size={14} /> {t('adminUserManagement.reset')}</button>
      </div>

      {loading && <LoadingSpinner text={t('adminUserManagement.refreshing')} />}

      {!loading && filteredUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Users size={48} color="var(--border-green)" />
          <h4 style={{ color: 'var(--text-white)', marginTop: '16px' }}>{t('adminUserManagement.noAccountsFound')}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '6px' }}>{t('adminUserManagement.tryAdjustingFilters')}</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{t('adminUserManagement.accountsFound', { count: filteredUsers.length, plural: filteredUsers.length !== 1 ? 's' : '' })}</p>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>{t('adminUserManagement.fullName')}</th>
                  <th>{t('adminUserManagement.email')}</th>
                  <th>{t('adminUserManagement.phone')}</th>
                  <th>{t('adminUserManagement.role')}</th>
                  <th>{t('adminUserManagement.status')}</th>
                  <th>{t('adminUserManagement.dateCreated')}</th>
                  <th style={{ textAlign: 'center' }}>{t('adminUserManagement.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td><span style={{ fontWeight: 600 }}>{u.fullName}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.phone || '—'}</td>
                    <td><span className={`badge ${u.roles?.includes('FLORIST') ? 'badge-info' : 'badge-warning'}`}>{u.roles?.includes('FLORIST') ? t('adminUserManagement.florist') : t('adminUserManagement.gardener')}</span></td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? t('adminUserManagement.active') : t('adminUserManagement.inactive')}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <div style={styles.actionCell}>
                        <button onClick={() => openViewModal(u)} style={styles.actionBtn} title="View details"><Eye size={15} /></button>
                        <button onClick={() => openEditForm(u)} style={styles.actionBtn} title="Edit account"><Edit3 size={15} /></button>
                        <button onClick={() => toggleStatus(u)} style={styles.actionBtn} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <ToggleRight size={15} color="var(--success)" /> : <ToggleLeft size={15} color="var(--text-muted)" />}
                        </button>
                        <button onClick={() => openDeleteModal(u)} style={{ ...styles.actionBtn, color: 'var(--error)' }} title="Delete account"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={t('adminUserManagement.accountDetails')}>
        {selectedUser && (
          <div>
            <div style={styles.detailGrid}>
              <div><strong>{t('adminUserManagement.fullNameLabel')}</strong> <span style={{ color: 'var(--text-white)' }}>{selectedUser.fullName}</span></div>
              <div><strong>{t('adminUserManagement.emailLabel')}</strong> <span style={{ color: 'var(--text-white)' }}>{selectedUser.email}</span></div>
              <div><strong>{t('adminUserManagement.phoneLabel')}</strong> <span style={{ color: 'var(--text-white)' }}>{selectedUser.phone || '—'}</span></div>
              <div><strong>{t('adminUserManagement.roleLabel')}</strong> <span className={`badge ${selectedUser.roles?.includes('FLORIST') ? 'badge-info' : 'badge-warning'}`}>{selectedUser.roles?.includes('FLORIST') ? t('adminUserManagement.florist') : t('adminUserManagement.gardener')}</span></div>
              <div><strong>{t('adminUserManagement.statusLabel')}</strong> <span className={`badge ${selectedUser.isActive ? 'badge-success' : 'badge-error'}`}>{selectedUser.isActive ? t('adminUserManagement.active') : t('adminUserManagement.inactive')}</span></div>
              <div><strong>{t('adminUserManagement.emailVerified')}</strong> <span style={{ color: 'var(--text-white)' }}>{selectedUser.isEmailVerified ? t('common.yes') : t('common.no')}</span></div>
              <div><strong>{t('adminUserManagement.dateCreatedLabel')}</strong> <span style={{ color: 'var(--text-white)' }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'}</span></div>
            </div>
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>{t('adminUserManagement.close')}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={formModalOpen} onClose={closeForm} title={editingUser ? t('adminUserManagement.editAccount') : (formData.role === 'FLORIST' ? t('adminUserManagement.addFloristTitle') : t('adminUserManagement.addGardenerTitle'))}>
        <div>
          <FormInput
            label={t('adminUserManagement.fullName')} id="fullName" placeholder={t('adminUserManagement.enterFullName')}
            value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={formErrors.fullName} required
          />
          {editingUser ? (
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">{t('adminUserManagement.email')}</label>
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '14px' }}>{formData.email}</div>
            </div>
          ) : (
            <FormInput
              label={t('adminUserManagement.email')} id="email" type="email" placeholder={t('adminUserManagement.enterEmailAddress')}
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email} required
            />
          )}
          <FormInput
            label={t('adminUserManagement.phone')} id="phone" placeholder={t('adminUserManagement.enterPhoneOptional')}
            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={formErrors.phone}
          />
          {!editingUser && (
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">{t('adminUserManagement.role')} <span style={{ color: 'var(--error)' }}>*</span></label>
              <select
                value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-control"
                style={{ borderColor: formErrors.role ? 'var(--error)' : 'var(--border-green)' }}
              >
                <option value="FLORIST">{t('adminUserManagement.florist')}</option>
                <option value="GARDENER">{t('adminUserManagement.gardener')}</option>
              </select>
              {formErrors.role && <span className="form-error"><AlertCircle size={14} />{formErrors.role}</span>}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="secondary" onClick={closeForm}>{t('adminUserManagement.cancel')}</Button>
            <Button variant="lime" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t('adminUserManagement.saving') : editingUser ? t('adminUserManagement.saveChanges') : t('adminUserManagement.createAccount')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={t('adminUserManagement.confirmDeletion')}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ShieldAlert size={32} color="var(--error)" />
            <div>
              <p style={{ color: 'var(--text-white)', fontWeight: 600, margin: 0 }}>{t('adminUserManagement.confirmDeleteQuestion')}</p>
              {selectedUser && <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 0' }}>{selectedUser.fullName} ({selectedUser.email})</p>}
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>{t('adminUserManagement.deleteWarning')}</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>{t('adminUserManagement.cancel')}</Button>
            <Button variant="primary" onClick={confirmDelete} style={{ backgroundColor: 'var(--error)', borderColor: 'var(--error)' }}>{t('adminUserManagement.deleteAccount')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const styles = {
  container: { padding: '40px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '800', margin: 0 },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' },
  toolbar: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' },
  searchWrap: { position: 'relative', flex: '1 0 260px' },
  searchInput: {
    width: '100%', padding: '10px 16px 10px 38px', borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-green)',
    color: 'var(--text-white)', fontSize: '14px', outline: 'none',
  },
  select: {
    padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-green)', color: 'var(--text-white)', fontSize: '14px', cursor: 'pointer',
  },
  filterBtn: {
    padding: '10px 20px', borderRadius: 'var(--radius-sm)', border: 'none',
    backgroundColor: 'var(--accent-lime)', color: 'var(--bg-darker)', fontWeight: 700, cursor: 'pointer',
  },
  resetBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 16px',
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-green)',
    backgroundColor: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px',
  },
  actionCell: { display: 'flex', gap: '4px', justifyContent: 'center' },
  actionBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
    padding: '6px', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '14px' },
};
