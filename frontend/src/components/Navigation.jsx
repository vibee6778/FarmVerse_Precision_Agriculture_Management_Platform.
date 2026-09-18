import React from 'react';
import {
  Users, Wheat, Layers, CloudSun, Droplet, Sprout, Bug, ShieldAlert,
  LineChart, Compass, User, LogOut,
} from 'lucide-react';
import { getCurrentUser } from '../services/apiClient';

export default function Navigation({ activeTab, setActiveTab, onLogout }) {
  const user = getCurrentUser();
  const menuItems = [
    { id: 'farmers', name: 'Farmer & Farm Management', icon: Users },
    { id: 'crops', name: 'Crop Management', icon: Wheat },
    { id: 'soil', name: 'Soil Monitoring', icon: Layers },
    { id: 'weather', name: 'Weather Monitoring', icon: CloudSun },
    { id: 'irrigation', name: 'Irrigation Management', icon: Droplet },
    { id: 'fertilizer', name: 'Fertilizer Recommendation', icon: Sprout },
    { id: 'pest', name: 'Pest Detection', icon: Bug },
    { id: 'disease', name: 'Disease Detection', icon: ShieldAlert },
    { id: 'yield', name: 'Crop Yield Prediction', icon: Wheat },
    { id: 'market', name: 'Market Price Tracking', icon: LineChart },
  ];

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <Compass className="logo-icon pulse" />
        <span className="logo-text">FarmVerse</span>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item-btn ${activeTab === item.id ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="user-avatar" style={{ background: (user?.role === 'ROLE_AGRONOMIST') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: (user?.role === 'ROLE_AGRONOMIST') ? 'var(--info)' : 'var(--primary)' }}>
            <User size={18} />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Farmer Bob'}</span>
            <span className="user-role" style={{ color: (user?.role === 'ROLE_AGRONOMIST') ? '#60a5fa' : 'var(--text-secondary)' }}>
              {user?.role === 'ROLE_AGRONOMIST' ? '🔬 Agronomist Expert' : '🌾 Registered Farmer'}
            </span>
          </div>
        </div>
        <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.82rem', gap: '0.4rem' }} onClick={onLogout}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
