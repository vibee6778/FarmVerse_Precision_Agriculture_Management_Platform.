import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, Sprout, Maximize2, Plus, Search, RefreshCw, Eye, Pencil, Trash2 } from 'lucide-react';
import { farmerService } from '../services/farmerService';
import { cropService } from '../services/cropService';
import { useToast } from '../context/ToastContext';
import { getCurrentUser } from '../services/apiClient';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

function FarmerForm({ farmer, onSubmit, onCancel }) {
  const currentUser = getCurrentUser();
  const [form, setForm] = useState({
    fullName: farmer?.fullName || currentUser?.name || '',
    email: farmer?.email || currentUser?.email || '',
    phone: farmer?.phone || '+91 98421 12345',
    address: farmer?.address || '',
    farmName: farmer?.farmName || '',
    farmSize: farmer?.farmSize ?? '',
    mainCrop: farmer?.mainCrop || '',
    status: farmer?.status || 'Active',
  });

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" required value={form.fullName} onChange={update('fullName')} placeholder="e.g. Arun Kumar" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" required value={form.email} onChange={update('email')} placeholder="farmer@farmverse.io" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" required value={form.phone} onChange={update('phone')} placeholder="+91 90000 00000" />
        </div>
        <div className="form-group">
          <label className="form-label">Main Crop</label>
          <input className="form-input" required value={form.mainCrop} onChange={update('mainCrop')} placeholder="e.g. Rice" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <input className="form-input" value={form.address} onChange={update('address')} placeholder="Full address, district, state, pincode" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Farm Name</label>
          <input className="form-input" required value={form.farmName} onChange={update('farmName')} placeholder="e.g. Green Valley Farm" />
        </div>
        <div className="form-group">
          <label className="form-label">Farm Size (acres)</label>
          <input type="number" step="0.1" min="0" className="form-input" required value={form.farmSize} onChange={update('farmSize')} placeholder="5.0" />
        </div>
      </div>
      {farmer && (
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={update('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {farmer ? 'Save Changes' : 'Register Farmer'}
        </button>
      </div>
    </form>
  );
}

function FarmerDetails({ farmer, onEdit, onClose, canEdit }) {
  return (
    <div>
      <div className="info-row">
        <span className="info-label">Farmer ID</span>
        <span className="info-value">{farmer.id}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Email</span>
        <span className="info-value">{farmer.email}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Phone</span>
        <span className="info-value">{farmer.phone}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Address</span>
        <span className="info-value">{farmer.address}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Farm Name</span>
        <span className="info-value">{farmer.farmName}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Farm Size</span>
        <span className="info-value">{farmer.farmSize} acres</span>
      </div>
      <div className="info-row">
        <span className="info-label">Number of Fields</span>
        <span className="info-value">{farmer.numberOfFields}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Main Crop</span>
        <span className="info-value">{farmer.mainCrop}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Status</span>
        <span className={`badge badge-${farmer.status === 'Active' ? 'success' : 'danger'}`}>{farmer.status}</span>
      </div>
      <div className="info-row">
        <span className="info-label">Registered On</span>
        <span className="info-value">{farmer.registrationDate}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Close</button>
        {canEdit && <button className="btn btn-primary" style={{ flex: 1 }} onClick={onEdit}>Edit Profile</button>}
      </div>
    </div>
  );
}

export default function FarmerManagement() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';
  const isAgronomist = currentUser?.role === 'ROLE_AGRONOMIST';
  const isFarmer = !isAdmin && !isAgronomist;

  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [viewingFarmer, setViewingFarmer] = useState(null);
  const [deletingFarmer, setDeletingFarmer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadFarmers = async () => {
    setIsLoading(true);
    try {
      const data = await farmerService.getFarmers();
      setFarmers(data);
    } catch {
      showToast('Error Loading Farmers', 'Failed to connect to farmer records', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFarmers();
    const unsubFarmers = farmerService.subscribe((updated) => setFarmers([...updated]));
    const unsubCrops = cropService.subscribe(() => loadFarmers());
    return () => {
      unsubFarmers();
      unsubCrops();
    };
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        f.fullName.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.farmName.toLowerCase().includes(q) ||
        f.mainCrop.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' ? true : f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [farmers, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = farmers.length;
    const active = farmers.filter((f) => f.status === 'Active').length;
    const totalAcres = farmers.reduce((acc, f) => acc + f.farmSize, 0).toFixed(1);
    const crops = new Set(farmers.map((f) => f.mainCrop));
    return { total, active, totalAcres, cropCount: crops.size };
  }, [farmers]);

  const handleAdd = async (input) => {
    try {
      const created = await farmerService.createFarmer(input);
      setFarmers((prev) => [created, ...prev]);
      showToast('Farmer Registered', `${created.fullName} has been successfully added.`, 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast('Registration Failed', err.message || 'Could not add new farmer record.', 'error');
    }
  };

  const handleEdit = async (input) => {
    if (!editingFarmer) return;
    try {
      const updated = await farmerService.updateFarmer(editingFarmer.id, input);
      setFarmers((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      showToast('Farmer Profile Updated', `Changes to ${updated.fullName} saved.`, 'success');
      setEditingFarmer(null);
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not save farmer profile changes.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFarmer) return;
    setIsDeleting(true);
    try {
      const success = await farmerService.deleteFarmer(deletingFarmer.id);
      if (success) {
        setFarmers((prev) => prev.filter((f) => f.id !== deletingFarmer.id));
        showToast('Farmer Deleted', `${deletingFarmer.fullName} was removed from the database.`, 'info');
      }
      setDeletingFarmer(null);
    } catch (err) {
      showToast('Delete Failed', err.message || 'Unable to delete farmer record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Security RBAC Status Banner */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', borderLeft: isAdmin ? '4px solid var(--primary)' : isFarmer ? '4px solid #3b82f6' : '4px solid #f59e0b', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
              {isAdmin && <span>👑 System Administrator Mode</span>}
              {isFarmer && <span>🌱 Farmer User: {currentUser?.name || currentUser?.email || 'Logged In'}</span>}
              {isAgronomist && <span>🔬 Agronomist Advisory Mode (Read-Only)</span>}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isAdmin && 'You have full access to manage, edit, and remove all user profile records.'}
              {isFarmer && 'Role-Based Access Active: You can edit only your own profile. Other users\' profiles are protected.'}
              {isAgronomist && 'You have advisory read-only access to farmer records and farmland telemetry.'}
            </p>
          </div>
          <span className={`badge badge-${isAdmin ? 'success' : isFarmer ? 'info' : 'warning'}`}>
            Role: {currentUser?.role || 'ROLE_FARMER'}
          </span>
        </div>
      </div>

      <div className="grid-4">
        <StatCard title="Total Farmers" value={stats.total} subtitle="Registered across districts" icon={<Users size={18} />} color="primary" />
        <StatCard title="Active Accounts" value={stats.active} subtitle={`${Math.round((stats.active / (stats.total || 1)) * 100)}% active rate`} icon={<UserCheck size={18} />} color="secondary" />
        <StatCard title="Cultivated Land" value={`${stats.totalAcres} Acres`} subtitle="Total farmland monitored" icon={<Maximize2 size={18} />} color="warning" />
        <StatCard title="Active Crops" value={`${stats.cropCount} Varieties`} subtitle="Across registered farms" icon={<Sprout size={18} />} color="info" />
      </div>

      <div className="glass-card">
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <div className="search-box">
            <Search size={16} />
            <input
              className="form-input"
              placeholder="Search by name, ID, farm name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
            <button className="icon-btn" onClick={loadFarmers} title="Refresh Data">
              <RefreshCw size={16} className={isLoading ? 'pulse' : ''} />
            </button>
            {!isAgronomist && (
              <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
                <Plus size={16} /> Add Farm / Land
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Farm</th>
                <th>Location</th>
                <th>Main Crop</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading farmer records...</td></tr>
              ) : filteredFarmers.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No farmers match your search.</td></tr>
              ) : (
                filteredFarmers.map((f) => {
                  const isOwnRecord = currentUser?.email && (
                    f.email.toLowerCase() === currentUser.email.toLowerCase() ||
                    f.fullName.toLowerCase() === (currentUser.name || '').toLowerCase()
                  );
                  const canEdit = isAdmin || (isFarmer && isOwnRecord);
                  const canDelete = isAdmin;

                  return (
                    <tr key={f.id} style={{ background: isOwnRecord ? 'rgba(16, 185, 129, 0.05)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {f.fullName}
                          {isOwnRecord && <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.id} · {f.phone}</div>
                      </td>
                      <td>{f.farmName}</td>
                      <td>{f.location}</td>
                      <td>{f.mainCrop}</td>
                      <td>{f.farmSize} acres</td>
                      <td><span className={`badge badge-${f.status === 'Active' ? 'success' : 'danger'}`}>{f.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-btn" onClick={() => setViewingFarmer(f)} title="View Profile Details"><Eye size={15} /></button>

                          {canEdit ? (
                            <button className="icon-btn" onClick={() => setEditingFarmer(f)} title="Edit Profile"><Pencil size={15} /></button>
                          ) : (
                            <button className="icon-btn" disabled style={{ opacity: 0.3, cursor: 'not-allowed' }} title="Access Denied: You can only edit your own profile">
                              <Pencil size={15} />
                            </button>
                          )}

                          {canDelete ? (
                            <button className="icon-btn icon-btn-danger" onClick={() => setDeletingFarmer(f)} title="Delete Record"><Trash2 size={15} /></button>
                          ) : (
                            <button className="icon-btn" disabled style={{ opacity: 0.3, cursor: 'not-allowed' }} title="Access Denied: Only Admins can delete farmer records">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Farmer" subtitle="Add a new agricultural profile to FarmVerse" maxWidth="xl">
        <FarmerForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingFarmer} onClose={() => setEditingFarmer(null)} title={`Edit Farmer: ${editingFarmer?.fullName || ''}`} subtitle={`Farmer ID: ${editingFarmer?.id || ''}`} maxWidth="xl">
        {editingFarmer && <FarmerForm farmer={editingFarmer} onSubmit={handleEdit} onCancel={() => setEditingFarmer(null)} />}
      </Modal>

      <Modal isOpen={!!viewingFarmer} onClose={() => setViewingFarmer(null)} title="Farmer Profile Details" subtitle="Complete registered farm specifications" maxWidth="lg">
        {viewingFarmer && (
          <FarmerDetails
            farmer={viewingFarmer}
            canEdit={isAdmin || (isFarmer && (
              viewingFarmer.email.toLowerCase() === (currentUser?.email || '').toLowerCase() ||
              viewingFarmer.fullName.toLowerCase() === (currentUser?.name || '').toLowerCase()
            ))}
            onEdit={() => { const target = viewingFarmer; setViewingFarmer(null); setEditingFarmer(target); }}
            onClose={() => setViewingFarmer(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingFarmer}
        onClose={() => setDeletingFarmer(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Farmer Record?"
        message={`Are you sure you want to remove ${deletingFarmer?.fullName} (${deletingFarmer?.id})? This action cannot be undone.`}
        confirmText="Delete Record"
        isDeleting={isDeleting}
      />
    </div>
  );
}
