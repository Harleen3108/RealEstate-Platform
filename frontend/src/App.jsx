import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyMarketplace from './pages/PropertyMarketplace';
import PropertyDetail from './pages/PropertyDetail';
import DashboardLayout from './layouts/DashboardLayout';
import AgencyDashboard from './pages/agency/Dashboard';
import AllProperties from './pages/agency/Properties/AllProperties';
import AddProperty from './pages/agency/Properties/AddProperty';
import AllLeads from './pages/agency/Leads/AllLeads';
import SalesPipeline from './pages/agency/Leads/SalesPipeline';
import AddLead from './pages/agency/Leads/AddLead';
import AgencyNotifications from './pages/agency/Notifications';
import AgencyProfile from './pages/agency/Profile';
import AgencySettings from './pages/agency/Settings';
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
              <Route path="agency" element={<AgencyDashboard />} />
              <Route path="agency/properties" element={<AllProperties />} />
              <Route path="agency/properties/add" element={<AddProperty />} />
              <Route path="agency/properties/edit/:id" element={<AddProperty />} />
              <Route path="agency/leads" element={<AllLeads />} />
              <Route path="agency/leads/pipeline" element={<SalesPipeline />} />
              <Route path="agency/leads/add" element={<AddLead />} />
              <Route path="agency/notifications" element={<AgencyNotifications />} />
              <Route path="agency/profile" element={<AgencyProfile />} />
              <Route path="agency/settings" element={<AgencySettings />} />
              
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
