import { apiFetch, getCurrentUser } from './apiClient';

let mockCrops = [
  { id: 'C001', cropName: 'Paddy Rice', cropVariety: 'ADT 43 (Ponni)', farmer: 'Farmer Bob', farmerId: 'F001', farm: 'Emerald Acres', field: 'Field #1 - River Bank', plantingDate: '2024-06-01', expectedHarvestDate: '2024-10-15', growthStage: 'Vegetative', area: 12.5, soilType: 'Loamy Clay', healthStatus: 'Healthy', irrigationStatus: 'Optimal', cropCategory: 'Cereal' },
  { id: 'C002', cropName: 'Rice', cropVariety: 'CO 51 High Yield', farmer: 'Arun Kumar', farmerId: 'F002', farm: 'Green Valley Farm', field: 'Field #1 - Valley Plot', plantingDate: '2024-06-15', expectedHarvestDate: '2024-10-20', growthStage: 'Vegetative', area: 5.0, soilType: 'Loamy Soil', healthStatus: 'Healthy', irrigationStatus: 'Optimal', cropCategory: 'Cereal' },
  { id: 'C003', cropName: 'Sugarcane', cropVariety: 'Co 0238 High Yield', farmer: 'Ramesh Patel', farmerId: 'F003', farm: 'Cauvery Delta Organic Farm', field: 'Block A - Main Canal', plantingDate: '2024-02-10', expectedHarvestDate: '2024-12-20', growthStage: 'Flowering', area: 8.5, soilType: 'Clay Loam', healthStatus: 'Healthy', irrigationStatus: 'Irrigated Today', cropCategory: 'Cash Crop' },
  { id: 'C004', cropName: 'Cotton', cropVariety: 'MCU 5 Hybrid', farmer: 'Vijayaraghavan S', farmerId: 'F004', farm: 'TexValley Agro', field: 'Field #3 - East Sector', plantingDate: '2024-05-15', expectedHarvestDate: '2024-11-01', growthStage: 'Flowering', area: 12.0, soilType: 'Black Cotton Soil', healthStatus: 'Moderate', irrigationStatus: 'Needs Water', cropCategory: 'Cash Crop' },
  { id: 'C005', cropName: 'Maize', cropVariety: 'CO 6 Hybrid', farmer: 'Priya Sundaram', farmerId: 'F005', farm: 'Anamalai Bio Plantation', field: 'Foothill Field B', plantingDate: '2024-07-01', expectedHarvestDate: '2024-09-30', growthStage: 'Seedling', area: 4.0, soilType: 'Red Loamy', healthStatus: 'Healthy', irrigationStatus: 'Optimal', cropCategory: 'Cereal' },
  { id: 'C006', cropName: 'Turmeric', cropVariety: 'BSR 2 Organic', farmer: 'Murugan S', farmerId: 'F006', farm: 'Yercaud Foothill Farm', field: 'Terrace Plot #2', plantingDate: '2024-04-10', expectedHarvestDate: '2025-01-15', growthStage: 'Vegetative', area: 6.2, soilType: 'Red Soil', healthStatus: 'Critical', irrigationStatus: 'Overwatered', cropCategory: 'Spice' },
  { id: 'C007', cropName: 'Banana', cropVariety: 'Grand Naine (G9)', farmer: 'Anitha Raj', farmerId: 'F007', farm: 'Vaigai Harvest Farm', field: 'Riverbed Plot 1', plantingDate: '2023-11-01', expectedHarvestDate: '2024-09-15', growthStage: 'Fruiting', area: 3.5, soilType: 'Deep Alluvial', healthStatus: 'Healthy', irrigationStatus: 'Optimal', cropCategory: 'Fruit' },
];

let listeners = [];

export const cropService = {
  subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter((cb) => cb !== callback);
    };
  },

  notify() {
    listeners.forEach((cb) => {
      try {
        cb(mockCrops);
      } catch (err) {
        console.error('Error in cropService subscriber:', err);
      }
    });
  },

  syncFarmerCrops(farmers) {
    if (!farmers || farmers.length === 0) return;
    let changed = false;
    farmers.forEach((f) => {
      if (f.farmName && f.mainCrop) {
        const exists = mockCrops.some(
          (c) =>
            c.farmerId === f.id ||
            (c.farm && c.farm.toLowerCase() === f.farmName.toLowerCase()) ||
            (c.farmer && c.farmer.toLowerCase() === f.fullName.toLowerCase() && c.cropName.toLowerCase() === f.mainCrop.toLowerCase())
        );
        if (!exists) {
          const nextNum = mockCrops.length + 1;
          const newCrop = {
            id: `C${nextNum.toString().padStart(3, '0')}`,
            cropName: f.mainCrop,
            cropVariety: 'Standard Hybrid',
            farmer: f.fullName,
            farmerId: f.id,
            farm: f.farmName,
            field: `${f.farmName} - Sector 1`,
            plantingDate: '2024-06-01',
            expectedHarvestDate: '2024-10-15',
            growthStage: 'Vegetative',
            area: Number(f.farmSize) || 2.0,
            soilType: 'Loamy Clay',
            healthStatus: 'Healthy',
            irrigationStatus: 'Optimal',
            cropCategory: 'General',
          };
          mockCrops.push(newCrop);
          changed = true;
        }
      }
    });
    if (changed) {
      this.notify();
    }
  },

  async getCrops() {
    try {
      const res = await apiFetch('/crop-management');
      if (res.ok) {
        const crops = await res.json();
        if (crops && crops.length > 0) {
          const apiCrops = crops.map((c) => ({
            id: `C${c.id}`,
            backendId: c.id,
            cropName: c.name,
            cropVariety: c.variety || 'Hybrid Standard',
            farmer: c.farm?.owner?.name || 'Farmer Bob',
            farmerId: c.farm?.owner?.id ? `F${c.farm.owner.id}` : 'F001',
            farm: c.farm?.name || 'Emerald Acres',
            field: `Field #${c.id}`,
            plantingDate: c.sowingDate || '2024-06-01',
            expectedHarvestDate: c.expectedHarvestDate || '2024-10-15',
            growthStage: c.status || 'GROWING',
            area: c.areaAcres || 5.0,
            soilType: c.farm?.soilType || 'Loamy Clay',
            healthStatus: 'Healthy',
            irrigationStatus: 'Optimal',
            cropCategory: c.season || 'General',
          }));
          const merged = [...apiCrops, ...mockCrops.filter(m => !apiCrops.some(a => a.id === m.id || (a.backendId && a.backendId === m.backendId)))];
          mockCrops = merged;
          return merged;
        }
      }
    } catch (err) {
      console.warn('API getCrops failed, using mock:', err);
    }
    return [...mockCrops];
  },

  async createCrop(input) {
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'ROLE_AGRONOMIST') {
      throw new Error('Access Denied: Agronomists are not permitted to register crops.');
    }
    let createdResult;
    try {
      const res = await apiFetch('/crop-management', {
        method: 'POST',
        body: JSON.stringify({
          farmId: input.farmId || (input.farm && input.farm.startsWith('F') ? Number(input.farm.substring(1)) : null),
          name: input.cropName,
          variety: input.cropVariety || 'Standard Hybrid',
          season: input.cropCategory || 'Kharif',
          sowingDate: input.plantingDate || new Date().toISOString().split('T')[0],
          expectedHarvestDate: input.expectedHarvestDate || new Date().toISOString().split('T')[0],
          areaAcres: Number(input.area) || 2.0,
          status: input.growthStage || 'GROWING',
          notes: input.field || 'Planted via UI',
        }),
      });
      if (res.ok) {
        const created = await res.json();
        createdResult = {
          id: `C${created.id}`,
          backendId: created.id,
          cropName: created.name || input.cropName,
          cropVariety: created.variety || input.cropVariety || 'Standard Hybrid',
          farmer: input.farmer || currentUser?.name || 'Farmer Bob',
          farmerId: 'F001',
          farm: input.farm || 'Emerald Acres',
          field: input.field || 'Field #1',
          plantingDate: created.sowingDate || input.plantingDate,
          expectedHarvestDate: created.expectedHarvestDate || input.expectedHarvestDate,
          growthStage: input.growthStage || created.status || 'Seedling',
          area: created.areaAcres || Number(input.area) || 2.0,
          soilType: input.soilType || 'Loamy Clay',
          healthStatus: input.healthStatus || 'Healthy',
          irrigationStatus: input.irrigationStatus || 'Optimal',
          cropCategory: created.season || input.cropCategory || 'General',
        };
      }
    } catch (err) {
      console.warn('API createCrop failed, fallback to mock:', err);
    }

    if (!createdResult) {
      const nextNum = mockCrops.length + 1;
      const id = `C${nextNum.toString().padStart(3, '0')}`;
      createdResult = {
        id,
        cropName: input.cropName,
        cropVariety: input.cropVariety || 'Standard Hybrid',
        farmer: input.farmer || currentUser?.name || 'Farmer Bob',
        farmerId: 'F001',
        farm: input.farm || 'Emerald Acres',
        field: input.field || 'Field #1',
        plantingDate: input.plantingDate || new Date().toISOString().split('T')[0],
        expectedHarvestDate: input.expectedHarvestDate || new Date().toISOString().split('T')[0],
        growthStage: input.growthStage || 'Seedling',
        area: Number(input.area) || 2.0,
        soilType: input.soilType || 'Loamy Clay',
        healthStatus: input.healthStatus || 'Healthy',
        irrigationStatus: input.irrigationStatus || 'Optimal',
        cropCategory: input.cropCategory || 'General',
      };
    }

    mockCrops = [createdResult, ...mockCrops];
    this.notify();
    return createdResult;
  },

  async updateCrop(id, input) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role !== 'ROLE_ADMIN') {
      if (currentUser.role === 'ROLE_AGRONOMIST') {
        throw new Error('Access Denied: Agronomists are not permitted to edit crop records.');
      }
      const existing = mockCrops.find((c) => c.id === id);
      const userEmailPrefix = currentUser.email ? currentUser.email.split('@')[0].toLowerCase() : '';
      const userName = (currentUser.name || '').toLowerCase();
      const cropFarmerName = existing ? existing.farmer.toLowerCase() : '';

      const isOwn = existing && (
        (userName && (cropFarmerName.includes(userName) || userName.includes(cropFarmerName))) ||
        (userEmailPrefix && cropFarmerName.includes(userEmailPrefix))
      );

      if (!isOwn) {
        throw new Error('Access Denied: You can only edit your own crop records.');
      }
    }

    const backendId = id.startsWith('C') ? id.substring(1) : id;
    let updatedResult;
    try {
      const res = await apiFetch(`/crop-management/${backendId}`, {
        method: 'PUT',
        body: JSON.stringify({
          farmId: input.farmId || (input.farm && input.farm.startsWith('F') ? Number(input.farm.substring(1)) : null),
          name: input.cropName,
          variety: input.cropVariety,
          season: input.cropCategory || 'Kharif',
          sowingDate: input.plantingDate,
          expectedHarvestDate: input.expectedHarvestDate,
          areaAcres: Number(input.area),
          status: input.growthStage || 'GROWING',
          notes: input.field,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        updatedResult = {
          id,
          backendId: updated.id,
          cropName: updated.name || input.cropName,
          cropVariety: updated.variety || input.cropVariety,
          farmer: input.farmer || 'Farmer Bob',
          farmerId: 'F001',
          farm: input.farm || 'Emerald Acres',
          field: input.field || 'Field #1',
          plantingDate: updated.sowingDate || input.plantingDate,
          expectedHarvestDate: updated.expectedHarvestDate || input.expectedHarvestDate,
          growthStage: input.growthStage || updated.status,
          area: updated.areaAcres || Number(input.area),
          soilType: input.soilType || 'Loamy Clay',
          healthStatus: input.healthStatus || 'Healthy',
          irrigationStatus: input.irrigationStatus || 'Optimal',
          cropCategory: updated.season || input.cropCategory,
        };
      }
    } catch (err) {
      console.warn('API updateCrop failed:', err);
    }

    const index = mockCrops.findIndex((c) => c.id === id);
    if (index !== -1) {
      const existing = mockCrops[index];
      updatedResult = updatedResult || {
        ...existing,
        ...input,
        area: input.area !== undefined ? Number(input.area) : existing.area,
      };
      mockCrops[index] = updatedResult;
    }

    this.notify();
    return updatedResult;
  },

  async deleteCrop(id) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role !== 'ROLE_ADMIN') {
      if (currentUser.role === 'ROLE_AGRONOMIST') {
        throw new Error('Access Denied: Agronomists are not permitted to delete crop records.');
      }
      const existing = mockCrops.find((c) => c.id === id);
      const userEmailPrefix = currentUser.email ? currentUser.email.split('@')[0].toLowerCase() : '';
      const userName = (currentUser.name || '').toLowerCase();
      const cropFarmerName = existing ? existing.farmer.toLowerCase() : '';

      const isOwn = existing && (
        (userName && (cropFarmerName.includes(userName) || userName.includes(cropFarmerName))) ||
        (userEmailPrefix && cropFarmerName.includes(userEmailPrefix))
      );

      if (!isOwn) {
        throw new Error('Access Denied: You can only delete your own crop records.');
      }
    }

    const backendId = id.startsWith('C') ? id.substring(1) : id;
    try {
      await apiFetch(`/crop-management/${backendId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteCrop failed:', err);
    }
    const initialLen = mockCrops.length;
    mockCrops = mockCrops.filter((c) => c.id !== id);
    this.notify();
    return mockCrops.length < initialLen;
  },
};
