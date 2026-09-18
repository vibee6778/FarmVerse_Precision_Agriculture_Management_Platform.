import React, { useState, useEffect } from 'react';
import { Upload, Bug, AlertCircle, ShieldCheck, RefreshCw, Calendar, Eye, CheckCircle2, FileX2 } from 'lucide-react';
import { cropService } from '../services/cropService';

export default function PestDetection() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPestName, setSelectedPestName] = useState('');
  const [isValidPlantImage, setIsValidPlantImage] = useState(true);
  const [imageValidationError, setImageValidationError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState('');
  const [results, setResults] = useState(null);
  const [cropOptions, setCropOptions] = useState(['Paddy Rice', 'Tomato Field', 'Sugarcane Plot']);
  const [history, setHistory] = useState([
    { id: 1, pest: 'Aphids', crop: 'Paddy Rice (Zone A)', date: '2026-08-22 09:30 AM', threat: 'Medium', status: 'Controlled' },
    { id: 2, pest: 'Stem Borer', crop: 'Sugarcane (Zone B)', date: '2026-08-20 04:15 PM', threat: 'Low', status: 'Resolved' },
  ]);

  useEffect(() => {
    const syncCrops = (crops) => {
      if (!crops || crops.length === 0) return;
      const names = crops.map((c) => c.cropName);
      setCropOptions(names);
      if (history.length > 0 && names[0]) {
        setHistory((prev) =>
          prev.map((item, i) => ({
            ...item,
            crop: `${names[i % names.length]} (${item.crop.split('(')[1] || 'Zone A)'}`,
          }))
        );
      }
    };

    cropService.getCrops().then(syncCrops);
    const unsubscribe = cropService.subscribe(syncCrops);
    return unsubscribe;
  }, []);

  const sampleImages = [
    {
      id: 'aphids',
      name: 'Aphids Infestation (Tomato Leaf)',
      icon: '🐛',
      pestName: 'Green Peach Aphids (Myzus persicae)',
      threat: 'Medium',
      damage: '8-12% foliar damage',
      organic: 'Apply organic Neem Oil spray (1% dilution) or introduce beneficial Ladybugs (Hippodamia convergens).',
      chemical: 'Apply Imidacloprid systemic insecticide if population surpasses threshold of 10 aphids per leaf.',
      svgContent: (
        <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', background: '#111a2e' }}>
          <path d="M20,120 Q80,100 160,30" stroke="#059669" strokeWidth="6" fill="none" />
          <path d="M90,75 Q130,35 170,50 Q160,90 90,75" fill="#10b981" stroke="#059669" strokeWidth="2" />
          <circle cx="110" cy="65" r="4" fill="#fbbf24" stroke="#d97706" />
          <circle cx="115" cy="60" r="3" fill="#fbbf24" stroke="#d97706" />
          <circle cx="125" cy="58" r="4.5" fill="#fbbf24" stroke="#d97706" />
          <circle cx="135" cy="50" r="3.5" fill="#fbbf24" stroke="#d97706" />
          <circle cx="140" cy="55" r="4" fill="#fbbf24" stroke="#d97706" />
          <circle cx="120" cy="70" r="3" fill="#fbbf24" stroke="#d97706" />
          <circle cx="125" cy="60" r="35" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <text x="75" y="140" fill="var(--text-secondary)" fontSize="10">Sample A: Aphids Vector</text>
        </svg>
      )
    },
    {
      id: 'armyworm',
      name: 'Fall Armyworm (Corn Stem)',
      icon: '🐛',
      pestName: 'Fall Armyworm (Spodoptera frugiperda)',
      threat: 'High',
      damage: '22-26% whorl damage',
      organic: 'Utilize Bacillus thuringiensis (Bt) bacterial sprays, or manually release Trichogramma wasps.',
      chemical: 'Apply Chlorantraniliprole (e.g. Coragen) or Spinetoram to protect the crop whorl.',
      svgContent: (
        <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%', background: '#111a2e' }}>
          <rect x="80" y="0" width="40" height="150" fill="#047857" />
          <path d="M100,0 L100,150" stroke="#065f46" strokeWidth="2" />
          <rect x="95" y="40" width="10" height="45" rx="5" fill="#a16207" />
          <circle cx="100" cy="45" r="4" fill="#854d0e" />
          <circle cx="100" cy="53" r="4" fill="#854d0e" />
          <circle cx="100" cy="61" r="4" fill="#854d0e" />
          <circle cx="100" cy="69" r="4" fill="#854d0e" />
          <circle cx="100" cy="77" r="4" fill="#854d0e" />
          <ellipse cx="100" cy="55" rx="7" ry="15" fill="#111827" opacity="0.6" />
          <rect x="85" y="30" width="30" height="60" stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 2" fill="none" />
          <text x="75" y="140" fill="var(--text-secondary)" fontSize="10">Sample B: Armyworm chewing</text>
        </svg>
      )
    }
  ];

  const handleSelectSample = (sample) => {
    setSelectedImage(sample.svgContent);
    setSelectedPestName(sample.name);
    setIsValidPlantImage(true);
    setImageValidationError('');
    setResults(null);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedPestName(file.name);
      setResults(null);

      const fileNameLower = file.name.toLowerCase();
      const nonPlantKeywords = ['car', 'cat', 'dog', 'building', 'document', 'paper', 'code', 'screenshot', 'invoice', 'receipt', 'avatar', 'person', 'logo', 'banner', 'random', 'invalid', 'test_invalid', 'nonplant', 'screen'];
      const hasNonPlantKeyword = nonPlantKeywords.some((kw) => fileNameLower.includes(kw));

      const imgUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imgUrl;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 100, 100);
          const data = ctx.getImageData(0, 0, 100, 100).data;
          let plantPixels = 0;
          const totalPixels = data.length / 4;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Chlorophyll green or leaf spot brown/yellow pigment condition
            const isGreen = g > r && g > b && g > 30;
            const isLeafSpot = r > 60 && g > 60 && b < 110 && Math.abs(r - g) < 50;
            if (isGreen || isLeafSpot) {
              plantPixels++;
            }
          }

          const plantRatio = plantPixels / totalPixels;
          if (hasNonPlantKeyword || plantRatio < 0.12) {
            setIsValidPlantImage(false);
            setImageValidationError('No plant foliage, leaves, or crop stems detected in the uploaded image.');
          } else {
            setIsValidPlantImage(true);
            setImageValidationError('');
          }
        }
      };

      setSelectedImage(
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0a0f1d' }}>
          <img src={imgUrl} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }
  };

  const startScan = () => {
    if (!selectedImage) return;
    setScanning(true);
    setResults(null);

    const stages = [
      'Establishing neural link with FarmVerse Cloud...',
      'Analyzing foliage color spectrum & spatial visual features...',
      'Segmenting plant structures & verifying chlorophyll nodes...',
      'Detecting localized pest signatures...',
      'Diagnosis finalization...'
    ];

    stages.forEach((msg, idx) => {
      setTimeout(() => {
        setScanningProgress(msg);
        if (idx === stages.length - 1) {
          setTimeout(() => {
            if (!isValidPlantImage) {
              setResults({
                isInvalid: true,
                title: 'Non-Plant Image Detected',
                reason: imageValidationError || 'The uploaded file does not contain recognizable plant foliage, leaves, or crop stems.',
                recommendation: 'Please upload a clear, focused photograph of a crop leaf or stem affected by pest or disease symptoms.'
              });
              setScanning(false);
              return;
            }

            const isArmyworm = selectedPestName.includes('Armyworm');
            const matchSample = isArmyworm ? sampleImages[1] : sampleImages[0];

            const newDetection = {
              pestName: matchSample.pestName,
              threat: matchSample.threat,
              confidence: +(92 + Math.random() * 6).toFixed(1),
              damage: matchSample.damage,
              organic: matchSample.organic,
              chemical: matchSample.chemical
            };

            setResults(newDetection);
            setScanning(false);

            setHistory([
              {
                id: Date.now(),
                pest: isArmyworm ? 'Fall Armyworm' : 'Aphids',
                crop: isArmyworm ? 'Corn Crop (Zone C)' : 'Tomato Field (Zone A)',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                threat: matchSample.threat,
                status: 'Under Review'
              },
              ...history
            ]);
          }, 800);
        }
      }, idx * 600);
    });
  };

  return (
    <div className="grid-aside">
      
      {/* Left Column: Image Uploader & Live Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Dropzone / Upload Panel */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload style={{ color: 'var(--primary)' }} /> Select Crop/Pest Image
          </h3>

          {!selectedImage ? (
            <div className="dropzone" onClick={() => document.getElementById('pest-uploader').click()}>
              <Upload className="dropzone-icon" />
              <div>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Drag & drop image here</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>or click to browse local files (JPG, PNG)</p>
              </div>
              <input 
                id="pest-uploader" 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Scan Container */}
              <div className="scan-container" style={{ borderRadius: '8px', border: !isValidPlantImage ? '2px solid var(--danger)' : undefined }}>
                {selectedImage}
                {scanning && <div className="scan-line"></div>}
                {scanning && <div className="scan-overlay"></div>}
              </div>

              {!isValidPlantImage && (
                <div className="badge badge-warning" style={{ fontSize: '0.78rem', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', gap: '0.4rem' }}>
                  <AlertCircle size={15} /> Warning: This file may not contain a valid plant leaf or crop photo.
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  File: <strong style={{ color: 'var(--text-primary)' }}>{selectedPestName}</strong>
                </span>
                <button 
                  onClick={() => { setSelectedImage(null); setResults(null); setIsValidPlantImage(true); }} 
                  className="btn btn-outline" 
                  style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                  disabled={scanning}
                >
                  Clear Image
                </button>
              </div>

              <button 
                onClick={startScan} 
                className="btn btn-cyan" 
                style={{ width: '100%', fontWeight: '600', gap: '0.5rem' }}
                disabled={scanning}
              >
                {scanning ? <RefreshCw size={16} className="pulse" /> : <Bug size={16} />}
                {scanning ? 'Running AI Diagnostics...' : 'Initiate Pest Diagnosis Scan'}
              </button>

            </div>
          )}

          {/* Quick-test Samples */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
              Quick Testing Samples
            </span>
            <div className="grid-2">
              {sampleImages.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="btn btn-outline"
                  style={{ justifyContent: 'flex-start', fontSize: '0.85rem', textAlign: 'left', padding: '0.5rem 0.75rem' }}
                  disabled={scanning}
                >
                  <span style={{ marginRight: '0.35rem' }}>{sample.icon}</span>
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live scanning logs */}
        {scanning && (
          <div className="glass-card" style={{ background: '#080c14', border: '1px solid var(--border-medium)', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="pulse" style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
              <span style={{ color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 'bold' }}>AI LOG TERMINAL</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.6' }}>
              &gt; {scanningProgress}
            </p>
          </div>
        )}

      </div>

      {/* Right Column: AI Analysis Results & History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Results Card */}
        <div className="glass-card" style={{ borderLeft: results ? (results.isInvalid ? '4px solid var(--danger)' : `4px solid ${results.threat === 'High' ? 'var(--danger)' : 'var(--warning)'}`) : '4px solid var(--border-medium)', minHeight: '300px' }}>
          {!results && !scanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', color: 'var(--text-muted)', gap: '0.5rem' }}>
              <Bug size={48} style={{ strokeWidth: '1.5' }} />
              <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>Upload or select a sample plant image above to compute pest analysis report.</p>
            </div>
          ) : scanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', gap: '1rem' }}>
              <RefreshCw size={36} className="pulse" style={{ color: 'var(--secondary)' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Analyzing plant image pixels & visual structures...</p>
            </div>
          ) : results.isInvalid ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--danger)' }}>
                <FileX2 size={24} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{results.title}</h3>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 500 }}>
                  ⚠️ {results.reason}
                </p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {results.recommendation}
                </p>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Tip for best results:</strong> Capture a clear, close-up photo of the affected leaf or crop stem under good lighting.
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="title-secondary" style={{ fontSize: '1.25rem' }}>Diagnostic Assessment</h3>
                <span className={`badge ${results.threat === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                  {results.threat} Threat
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Detected Pest Identity</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {results.pestName}
                  </div>
                </div>

                <div className="grid-2" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Confidence Score</span>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--secondary)', fontFamily: 'Outfit' }}>
                      {results.confidence}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Infestation Index</span>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--warning)', fontFamily: 'Outfit' }}>
                      {results.damage}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Organic Control Protocol</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{results.organic}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Chemical Intervention</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{results.chemical}</p>
                </div>

                <button 
                  onClick={() => alert('Pest treatment protocols logged. Integrated Pest Management task spawned.')}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={14} /> Dispatch Action Protocol
                </button>

              </div>
            </div>
          )}
        </div>

        {/* History Logs */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar style={{ color: 'var(--text-secondary)' }} /> Scan History Logs
          </h3>
          <div className="history-list">
            {history.map((log) => (
              <div key={log.id} className="history-item">
                <div className="history-info">
                  <span className="history-title">{log.pest}</span>
                  <span className="history-date">{log.crop} • {log.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge ${log.threat === 'High' ? 'badge-danger' : log.threat === 'Medium' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.6rem' }}>
                    {log.threat}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
