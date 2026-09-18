import React, { useState, useEffect } from 'react';
import { Layers, Droplet, FlaskConical, Thermometer, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { cropService } from '../services/cropService';

const defaultFields = [
  { id: 'F1', name: 'Field #1 - River Bank', cropName: 'Paddy Rice', soilType: 'Alluvial Clay', moisture: 62, ph: 6.4, nitrogen: 58, phosphorus: 42, potassium: 65, temperature: 26 },
  { id: 'F2', name: 'Block A - Main Canal', cropName: 'Sugarcane', soilType: 'Clay Loam', moisture: 74, ph: 6.8, nitrogen: 70, phosphorus: 55, potassium: 60, temperature: 27 },
  { id: 'F3', name: 'Field #3 - East Sector', cropName: 'Cotton', soilType: 'Black Cotton Soil', moisture: 38, ph: 7.5, nitrogen: 45, phosphorus: 38, potassium: 50, temperature: 29 },
  { id: 'F4', name: 'Foothill Field B', cropName: 'Maize', soilType: 'Red Loamy', moisture: 55, ph: 6.1, nitrogen: 60, phosphorus: 48, potassium: 55, temperature: 25 },
];

function getMoistureStatus(m) {
  if (m < 40) return { label: 'Dry', badge: 'warning' };
  if (m > 70) return { label: 'Saturated', badge: 'info' };
  return { label: 'Optimal', badge: 'success' };
}

function getPhStatus(ph) {
  if (ph < 6.0) return { label: 'Acidic', badge: 'warning' };
  if (ph > 7.5) return { label: 'Alkaline', badge: 'warning' };
  return { label: 'Balanced', badge: 'success' };
}

export default function SoilMonitoring() {
  const [fieldList, setFieldList] = useState(defaultFields);
  const [selectedField, setSelectedField] = useState('F1');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const syncFields = (crops) => {
      if (!crops || crops.length === 0) return;
      const mapped = crops.map((c, i) => ({
        id: c.id || `F${i + 1}`,
        name: c.field ? `${c.field} (${c.cropName})` : `${c.cropName} Plot`,
        cropName: c.cropName,
        soilType: c.soilType || 'Loamy Soil',
        moisture: c.healthStatus === 'Critical' ? 32 : c.healthStatus === 'Moderate' ? 45 : 64,
        ph: 6.5,
        nitrogen: 60,
        phosphorus: 45,
        potassium: 55,
        temperature: 26,
      }));
      setFieldList(mapped);
      if (!mapped.some((m) => m.id === selectedField)) {
        setSelectedField(mapped[0].id);
      }
    };

    cropService.getCrops().then(syncFields);
    const unsubscribe = cropService.subscribe(syncFields);
    return unsubscribe;
  }, []);

  const field = fieldList.find((f) => f.id === selectedField) || fieldList[0] || defaultFields[0];
  const moistureStatus = getMoistureStatus(field.moisture);
  const phStatus = getPhStatus(field.ph);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const npkItems = [
    { key: 'Nitrogen (N)', value: field.nitrogen, color: 'var(--primary)' },
    { key: 'Phosphorus (P)', value: field.phosphorus, color: 'var(--secondary)' },
    { key: 'Potassium (K)', value: field.potassium, color: 'var(--warning)' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Field Selector */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Select Field</h3>
          <button className="btn btn-outline" onClick={handleRefresh}>
            <RefreshCw size={14} className={isRefreshing ? 'pulse' : ''} /> Refresh Sensors
          </button>
        </div>
        <div className="grid-4">
          {fieldList.map((f) => (
            <div
              key={f.id}
              className={`selectable-card ${selectedField === f.id ? 'selected' : ''}`}
              onClick={() => setSelectedField(f.id)}
            >
              <div className="selectable-icon-wrapper"><Layers size={18} /></div>
              <div className="selectable-text">
                <span className="selectable-title">{f.name}</span>
                <span className="selectable-desc">{f.soilType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-aside">
        {/* Left: Gauges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Real-Time Soil Sensors — {field.name}</h4>
            <div className="grid-2">
              {/* Moisture Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Soil Moisture</h4>
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1rem' }}>
                  <svg className="gauge-svg" width="120" height="120" viewBox="0 0 120 120">
                    <circle className="gauge-track" cx="60" cy="60" r={radius} strokeWidth="8" />
                    <circle
                      className="gauge-fill"
                      cx="60" cy="60" r={radius} strokeWidth="8"
                      stroke="var(--secondary)"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (field.moisture / 100) * circumference}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>{field.moisture}%</span>
                  </div>
                </div>
                <span className={`badge badge-${moistureStatus.badge}`}>{moistureStatus.label}</span>
              </div>

              {/* pH Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Soil pH Level</h4>
                <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1rem' }}>
                  <svg className="gauge-svg" width="120" height="120" viewBox="0 0 120 120">
                    <circle className="gauge-track" cx="60" cy="60" r={radius} strokeWidth="8" />
                    <circle
                      className="gauge-fill gauge-fill-cyan"
                      cx="60" cy="60" r={radius} strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - (field.ph / 14) * circumference}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit' }}>{field.ph}</span>
                  </div>
                </div>
                <span className={`badge badge-${phStatus.badge}`}>{phStatus.label}</span>
              </div>
            </div>
          </div>

          {/* NPK Levels */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FlaskConical size={18} style={{ color: 'var(--primary)' }} /> NPK Nutrient Levels
            </h4>
            {npkItems.map((item) => (
              <div key={item.key} style={{ marginBottom: '1.1rem' }}>
                <div className="form-label" style={{ marginBottom: '0.4rem' }}>
                  <span>{item.key}</span>
                  <span style={{ color: item.color, fontWeight: 'bold' }}>{item.value} mg/kg</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '5px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary + Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="title-gradient" style={{ fontSize: '1.2rem' }}>Soil Health Summary</h3>
              <span className={`badge badge-${moistureStatus.badge === 'success' && phStatus.badge === 'success' ? 'success' : 'warning'}`}>
                {moistureStatus.badge === 'success' && phStatus.badge === 'success' ? 'Healthy' : 'Needs Attention'}
              </span>
            </div>
            <div className="info-row"><span className="info-label">Soil Type</span><span className="info-value">{field.soilType}</span></div>
            <div className="info-row"><span className="info-label">Soil Temperature</span><span className="info-value">{field.temperature}°C</span></div>
            <div className="info-row"><span className="info-label">Moisture Status</span><span className="info-value">{moistureStatus.label}</span></div>
            <div className="info-row"><span className="info-label">pH Status</span><span className="info-value">{phStatus.label}</span></div>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Recommendations</h4>
            <div className="history-list">
              {field.moisture < 40 && (
                <div className="history-item">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--warning)', marginTop: '0.15rem' }} />
                    <div>
                      <div className="history-title">Low Moisture Detected</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Schedule irrigation within the next 12 hours to prevent crop stress.</p>
                    </div>
                  </div>
                </div>
              )}
              {field.moisture > 70 && (
                <div className="history-item">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Droplet size={16} style={{ color: 'var(--info)', marginTop: '0.15rem' }} />
                    <div>
                      <div className="history-title">Soil Saturation High</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pause irrigation and check for adequate field drainage.</p>
                    </div>
                  </div>
                </div>
              )}
              {(field.ph < 6.0 || field.ph > 7.5) && (
                <div className="history-item">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <FlaskConical size={16} style={{ color: 'var(--warning)', marginTop: '0.15rem' }} />
                    <div>
                      <div className="history-title">pH Imbalance</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {field.ph < 6.0 ? 'Apply agricultural lime to raise soil pH.' : 'Apply elemental sulfur or organic compost to lower soil pH.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {moistureStatus.badge === 'success' && phStatus.badge === 'success' && (
                <div className="history-item">
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <CheckCircle size={16} style={{ color: 'var(--primary)', marginTop: '0.15rem' }} />
                    <div>
                      <div className="history-title">Soil Conditions Optimal</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No immediate action needed. Continue regular monitoring.</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="history-item">
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Thermometer size={16} style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }} />
                  <div>
                    <div className="history-title">Soil Temperature Nominal</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{field.temperature}°C is within the optimal range for root development.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
