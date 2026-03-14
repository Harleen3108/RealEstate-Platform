import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyMarketplace from './pages/PropertyMarketplace';
import PropertyDetail from './pages/PropertyDetail';
import DashboardLayout from './layouts/DashboardLayout';
import AgencyDashboard from './pages/dashboards/AgencyDashboard';
import InvestorDashboard from './pages/dashboards/InvestorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/marketplace" element={<PropertyMarketplace />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="agency/:tab?" element={<AgencyDashboard />} />
              <Route path="investor/:tab?" element={<InvestorDashboard />} />
              <Route path="admin/:tab?" element={<AdminDashboard />} />
              <Route path="buyer/:tab?" element={<BuyerDashboard />} />
            </Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
