import React, { useState, useEffect } from 'react';
import { LineChart, RefreshCw, Store, TrendingUp, TrendingDown, Bell, ArrowRight, Landmark } from 'lucide-react';
import { cropService } from '../services/cropService';

const defaultCropsList = [
  { name: 'Paddy Rice', unit: 'quintal', base: 2350 },
  { name: 'Sugarcane', unit: 'ton', base: 3150 },
  { name: 'Tomato', unit: 'quintal', base: 3200 },
  { name: 'Cotton', unit: 'quintal', base: 6800 },
];

export default function MarketPriceTracking() {
  const [cropsList, setCropsList] = useState(defaultCropsList);
  const [crop, setCrop] = useState('Paddy Rice');
  const [market, setMarket] = useState('Central Mandi');
  const [alertPrice, setAlertPrice] = useState(2400);
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);

  useEffect(() => {
    const syncCrops = (crops) => {
      if (!crops || crops.length === 0) return;
      const mapped = crops.map((c) => ({
        name: c.cropName,
        unit: c.cropName.toLowerCase().includes('sugarcane') ? 'ton' : 'quintal',
        base: c.cropName.toLowerCase().includes('sugarcane') ? 3150 : c.cropName.toLowerCase().includes('rice') ? 2350 : c.cropName.toLowerCase().includes('tomato') ? 3200 : 2500,
      }));
      setCropsList(mapped);
      if (mapped[0]) setCrop(mapped[0].name);
    };

    cropService.getCrops().then(syncCrops);
    const unsubscribe = cropService.subscribe(syncCrops);
    return unsubscribe;
  }, []);

  const marketsList = [
    { name: 'Central Mandi', desc: 'Primary regional market', variance: 1.0 },
    { name: 'Riverside Market', desc: '30km east, higher demand', variance: 1.06 },
    { name: 'Northgate Exchange', desc: 'Wholesale trading hub', variance: 0.94 },
    { name: 'Valley Co-op', desc: 'Farmer cooperative pricing', variance: 1.02 },
  ];

  const generatePriceData = () => {
    setLoading(true);
    setTimeout(() => {
      const cropData = cropsList.find((c) => c.name === crop) || cropsList[0] || defaultCropsList[0];
      const marketData = marketsList.find((m) => m.name === market) || marketsList[0];

      // Deterministic pseudo-random 14-day trend seeded by crop+market
      const seed = crop.length * 7 + market.length * 3;
      const days = Array.from({ length: 14 }, (_, i) => {
        const wobble = Math.sin((i + seed) * 0.9) * 0.05 + Math.sin(i * 0.4 + seed) * 0.03;
        const price = Math.round(cropData.base * marketData.variance * (1 + wobble));
        return { day: `D${i + 1}`, price };
      });

      const current = days[days.length - 1].price;
      const previous = days[days.length - 2].price;
      const change = current - previous;
      const changePct = ((change / previous) * 100).toFixed(2);

      const otherMarkets = marketsList
        .filter((m) => m.name !== market)
        .map((m) => ({
          name: m.name,
          price: Math.round(cropData.base * m.variance),
        }));

      setPriceData({
        days,
        current,
        change,
        changePct,
        high: Math.max(...days.map((d) => d.price)),
        low: Math.min(...days.map((d) => d.price)),
        otherMarkets,
        unit: cropData.unit,
      });
      setLoading(false);
    }, 700);
  };

  useEffect(() => {
    generatePriceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop, market]);

  const maxPrice = priceData ? Math.max(...priceData.days.map((d) => d.price)) : 1;
  const minPrice = priceData ? Math.min(...priceData.days.map((d) => d.price)) : 0;

  return (
    <div className="grid-aside">
      {/* Left Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Crop Selection */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LineChart style={{ color: 'var(--primary)' }} /> 1. Select Crop
          </h3>
          <div className="grid-2">
            {cropsList.map((item) => (
              <div
                key={item.name}
                className={`selectable-card ${crop === item.name ? 'selected' : ''}`}
                onClick={() => setCrop(item.name)}
              >
                <div className="selectable-icon-wrapper">
                  <LineChart size={18} />
                </div>
                <div className="selectable-text">
                  <span className="selectable-title">{item.name}</span>
                  <span className="selectable-desc">Priced per {item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Selection */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store style={{ color: 'var(--secondary)' }} /> 2. Select Market
          </h3>
          <div className="grid-2">
            {marketsList.map((m) => (
              <div
                key={m.name}
                className={`selectable-card ${market === m.name ? 'selected' : ''}`}
                onClick={() => setMarket(m.name)}
              >
                <div className="selectable-icon-wrapper">
                  <Landmark size={18} />
                </div>
                <div className="selectable-text">
                  <span className="selectable-title">{m.name}</span>
                  <span className="selectable-desc">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Trend Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem' }}>14-Day Price Trend</h4>
            {priceData && (
              <span className="badge badge-info">
                {priceData.unit === 'quintal' ? 'Price / Quintal' : `Price / ${priceData.unit}`}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 0', gap: '1rem' }}>
              <RefreshCw size={32} className="pulse" style={{ color: 'var(--secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching latest mandi prices...</p>
            </div>
          ) : priceData ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', height: '160px', padding: '0 0.25rem' }}>
              {priceData.days.map((d, idx) => {
                const heightPct = ((d.price - minPrice + 1) / (maxPrice - minPrice + 1)) * 90 + 10;
                const isLast = idx === priceData.days.length - 1;
                return (
                  <div
                    key={d.day}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', height: '100%', justifyContent: 'flex-end' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: isLast
                          ? 'linear-gradient(180deg, var(--primary) 0%, rgba(16, 185, 129, 0.2) 100%)'
                          : 'linear-gradient(180deg, var(--secondary) 0%, rgba(56, 189, 248, 0.15) 100%)',
                        borderRadius: '3px 3px 0 0',
                        minHeight: '4px',
                        boxShadow: isLast ? '0 0 10px var(--primary-glow)' : 'none',
                      }}
                    ></div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{idx % 2 === 0 ? d.day : ''}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Current Price Card */}
        <div
          className="glass-card"
          style={{
            borderLeft: '4px solid var(--secondary)',
            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.05) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="title-gradient" style={{ fontSize: '1.25rem' }}>Live Market Price</h3>
            <span className="badge badge-success">Updated Today</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 0', gap: '1rem' }}>
              <RefreshCw size={32} className="pulse" style={{ color: 'var(--secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Syncing market feed...</p>
            </div>
          ) : priceData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {crop} at {market}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--text-primary)' }}>
                    ₹{priceData.current}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      color: priceData.change >= 0 ? 'var(--primary)' : 'var(--danger, #f87171)',
                    }}
                  >
                    {priceData.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {priceData.change >= 0 ? '+' : ''}
                    {priceData.changePct}%
                  </span>
                </div>
              </div>

              <div
                className="grid-2"
                style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>14-Day High</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--primary)', marginTop: '0.15rem' }}>
                    ₹{priceData.high}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>14-Day Low</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Outfit', color: 'var(--warning)', marginTop: '0.15rem' }}>
                    ₹{priceData.low}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div className="form-label">
                  <span>Set Price Alert Threshold</span>
                  <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>₹{alertPrice}</span>
                </div>
                <input
                  type="range"
                  className="range-slider range-slider-cyan"
                  min={Math.round(priceData.low * 0.8)}
                  max={Math.round(priceData.high * 1.2)}
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(parseInt(e.target.value))}
                />
              </div>

              <button
                onClick={() => alert(`Alert set: notify when ${crop} at ${market} reaches ₹${alertPrice}.`)}
                className="btn btn-cyan"
                style={{ width: '100%', gap: '0.4rem' }}
              >
                <Bell size={14} /> Notify Me at This Price
              </button>
            </div>
          ) : null}
        </div>

        {/* Compare Across Markets */}
        <div className="glass-card">
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Compare Across Markets</h4>
          {priceData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="info-row" style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span className="info-label" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{market} (Selected)</span>
                <span className="info-value" style={{ color: 'var(--primary)' }}>₹{priceData.current}</span>
              </div>
              {priceData.otherMarkets.map((m) => (
                <div className="info-row" key={m.name}>
                  <span className="info-label">{m.name}</span>
                  <span className="info-value">₹{m.price}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setMarket(marketsList.find((m) => m.name !== market).name)}
            className="btn btn-outline"
            style={{ width: '100%', marginTop: '1rem', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            Switch to Best Price Market <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
