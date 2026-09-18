import React from 'react';
import { Sun, CloudRain, Droplets, Thermometer, ShieldAlert, CheckCircle } from 'lucide-react';

export default function DashboardHeader({ activeTab }) {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'farmers':
        return {
          title: 'Farmer & Farm Management',
          desc: 'Register, manage, and monitor agricultural profiles across regions.',
          badge: { text: 'Registry: Active', type: 'success' }
        };
      case 'crops':
        return {
          title: 'Crop Management',
          desc: 'Track crop growth stages, soil health, irrigation schedules, and harvest timelines.',
          badge: { text: 'Inventory: Synced', type: 'info' }
        };
      case 'soil':
        return {
          title: 'Soil Monitoring',
          desc: 'Track live moisture, pH, and NPK nutrient levels across your fields.',
          badge: { text: 'Sensors: Online', type: 'success' }
        };
      case 'weather':
        return {
          title: 'Weather Monitoring',
          desc: 'Hyper-local climate monitoring, 7-day field forecasts, and irrigation advisory.',
          badge: { text: 'Feed: Live', type: 'info' }
        };
      case 'irrigation':
        return {
          title: 'Irrigation Management',
          desc: 'Monitor soil humidity, schedule automated watering cycles, and control smart valves.',
          badge: { text: 'Water Systems: Optimal', type: 'success' }
        };
      case 'fertilizer':
        return {
          title: 'Fertilizer Recommendation',
          desc: 'Analyze nutrient levels (NPK) and calculate tailored fertilization recommendations.',
          badge: { text: 'Soil Health: Balanced', type: 'info' }
        };
      case 'pest':
        return {
          title: 'Pest Detection AI',
          desc: 'Upload crop photos to detect infestations early and retrieve precise treatment advice.',
          badge: { text: 'Alerts: 1 Active Threat', type: 'warning' }
        };
      case 'disease':
        return {
          title: 'Disease Diagnosis AI',
          desc: 'Scan leaves and stems to identify plant pathogens and generate targeted organic remedies.',
          badge: { text: 'Scans: 0 Pathogens Detected Today', type: 'success' }
        };
      case 'yield':
        return {
          title: 'Crop Yield Prediction',
          desc: 'Forecast expected harvest output using soil, climate, and field management data.',
          badge: { text: 'Model: AI Forecast Ready', type: 'info' }
        };
      case 'market':
        return {
          title: 'Market Price Tracking',
          desc: 'Track live mandi prices, compare markets, and set alerts for the best selling price.',
          badge: { text: 'Feed: Live Prices', type: 'success' }
        };
      default:
        return {
          title: 'Precision Agriculture',
          desc: 'Welcome to FarmVerse. Monitor your crops, soil, and automated systems.',
          badge: { text: 'All Systems Operational', type: 'success' }
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="header-bar">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h1 className="title-gradient" style={{ fontSize: '1.85rem' }}>{info.title}</h1>
          <span className={`badge badge-${info.badge.type}`} style={{ height: 'fit-content' }}>
            {info.badge.type === 'success' && <CheckCircle size={12} />}
            {info.badge.type === 'warning' && <ShieldAlert size={12} />}
            {info.badge.text}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{info.desc}</p>
      </div>

      <div className="weather-widget">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Thermometer size={18} style={{ color: 'var(--warning)' }} />
          <span style={{ fontWeight: '600' }}>28°C</span>
        </div>
        <div className="weather-divider"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Droplets size={18} style={{ color: 'var(--secondary)' }} />
          <span style={{ fontWeight: '600' }}>62% RH</span>
        </div>
        <div className="weather-divider"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CloudRain size={18} style={{ color: 'var(--info)' }} />
          <span style={{ fontWeight: '600' }}>15% Rain</span>
        </div>
        <div className="weather-divider"></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sun size={18} style={{ color: '#fbbf24', animation: 'pulse 3s infinite' }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Clear Skies</span>
        </div>
      </div>
    </header>
  );
}
