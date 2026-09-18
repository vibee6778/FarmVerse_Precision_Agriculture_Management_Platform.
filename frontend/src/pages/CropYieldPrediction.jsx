import React, { useState, useEffect } from 'react';
import { Wheat, RefreshCw, MapPin, CloudRain, TrendingUp, BarChart3, Download, Database, ShieldCheck } from 'lucide-react';
import { cropService } from '../services/cropService';
import { yieldService } from '../services/yieldService';

const defaultCropsList = [
  { name: 'Paddy Rice', desc: 'Oryza sativa', baseYield: 4.1 },
  { name: 'Sugarcane', desc: 'Saccharum officinarum', baseYield: 35.0 },
  { name: 'Tomato', desc: 'Solanum lycopersicum', baseYield: 12.5 },
  { name: 'Cotton', desc: 'Gossypium hirsutum', baseYield: 2.2 },
];

export default function CropYieldPrediction() {
  const [cropsList, setCropsList] = useState(defaultCropsList);
  const [crop, setCrop] = useState('Paddy Rice');
  const [soilType, setSoilType] = useState('Loamy');
  const [area, setArea] = useState(5);
  const [rainfall, setRainfall] = useState(650);
  const [fertilizerUse, setFertilizerUse] = useState(60);
  const [irrigationLevel, setIrrigationLevel] = useState(70);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbPredictions, setDbPredictions] = useState([]);

  const fetchDbPredictions = async () => {
    const data = await yieldService.getYieldPredictions();
    setDbPredictions(data);
  };

  useEffect(() => {
    fetchDbPredictions();

    const syncCrops = (crops) => {
      if (!crops || crops.length === 0) return;
      const mapped = crops.map((c) => ({
        name: c.cropName,
        desc: `${c.cropVariety || 'Hybrid'} (${c.area || 2} Acres)`,
        baseYield: c.cropName.toLowerCase().includes('sugarcane') ? 32.0 : c.cropName.toLowerCase().includes('rice') ? 4.2 : c.cropName.toLowerCase().includes('tomato') ? 12.0 : 3.5,
        userArea: c.area || 2,
      }));
      setCropsList(mapped);
      if (mapped[0]) {
        setCrop(mapped[0].name);
        setArea(mapped[0].userArea);
      }
    };

    cropService.getCrops().then(syncCrops);
    const unsubscribe = cropService.subscribe(syncCrops);
    return unsubscribe;
  }, []);

  const soilTypes = [
    { name: 'Loamy', desc: 'Balanced drainage & fertility', factor: 1.15 },
    { name: 'Clay', desc: 'High water retention', factor: 0.95 },
    { name: 'Sandy', desc: 'Fast draining, low retention', factor: 0.8 },
    { name: 'Silty', desc: 'Fertile, moderate drainage', factor: 1.05 },
  ];

  const historicalYears = [
    { year: '2021', yield: 3.4 },
    { year: '2022', yield: 3.1 },
    { year: '2023', yield: 3.8 },
    { year: '2024', yield: 3.6 },
    { year: '2025', yield: 4.0 },
  ];

  const runPrediction = async () => {
    setLoading(true);
    const cropData = cropsList.find((c) => c.name === crop) || defaultCropsList[0];
    const soilData = soilTypes.find((s) => s.name === soilType) || soilTypes[0];

    const rainfallFactor = rainfall < 400 ? 0.75 : rainfall > 900 ? 0.9 : 1 + (rainfall - 650) / 2000;
    const fertilizerFactor = 0.75 + (fertilizerUse / 100) * 0.4;
    const irrigationFactor = 0.8 + (irrigationLevel / 100) * 0.3;

    const perAcreYield =
      cropData.baseYield * soilData.factor * rainfallFactor * fertilizerFactor * irrigationFactor;

    const totalYield = perAcreYield * area;
    const confidence = Math.min(
      96,
      Math.round(70 + (fertilizerUse / 100) * 12 + (irrigationLevel / 100) * 10 + (soilData.factor - 0.8) * 15)
    );

    let outlook = 'Average';
    if (perAcreYield > cropData.baseYield * 1.15) outlook = 'Above Average';
    if (perAcreYield < cropData.baseYield * 0.85) outlook = 'Below Average';

    const newPred = {
      perAcre: perAcreYield.toFixed(2),
      total: totalYield.toFixed(2),
      confidence,
      outlook,
      marketValueEstimate: Math.round(totalYield * 220),
    };
    setPrediction(newPred);

    // Save to backend database
    try {
      await yieldService.createYieldPrediction({
        cropName: crop,
        variety: soilType + ' Soil Variant',
        areaAcres: area,
        predictedYieldTons: parseFloat(totalYield.toFixed(2)),
        confidenceScore: confidence,
        riskFactors: rainfall < 400 ? 'Low seasonal rainfall' : rainfall > 900 ? 'Heavy monsoon flood risk' : 'Optimal moisture window',
        optimalHarvestWindow: '90 - 120 Days',
      });
      fetchDbPredictions();
    } catch (err) {
      console.error('Save yield prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [crop, soilType]);

  const maxHistYield = Math.max(...historicalYears.map((h) => h.yield), prediction ? parseFloat(prediction.perAcre) : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="grid-aside">
        {/* Left Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Crop Selection */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wheat style={{ color: 'var(--primary)' }} /> 1. Select Crop
            </h3>
            <div className="grid-2">
              {cropsList.map((item) => (
                <div
                  key={item.name}
                  className={`selectable-card ${crop === item.name ? 'selected' : ''}`}
                  onClick={() => setCrop(item.name)}
                >
                  <div className="selectable-icon-wrapper">
                    <Wheat size={18} />
                  </div>
                  <div className="selectable-text">
                    <span className="selectable-title">{item.name}</span>
                    <span className="selectable-desc">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soil Type Selection */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin style={{ color: 'var(--secondary)' }} /> 2. Soil Type
            </h3>
            <div className="grid-2">
              {soilTypes.map((soil) => (
                <div
                  key={soil.name}
                  className={`selectable-card ${soilType === soil.name ? 'selected' : ''}`}
                  onClick={() => setSoilType(soil.name)}
                >
                  <div className="selectable-icon-wrapper">
                    <MapPin size={18} />
                  </div>
                  <div className="selectable-text">
                    <span className="selectable-title">{soil.name}</span>
                    <span className="selectable-desc">{soil.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Field Conditions */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CloudRain style={{ color: 'var(--warning)' }} /> 3. Field & Climate Conditions
            </h3>

            <div className="form-group">
              <div className="form-label">
                <span>Farm Area</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{area} acres</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="1"
                max="50"
                value={area}
                onChange={(e) => setArea(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Expected Seasonal Rainfall</span>
                <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{rainfall} mm</span>
              </div>
              <input
                type="range"
                className="range-slider range-slider-cyan"
                min="200"
                max="1200"
                step="10"
                value={rainfall}
                onChange={(e) => setRainfall(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Fertilizer Usage Efficiency</span>
                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{fertilizerUse}%</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="0"
                max="100"
                value={fertilizerUse}
                onChange={(e) => setFertilizerUse(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Irrigation Coverage</span>
                <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{irrigationLevel}%</span>
              </div>
              <input
                type="range"
                className="range-slider range-slider-warning"
                min="0"
                max="100"
                value={irrigationLevel}
                onChange={(e) => setIrrigationLevel(parseInt(e.target.value))}
              />
            </div>

            <button
              onClick={runPrediction}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <RefreshCw size={16} className="pulse" /> : <TrendingUp size={16} />}
              {loading ? 'Running AI Yield Model...' : 'Predict & Store Yield Record'}
            </button>
          </div>
        </div>

        {/* Right Output Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Prediction Results Card */}
          <div
            className="glass-card"
            style={{
              borderLeft: '4px solid var(--primary)',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 23, 42, 0.6) 100%)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="title-gradient" style={{ fontSize: '1.25rem' }}>Yield Forecast</h3>
              <span className="badge badge-success">AI Predicted</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
                <RefreshCw size={36} className="pulse" style={{ color: 'var(--primary)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing field & climate variables...</p>
              </div>
            ) : prediction ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Estimated Yield per Acre
                  </span>
                  <div style={{ fontSize: '1.7rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                    {prediction.perAcre} tons/acre
                  </div>
                </div>

                <div
                  className="grid-2"
                  style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                >
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Farm Yield</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--secondary)', marginTop: '0.15rem' }}>
                      {prediction.total} tons
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Model Confidence</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--primary)', marginTop: '0.15rem' }}>
                      {prediction.confidence}%
                    </div>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Season Outlook</span>
                  <span
                    className="info-value"
                    style={{
                      color:
                        prediction.outlook === 'Above Average'
                          ? 'var(--primary)'
                          : prediction.outlook === 'Below Average'
                          ? 'var(--warning)'
                          : 'var(--text-primary)',
                    }}
                  >
                    {prediction.outlook}
                  </span>
                </div>

                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Est. Market Value</span>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                      ₹{prediction.marketValueEstimate.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Yield forecast report downloaded successfully.')}
                    className="btn btn-primary"
                    style={{ gap: '0.4rem', fontSize: '0.9rem' }}
                  >
                    <Download size={14} /> Export Report
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Historical Yield Trend */}
          <div className="glass-card">
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={18} style={{ color: 'var(--secondary)' }} /> 5-Year Yield Trend ({crop})
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '140px', padding: '0 0.25rem' }}>
              {historicalYears.map((h) => (
                <div key={h.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{h.yield}t</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${(h.yield / maxHistYield) * 100}%`,
                      background: 'linear-gradient(180deg, var(--secondary) 0%, rgba(56, 189, 248, 0.2) 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                    }}
                  ></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{h.year}</span>
                </div>
              ))}
              {prediction && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}>{prediction.perAcre}t</span>
                  <div
                    style={{
                      width: '100%',
                      height: `${(parseFloat(prediction.perAcre) / maxHistYield) * 100}%`,
                      background: 'linear-gradient(180deg, var(--primary) 0%, rgba(16, 185, 129, 0.2) 100%)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: '4px',
                      boxShadow: '0 0 10px var(--primary-glow)',
                    }}
                  ></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>2026 (P)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database Yield Predictions Records Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} style={{ color: 'var(--primary)' }} /> Database Yield Prediction Records ({dbPredictions.length})
          </h3>
          <button onClick={fetchDbPredictions} className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
            <RefreshCw size={14} /> Refresh Table
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Crop Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Variety</th>
                <th style={{ padding: '0.75rem 1rem' }}>Area (Acres)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Predicted Yield (Tons)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Confidence Score</th>
                <th style={{ padding: '0.75rem 1rem' }}>Risk Factors</th>
                <th style={{ padding: '0.75rem 1rem' }}>Harvest Window</th>
              </tr>
            </thead>
            <tbody>
              {dbPredictions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No yield predictions found in database. Click "Predict & Store Yield Record" to create one.
                  </td>
                </tr>
              ) : (
                dbPredictions.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>#{row.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-primary)', fontWeight: '600' }}>{row.cropName || 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{row.variety || 'Standard Hybrid'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{row.areaAcres ? `${row.areaAcres} Acres` : 'N/A'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                      {row.predictedYieldTons ? `${row.predictedYieldTons} Tons` : 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <ShieldCheck size={12} /> {row.confidenceScore ? `${row.confidenceScore}%` : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--warning)', fontSize: '0.85rem' }}>{row.riskFactors || 'None'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{row.optimalHarvestWindow || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
