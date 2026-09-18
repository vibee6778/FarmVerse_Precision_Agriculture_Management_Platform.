import React from 'react';
import { Compass, Tractor, Droplets, FlaskConical, MapPinned } from 'lucide-react';

const features = [
  { icon: Tractor, title: 'Farm records', text: 'Keep every plot, crop and soil type in one place.' },
  { icon: Droplets, title: 'Moisture tracking', text: 'Follow soil moisture movement across the week.' },
  { icon: FlaskConical, title: 'Nutrient profile', text: 'Nitrogen, phosphorus and potassium at a glance.' },
  { icon: MapPinned, title: 'Multi-location', text: 'Manage farms across districts from one dashboard.' },
];

export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <div className="logo-section" style={{ marginBottom: '3rem' }}>
          <Compass className="logo-icon pulse" />
          <span className="logo-text">FarmVerse</span>
        </div>

        <div>
          <h1 className="title-gradient" style={{ fontSize: '2.2rem', lineHeight: 1.25, marginBottom: '1rem' }}>
            Smart Farming.<br />Better Decisions.<br />Sustainable Growth.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '420px' }}>
            FarmVerse brings your farm records, soil health, and market data together
            so every decision in the field is backed by data.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            {features.map(({ icon: Icon, title, text }) => (
              <div className="auth-feature" key={title}>
                <div className="auth-feature-icon"><Icon size={19} /></div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
          Precision Agriculture Management System · Frontend demo
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">{children}</div>
      </section>
    </div>
  );
}
