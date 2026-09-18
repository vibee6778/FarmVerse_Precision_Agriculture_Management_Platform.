import React, { useState, useEffect } from 'react';
import { Sprout, RefreshCw, Layers, CircleDollarSign, CheckSquare, HelpCircle, ArrowRight } from 'lucide-react';
import { cropService } from '../services/cropService';

const defaultCropsList = [
  { name: 'Paddy Rice', desc: 'Oryza sativa', optimumPH: '6.0 - 7.0' },
  { name: 'Sugarcane', desc: 'Saccharum officinarum', optimumPH: '6.0 - 7.5' },
  { name: 'Tomato', desc: 'Solanum lycopersicum', optimumPH: '6.0 - 6.8' },
  { name: 'Cotton', desc: 'Gossypium hirsutum', optimumPH: '5.8 - 7.0' },
];

export default function Fertilizer() {
  const [cropsList, setCropsList] = useState(defaultCropsList);
  const [crop, setCrop] = useState('Paddy Rice');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [soilN, setSoilN] = useState(42);
  const [soilP, setSoilP] = useState(25);
  const [soilK, setSoilK] = useState(38);
  const [soilPH, setSoilPH] = useState(6.2);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncCrops = (crops) => {
      if (!crops || crops.length === 0) return;
      const mapped = crops.map((c) => ({
        name: c.cropName,
        desc: `${c.cropVariety || 'Standard Hybrid'} · ${c.farm}`,
        optimumPH: '6.0 - 7.0',
      }));
      setCropsList(mapped);
      if (mapped[0]) setCrop(mapped[0].name);
    };

    cropService.getCrops().then(syncCrops);
    const unsubscribe = cropService.subscribe(syncCrops);
    return unsubscribe;
  }, []);

  const stagesList = [
    { name: 'Seedling', desc: 'Root development & initial sprouts' },
    { name: 'Vegetative', desc: 'Foliage growth & stem thickening' },
    { name: 'Flowering', desc: 'Budding & bloom production' },
    { name: 'Maturation', desc: 'Fruit development & ripening' }
  ];

  // Calculate recommendation based on crop, stage, and soil levels
  const calculateRecommendation = () => {
    setLoading(true);
    setTimeout(() => {
      // Ideal NPK values for each crop
      const idealNPK = {
        Tomato: { Seedling: [50, 60, 40], Vegetative: [80, 50, 60], Flowering: [60, 80, 80], Maturation: [40, 40, 90] },
        Corn: { Seedling: [60, 50, 40], Vegetative: [90, 40, 50], Flowering: [80, 60, 60], Maturation: [50, 30, 70] },
        Wheat: { Seedling: [45, 45, 35], Vegetative: [70, 35, 45], Flowering: [60, 50, 55], Maturation: [30, 20, 50] },
        Potato: { Seedling: [40, 60, 50], Vegetative: [70, 50, 75], Flowering: [50, 70, 90], Maturation: [30, 30, 95] }
      };

      const cropMap = idealNPK[crop] || { Seedling: [55, 55, 45], Vegetative: [75, 45, 55], Flowering: [65, 75, 75], Maturation: [45, 35, 85] };
      const ideals = cropMap[growthStage] || [60, 50, 60];
      
      // Calculate deficits
      const defN = Math.max(0, ideals[0] - soilN);
      const defP = Math.max(0, ideals[1] - soilP);
      const defK = Math.max(0, ideals[2] - soilK);

      let primaryRec = '';
      let secondaryRec = '';
      let npkRatio = '';
      let dosage = 0;
      let costPerAcre = 0;

      const sumDef = defN + defP + defK;

      if (sumDef === 0) {
        primaryRec = 'Soil nutrient levels are currently optimal. No fertilizer addition needed.';
        secondaryRec = 'Maintain organic mulch to preserve current soil health.';
        npkRatio = '0-0-0';
        dosage = 0;
        costPerAcre = 0;
      } else {
        // Find maximum deficit to suggest product
        if (defN >= defP && defN >= defK) {
          primaryRec = 'Nitrogen-Rich Formula (e.g. Urea or Ammonium Nitrate)';
          secondaryRec = 'Side-dress fertilizer in early morning. Keep 5cm away from direct crop stems to prevent nitrogen burning.';
          npkRatio = '46-0-0 (Urea) or 21-0-0 (Ammonium Sulfate)';
          dosage = Math.round(35 + defN * 0.8);
          costPerAcre = dosage * 1.25;
        } else if (defP >= defN && defP >= defK) {
          primaryRec = 'Phosphorus-Rich Formula (e.g. Diammonium Phosphate - DAP)';
          secondaryRec = 'Incorporate into the soil close to the root zone. Highly recommended during root extension stages.';
          npkRatio = '18-46-0 (DAP) or 0-46-0 (Triple Superphosphate)';
          dosage = Math.round(40 + defP * 0.9);
          costPerAcre = dosage * 1.65;
        } else {
          primaryRec = 'Potassium-Rich Blend (e.g. Muriate of Potash - MOP)';
          secondaryRec = 'Apply broadcast application. Essential for water regulation, sugar synthesis, and disease resistance during maturation.';
          npkRatio = '0-0-60 (MOP) or 0-0-50 (Potassium Sulfate)';
          dosage = Math.round(30 + defK * 0.85);
          costPerAcre = dosage * 1.45;
        }

        // Overrides for specific stages
        if (growthStage === 'Flowering' && sumDef > 15) {
          primaryRec = 'Balanced NPK Fruit Booster (NPK 10-26-26)';
          npkRatio = '10-26-26';
          dosage = Math.round(50 + (defP + defK) * 0.5);
          costPerAcre = dosage * 1.85;
        } else if (growthStage === 'Seedling' && sumDef > 10) {
          primaryRec = 'Starter Phosphate Starter Mixture (NPK 12-32-16)';
          npkRatio = '12-32-16';
          dosage = Math.round(30 + defP * 0.6);
          costPerAcre = dosage * 1.5;
        }
      }

      setRecommendation({
        primary: primaryRec,
        secondary: secondaryRec,
        ratio: npkRatio,
        dosage: dosage, // kg per acre
        cost: Math.round(costPerAcre), // $
        phStatus: soilPH < 5.8 ? 'Acidic (Suggest adding Agricultural Lime)' : soilPH > 7.0 ? 'Alkaline (Suggest adding Elemental Sulfur)' : 'Optimal pH for Crop'
      });
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    // Generate initial recommendation
    calculateRecommendation();
  }, [crop, growthStage]);

  return (
    <div className="grid-aside">
      
      {/* Left Input Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Crop Selection */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sprout style={{ color: 'var(--primary)' }} /> 1. Select Crop Target
          </h3>
          <div className="grid-2">
            {cropsList.map((item) => (
              <div 
                key={item.name} 
                className={`selectable-card ${crop === item.name ? 'selected' : ''}`}
                onClick={() => setCrop(item.name)}
              >
                <div className="selectable-icon-wrapper">
                  <Sprout size={18} />
                </div>
                <div className="selectable-text">
                  <span className="selectable-title">{item.name}</span>
                  <span className="selectable-desc">Optimum pH: {item.optimumPH}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Stage Selection */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers style={{ color: 'var(--secondary)' }} /> 2. Crop Growth Stage
          </h3>
          <div className="grid-2">
            {stagesList.map((stage) => (
              <div 
                key={stage.name} 
                className={`selectable-card ${growthStage === stage.name ? 'selected' : ''}`}
                onClick={() => setGrowthStage(stage.name)}
              >
                <div className="selectable-icon-wrapper">
                  <Layers size={18} />
                </div>
                <div className="selectable-text">
                  <span className="selectable-title">{stage.name}</span>
                  <span className="selectable-desc">{stage.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Soil NPK Levels */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw style={{ color: 'var(--warning)' }} /> 3. Current Soil Nutrients (PPM)
          </h3>

          <div className="form-group">
            <div className="form-label">
              <span>Nitrogen (N)</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{soilN} PPM</span>
            </div>
            <input 
              type="range" 
              className="range-slider" 
              min="0" 
              max="100" 
              value={soilN} 
              onChange={(e) => setSoilN(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Phosphorus (P)</span>
              <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{soilP} PPM</span>
            </div>
            <input 
              type="range" 
              className="range-slider range-slider-cyan" 
              min="0" 
              max="100" 
              value={soilP} 
              onChange={(e) => setSoilP(parseInt(e.target.value))}
            />
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Potassium (K)</span>
              <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>{soilK} PPM</span>
            </div>
            <input 
              type="range" 
              className="range-slider range-slider-warning" 
              min="0" 
              max="100" 
              value={soilK} 
              onChange={(e) => setSoilK(parseInt(e.target.value))}
            />
          </div>

          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Soil pH Level</label>
              <input 
                type="number" 
                step="0.1" 
                min="3.0" 
                max="10.0" 
                className="form-input" 
                value={soilPH} 
                onChange={(e) => setSoilPH(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <button 
            onClick={calculateRecommendation} 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem', gap: '0.5rem' }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="pulse" /> : <Sprout size={16} />} 
            {loading ? 'Analyzing Soil Chemistry...' : 'Recalculate AI Recommendation'}
          </button>
        </div>

      </div>

      {/* Right Output Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* AI Recommendations Card */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="title-gradient" style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AI Soil Prescription
            </h3>
            <span className="badge badge-success">AI Verified</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 0', gap: '1rem' }}>
              <RefreshCw size={36} className="pulse" style={{ color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Recalculating soil chemical balances...</p>
            </div>
          ) : recommendation ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Recommended Product Formula</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {recommendation.primary}
                </div>
              </div>

              <div className="grid-2" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Target NPK Ratio</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--secondary)', marginTop: '0.15rem' }}>
                    {recommendation.ratio}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Dosage Rate</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--primary)', marginTop: '0.15rem' }}>
                    {recommendation.dosage} kg / acre
                  </div>
                </div>
              </div>

              <div className="info-row">
                <span className="info-label">Soil pH Assessment</span>
                <span className="info-value" style={{ color: recommendation.phStatus.includes('Optimal') ? 'var(--primary)' : 'var(--warning)' }}>
                  {recommendation.phStatus}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Application Method</span>
                <span className="info-value" style={{ fontSize: '0.85rem', maxWidth: '70%', textAlign: 'right', display: 'inline-block' }}>
                  {recommendation.secondary}
                </span>
              </div>

              <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated Cost per Acre</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CircleDollarSign size={20} style={{ color: 'var(--primary)' }} /> ₹{recommendation.cost}
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Prescribed fertilizer (${recommendation.primary}) order submitted successfully.`)}
                  className="btn btn-primary"
                  style={{ gap: '0.4rem', fontSize: '0.9rem' }}
                  disabled={recommendation.dosage === 0}
                >
                  Order Fertilizer <ArrowRight size={14} />
                </button>
              </div>

            </div>
          ) : null}
        </div>

        {/* NPK Chart representation using CSS & SVGs */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Nutrient Balance Breakdown</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            
            {/* Nitrogen bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Nitrogen (N)</span>
                <span>{soilN}% of Optimal</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, soilN)}%`, height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
              </div>
            </div>

            {/* Phosphorus bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Phosphorus (P)</span>
                <span>{soilP}% of Optimal</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, soilP)}%`, height: '100%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary-glow)' }}></div>
              </div>
            </div>

            {/* Potassium bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Potassium (K)</span>
                <span>{soilK}% of Optimal</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, soilK)}%`, height: '100%', background: 'var(--warning)', boxShadow: '0 0 10px var(--warning-glow)' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
