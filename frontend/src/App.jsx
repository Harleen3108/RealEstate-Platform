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
import NotificationHub from './components/common/NotificationHub';
import AgencyProfile from './pages/agency/Profile';
import AgencySettings from './pages/agency/Settings';
import InvestorDashboard from './pages/dashboards/InvestorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import UserLayout from './layouts/UserLayout';
import UserDashboard from './pages/user/Dashboard';
import BrowseProperties from './pages/user/BrowseProperties';
import SavedProperties from './pages/user/SavedProperties';
import MyEnquiries from './pages/user/MyEnquiries';
import UserProfile from './pages/user/Profile';
import UserSettings from './pages/user/Settings';
import PriceIntelligenceDashboard from './pages/estimation/PriceIntelligenceDashboard';
import PropertyComparisonView from './pages/estimation/PropertyComparisonView';
import EMICalculator from './components/estimation/EMICalculator';
import ArticlesBlog from './pages/ArticlesBlog';
import ArticleDetail from './pages/ArticleDetail';
import TenantDocuments from './pages/TenantDocuments';

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
            <Route path="/calculator/emi" element={<EMICalculator />} />
            <Route path="/articles" element={<ArticlesBlog />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="agency" element={<AgencyDashboard />} />
              <Route path="agency/properties" element={<AllProperties />} />
              <Route path="agency/properties/add" element={<AddProperty />} />
              <Route path="agency/properties/edit/:id" element={<AddProperty />} />
              <Route path="agency/leads" element={<AllLeads />} />
              <Route path="agency/leads/pipeline" element={<SalesPipeline />} />
              <Route path="agency/leads/add" element={<AddLead />} />
              <Route path="agency/notifications" element={<NotificationHub />} />
              <Route path="agency/profile" element={<AgencyProfile />} />
              <Route path="agency/settings" element={<AgencySettings />} />
              <Route path="agency/price-intelligence" element={<PriceIntelligenceDashboard />} />
              <Route path="agency/compare" element={<PropertyComparisonView />} />

              <Route path="investor/notifications" element={<NotificationHub />} />
              <Route path="investor/price-intelligence" element={<PriceIntelligenceDashboard />} />
              <Route path="investor/compare" element={<PropertyComparisonView />} />
              <Route path="investor/:tab?" element={<InvestorDashboard />} />
              <Route path="admin/notifications" element={<NotificationHub />} />
              <Route path="admin/price-intelligence" element={<PriceIntelligenceDashboard />} />
              <Route path="admin/compare" element={<PropertyComparisonView />} />
              <Route path="admin/:tab?" element={<AdminDashboard />} />
              <Route path="buyer/notifications" element={<NotificationHub />} />
              <Route path="buyer/price-intelligence" element={<PriceIntelligenceDashboard />} />
              <Route path="buyer/compare" element={<PropertyComparisonView />} />
              <Route path="buyer/:tab?" element={<BuyerDashboard />} />
            </Route>

            {/* New User Panel Portal */}
            <Route path="/dashboard/user" element={<UserLayout />}>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="browse" element={<BrowseProperties />} />
              <Route path="saved" element={<SavedProperties />} />
              <Route path="notifications" element={<NotificationHub />} />
              <Route path="enquiries" element={<MyEnquiries />} />
              <Route path="price-intelligence" element={<PriceIntelligenceDashboard />} />
              <Route path="compare" element={<PropertyComparisonView />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>

            {/* Tenant Documents */}
            <Route path="/tenant/documents" element={<TenantDocuments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
