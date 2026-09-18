import React, { useState, useEffect } from 'react';
import { Droplet, Power, Calendar, Clock, AlertTriangle, Play, Sparkles, Plus, Trash2 } from 'lucide-react';
import { cropService } from '../services/cropService';

const defaultSectors = [
  { id: 'A', name: 'Paddy Rice Field (Zone A)', moisture: 42, target: 60, status: 'Dry' },
  { id: 'B', name: 'Sugarcane Field (Zone B)', moisture: 68, target: 65, status: 'Optimal' },
  { id: 'C', name: 'Tomato Plot (Zone C)', moisture: 54, target: 70, status: 'Borderline' },
];

export default function Irrigation() {
  const [sectors, setSectors] = useState(defaultSectors);

  const [valves, setValves] = useState([
    { id: 1, name: 'Solenoid Valve 01 (Zone A)', active: true, flowRate: 14.2 },
    { id: 2, name: 'Solenoid Valve 02 (Zone B)', active: false, flowRate: 0.0 },
    { id: 3, name: 'Solenoid Valve 03 (Zone C)', active: false, flowRate: 0.0 },
  ]);

  const [schedules, setSchedules] = useState([
    { id: 1, sector: 'Paddy Rice Field (Zone A)', time: '06:00 AM', duration: 25, active: true },
    { id: 2, sector: 'Tomato Plot (Zone C)', time: '08:30 PM', duration: 40, active: false },
  ]);

  const [newSchedule, setNewSchedule] = useState({ sector: 'Paddy Rice Field (Zone A)', time: '12:00', duration: 15 });

  useEffect(() => {
    const syncCrops = (crops) => {
      if (!crops || crops.length === 0) return;
      const mappedSectors = crops.map((c, idx) => ({
        id: String.fromCharCode(65 + idx),
        name: `${c.cropName} (${c.field || 'Zone ' + String.fromCharCode(65 + idx)})`,
        moisture: c.healthStatus === 'Critical' ? 35 : c.healthStatus === 'Moderate' ? 48 : 62,
        target: 65,
        status: c.healthStatus === 'Critical' ? 'Dry' : 'Optimal',
      }));
      setSectors(mappedSectors);
      setValves(mappedSectors.map((sec, idx) => ({
        id: idx + 1,
        name: `Solenoid Valve ${String(idx + 1).padStart(2, '0')} (${sec.name})`,
        active: sec.moisture < sec.target,
        flowRate: sec.moisture < sec.target ? 13.5 : 0.0,
      })));
      if (mappedSectors[0]) {
        setNewSchedule((prev) => ({ ...prev, sector: mappedSectors[0].name }));
      }
    };

    cropService.getCrops().then(syncCrops);
    const unsubscribe = cropService.subscribe(syncCrops);
    return unsubscribe;
  }, []);

  const toggleValve = (id) => {
    setValves(valves.map(valve => {
      if (valve.id === id) {
        const nextState = !valve.active;
        return {
          ...valve,
          active: nextState,
          flowRate: nextState ? +(Math.random() * 5 + 10).toFixed(1) : 0.0
        };
      }
      return valve;
    }));
  };

  const handleSmartOptimization = () => {
    // Smart optimization: Turn on valve if moisture is less than target moisture, turn off if it's optimal
    const updatedValves = valves.map((valve, index) => {
      const sector = sectors[index];
      const shouldBeActive = sector.moisture < sector.target;
      return {
        ...valve,
        active: shouldBeActive,
        flowRate: shouldBeActive ? +(Math.random() * 4 + 11).toFixed(1) : 0.0
      };
    });
    setValves(updatedValves);
    // Increase dry moisture values slightly as a visual indicator of action!
    setSectors(sectors.map(sec => {
      if (sec.moisture < sec.target) {
        return { ...sec, moisture: Math.min(sec.target, sec.moisture + 5), status: 'Watering' };
      }
      return sec;
    }));
  };

  const addSchedule = (e) => {
    e.preventDefault();
    if (!newSchedule.time || !newSchedule.duration) return;
    
    // Format time from 24h to 12h
    const [hours, minutes] = newSchedule.time.split(':');
    const hr = parseInt(hours);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const formattedHour = hr % 12 || 12;
    const time12 = `${formattedHour}:${minutes} ${ampm}`;

    setSchedules([
      ...schedules,
      {
        id: Date.now(),
        sector: newSchedule.sector,
        time: time12,
        duration: parseInt(newSchedule.duration),
        active: true
      }
    ]);
    setNewSchedule({ sector: 'Tomato Field (Zone A)', time: '12:00', duration: 15 });
  };

  const deleteSchedule = (id) => {
    setSchedules(schedules.filter(sch => sch.id !== id));
  };

  const toggleScheduleActive = (id) => {
    setSchedules(schedules.map(sch => 
      sch.id === id ? { ...sch, active: !sch.active } : sch
    ));
  };

  // Circular gauge constants
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Smart Optimization Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', color: 'var(--primary)' }}>
            <Sparkles className="pulse" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>EcoWater Intelligent Assistant</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>EcoWater AI recommends skipping irrigation for Zone B because rain is expected in 3 hours.</p>
          </div>
        </div>
        <button onClick={handleSmartOptimization} className="btn btn-primary" style={{ fontSize: '0.9rem', gap: '0.4rem' }}>
          <Sparkles size={16} /> Apply Smart Watering
        </button>
      </div>

      <div className="grid-aside">
        
        {/* Left Side: Soil Moisture Sectors & Valves */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Soil Moisture Section */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplet style={{ color: 'var(--secondary)' }} /> Soil Moisture Metrics
            </h2>
            <div className="grid-3">
              {sectors.map((sector) => {
                const strokeDashoffset = circumference - (sector.moisture / 100) * circumference;
                const isDry = sector.moisture < sector.target - 10;
                const isOptimal = sector.moisture >= sector.target - 10 && sector.moisture <= sector.target + 10;
                const gaugeColor = isDry ? 'var(--warning)' : isOptimal ? 'var(--primary)' : 'var(--secondary)';
                const statusBadgeClass = isDry ? 'badge-warning' : isOptimal ? 'badge-success' : 'badge-info';

                return (
                  <div key={sector.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center' }}>{sector.name}</h4>
                    
                    {/* SVG Gauge */}
                    <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '1rem' }}>
                      <svg className="gauge-svg" width="120" height="120" viewBox="0 0 120 120">
                        <circle className="gauge-track" cx="60" cy="60" r={radius} strokeWidth="8" />
                        <circle 
                          className="gauge-fill" 
                          cx="60" 
                          cy="60" 
                          r={radius} 
                          strokeWidth="8" 
                          stroke={gaugeColor}
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'Outfit' }}>{sector.moisture}%</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target {sector.target}%</span>
                      </div>
                    </div>

                    <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '0.7rem' }}>
                      {sector.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smart Valve Controls */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Power style={{ color: 'var(--primary)' }} /> Valve Override Terminals
            </h2>
            <div className="grid-3">
              {valves.map((valve) => (
                <div key={valve.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: valve.active ? 'rgba(16, 185, 129, 0.03)' : 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: valve.active ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-light)', transition: 'all 0.3s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{valve.name}</span>
                    <span className={`badge ${valve.active ? 'badge-success glow-active' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                      {valve.active ? 'Flowing' : 'Closed'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flow Velocity:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Outfit', color: valve.active ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {valve.flowRate} L/min
                    </span>
                  </div>

                  <button 
                    onClick={() => toggleValve(valve.id)} 
                    className={`btn ${valve.active ? 'btn-danger' : 'btn-primary'}`} 
                    style={{ fontSize: '0.85rem', padding: '0.5rem', width: '100%' }}
                  >
                    <Power size={14} /> {valve.active ? 'Deactivate' : 'Activate Valve'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Schedules Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Current Schedules */}
          <div className="glass-card" style={{ height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ color: 'var(--warning)' }} /> Irrigation Schedules
            </h2>
            
            {schedules.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No active watering schedules.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {schedules.map((sch) => (
                  <div key={sch.id} style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <Clock size={16} style={{ color: sch.active ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{sch.time} ({sch.duration} mins)</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sch.sector}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={sch.active} 
                          onChange={() => toggleScheduleActive(sch.id)}
                        />
                        <span className="slider"></span>
                      </label>
                      <button 
                        onClick={() => deleteSchedule(sch.id)} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        className="btn-outline-hover"
                      >
                        <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create New Schedule */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus style={{ color: 'var(--primary)' }} /> Create Auto-Irrigation
            </h3>
            <form onSubmit={addSchedule}>
              <div className="form-group">
                <label className="form-label">Select Crop Zone</label>
                <select 
                  className="form-select" 
                  value={newSchedule.sector}
                  onChange={(e) => setNewSchedule({ ...newSchedule, sector: e.target.value })}
                >
                  {sectors.map((sec) => (
                    <option key={sec.id} value={sec.name}>{sec.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Time of Day</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Min)</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="180" 
                    className="form-input" 
                    value={newSchedule.duration}
                    onChange={(e) => setNewSchedule({ ...newSchedule, duration: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }}>
                <Plus size={16} /> Queue Schedule
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
