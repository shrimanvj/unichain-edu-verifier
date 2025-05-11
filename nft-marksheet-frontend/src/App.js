import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import WalletProvider from './context/WalletContext';
import Home from './components/Home';
import IssuerDashboard from './components/IssuerDashboard';
import StudentDashboard from './components/StudentDashboard';
import DashboardRouter from './components/DashboardRouter';
import './styles/main.css';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issuer" element={<IssuerDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </WalletProvider>
  );
}

export default App;
