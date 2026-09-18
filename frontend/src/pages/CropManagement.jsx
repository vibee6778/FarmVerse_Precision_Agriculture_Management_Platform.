import React, { useState, useEffect, useMemo } from 'react';
import { Wheat, HeartPulse, CheckCircle, Maximize2, Plus, Search, RefreshCw, Eye, Pencil, Trash2 } from 'lucide-react';
import { cropService } from '../services/cropService';
import { useToast } from '../context/ToastContext';
import { getCurrentUser } from '../services/apiClient';
import { farmerService } from '../services/farmerService';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';

const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Harvest Ready'];
const HEALTH = ['Healthy', 'Moderate', 'Critical'];

function CropForm({ crop, onSubmit, onCancel }) {
  const currentUser = getCurrentUser();
  const [farmersList, setFarmersList] = useState([]);
  const [form, setForm] = useState({
    cropName: crop?.cropName || '',
    cropVariety: crop?.cropVariety || '',
    farmer: crop?.farmer || currentUser?.name || '',
    farm: crop?.farm || '',
    field: crop?.field || '',
    plantingDate: crop?.plantingDate || '',
    expectedHarvestDate: crop?.expectedHarvestDate || '',
    growthStage: crop?.growthStage || 'Seedling',
    area: crop?.area ?? '',
    soilType: crop?.soilType || '',
    healthStatus: crop?.healthStatus || 'Healthy',
    irrigationStatus: crop?.irrigationStatus || 'Optimal',
    cropCategory: crop?.cropCategory || '',
  });

  useEffect(() => {
    const syncFarmers = (farmers) => {
      setFarmersList(farmers);
      if (farmers.length > 0 && !form.farmer) {
        setForm((prev) => ({
          ...prev,
          farmer: prev.farmer || farmers[0].fullName,
          farm: prev.farm || farmers[0].farmName,
          soilType: prev.soilType || 'Loamy Soil',
        }));
      }
    };
    farmerService.getFarmers().then(syncFarmers);
    const unsub = farmerService.subscribe(syncFarmers);
    return unsub;
  }, []);

  const handleFarmerChange = (e) => {
    const selectedName = e.target.value;
    const found = farmersList.find((f) => f.fullName === selectedName);
    setForm((prev) => ({
      ...prev,
      farmer: selectedName,
      farm: found ? found.farmName : prev.farm,
    }));
  };

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Crop Name</label>
          <input className="form-input" required value={form.cropName} onChange={update('cropName')} placeholder="e.g. Paddy Rice" />
        </div>
        <div className="form-group">
          <label className="form-label">Variety</label>
          <input className="form-input" required value={form.cropVariety} onChange={update('cropVariety')} placeholder="e.g. ADT 43 (Ponni)" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Farmer</label>
          {farmersList.length > 0 ? (
            <select className="form-select" value={form.farmer} onChange={handleFarmerChange} required>
              {farmersList.map((f) => (
                <option key={f.id} value={f.fullName}>{f.fullName} ({f.farmName})</option>
              ))}
            </select>
          ) : (
            <input className="form-input" required value={form.farmer} onChange={update('farmer')} placeholder="Farmer name" />
          )}
        </div>
        <div className="form-group">
          <label className="form-label">Farm</label>
          <input className="form-input" required value={form.farm} onChange={update('farm')} placeholder="Farm name" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Field</label>
          <input className="form-input" required value={form.field} onChange={update('field')} placeholder="e.g. Field #1" />
        </div>
        <div className="form-group">
          <label className="form-label">Area (acres)</label>
          <input type="number" step="0.1" min="0" className="form-input" required value={form.area} onChange={update('area')} placeholder="2.5" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Planting Date</label>
          <input type="date" className="form-input" required value={form.plantingDate} onChange={update('plantingDate')} />
        </div>
        <div className="form-group">
          <label className="form-label">Expected Harvest</label>
          <input type="date" className="form-input" required value={form.expectedHarvestDate} onChange={update('expectedHarvestDate')} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Growth Stage</label>
          <select className="form-select" value={form.growthStage} onChange={update('growthStage')}>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Health Status</label>
          <select className="form-select" value={form.healthStatus} onChange={update('healthStatus')}>
            {HEALTH.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Soil Type</label>
          <input className="form-input" required value={form.soilType} onChange={update('soilType')} placeholder="e.g. Alluvial Clay" />
        </div>
        <div className="form-group">
          <label className="form-label">Crop Category</label>
          <input className="form-input" value={form.cropCategory} onChange={update('cropCategory')} placeholder="e.g. Cereal" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Irrigation Status</label>
        <input className="form-input" value={form.irrigationStatus} onChange={update('irrigationStatus')} placeholder="e.g. Optimal" />
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{crop ? 'Save Changes' : 'Register Crop'}</button>
      </div>
    </form>
  );
}

function CropDetails({ crop, onEdit, onClose, canEdit }) {
  const healthBadge = crop.healthStatus === 'Healthy' ? 'success' : crop.healthStatus === 'Moderate' ? 'warning' : 'danger';
  return (
    <div>
      <div className="info-row"><span className="info-label">Crop ID</span><span className="info-value">{crop.id}</span></div>
      <div className="info-row"><span className="info-label">Variety</span><span className="info-value">{crop.cropVariety}</span></div>
      <div className="info-row"><span className="info-label">Farmer</span><span className="info-value">{crop.farmer}</span></div>
      <div className="info-row"><span className="info-label">Farm / Field</span><span className="info-value">{crop.farm} · {crop.field}</span></div>
      <div className="info-row"><span className="info-label">Planting Date</span><span className="info-value">{crop.plantingDate}</span></div>
      <div className="info-row"><span className="info-label">Expected Harvest</span><span className="info-value">{crop.expectedHarvestDate}</span></div>
      <div className="info-row"><span className="info-label">Growth Stage</span><span className="info-value">{crop.growthStage}</span></div>
      <div className="info-row"><span className="info-label">Area</span><span className="info-value">{crop.area} acres</span></div>
      <div className="info-row"><span className="info-label">Soil Type</span><span className="info-value">{crop.soilType}</span></div>
      <div className="info-row"><span className="info-label">Health Status</span><span className={`badge badge-${healthBadge}`}>{crop.healthStatus}</span></div>
      <div className="info-row"><span className="info-label">Irrigation Status</span><span className="info-value">{crop.irrigationStatus}</span></div>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Close</button>
        {canEdit && <button className="btn btn-primary" style={{ flex: 1 }} onClick={onEdit}>Edit Record</button>}
      </div>
    </div>
  );
}

export default function CropManagement() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';
  const isAgronomist = currentUser?.role === 'ROLE_AGRONOMIST';
  const isFarmer = !isAdmin && !isAgronomist;

  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [viewingCrop, setViewingCrop] = useState(null);
  const [deletingCrop, setDeletingCrop] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadCrops = async () => {
    setIsLoading(true);
    try {
      const data = await cropService.getCrops();
      setCrops(data);
    } catch {
      showToast('Error Loading Crops', 'Failed to retrieve crop inventory', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
    const unsubscribe = cropService.subscribe((updated) => setCrops([...updated]));
    return unsubscribe;
  }, []);

  const filteredCrops = useMemo(() => {
    return crops.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.cropName.toLowerCase().includes(q) ||
        c.cropVariety.toLowerCase().includes(q) ||
        c.farmer.toLowerCase().includes(q) ||
        (c.farm && c.farm.toLowerCase().includes(q)) ||
        c.field.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchesStage = stageFilter === 'All' ? true : c.growthStage === stageFilter;
      const matchesHealth = healthFilter === 'All' ? true : c.healthStatus === healthFilter;
      return matchesSearch && matchesStage && matchesHealth;
    });
  }, [crops, searchQuery, stageFilter, healthFilter]);

  const stats = useMemo(() => {
    const total = crops.length;
    const healthy = crops.filter((c) => c.healthStatus === 'Healthy').length;
    const harvestReady = crops.filter((c) => c.growthStage === 'Harvest Ready').length;
    const totalAcres = crops.reduce((acc, c) => acc + c.area, 0).toFixed(1);
    return { total, healthy, harvestReady, totalAcres };
  }, [crops]);

  const handleAdd = async (input) => {
    try {
      const created = await cropService.createCrop(input);
      setCrops((prev) => [created, ...prev]);
      showToast('Crop Registered', `${created.cropName} (${created.cropVariety}) successfully recorded.`, 'success');
      setIsAddOpen(false);
    } catch (err) {
      showToast('Registration Failed', err.message || 'Could not register crop record.', 'error');
    }
  };

  const handleEdit = async (input) => {
    if (!editingCrop) return;
    try {
      const updated = await cropService.updateCrop(editingCrop.id, input);
      setCrops((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast('Crop Updated', `Saved changes for ${updated.cropName}.`, 'success');
      setEditingCrop(null);
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update crop record.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCrop) return;
    setIsDeleting(true);
    try {
      const success = await cropService.deleteCrop(deletingCrop.id);
      if (success) {
        setCrops((prev) => prev.filter((c) => c.id !== deletingCrop.id));
        showToast('Crop Deleted', `${deletingCrop.cropName} record was removed.`, 'info');
      }
      setDeletingCrop(null);
    } catch (err) {
      showToast('Delete Failed', err.message || 'Unable to delete crop record.', 'error');
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
              {isFarmer && <span>🌾 Farmer User: {currentUser?.name || currentUser?.email || 'Logged In'}</span>}
              {isAgronomist && <span>🔬 Agronomist Advisory Mode (Read-Only)</span>}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isAdmin && 'Full permission to register, edit, and remove all crop records.'}
              {isFarmer && 'Crop RBAC Protection Active: You can edit only crops belonging to your farm. Other farmers\' crops are protected.'}
              {isAgronomist && 'Advisory Mode: View crop metrics and health indicators.'}
            </p>
          </div>
          <span className={`badge badge-${isAdmin ? 'success' : isFarmer ? 'info' : 'warning'}`}>
            Role: {currentUser?.role || 'ROLE_FARMER'}
          </span>
        </div>
      </div>

      <div className="grid-4">
        <StatCard title="Total Crops" value={stats.total} subtitle="Monitored crop batches" icon={<Wheat size={18} />} color="primary" />
        <StatCard title="Healthy Status" value={stats.healthy} subtitle={`${Math.round((stats.healthy / (stats.total || 1)) * 100)}% healthy index`} icon={<HeartPulse size={18} />} color="secondary" />
        <StatCard title="Harvest Ready" value={stats.harvestReady} subtitle="Ready for crop yield" icon={<CheckCircle size={18} />} color="warning" />
        <StatCard title="Total Crop Area" value={`${stats.totalAcres} Acres`} subtitle="Actively cultivated" icon={<Maximize2 size={18} />} color="info" />
      </div>

      <div className="glass-card">
        <div className="toolbar" style={{ marginBottom: '1.25rem' }}>
          <div className="search-box">
            <Search size={16} />
            <input className="form-input" placeholder="Search crop name, variety, farmer, or field..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-group">
            <select className="form-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="All">All Stages</option>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}>
              <option value="All">All Health</option>
              {HEALTH.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
            <button className="icon-btn" onClick={loadCrops} title="Refresh"><RefreshCw size={16} className={isLoading ? 'pulse' : ''} /></button>
            {!isAgronomist && (
              <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}><Plus size={16} /> Add Crop</button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Farmer / Field</th>
                <th>Stage</th>
                <th>Area</th>
                <th>Health</th>
                <th>Irrigation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading crop inventory...</td></tr>
              ) : filteredCrops.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No crops match your search.</td></tr>
              ) : (
                filteredCrops.map((c) => {
                  const healthBadge = c.healthStatus === 'Healthy' ? 'success' : c.healthStatus === 'Moderate' ? 'warning' : 'danger';
                  const userEmailPrefix = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase() : '';
                  const userName = (currentUser?.name || '').toLowerCase();
                  const cropFarmerName = (c.farmer || '').toLowerCase();

                  const isOwnCrop = currentUser && (
                    (userName && (cropFarmerName.includes(userName) || userName.includes(cropFarmerName))) ||
                    (userEmailPrefix && cropFarmerName.includes(userEmailPrefix))
                  );

                  const canEditCrop = isAdmin || (isFarmer && isOwnCrop);
                  const canDeleteCrop = isAdmin || (isFarmer && isOwnCrop);

                  return (
                    <tr key={c.id} style={{ background: isOwnCrop ? 'rgba(16, 185, 129, 0.05)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {c.cropName}
                          {isOwnCrop && <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Mine</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.id} · {c.cropVariety}</div>
                      </td>
                      <td>{c.farmer} · {c.field}</td>
                      <td>{c.growthStage}</td>
                      <td>{c.area} acres</td>
                      <td><span className={`badge badge-${healthBadge}`}>{c.healthStatus}</span></td>
                      <td>{c.irrigationStatus}</td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-btn" onClick={() => setViewingCrop(c)} title="View"><Eye size={15} /></button>
                          {canEditCrop ? (
                            <button className="icon-btn" onClick={() => setEditingCrop(c)} title="Edit Crop Record"><Pencil size={15} /></button>
                          ) : (
                            <button className="icon-btn" disabled style={{ opacity: 0.3, cursor: 'not-allowed' }} title="Access Denied: You can only edit your own crops">
                              <Pencil size={15} />
                            </button>
                          )}
                          {canDeleteCrop ? (
                            <button className="icon-btn icon-btn-danger" onClick={() => setDeletingCrop(c)} title="Delete Crop Record"><Trash2 size={15} /></button>
                          ) : (
                            <button className="icon-btn" disabled style={{ opacity: 0.3, cursor: 'not-allowed' }} title="Access Denied: You can only delete your own crops">
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

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Crop" subtitle="Track planting, growth stages, soil type, and irrigation" maxWidth="xl">
        <CropForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingCrop} onClose={() => setEditingCrop(null)} title={`Edit Crop: ${editingCrop?.cropName || ''}`} subtitle={`Crop ID: ${editingCrop?.id || ''}`} maxWidth="xl">
        {editingCrop && <CropForm crop={editingCrop} onSubmit={handleEdit} onCancel={() => setEditingCrop(null)} />}
      </Modal>

      <Modal isOpen={!!viewingCrop} onClose={() => setViewingCrop(null)} title="Crop Agronomy Overview" subtitle="Detailed growth stage and health metrics" maxWidth="lg">
        {viewingCrop && (
          <CropDetails
            crop={viewingCrop}
            canEdit={isAdmin || (isFarmer && (
              (currentUser?.name && (viewingCrop.farmer.toLowerCase().includes(currentUser.name.toLowerCase()) || currentUser.name.toLowerCase().includes(viewingCrop.farmer.toLowerCase()))) ||
              (currentUser?.email && viewingCrop.farmer.toLowerCase().includes(currentUser.email.split('@')[0].toLowerCase()))
            ))}
            onEdit={() => { const target = viewingCrop; setViewingCrop(null); setEditingCrop(target); }}
            onClose={() => setViewingCrop(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingCrop}
        onClose={() => setDeletingCrop(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Crop Record?"
        message={`Are you sure you want to delete ${deletingCrop?.cropName} (${deletingCrop?.id})? This action cannot be undone.`}
        confirmText="Delete Record"
        isDeleting={isDeleting}
      />
    </div>
  );
}
