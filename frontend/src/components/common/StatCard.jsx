import React from 'react';

const colorMap = {
  primary: { bg: 'rgba(16, 185, 129, 0.12)', fg: 'var(--primary)' },
  secondary: { bg: 'rgba(6, 182, 212, 0.12)', fg: 'var(--secondary)' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', fg: 'var(--warning)' },
  info: { bg: 'rgba(59, 130, 246, 0.12)', fg: 'var(--info)' },
};

export default function StatCard({ title, value, subtitle, icon, color = 'primary' }) {
  const c = colorMap[color] || colorMap.primary;
  return (
    <div className="glass-card stat-card">
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ background: c.bg, color: c.fg }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
    </div>
  );
}
