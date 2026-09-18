import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import DashboardHeader from './components/DashboardHeader';
import ToastContainer from './components/common/ToastContainer';

import Login from './pages/auth/Login';
import SimpleAuthPage from './pages/auth/SimpleAuthPage';

import FarmerManagement from './pages/FarmerManagement';
import CropManagement from './pages/CropManagement';
import SoilMonitoring from './pages/SoilMonitoring';
import WeatherMonitoring from './pages/WeatherMonitoring';
import Irrigation from './pages/Irrigation';
import Fertilizer from './pages/Fertilizer';
import PestDetection from './pages/PestDetection';
import DiseaseDetection from './pages/DiseaseDetection';
import CropYieldPrediction from './pages/CropYieldPrediction';
import MarketPriceTracking from './pages/MarketPriceTracking';

function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('farmers');

  const renderActivePage = () => {
    switch (activeTab) {
      case 'farmers':
        return <FarmerManagement />;
      case 'crops':
        return <CropManagement />;
      case 'soil':
        return <SoilMonitoring />;
      case 'weather':
        return <WeatherMonitoring />;
      case 'irrigation':
        return <Irrigation />;
      case 'fertilizer':
        return <Fertilizer />;
      case 'pest':
        return <PestDetection />;
      case 'disease':
        return <DiseaseDetection />;
      case 'yield':
        return <CropYieldPrediction />;
      case 'market':
        return <MarketPriceTracking />;
      default:
        return <FarmerManagement />;
    }
  };

  return (
    <div className="app-container">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="main-content">
        <DashboardHeader activeTab={activeTab} />
        <div style={{ marginTop: '0.5rem' }}>{renderActivePage()}</div>
      </main>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('farmverse_logged_in') === 'true' &&
      !!localStorage.getItem('farmverse_token') &&
      !!localStorage.getItem('farmverse_user');
  });

  const handleLogin = (userData) => {
    sessionStorage.setItem('farmverse_logged_in', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('farmverse_logged_in');
    localStorage.removeItem('farmverse_token');
    localStorage.removeItem('farmverse_user');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
      <Route path="/create-account" element={<SimpleAuthPage type="create" />} />
      <Route path="/forgot-password" element={<SimpleAuthPage type="forgot" />} />
      <Route
        path="/dashboard/*"
        element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
