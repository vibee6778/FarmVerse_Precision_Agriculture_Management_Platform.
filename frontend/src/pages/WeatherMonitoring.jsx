import React, { useState, useEffect } from 'react';
import { RefreshCw, Sunrise, Sunset, Wind, Droplets, Gauge, Eye, AlertTriangle, Info, ShieldAlert, CloudRain } from 'lucide-react';
import { weatherService, AVAILABLE_LOCATIONS } from '../services/weatherService';
import { useToast } from '../context/ToastContext';

import { farmerService } from '../services/farmerService';

const severityBadge = { info: 'info', warning: 'warning', critical: 'danger' };
const severityIcon = { info: Info, warning: AlertTriangle, critical: ShieldAlert };

export default function WeatherMonitoring() {
  const [locations, setLocations] = useState(AVAILABLE_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState('karur');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const syncLocations = (farmers) => {
      if (!farmers || farmers.length === 0) return;
      const farmerLocs = farmers.map((f) => {
        const rawLoc = f.location || 'Karur';
        const cleanId = rawLoc.toLowerCase().replace(/[^a-z0-9]/g, '');
        return {
          id: cleanId,
          name: rawLoc,
          district: `${rawLoc} District`,
          state: 'Tamil Nadu',
          lat: 10.96,
          lon: 78.08,
        };
      });
      const merged = [...AVAILABLE_LOCATIONS];
      farmerLocs.forEach((loc) => {
        if (!merged.some((m) => m.id === loc.id || m.name.toLowerCase() === loc.name.toLowerCase())) {
          merged.push(loc);
        }
      });
      setLocations(merged);
    };

    farmerService.getFarmers().then(syncLocations);
    const unsub = farmerService.subscribe(syncLocations);
    return unsub;
  }, []);

  const fetchWeather = async (locId, showSuccess = false) => {
    if (!weatherData) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await weatherService.getWeatherByLocation(locId);
      setWeatherData(data);
      if (showSuccess) {
        showToast('Weather Updated', `Fetched microclimate telemetry for ${data.current.location}.`, 'success');
      }
    } catch {
      showToast('Weather Telemetry Error', 'Unable to fetch weather condition.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Location chips */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Select District</h3>
          <button className="btn btn-outline" onClick={() => fetchWeather(selectedLocation, true)} disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'pulse' : ''} /> Refresh
          </button>
        </div>
        <div className="chip-row">
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`chip ${selectedLocation === loc.id ? 'active' : ''}`}
              onClick={() => setSelectedLocation(loc.id)}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
          <RefreshCw size={32} className="pulse" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Connecting to meteorological sensors...</p>
        </div>
      ) : weatherData ? (
        <>
          {/* Current Weather */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 className="title-secondary" style={{ fontSize: '1.5rem' }}>{weatherData.current.location}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{weatherData.current.district} · Updated {weatherData.current.lastUpdated}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>{weatherData.current.temperature}°C</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Feels like {weatherData.current.feelsLike}°C · {weatherData.current.condition}</div>
              </div>
            </div>

            <div className="grid-4" style={{ marginTop: '1.5rem' }}>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Droplets size={14} /> Humidity</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.humidity}%</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Wind size={14} /> Wind Speed</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.windSpeed} km/h</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CloudRain size={14} /> Rain Chance</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.rainProbability}%</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Gauge size={14} /> UV Index</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.uvIndex} ({weatherData.current.uvLevel})</span>
              </div>
            </div>

            <div className="grid-4" style={{ marginTop: '0.5rem' }}>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Sunrise size={14} /> Sunrise</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.sunrise}</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Sunset size={14} /> Sunset</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.sunset}</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label">Pressure</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.pressure} hPa</span>
              </div>
              <div className="info-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.3rem', border: 'none' }}>
                <span className="info-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Eye size={14} /> Visibility</span>
                <span className="info-value" style={{ fontSize: '1.1rem' }}>{weatherData.current.visibility} km</span>
              </div>
            </div>
          </div>

          {/* Irrigation Advisory & Alerts */}
          <div className="grid-aside">
            <div className="glass-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Weather Alerts</h4>
              <div className="history-list">
                {weatherData.alerts.map((alert) => {
                  const Icon = severityIcon[alert.severity] || Info;
                  return (
                    <div className="history-item" key={alert.id} style={{ alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Icon size={18} style={{ color: alert.severity === 'critical' ? 'var(--danger)' : alert.severity === 'warning' ? 'var(--warning)' : 'var(--info)', marginTop: '0.1rem' }} />
                        <div>
                          <div className="history-title">{alert.title}</div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{alert.description}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.35rem', fontWeight: 500 }}>{alert.recommendation}</p>
                          <div className="history-date" style={{ marginTop: '0.3rem' }}>{alert.issuedAt}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${severityBadge[alert.severity]}`}>{alert.severity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="glass-card"
              style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
            >
              <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Smart Irrigation Advisory</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{weatherData.irrigationAdvice}</p>
            </div>
          </div>

          {/* 7-day Forecast */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>7-Day Forecast</h4>
            <div className="grid-4" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem' }}>
              {weatherData.forecast.map((f) => (
                <div key={f.id} className="selectable-card" style={{ flexDirection: 'column', textAlign: 'center', cursor: 'default' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{f.day}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{f.date}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.4rem 0' }}>{f.condition}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{f.tempMax}° / {f.tempMin}°</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--secondary)', marginTop: '0.3rem' }}>{f.rainProbability}% rain</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
