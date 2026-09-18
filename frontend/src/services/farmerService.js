import { apiFetch, getCurrentUser } from './apiClient';
import { cropService } from './cropService';

let mockFarmers = [
  { id: 'F001', fullName: 'Farmer Bob', email: 'bob@farmverse.com', phone: '+91 98421 12345', location: 'Karur', address: '14, River View Road, Karur, Tamil Nadu 639001', farmName: 'Emerald Acres', farmSize: 45.5, numberOfFields: 3, mainCrop: 'Paddy Rice', status: 'Active', registrationDate: '2024-03-15' },
  { id: 'F002', fullName: 'Arun Kumar', email: 'arun.kumar@farmverse.io', phone: '+91 98421 12345', location: 'Karur', address: '14, River View Road, Karur, Tamil Nadu 639001', farmName: 'Green Valley Farm', farmSize: 5.0, numberOfFields: 3, mainCrop: 'Rice', status: 'Active', registrationDate: '2024-03-15' },
  { id: 'F003', fullName: 'Ramesh Patel', email: 'ramesh.patel@farmverse.io', phone: '+91 94432 98765', location: 'Thanjavur', address: '88, Delta Lane, Thanjavur, Tamil Nadu 613001', farmName: 'Cauvery Delta Organic Farm', farmSize: 8.5, numberOfFields: 5, mainCrop: 'Sugarcane', status: 'Active', registrationDate: '2024-01-10' },
  { id: 'F004', fullName: 'Vijayaraghavan S', email: 'vijay.raghavan@farmverse.io', phone: '+91 97890 45678', location: 'Erode', address: '42, Agro Industrial Estate, Erode, Tamil Nadu 638001', farmName: 'TexValley Agro', farmSize: 12.0, numberOfFields: 6, mainCrop: 'Cotton', status: 'Active', registrationDate: '2023-11-20' },
  { id: 'F005', fullName: 'Priya Sundaram', email: 'priya.sundaram@farmverse.io', phone: '+91 98941 67890', location: 'Coimbatore', address: '105, Anamalai Foothills, Pollachi, Coimbatore, Tamil Nadu 642001', farmName: 'Anamalai Bio Plantation', farmSize: 4.0, numberOfFields: 2, mainCrop: 'Maize', status: 'Active', registrationDate: '2024-04-02' },
  { id: 'F006', fullName: 'Murugan S', email: 'murugan.s@farmverse.io', phone: '+91 94861 23456', location: 'Salem', address: '27, Foothills Road, Hasthampatti, Salem, Tamil Nadu 636007', farmName: 'Yercaud Foothill Farm', farmSize: 6.2, numberOfFields: 4, mainCrop: 'Turmeric', status: 'Inactive', registrationDate: '2023-08-14' },
  { id: 'F007', fullName: 'Anitha Raj', email: 'anitha.raj@farmverse.io', phone: '+91 94421 88776', location: 'Madurai', address: '12, Vaigai River Road, Madurai, Tamil Nadu 625001', farmName: 'Vaigai Harvest Farm', farmSize: 7.8, numberOfFields: 3, mainCrop: 'Banana', status: 'Active', registrationDate: '2024-02-18' },
];

let listeners = [];

export const farmerService = {
  subscribe(callback) {
    listeners.push(callback);
    return () => {
      listeners = listeners.filter((cb) => cb !== callback);
    };
  },

  notify() {
    listeners.forEach((cb) => {
      try {
        cb(mockFarmers);
      } catch (err) {
        console.error('Error in farmerService subscriber:', err);
      }
    });
  },

  async getFarmers() {
    try {
      const res = await apiFetch('/farms');
      if (res.ok) {
        const farms = await res.json();
        if (farms && farms.length > 0) {
          const apiFarmers = farms.map((farm) => ({
            id: `F${farm.id}`,
            backendId: farm.id,
            fullName: farm.owner?.name || 'Farmer Bob',
            email: farm.owner?.email || 'bob@farmverse.com',
            phone: '+91 98421 12345',
            location: farm.location || 'Karur',
            address: farm.location || 'Karur, Tamil Nadu',
            farmName: farm.name,
            farmSize: farm.sizeAcres,
            numberOfFields: 3,
            mainCrop: farm.soilType || 'Paddy Rice',
            status: 'Active',
            registrationDate: '2024-03-15',
          }));
          const merged = [...apiFarmers, ...mockFarmers.filter(m => !apiFarmers.some(a => a.id === m.id || (a.backendId && a.backendId === m.backendId)))];
          mockFarmers = merged;
          cropService.syncFarmerCrops(mockFarmers);
          return merged;
        }
      }
    } catch (err) {
      console.warn('API getFarmers failed, using mock:', err);
    }
    cropService.syncFarmerCrops(mockFarmers);
    return [...mockFarmers];
  },

  async createFarmer(input) {
    const currentUser = getCurrentUser();
    if (currentUser?.role === 'ROLE_AGRONOMIST') {
      throw new Error('Access Denied: Agronomists are not permitted to register new farmers.');
    }
    let created;
    try {
      const res = await apiFetch('/farms', {
        method: 'POST',
        body: JSON.stringify({
          name: input.farmName,
          location: input.address || input.location || 'Karur, Tamil Nadu',
          sizeAcres: Number(input.farmSize),
          soilType: input.mainCrop || 'Loamy',
        }),
      });
      if (res.ok) {
        const farm = await res.json();
        created = {
          id: `F${farm.id}`,
          backendId: farm.id,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          location: farm.location,
          address: input.address,
          farmName: farm.name,
          farmSize: farm.sizeAcres,
          numberOfFields: 3,
          mainCrop: input.mainCrop,
          status: 'Active',
          registrationDate: new Date().toISOString().split('T')[0],
        };
      }
    } catch (err) {
      console.warn('API createFarmer failed, adding to mock:', err);
    }

    if (!created) {
      const nextNum = mockFarmers.length + 1;
      const id = `F${nextNum.toString().padStart(3, '0')}`;
      created = {
        id,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        location: input.address ? input.address.split(',')[0].trim() : 'Tamil Nadu',
        address: input.address,
        farmName: input.farmName,
        farmSize: Number(input.farmSize),
        numberOfFields: 3,
        mainCrop: input.mainCrop,
        status: 'Active',
        registrationDate: new Date().toISOString().split('T')[0],
      };
    }

    mockFarmers = [created, ...mockFarmers];
    this.notify();

    if (input.mainCrop) {
      const harvestDate = new Date();
      harvestDate.setMonth(harvestDate.getMonth() + 4);
      try {
        await cropService.createCrop({
          cropName: input.mainCrop,
          cropVariety: 'Standard Hybrid',
          farmer: input.fullName,
          farmerId: created.id,
          farm: input.farmName,
          field: `${input.farmName} - Sector 1`,
          plantingDate: new Date().toISOString().split('T')[0],
          expectedHarvestDate: harvestDate.toISOString().split('T')[0],
          growthStage: 'Seedling',
          area: Number(input.farmSize) || 2.0,
          soilType: 'Loamy Clay',
          healthStatus: 'Healthy',
          irrigationStatus: 'Optimal',
          cropCategory: 'General',
        });
      } catch (e) {
        console.warn('Auto create crop failed:', e);
      }
    }

    return created;
  },

  async updateFarmer(id, input) {
    const currentUser = getCurrentUser();
    const existing = mockFarmers.find((f) => f.id === id);

    // RBAC validation
    if (currentUser) {
      if (currentUser.role === 'ROLE_AGRONOMIST') {
        throw new Error('Access Denied: Agronomists are not permitted to edit farmer profiles.');
      }
      if (currentUser.role === 'ROLE_FARMER') {
        const isOwn = existing && (existing.email === currentUser.email || existing.fullName === currentUser.name);
        if (!isOwn) {
          throw new Error('Access Denied: Standard farmers can only edit their own profile. Admin privileges are required to edit other users.');
        }
      }
    }

    const backendId = id.startsWith('F') ? id.substring(1) : id;
    let updated;
    try {
      const res = await apiFetch(`/farms/${backendId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: input.farmName,
          location: input.address || input.location,
          sizeAcres: Number(input.farmSize),
          soilType: input.mainCrop,
        }),
      });
      if (res.ok) {
        const farm = await res.json();
        updated = {
          id,
          backendId: farm.id,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          location: farm.location,
          address: input.address,
          farmName: farm.name,
          farmSize: farm.sizeAcres,
          numberOfFields: 3,
          mainCrop: input.mainCrop,
          status: 'Active',
          registrationDate: new Date().toISOString().split('T')[0],
        };
      }
    } catch (err) {
      console.warn('API updateFarmer failed:', err);
    }

    const index = mockFarmers.findIndex((f) => f.id === id);
    if (index !== -1) {
      updated = updated || {
        ...mockFarmers[index],
        ...input,
        farmSize: input.farmSize !== undefined ? Number(input.farmSize) : mockFarmers[index].farmSize,
      };
      mockFarmers[index] = updated;
    }

    if (input.mainCrop) {
      try {
        const crops = await cropService.getCrops();
        const existingCrop = crops.find((c) => c.farmerId === id || c.farmer === input.fullName);
        if (existingCrop) {
          await cropService.updateCrop(existingCrop.id, {
            cropName: input.mainCrop,
            farm: input.farmName,
            farmer: input.fullName,
            area: input.farmSize !== undefined ? Number(input.farmSize) : existingCrop.area,
          });
        }
      } catch (e) {
        console.warn('Sync crop update failed:', e);
      }
    }

    this.notify();
    return updated;
  },

  async deleteFarmer(id) {
    const currentUser = getCurrentUser();
    
    // RBAC validation: Only Admin can delete farmers
    if (currentUser && currentUser.role !== 'ROLE_ADMIN') {
      throw new Error('Access Denied: Only System Administrators can delete farmer account records.');
    }

    const backendId = id.startsWith('F') ? id.substring(1) : id;
    try {
      await apiFetch(`/farms/${backendId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API deleteFarmer failed:', err);
    }
    const target = mockFarmers.find((f) => f.id === id);
    const initialLen = mockFarmers.length;
    mockFarmers = mockFarmers.filter((f) => f.id !== id);
    
    if (target) {
      try {
        const crops = await cropService.getCrops();
        const targetCrops = crops.filter((c) => c.farmerId === id || c.farmer === target.fullName);
        for (const tc of targetCrops) {
          await cropService.deleteCrop(tc.id);
        }
      } catch (e) {
        console.warn('Sync crop deletion failed:', e);
      }
    }

    this.notify();
    return mockFarmers.length < initialLen;
  },
};
