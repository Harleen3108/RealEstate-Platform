import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle,
  BarChart3,
  UserPlus,
  ShieldBan,
  ShieldCheck,
  Mail,
  Phone,
  Info,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  TrendingUp,
  Clock,
  MapPin,
  Search,
  Filter,
  X,
  PlusCircle,
  UserCheck,
  Activity,
  Database,
  Globe,
  ChevronRight,
  Home,
  FileText,
  Edit,
  Save,
  Upload,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [stats, setStats] = useState({
    totalInvestors: 0,
    totalLeads: 0,
    totalUsers: 0,
    totalAgencies: 0, // Added missing totalAgencies
    totalInvestedValue: 0,
    activeListings: 0,
    pendingAgencies: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsAnalytics, setLeadsAnalytics] = useState({
    summary: { totalLeads: 0, contactedLeads: 0, closedLeads: 0, conversionRate: "0%" },
    sourcePerformance: [],
    volumeTrend: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tab || "stats");
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyFilterStatus, setPropertyFilterStatus] = useState("All");

  // Management States
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [agencyDetails, setAgencyDetails] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [showCreateAgency, setShowCreateAgency] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    website: "",
    description: "",
  });

  const [showPropForm, setShowPropForm] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [propData, setPropData] = useState({
    title: "",
    description: "",
    location: "",
    propertyType: "Apartment",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
    status: "Available",
    agency: "", // Required for Admin creation
    images: [],
    documents: [],
  });

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    propertyId: "",
    agencyId: "",
    message: "",
    status: "New Lead",
    source: "Direct",
  });

  const agencies = users.filter((u) => u.role === "Agency");

  // Property Filters state
  const [propertyFilters, setPropertyFilters] = useState({
    type: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  const filteredProperties = properties.filter((p) => {
    const matchesType =
      !propertyFilters.type || p.propertyType === propertyFilters.type;
    const matchesLocation =
      !propertyFilters.location ||
      p.location.toLowerCase().includes(propertyFilters.location.toLowerCase());
    const matchesSearch =
      !propertySearch ||
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.description.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesModeration =
      propertyFilterStatus === "All" ||
      (propertyFilterStatus === "Approved" && p.isApproved) ||
      (propertyFilterStatus === "Pending" && !p.isApproved) ||
      (propertyFilterStatus === "Blocked" && p.status === "Blocked");

    return matchesType && matchesLocation && matchesSearch && matchesModeration;
  });

  useEffect(() => {
    if (tab) {
      const tabMap = {
        agencies: "agencies",
        investors: "investors",
        users: "users",
        properties: "properties",
        leads: "leads",
        settings: "settings",
      };
      setActiveTab(tabMap[tab] || "stats");
    } else {
      setActiveTab("stats");
    }
  }, [tab]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, propertiesRes, leadsRes, leadsAnalyticsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats"),
        axios.get("http://localhost:5000/api/admin/users"),
        axios.get("http://localhost:5000/api/properties"),
        axios.get("http://localhost:5000/api/leads"),
        axios.get("http://localhost:5000/api/admin/lead-analytics"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProperties(propertiesRes.data);
      setLeads(leadsRes.data);
      setLeadsAnalytics(leadsAnalyticsRes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchAgencyDetail = async (id) => {
    setFetchingDetails(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/users/${id}/details`,
      );
      setAgencyDetails(
        data.agencyData
          ? {
              agency: data.user,
              properties: data.agencyData.properties,
              leads: data.enquiries,
            }
          : null,
      );
      // If it was just a general user, we might use a different state, but let's keep it consistent
      if (data.user.role === "Agency") {
        setSelectedAgency(id);
      } else {
        setUserDetails(data);
        setSelectedUser(id);
      }
      setFetchingDetails(false);
    } catch (error) {
      console.error(error);
      setFetchingDetails(false);
    }
  };

  const fetchUserDetails = async (id) => {
    setFetchingDetails(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/admin/users/${id}/details`,
      );
      setUserDetails(data);
      setSelectedUser(id);
      setFetchingDetails(false);
    } catch (error) {
      console.error(error);
      setFetchingDetails(false);
    }
  };

  const handleBlockUser = async (id, isBlocked) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${id}/block`, {
        isBlocked,
      });
      fetchAdminData(); // Refresh list
      if (userDetails?.user._id === id) {
        setUserDetails({
          ...userDetails,
          user: { ...userDetails.user, isBlocked },
        });
      }
    } catch (error) {
      alert("Failed to update block status");
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this user and all associated data?",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
      fetchAdminData();
      if (selectedAgency?._id === id) setSelectedAgency(null);
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const handleApproveProperty = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/properties/${id}/approve`,
      );
      fetchAdminData();
    } catch (error) {
      console.error("Property Approval Error:", error);
      alert(`Failed to approve listing: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleBlockProperty = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/properties/${id}/block`,
      );
      fetchAdminData();
    } catch (error) {
      console.error("Property Block Error:", error);
      alert(
        `Failed to update moderation status: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
      );
      if (type === "image") {
        setPropData((prev) => ({
          ...prev,
          images: [...prev.images, data.url],
        }));
      } else {
        setPropData((prev) => ({
          ...prev,
          documents: [...prev.documents, data.url],
        }));
      }
    } catch (error) {
      alert("File upload failed");
    }
  };

  const handlePropSubmit = async (e) => {
    e.preventDefault();

    // Ensure agency is selected for administrative listings
    if (!propData.agency) {
      alert("Critical Requirement: Please assign this listing to a Responsible Agency.");
      return;
    }

    try {
      const payload = {
        ...propData,
        amenities:
          typeof propData.amenities === "string"
            ? propData.amenities
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
            : propData.amenities,
      };
      if (editingProp) {
        await axios.put(
          `http://localhost:5000/api/properties/${editingProp._id}`,
          payload,
        );
      } else {
        await axios.post("http://localhost:5000/api/properties", payload);
      }
      setShowPropForm(false);
      setEditingProp(null);
      setPropData({
        title: "",
        description: "",
        location: "",
        propertyType: "Apartment",
        price: "",
        size: "",
        bedrooms: "",
        bathrooms: "",
        amenities: "",
        status: "Available",
        agency: "",
        images: [],
        documents: [],
      });
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  const handleEditProp = (prop) => {
    setEditingProp(prop);
    setPropData({
      ...prop,
      amenities: prop.amenities.join(", "),
      agency: prop.agency?._id || prop.agency,
    });
    setShowPropForm(true);
  };

  const handleDeleteProperty = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this listing?",
      )
    )
      return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/properties/${id}`);
      fetchAdminData();
    } catch (error) {
      console.error("Property Disposal Error:", error);
      alert(`Critical: Listing removal failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleApproveAgency = async (userId, isApproved) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/approve`,
        { isApproved },
      );
      setUsers(users.map((u) => (u._id === userId ? { ...u, isApproved } : u)));
      if (agencyDetails?.agency._id === userId) {
        setAgencyDetails({
          ...agencyDetails,
          agency: { ...agencyDetails.agency, isApproved },
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateAgency = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/admin/agencies", newAgency);
      setShowCreateAgency(false);
      setNewAgency({ name: "", email: "", password: "", phoneNumber: "" });
      fetchAdminData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create agency");
    }
  };

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    if (name === "propertyId") {
      const selectedProp = properties.find((p) => p._id === value);
      setNewLeadData({
        ...newLeadData,
        propertyId: value,
        agencyId: selectedProp?.agency?._id || selectedProp?.agency || "",
      });
    } else {
      setNewLeadData({ ...newLeadData, [name]: value });
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/leads", newLeadData);
      setShowLeadForm(false);
      setNewLeadData({
        name: "",
        email: "",
        phone: "",
        propertyId: "",
        agencyId: "",
        message: "",
        status: "New Lead",
        source: "Direct",
      });
      fetchAdminData();
      alert("Lead created successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add lead");
    }
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div
          className="glass"
          style={{
            padding: "2rem",
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Activity
            className="animate-pulse"
            size={40}
            color="var(--primary)"
          />
        </div>
      </div>
    );

  const activeAgencies = users.filter(
    (u) => u.role?.toLowerCase() === "agency",
  );
  const activeAgenciesSorted = [...activeAgencies].sort((a, b) =>
    b.createdAt > a.createdAt ? 1 : -1,
  );
  const activeInvestors = users.filter(
    (u) => u.role?.toLowerCase() === "investor",
  );
  const activeBuyers = users.filter((u) => u.role?.toLowerCase() === "buyer");
  const pendingAgenciesList = activeAgencies.filter((a) => !a.isApproved);

  return (
    <div className="animate-fade">
      {/* Back Button for Detail Views */}
      {(selectedAgency || selectedUser || selectedLead) && (
        <button
          className="btn btn-outline"
          onClick={() => {
            setSelectedAgency(null);
            setSelectedUser(null);
            setSelectedLead(null);
          }}
          style={{
            marginBottom: "1.5rem",
            border: "none",
            background: "transparent",
          }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
      )}

      {/* Platform Overview Dashboard */}
      {activeTab === "stats" && !selectedAgency && !selectedLead && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 1fr)",
            gap: "2rem",
          }}
        >
          {/* Left Column: Stats and Table */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <div>
              <h4
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "1.2rem",
                  letterSpacing: "1px",
                }}
              >
                Market Overview
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {[
                  {
                    label: "Total Assets Value",
                    value: `₹${(stats.totalInvestedValue / 1000000).toFixed(1)}M`,
                    trend: "+12%",
                    icon: TrendingUp,
                    color: "#14b8a6",
                  },
                  {
                    label: "Active Listings",
                    value: stats.activeListings || stats.totalProperties,
                    trend: "Live",
                    icon: Building2,
                    color: "var(--primary)",
                  },
                  {
                    label: "Total Users",
                    value:
                      (stats.totalUsers || 0) +
                      (stats.totalAgencies || 0) +
                      (stats.totalInvestors || 0),
                    trend: "+5.2%",
                    icon: Users,
                    color: "#6366f1",
                  },
                  {
                    label: "Pending Reviews",
                    value: stats.pendingAgencies || 0,
                    trend: "Action",
                    icon: ShieldAlert,
                    color: "#f59e0b",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="glass-card"
                    style={{
                      padding: "1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.6rem",
                          fontWeight: "800",
                          color: "var(--text)",
                        }}
                      >
                        {item.value}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          background: `${item.color}20`,
                          color: item.color,
                          fontWeight: "700",
                        }}
                      >
                        {item.trend}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        marginTop: "4px",
                      }}
                    >
                      From last month
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Listings Grid/Table */}
            <div
              className="glass-card"
              style={{
                padding: "0",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                    Recent Listings
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Monitor and approve newly submitted properties
                  </p>
                </div>
                <button
                  className="btn btn-outline"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}
                  onClick={() => setActiveTab("properties")}
                >
                  View All Properties
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--surface-light)" }}>
                    <tr style={{ textAlign: "left" }}>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Property
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Listed By
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Price
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          textAlign: "right",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.slice(0, 5).map((p) => (
                      <tr
                        key={p._id}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td
                          style={{ padding: "1rem 1.5rem", cursor: "pointer" }}
                          onClick={() => navigate(`/property/${p._id}`)}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                background: "var(--surface-light)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                              ) : (
                                <Building2 size={16} opacity={0.5} />
                              )}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: "600",
                                  color: "var(--text)",
                                }}
                              >
                                {p.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                ID: {p._id.slice(-8).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          {p.agency?.name || "Admin"}
                        </td>
                        <td
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                          }}
                        >
                          ₹${p.price.toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              background:
                                p.status === "Available"
                                  ? "#10b98120"
                                  : "#f59e0b20",
                              color:
                                p.status === "Available"
                                  ? "#10b981"
                                  : "#f59e0b",
                              fontWeight: "800",
                            }}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>
                        <td
                          style={{ padding: "1rem 1.5rem", textAlign: "right" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={() => navigate(`/property/${p._id}`)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--primary)",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Info size={14} /> VIEW
                            </button>
                            {!p.isApproved && (
                              <button
                                onClick={() => handleApproveProperty(p._id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#10b981",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <CheckCircle size={14} /> APPROVE
                              </button>
                            )}
                            <button
                              onClick={() => handleBlockProperty(p._id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: p.status === "Blocked" ? "#f59e0b" : "#ef4444",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {p.status === "Blocked" ? (
                                <>
                                  <ShieldCheck size={14} /> UNBLOCK
                                </>
                              ) : (
                                <>
                                  <ShieldBan size={14} /> BLOCK
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Actions and Status */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
            <div>
              <h4
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "1.2rem",
                  letterSpacing: "1px",
                }}
              >
                Quick Actions
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                {[
                  {
                    label: "Add New Listing",
                    icon: PlusCircle,
                    action: () => {
                      setActiveTab("properties");
                      setShowPropForm(true);
                      setEditingProp(null);
                    },
                  },
                  {
                    label: "Invite Agency",
                    icon: UserPlus,
                    action: () => {
                      setActiveTab("agencies");
                      setShowCreateAgency(true);
                    },
                  },
                  {
                    label: "Generate Report",
                    icon: BarChart3,
                    action: () => alert("Report engine initializing..."),
                  },
                ].map((btn, i) => (
                  <button
                    key={i}
                    onClick={btn.action}
                    className="glass-card"
                    style={{
                      padding: "1.2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      transition: "var(--transition)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <btn.icon size={18} color="var(--primary)" />
                      <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                        {btn.label}
                      </span>
                    </div>
                    <ChevronRight size={16} opacity={0.5} />
                  </button>
                ))}
              </div>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "1.5rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "1.5rem",
                  letterSpacing: "1px",
                }}
              >
                System Status
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                {[
                  {
                    label: "Database",
                    status: "Stable",
                    icon: Database,
                    color: "#10b981",
                  },
                  {
                    label: "API Gateway",
                    status: "99.9%",
                    icon: Globe,
                    color: "#10b981",
                  },
                  {
                    label: "Storage",
                    status: "82% Full",
                    icon: ShieldCheck,
                    color: "#f59e0b",
                  },
                ].map((sys, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <sys.icon size={16} color="var(--text-muted)" />
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {sys.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "800",
                        color: sys.color,
                      }}
                    >
                      {sys.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Tabs Refined with the same aesthetic */}
      {/* Redesigned Agency Management Tab */}
      {activeTab === "agencies" && (
        <div className="animate-fade">
          {/* Header Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.8rem",
                  fontWeight: "800",
                  marginBottom: "0.4rem",
                }}
              >
                Agency Management
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                Oversee and regulate {activeAgencies.length} registered firms
                across the network.
              </p>
            </div>
            {!selectedAgency && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateAgency(!showCreateAgency)}
                style={{
                  padding: "0.8rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 10px 20px -5px rgba(194, 65, 12, 0.3)",
                }}
              >
                <UserPlus size={18} />{" "}
                {showCreateAgency ? "Back to Inventory" : "Invite New Agency"}
              </button>
            )}
          </div>

          {!selectedAgency ? (
            <div className="glass-card" style={{ padding: "0" }}>
              {showCreateAgency ? (
                <div style={{ padding: "2rem" }} className="animate-fade">
                  <form
                    onSubmit={handleCreateAgency}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "1.5rem",
                      padding: "2rem",
                      background: "var(--surface-light)",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="input-group">
                      <label>Firm Name</label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={newAgency.name}
                        onChange={(e) =>
                          setNewAgency({ ...newAgency, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        className="input-control"
                        required
                        value={newAgency.email}
                        onChange={(e) =>
                          setNewAgency({ ...newAgency, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Initial Password</label>
                      <input
                        type="password"
                        className="input-control"
                        required
                        value={newAgency.password}
                        onChange={(e) =>
                          setNewAgency({
                            ...newAgency,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={newAgency.phoneNumber}
                        onChange={(e) =>
                          setNewAgency({
                            ...newAgency,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                          width: "100%",
                          padding: "1rem",
                          fontWeight: "800",
                        }}
                      >
                        Confirm Business Registration
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      padding: "1.5rem",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search
                        size={16}
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-muted)",
                        }}
                      />
                      <input
                        className="input-control"
                        placeholder="Search agencies..."
                        style={{
                          background: "var(--surface-light)",
                          paddingLeft: "38px",
                          border: "1px solid var(--border)",
                        }}
                      />
                    </div>
                    <select
                      className="input-control"
                      style={{
                        width: "150px",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <option>Verified First</option>
                      <option>Pending First</option>
                    </select>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <th
                            style={{
                              padding: "1rem 1.5rem",
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              fontWeight: "800",
                            }}
                          >
                            FIRM IDENTITY
                          </th>
                          <th
                            style={{
                              padding: "1rem 1.5rem",
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              fontWeight: "800",
                            }}
                          >
                            VERIFICATION
                          </th>
                          <th
                            style={{
                              padding: "1rem 1.5rem",
                              fontSize: "0.7rem",
                              color: "var(--text-muted)",
                              fontWeight: "800",
                              textAlign: "right",
                            }}
                          >
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAgencies.map((agency) => (
                          <tr
                            key={agency._id}
                            style={{ borderBottom: "1px solid var(--border)" }}
                            className="hover-light"
                            onClick={() => fetchAgencyDetail(agency._id)}
                          >
                            <td
                              style={{
                                padding: "1.2rem 1.5rem",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: "var(--primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "800",
                                    color: "white",
                                  }}
                                >
                                  {agency.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    {agency.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {agency.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "1.2rem 1.5rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: agency.isApproved
                                      ? "#10b981"
                                      : "#f59e0b",
                                  }}
                                ></div>
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    fontWeight: "700",
                                    color: agency.isApproved
                                      ? "#10b981"
                                      : "#f59e0b",
                                  }}
                                >
                                  {agency.isApproved
                                    ? "VERIFIED"
                                    : "PENDING REVIEW"}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "1.2rem 1.5rem",
                                textAlign: "right",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  className="btn btn-outline"
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    borderColor: "rgba(255,255,255,0.1)",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchAgencyDetail(agency._id);
                                  }}
                                >
                                  View
                                </button>
                                <button
                                  className="btn btn-outline"
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    borderColor: "rgba(255,255,255,0.1)",
                                    color: "#ef4444",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(agency._id);
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            agencyDetails && (
              <div className="animate-fade">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "350px 1fr",
                    gap: "2rem",
                  }}
                >
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "1.5rem",
                          background: "var(--primary)",
                          margin: "0 auto 1.2rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          fontWeight: "900",
                          color: "white",
                        }}
                      >
                        {agencyDetails.agency.name.slice(0, 2).toUpperCase()}
                      </div>
                      <h4 style={{ fontSize: "1.5rem", fontWeight: "900" }}>
                        {agencyDetails.agency.name}
                      </h4>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {agencyDetails.agency.email}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        marginBottom: "2rem",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          padding: "1rem",
                          borderRadius: "1rem",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                          }}
                        >
                          Asset Inventory
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                          }}
                        >
                          <div
                            style={{ fontSize: "1.5rem", fontWeight: "800" }}
                          >
                            {agencyDetails.properties.length}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#10b981",
                              fontWeight: "700",
                            }}
                          >
                            Properties
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          padding: "1rem",
                          borderRadius: "1rem",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                          }}
                        >
                          Lead Flow
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                          }}
                        >
                          <div
                            style={{ fontSize: "1.5rem", fontWeight: "800" }}
                          >
                            {agencyDetails.leads.length}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--primary)",
                              fontWeight: "700",
                            }}
                          >
                            Active Conversions
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleApproveAgency(
                            agencyDetails.agency._id,
                            !agencyDetails.agency.isApproved,
                          )
                        }
                        className="btn btn-primary"
                        style={{
                          width: "100%",
                          background: agencyDetails.agency.isApproved
                            ? "#ef4444"
                            : "var(--primary)",
                          border: "none",
                          boxShadow: agencyDetails.agency.isApproved
                            ? "none"
                            : "0 10px 20px -5px rgba(194, 65, 12, 0.3)",
                        }}
                      >
                        {agencyDetails.agency.isApproved
                          ? "Revoke Agency Access"
                          : "Approve Firm Identity"}
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{
                          width: "100%",
                          border: "none",
                          color: "var(--text-muted)",
                        }}
                      >
                        Contact Agency Principal
                      </button>
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "2rem",
                      }}
                    >
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                        Firms Portfolio
                      </h4>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {agencyDetails.properties.length} total listings
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "1.2rem",
                      }}
                    >
                      {agencyDetails.properties.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => navigate(`/property/${p._id}`)}
                          className="hover-card"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            padding: "1.2rem",
                            borderRadius: "1.2rem",
                            border: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "700",
                              fontSize: "0.95rem",
                              marginBottom: "0.5rem",
                              color: "var(--text)",
                            }}
                          >
                            {p.title}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "0.9rem",
                                color: "var(--primary)",
                                fontWeight: "900",
                              }}
                            >
                              ₹${p.price.toLocaleString()}
                            </div>
                            <span
                              style={{
                                fontSize: "0.65rem",
                                fontWeight: "800",
                                color: "var(--text-muted)",
                                background: "rgba(255,255,255,0.08)",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                textTransform: "uppercase",
                              }}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Redesigned Property Management Tab */}
      {activeTab === "properties" && (
        <div className="animate-fade">
          {/* Header with Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              {
                label: "TOTAL LISTINGS",
                value: stats.totalProperties,
                icon: Building2,
                trend: "+5.2%",
                trendLabel: "vs last month",
                color: "var(--primary)",
              },
              {
                label: "ACTIVE LISTINGS",
                value:
                  stats.activeListings ||
                  properties.filter((p) => p.status === "Available").length,
                icon: Home,
                trend: "+2.1%",
                trendLabel: "avg. occupancy",
                color: "#f59e0b",
              },
              {
                label: "PLATFORM REVENUE",
                value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,
                icon: TrendingUp,
                trend: "Managed",
                trendLabel: "1% fee est.",
                color: "var(--primary)",
              },
              {
                label: "PENDING REVIEWS",
                value: stats.pendingAgencies || 0,
                icon: ShieldAlert,
                trend: "Action",
                trendLabel: "Needs review",
                color: "#ef4444",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: "var(--text-muted)",
                    }}
                  >
                    {card.label}
                  </span>
                  <div
                    style={{
                      background: "var(--surface-light)",
                      padding: "6px",
                      borderRadius: "6px",
                    }}
                  >
                    <card.icon size={16} color={card.color} />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "900",
                    marginBottom: "0.4rem",
                    color: "var(--text)",
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      color: card.trend.startsWith("+") ? "#10b981" : "#ef4444",
                      fontWeight: "700",
                    }}
                  >
                    {card.trend}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {card.trendLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* Property Management Form */}
              {showPropForm && (
                <div
                  className="glass-card animate-fade"
                  style={{
                    marginBottom: "3rem",
                    border: "1px solid var(--primary)",
                    background: "var(--surface)",
                    padding: "2rem",
                    borderRadius: "1.2rem",
                  }}
                >
                  <h5
                    style={{
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "var(--text)",
                      fontWeight: "800",
                    }}
                  >
                    <PlusCircle size={20} color="var(--primary)" />{" "}
                    {editingProp ? "Edit Listing Data" : "New Property Details"}
                  </h5>
                  <form
                    onSubmit={handlePropSubmit}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      className="input-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label style={{ color: "var(--text-muted)" }}>
                        Headline Title
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={propData.title}
                        onChange={(e) =>
                          setPropData({ ...propData, title: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        required
                        value={propData.price}
                        onChange={(e) =>
                          setPropData({ ...propData, price: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div
                      className="input-group"
                      style={{ gridColumn: "span 3" }}
                    >
                      <label style={{ color: "var(--text-muted)" }}>
                        Description
                      </label>
                      <textarea
                        className="input-control"
                        rows="3"
                        required
                        value={propData.description}
                        onChange={(e) =>
                          setPropData({
                            ...propData,
                            description: e.target.value,
                          })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      ></textarea>
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Location / City
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        required
                        value={propData.location}
                        onChange={(e) =>
                          setPropData({ ...propData, location: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Property Category
                      </label>
                      <select
                        className="input-control"
                        value={propData.propertyType}
                        onChange={(e) =>
                          setPropData({
                            ...propData,
                            propertyType: e.target.value,
                          })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          width: "100%",
                          padding: "0.8rem",
                          borderRadius: "8px",
                        }}
                      >
                        <option>Apartment</option>
                        <option>Villa</option>
                        <option>Commercial</option>
                        <option>Land</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Responsible Agency
                      </label>
                      <select
                        className="input-control"
                        required
                        value={propData.agency}
                        onChange={(e) =>
                          setPropData({ ...propData, agency: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                          width: "100%",
                          padding: "0.8rem",
                          borderRadius: "8px",
                        }}
                      >
                        <option value="">Select Agency...</option>
                        {agencies.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name} ({a.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Area (sqft)
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        required
                        value={propData.size}
                        onChange={(e) =>
                          setPropData({ ...propData, size: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>Beds</label>
                      <input
                        type="number"
                        className="input-control"
                        value={propData.bedrooms}
                        onChange={(e) =>
                          setPropData({ ...propData, bedrooms: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text-muted)" }}>
                        Baths
                      </label>
                      <input
                        type="number"
                        className="input-control"
                        value={propData.bathrooms}
                        onChange={(e) =>
                          setPropData({
                            ...propData,
                            bathrooms: e.target.value,
                          })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div
                      className="input-group"
                      style={{ gridColumn: "span 3" }}
                    >
                      <label style={{ color: "var(--text-muted)" }}>
                        Amenities (comma separated)
                      </label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Pool, Gym, Parking, WiFi"
                        value={propData.amenities}
                        onChange={(e) =>
                          setPropData({ ...propData, amenities: e.target.value })
                        }
                        style={{
                          background: "var(--surface-light)",
                          border: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ color: "var(--text)" }}>
                        <Upload size={14} /> Upload Image
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "image")}
                        style={{ fontSize: "0.8rem", marginTop: "5px" }}
                      />
                      <div
                        style={{ display: "flex", gap: "5px", marginTop: "5px" }}
                      >
                        {propData.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "4px",
                              objectFit: "cover",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div
                      className="input-group"
                      style={{ gridColumn: "span 2" }}
                    >
                      <label style={{ color: "var(--text)" }}>
                        <FileText size={14} /> Property Documents
                      </label>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e, "doc")}
                        style={{ fontSize: "0.8rem", marginTop: "5px" }}
                      />
                      <div style={{ fontSize: "0.75rem", marginTop: "5px" }}>
                        {propData.documents.length} files attached
                      </div>
                    </div>
                    <div style={{ gridColumn: "span 3", display: "flex", gap: "1rem" }}>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ flex: 2, padding: "1rem" }}
                      >
                        <Save size={18} />{" "}
                        {editingProp ? "Finalize Updates" : "Publish Listing"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => { setShowPropForm(false); setEditingProp(null); }}
                        style={{ flex: 1, padding: "1rem" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Main Table Content */}
              <div
                className="glass-card"
                style={{
                  padding: "0",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.2rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search
                        size={16}
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "var(--text-muted)",
                        }}
                      />
                      <input
                        className="input-control"
                        placeholder="Search properties by title or location..."
                        style={{
                          background: "var(--surface-light)",
                          paddingLeft: "38px",
                          border: "1px solid var(--border)",
                        }}
                        value={propertySearch}
                        onChange={(e) => setPropertySearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="input-control"
                      style={{
                        width: "180px",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                      }}
                      value={propertyFilterStatus}
                      onChange={(e) => setPropertyFilterStatus(e.target.value)}
                    >
                      <option value="All">All Moderation</option>
                      <option value="Pending">Pending Review</option>
                      <option value="Approved">Approved Listings</option>
                      <option value="Blocked">Blocked / Banned</option>
                    </select>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--primary)",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                      }}
                    >
                      <Filter size={16} /> FILTERS:
                    </div>
                    <select
                      className="input-control"
                      style={{
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                        width: "auto",
                        padding: "6px 12px",
                        color: "var(--text)",
                      }}
                      value={propertyFilters.type}
                      onChange={(e) =>
                        setPropertyFilters({
                          ...propertyFilters,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="">All Types</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Villa">Villas</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Land">Land</option>
                    </select>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setPropertyFilters({
                          type: "",
                          location: "",
                          minPrice: "",
                          maxPrice: "",
                        });
                        setPropertySearch("");
                        setPropertyFilterStatus("All");
                      }}
                    >
                      Reset all views
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <th
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                          }}
                        >
                          PROPERTY
                        </th>
                        <th
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                          }}
                        >
                          FIRM
                        </th>
                        <th
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                          }}
                        >
                          MODERATION
                        </th>
                        <th
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                          }}
                        >
                          PRICE
                        </th>
                        <th
                          style={{
                            padding: "1rem 1.5rem",
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            textAlign: "right",
                          }}
                        >
                          GOVERNANCE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.slice(0, 5).map((p) => (
                        <tr
                          key={p._id}
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(`/property/${p._id}`)}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "8px",
                                  background: "var(--surface-light)",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={
                                    p.images?.[0] ||
                                    "https://via.placeholder.com/45"
                                  }
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "0.9rem",
                                    color: "var(--text)",
                                  }}
                                >
                                  {p.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {p.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              fontSize: "0.85rem",
                            }}
                          >
                            {p.agency?.name || "Private Seller"}
                          </td>
                          <td style={{ padding: "1rem 1.5rem" }}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  background: p.isApproved
                                    ? "rgba(16, 185, 129, 0.1)"
                                    : "rgba(245, 158, 11, 0.1)",
                                  color: p.isApproved ? "#10b981" : "#f59e0b",
                                  fontWeight: "800",
                                  width: "fit-content",
                                }}
                              >
                                {p.isApproved ? "APPROVED" : "PENDING"}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  color:
                                    p.status === "Blocked"
                                      ? "#ef4444"
                                      : "var(--text-muted)",
                                  fontWeight: "700",
                                }}
                              >
                                Market Status: {p.status}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              fontWeight: "800",
                              fontSize: "0.95rem",
                            }}
                          >
                            ${p.price?.toLocaleString()}
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              textAlign: "right",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                              }}
                            >
                              {!p.isApproved && (
                                <button
                                  title="Approve Listing"
                                  className="btn btn-outline"
                                  style={{
                                    padding: "6px",
                                    fontSize: "0.75rem",
                                    borderColor: "#10b981",
                                    color: "#10b981",
                                  }}
                                  onClick={() => handleApproveProperty(p._id)}
                                >
                                  <CheckCircle size={14} />
                                </button>
                              )}
                              <button
                                title={
                                  p.status === "Blocked"
                                    ? "Unblock Listing"
                                    : "Block Listing"
                                }
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor:
                                    p.status === "Blocked"
                                      ? "var(--primary)"
                                      : "#f59e0b",
                                  color:
                                    p.status === "Blocked"
                                      ? "var(--primary)"
                                      : "#f59e0b",
                                }}
                                onClick={() => handleBlockProperty(p._id)}
                              >
                                {p.status === "Blocked" ? (
                                  <ShieldCheck size={14} />
                                ) : (
                                  <ShieldBan size={14} />
                                )}
                              </button>
                               <button
                                title="Edit Listing"
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                }}
                                onClick={() => handleEditProp(p)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                title="Delete Listing"
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                  color: "#ef4444",
                                }}
                                onClick={() => handleDeleteProperty(p._id)}
                              >
                                <Trash2 size={14} />
                              </button>
                              <button
                                title="View Live"
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                }}
                                onClick={() => navigate(`/property/${p._id}`)}
                              >
                                <ExternalLink size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    padding: "1.2rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface-light)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                  >
                    Showing 1-5 of {filteredProperties.length} listings
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className={`btn btn-outline`}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.8rem",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      <ChevronRight
                        size={16}
                        style={{ transform: "rotate(180deg)" }}
                      />
                    </button>
                    <button
                      className={`btn btn-primary`}
                      style={{
                        width: "32px",
                        height: "32px",
                        padding: "0",
                        fontSize: "0.8rem",
                      }}
                    >
                      1
                    </button>
                    <button
                      className={`btn btn-outline`}
                      style={{
                        width: "32px",
                        height: "32px",
                        padding: "0",
                        fontSize: "0.8rem",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      2
                    </button>
                    <button
                      className={`btn btn-outline`}
                      style={{
                        padding: "4px 10px",
                        fontSize: "0.8rem",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Map Visualization Placeholder */}
              <div
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      color: "var(--text)",
                    }}
                  >
                    Regional Performance
                  </h4>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary)",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                    }}
                  >
                    View Full Map
                  </button>
                </div>
                <div
                  style={{
                    height: "240px",
                    background: "var(--surface-light)",
                    borderRadius: "1rem",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      background: "var(--surface)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      fontSize: "0.7rem",
                      color: "var(--text)",
                    }}
                  >
                    <div style={{ fontWeight: "800", marginBottom: "4px" }}>
                      LIVE ACTIVITY
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "var(--primary)",
                        }}
                      ></div>{" "}
                      New Listing in West Park
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      ></div>{" "}
                      Sale Closed in Downtown
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <Globe size={40} opacity={0.1} />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              {/* Top Agencies Sidebar */}
              <div className="glass-card" style={{ padding: "1.5rem" }}>
                <h4
                  style={{
                    fontSize: "1rem",
                    fontWeight: "800",
                    marginBottom: "1.5rem",
                  }}
                >
                  Top Agencies
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {activeAgenciesSorted.slice(0, 4).map((agency, i) => {
                    const agencyListingCount = properties.filter(
                      (p) =>
                        p.agency?._id === agency._id || p.agency === agency._id,
                    ).length;
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.7rem",
                              fontWeight: "800",
                              color: "white",
                            }}
                          >
                            {agency.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{ fontSize: "0.85rem", fontWeight: "700" }}
                            >
                              {agency.name}
                            </div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {agencyListingCount} listings
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "800",
                            color: "#10b981",
                          }}
                        >
                          {agency.isApproved ? "Verified" : "Pending"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="btn btn-outline"
                  style={{
                    width: "100%",
                    marginTop: "1.5rem",
                    border: "1px solid var(--primary)",
                    color: "var(--primary)",
                    fontWeight: "700",
                  }}
                >
                  Analyze Agency Data
                </button>
              </div>

              {/* Create New Listing Button (Reference style) */}
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowPropForm(true);
                  setEditingProp(null);
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 10px 20px -5px rgba(194, 65, 12, 0.3)",
                }}
              >
                <PlusCircle size={20} />
                <span style={{ fontWeight: "800" }}>Create New Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned User Management Tab */}
      {(activeTab === "users" || activeTab === "investors") && (
        <div className="animate-fade">
          {/* Summary Cards for Users/Investors */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
              marginBottom: "2.5rem",
            }}
          >
            {[
              {
                label:
                  activeTab === "users" ? "TOTAL USERS" : "TOTAL INVESTORS",
                value:
                  activeTab === "users"
                    ? stats.totalUsers
                    : stats.totalInvestors,
                icon: Users,
                trend: "+12%",
                trendLabel: "from last month",
                color: "var(--primary)",
              },
              {
                label: activeTab === "users" ? "ACTIVE AGENTS" : "AUM TOTAL",
                value:
                  activeTab === "users"
                    ? activeAgencies.length
                    : `$${((stats.totalInvestedValue / 1000000) * 0.4).toFixed(1)}M`,
                icon: activeTab === "users" ? UserPlus : Database,
                trend: "92%",
                trendLabel: "platform share",
                color: "#f59e0b",
              },
              {
                label:
                  activeTab === "users" ? "PENDING INVESTORS" : "PROJECTED ROI",
                value: activeTab === "users" ? activeInvestors.length : "12.8%",
                icon: TrendingUp,
                trend: "Action",
                trendLabel: "Avg. Market Yield",
                color: "#ef4444",
              },
              {
                label:
                  activeTab === "users" ? "NEW BUYERS" : "PENDING APPROVALS",
                value:
                  activeTab === "users"
                    ? activeBuyers.length
                    : stats.pendingAgencies || 0,
                icon: activeTab === "users" ? UserCheck : ShieldAlert,
                trend: "+45",
                trendLabel: "today",
                color: "#10b981",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "800",
                      color: "var(--text-muted)",
                      letterSpacing: "1px",
                    }}
                  >
                    {card.label}
                  </div>
                  <card.icon
                    size={18}
                    style={{ color: card.color, opacity: 0.8 }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "900",
                    marginBottom: "0.5rem",
                    color: "var(--text)",
                  }}
                >
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                  }}
                >
                  <span style={{ color: card.color, fontWeight: "700" }}>
                    {card.trend}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>
                    {card.trendLabel}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    right: "-10px",
                    opacity: 0.03,
                    color: "var(--text)",
                  }}
                >
                  <card.icon size={80} />
                </div>
              </div>
            ))}
          </div>

          {/* User Details Detail View */}
          {selectedUser && userDetails && (
            <div className="animate-fade">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
                  gap: "2rem",
                }}
              >
                {/* Left Column: User Brief Profile */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                  <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "2rem",
                        background: "var(--surface-light)",
                        margin: "0 auto 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        fontWeight: "900",
                        color: "var(--primary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {userDetails.user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <h4
                      style={{
                        fontSize: "1.6rem",
                        fontWeight: "900",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {userDetails.user.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        background: "var(--surface-light)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      PLATFORM {userDetails.user.role.toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                      marginBottom: "2.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: "var(--surface-light)",
                          borderRadius: "10px",
                        }}
                      >
                        <Mail size={16} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: "0.9rem" }}>
                        {userDetails.user.email}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: "var(--surface-light)",
                          borderRadius: "10px",
                        }}
                      >
                        <Phone size={16} color="var(--primary)" />
                      </div>
                      <div style={{ fontSize: "0.9rem" }}>
                        {userDetails.user.phoneNumber || "N/A"}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          padding: "8px",
                          background: "var(--surface-light)",
                          borderRadius: "10px",
                        }}
                      >
                        <Clock size={16} color="var(--primary)" />
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Joined{" "}
                        {new Date(
                          userDetails.user.createdAt,
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleBlockUser(
                          userDetails.user._id,
                          !userDetails.user.isBlocked,
                        )
                      }
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        borderColor: userDetails.user.isBlocked
                          ? "#10b981"
                          : "#f59e0b",
                        color: userDetails.user.isBlocked
                          ? "#10b981"
                          : "#f59e0b",
                      }}
                    >
                      {userDetails.user.isBlocked ? (
                        <>
                          <ShieldCheck size={16} /> Restore Access
                        </>
                      ) : (
                        <>
                          <ShieldBan size={16} /> Block User Account
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userDetails.user._id)}
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        color: "#ef4444",
                        borderColor: "#ef4444",
                      }}
                    >
                      <Trash2 size={16} /> Delete User Permanent
                    </button>
                  </div>
                </div>

                {/* Right Column Content Area */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                  }}
                >
                  {/* Investor Specific Section */}
                  {userDetails.user.role === "Investor" &&
                    userDetails.investorData && (
                      <>
                        {/* Portfolio Overview */}
                        <div className="glass-card" style={{ padding: "2rem" }}>
                          <h4
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: "800",
                              marginBottom: "1.5rem",
                            }}
                          >
                            Portfolio Overview
                          </h4>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "1.5rem",
                            }}
                          >
                            <div
                              style={{
                                background: "var(--surface-light)",
                                padding: "1.5rem",
                                borderRadius: "1.2rem",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  color: "var(--text-muted)",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                TOTAL INVESTED
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "900",
                                  color: "var(--primary)",
                                }}
                              >
                                $
                                {userDetails.investorData.investments
                                  .reduce(
                                    (acc, inv) => acc + inv.purchasePrice,
                                    0,
                                  )
                                  .toLocaleString()}
                              </div>
                            </div>
                            <div
                              style={{
                                background: "var(--surface-light)",
                                padding: "1.5rem",
                                borderRadius: "1.2rem",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  color: "var(--text-muted)",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                CURRENT VALUATION
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "900",
                                  color: "#10b981",
                                }}
                              >
                                $
                                {userDetails.investorData.investments
                                  .reduce(
                                    (acc, inv) => acc + inv.currentValue,
                                    0,
                                  )
                                  .toLocaleString()}
                              </div>
                            </div>
                            <div
                              style={{
                                background: "var(--surface-light)",
                                padding: "1.5rem",
                                borderRadius: "1.2rem",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "800",
                                  color: "var(--text-muted)",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                NET APPRECIATION
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: "900",
                                  color: "#c2410c",
                                }}
                              >
                                +{" "}
                                {(
                                  (userDetails.investorData.investments.reduce(
                                    (acc, inv) => acc + inv.currentValue,
                                    0,
                                  ) /
                                    (userDetails.investorData.investments.reduce(
                                      (acc, inv) => acc + inv.purchasePrice,
                                      0,
                                    ) || 1) -
                                    1) *
                                  100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Investment Details Table */}
                        <div className="glass-card" style={{ padding: "2rem" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <h4
                              style={{ fontSize: "1.2rem", fontWeight: "800" }}
                            >
                              Active Investments
                            </h4>
                            <button
                              className="btn btn-outline"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "0.6rem 1rem",
                                fontSize: "0.75rem",
                              }}
                            >
                              <FileText size={14} /> View All Docs
                            </button>
                          </div>
                          <div style={{ overflowX: "auto" }}>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    textAlign: "left",
                                    borderBottom: "1px solid var(--border)",
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: "1rem",
                                      fontSize: "0.7rem",
                                      color: "var(--text-muted)",
                                      fontWeight: "800",
                                    }}
                                  >
                                    PROPERTY
                                  </th>
                                  <th
                                    style={{
                                      padding: "1rem",
                                      fontSize: "0.7rem",
                                      color: "var(--text-muted)",
                                      fontWeight: "800",
                                    }}
                                  >
                                    STAKE
                                  </th>
                                  <th
                                    style={{
                                      padding: "1rem",
                                      fontSize: "0.7rem",
                                      color: "var(--text-muted)",
                                      fontWeight: "800",
                                    }}
                                  >
                                    VALUATION
                                  </th>
                                  <th
                                    style={{
                                      padding: "1rem",
                                      fontSize: "0.7rem",
                                      color: "var(--text-muted)",
                                      fontWeight: "800",
                                    }}
                                  >
                                    DOCUMENTS
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {userDetails.investorData.investments.map(
                                  (inv) => (
                                    <tr
                                      key={inv._id}
                                      style={{
                                        borderBottom: "1px solid var(--border)",
                                      }}
                                    >
                                      <td style={{ padding: "1rem" }}>
                                        <div
                                          style={{
                                            fontWeight: "700",
                                            fontSize: "0.85rem",
                                          }}
                                        >
                                          {inv.propertyName}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                          }}
                                        >
                                          Invested{" "}
                                          {new Date(
                                            inv.investmentDate,
                                          ).toLocaleDateString()}
                                        </div>
                                      </td>
                                      <td style={{ padding: "1rem" }}>
                                        <span
                                          style={{
                                            fontSize: "0.75rem",
                                            fontWeight: "800",
                                            background: "var(--surface-light)",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                          }}
                                        >
                                          {inv.ownershipPercentage}%
                                        </span>
                                      </td>
                                      <td style={{ padding: "1rem" }}>
                                        <div
                                          style={{
                                            fontSize: "0.85rem",
                                            fontWeight: "700",
                                          }}
                                        >
                                          ${inv.currentValue.toLocaleString()}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: "0.7rem",
                                            color: "#10b981",
                                          }}
                                        >
                                          Yield: 8.2%
                                        </div>
                                      </td>
                                      <td style={{ padding: "1rem" }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: "5px",
                                          }}
                                        >
                                          {inv.documents &&
                                            inv.documents.map((doc, idx) => (
                                              <div
                                                key={idx}
                                                style={{
                                                  padding: "6px",
                                                  background:
                                                    "var(--surface-light)",
                                                  borderRadius: "6px",
                                                  cursor: "pointer",
                                                }}
                                                title={doc}
                                              >
                                                <FileText
                                                  size={12}
                                                  color="var(--primary)"
                                                />
                                              </div>
                                            ))}
                                          {(!inv.documents ||
                                            inv.documents.length === 0) && (
                                            <span
                                              style={{
                                                fontSize: "0.7rem",
                                                color: "var(--text-muted)",
                                              }}
                                            >
                                              None
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                          {userDetails.investorData.investments.length ===
                            0 && (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "3rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              No active investments found for this account.
                            </div>
                          )}
                        </div>
                      </>
                    )}

                  {/* Agency Specific Section */}
                  {userDetails.user.role === "Agency" &&
                    userDetails.agencyData && (
                      <div className="glass-card" style={{ padding: "2rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <h4 style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                            Management Inventory
                          </h4>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            {userDetails.agencyData.properties.length} active
                            listings
                          </span>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "1.2rem",
                          }}
                        >
                          {userDetails.agencyData.properties.map((p) => (
                            <div
                              key={p._id}
                              onClick={() => navigate(`/property/${p._id}`)}
                              className="hover-card"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                padding: "1.2rem",
                                borderRadius: "1.2rem",
                                border: "1px solid var(--border)",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: "700",
                                  fontSize: "0.95rem",
                                  marginBottom: "0.5rem",
                                  color: "var(--text)",
                                }}
                              >
                                {p.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--primary)",
                                  fontWeight: "900",
                                }}
                              >
                                ${p.price.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Enquiry History */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                        Enquiry History
                      </h4>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {userDetails.enquiries.length} enquiries sent
                      </span>
                    </div>
                    {userDetails.enquiries.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                        }}
                      >
                        {userDetails.enquiries.map((enq) => (
                          <div
                            key={enq._id}
                            className="hover-light"
                            style={{
                              padding: "1rem",
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: "1rem",
                              border: "1px solid var(--border)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  background: "var(--surface-light)",
                                  borderRadius: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <MessageSquare
                                  size={18}
                                  color="var(--primary)"
                                />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {enq.property?.title || "Unknown Property"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  Enquired on{" "}
                                  {new Date(enq.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                enq.property?._id &&
                                navigate(`/property/${enq.property._id}`)
                              }
                              className="btn btn-outline"
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.75rem",
                                border: "none",
                                color: "var(--primary)",
                                fontWeight: "700",
                              }}
                            >
                              VIEW LISTING
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "3rem",
                          color: "var(--text-muted)",
                          background: "rgba(255,255,255,0.01)",
                          borderRadius: "1rem",
                          border: "1px dashed var(--border)",
                        }}
                      >
                        No enquiry history available for this account.
                      </div>
                    )}
                  </div>

                  {/* Saved Properties */}
                  <div className="glass-card" style={{ padding: "2rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <h4 style={{ fontSize: "1.2rem", fontWeight: "800" }}>
                        Saved Properties
                      </h4>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {userDetails.savedProperties?.length || 0} items in
                        bucket
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "1.2rem",
                      }}
                    >
                      {userDetails.savedProperties &&
                      userDetails.savedProperties.length > 0 ? (
                        userDetails.savedProperties.map((p) => (
                          <div
                            key={p._id}
                            onClick={() => navigate(`/property/${p._id}`)}
                            className="hover-card"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              padding: "1.2rem",
                              borderRadius: "1.2rem",
                              border: "1px solid var(--border)",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "700",
                                fontSize: "0.95rem",
                                marginBottom: "0.5rem",
                                color: "var(--text)",
                              }}
                            >
                              {p.title}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.9rem",
                                  color: "var(--primary)",
                                  fontWeight: "900",
                                }}
                              >
                                ${p.price.toLocaleString()}
                              </div>
                              <span
                                style={{
                                  fontSize: "0.65rem",
                                  fontWeight: "800",
                                  color: "var(--text-muted)",
                                  background: "rgba(255,255,255,0.08)",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            gridColumn: "span 2",
                            textAlign: "center",
                            padding: "3rem",
                            color: "var(--text-muted)",
                            background: "rgba(255,255,255,0.01)",
                            borderRadius: "1rem",
                            border: "1px dashed var(--border)",
                          }}
                        >
                          This user hasn't saved any assets yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrated Table Container */}
          {!selectedUser && (
            <div
              className="glass-card"
              style={{
                padding: "0",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Table Header / Filters */}
              <div
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", gap: "1rem" }}>
                  <select
                    className="input-control"
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      width: "auto",
                      minWidth: "120px",
                      padding: "6px 12px",
                    }}
                  >
                    <option>All Roles</option>
                    <option>Agents</option>
                    <option>Buyers</option>
                    <option>Investors</option>
                  </select>
                  <select
                    className="input-control"
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      width: "auto",
                      minWidth: "120px",
                      padding: "6px 12px",
                    }}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    <Filter size={16} /> Advanced Filters
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: "8px",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <Globe size={16} />
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: "8px",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    <Database size={16} />
                  </button>
                </div>
              </div>

              {/* High-Density Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--surface-light)" }}>
                    <tr
                      style={{
                        textAlign: "left",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                        }}
                      >
                        USER DETAILS
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                        }}
                      >
                        ROLE
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                        }}
                      >
                        LOCATION
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "0.5px",
                          textAlign: "right",
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === "users" ? activeBuyers : activeInvestors)
                      .slice(0, 5)
                      .map((u) => (
                        <tr
                          key={u._id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            transition: "background 0.2s ease",
                          }}
                        >
                          <td style={{ padding: "1rem 1.5rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  background: "var(--surface-light)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "800",
                                  fontSize: "0.8rem",
                                  color: "var(--primary)",
                                }}
                              >
                                {u.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "700",
                                    fontSize: "0.9rem",
                                    color: "var(--text)",
                                  }}
                                >
                                  {u.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "1rem 1.5rem" }}>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "800",
                                background: "var(--surface-light)",
                                border: "1px solid var(--border)",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              fontSize: "0.85rem",
                              color: "var(--text)",
                            }}
                          >
                            Global Node-01
                          </td>
                          <td style={{ padding: "1rem 1.5rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <div
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: "#10b981",
                                }}
                              ></div>
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: "600",
                                  color: "#10b981",
                                }}
                              >
                                Active
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1rem 1.5rem",
                              textAlign: "right",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                }}
                                onClick={() => fetchUserDetails(u._id)}
                                title="View Profile"
                              >
                                <Info size={14} />
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                  color: u.isBlocked ? "#10b981" : "#f59e0b",
                                }}
                                onClick={() =>
                                  handleBlockUser(u._id, !u.isBlocked)
                                }
                                title={
                                  u.isBlocked ? "Unblock User" : "Block User"
                                }
                              >
                                {u.isBlocked ? (
                                  <ShieldCheck size={14} />
                                ) : (
                                  <ShieldBan size={14} />
                                )}
                              </button>
                              <button
                                className="btn btn-outline"
                                style={{
                                  padding: "6px",
                                  fontSize: "0.75rem",
                                  borderColor: "var(--border)",
                                  color: "#ef4444",
                                }}
                                onClick={() => handleDeleteUser(u._id)}
                                title="Remove User"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div
                style={{
                  padding: "1.2rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--surface-light)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Showing 1 to 5 of{" "}
                  {
                    (activeTab === "users" ? activeBuyers : activeInvestors)
                      .length
                  }{" "}
                  users
                </div>
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: "5px 10px",
                      fontSize: "0.8rem",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    Prev
                  </button>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      className={`btn ${n === 1 ? "btn-primary" : "btn-outline"}`}
                      style={{
                        width: "32px",
                        height: "32px",
                        padding: "0",
                        fontSize: "0.8rem",
                        borderColor: n === 1 ? "transparent" : "var(--border)",
                        color: n === 1 ? "white" : "var(--text)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="btn btn-outline"
                    style={{
                      padding: "5px 10px",
                      fontSize: "0.8rem",
                      borderColor: "var(--border)",
                      color: "var(--text)",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Activity Banner */}
          <div
            style={{
              marginTop: "2.5rem",
              padding: "2.5rem",
              borderRadius: "1.5rem",
              background: "linear-gradient(90deg, #c2410c, #9a3412)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 20px 40px -15px rgba(194, 65, 12, 0.4)",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: "800",
                  marginBottom: "0.5rem",
                  color: "white",
                }}
              >
                User Activity Overview
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}
              >
                248 new agent applications are waiting for your approval.
                Processing time is currently within the expected 24-hour window.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Redesigned Lead Management Tab (Global Lead Tracking) */}
      {activeTab === "leads" && (
        <div className="animate-fade">
          {!selectedLead ? (
            <>
              {/* Lead Page Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "2.5rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "2rem",
                      fontWeight: "900",
                      marginBottom: "0.4rem",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Global Lead Tracking
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
                    Monitor multi-agency performance and distribution metrics.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn btn-outline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: "700",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <TrendingUp size={18} /> Export Data
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowLeadForm(true);
                      setNewLeadData({
                        ...newLeadData,
                        propertyId: properties[0]?._id || "",
                        agencyId: properties[0]?.agency?._id || properties[0]?.agency || "",
                      });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "0.8rem 1.5rem",
                      fontWeight: "800",
                    }}
                  >
                    <PlusCircle size={18} /> Add New Lead
                  </button>
                </div>
              </div>

              {/* Lead Performance Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1.5rem",
                  marginBottom: "2.5rem",
                }}
              >
                {[
                  {
                    label: "TOTAL LEADS",
                    value: leadsAnalytics.summary.totalLeads,
                    icon: UserPlus,
                    trend: "+12%",
                    color: "var(--primary)",
                    trendDir: "up",
                  },
                  {
                    label: "CONTACTED",
                    value: leadsAnalytics.summary.contactedLeads,
                    icon: Phone,
                    trend: "+5.2%",
                    color: "#f59e0b",
                    trendDir: "up",
                  },
                  {
                    label: "CLOSED",
                    value: leadsAnalytics.summary.closedLeads,
                    icon: ShieldCheck,
                    trend: "-2.1%",
                    color: "#10b981",
                    trendDir: "down",
                  },
                  {
                    label: "CONVERSION",
                    value: leadsAnalytics.summary.conversionRate,
                    icon: TrendingUp,
                    trend: "+0.8%",
                    color: "#c2410c",
                    trendDir: "up",
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="glass-card"
                    style={{
                      padding: "2rem",
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div
                        style={{
                          background: "var(--surface-light)",
                          padding: "10px",
                          borderRadius: "12px",
                        }}
                      >
                        <card.icon size={22} color={card.color} />
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: "800",
                          color: card.trendDir === "up" ? "#10b981" : "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {card.trend} {card.trendDir === "up" ? "↗" : "↘"}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        color: "var(--text-muted)",
                        marginBottom: "0.5rem",
                        letterSpacing: "1px",
                      }}
                    >
                      {card.label}
                    </div>
                    <div
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: "900",
                        color: "var(--text)",
                      }}
                    >
                      {card.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualization Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr",
                  gap: "1.5rem",
                  marginBottom: "2.5rem",
                }}
              >
                {/* Lead Volume Trend */}
                <div
                  className="glass-card"
                  style={{
                    padding: "2rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "2.5rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: "800",
                        color: "var(--text)",
                      }}
                    >
                      Lead Volume Trend
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "var(--text)",
                      }}
                    >
                      Last 30 Days{" "}
                      <ChevronRight
                        size={14}
                        style={{ transform: "rotate(90deg)" }}
                      />
                    </div>
                  </div>

                  {/* Dynamic Chart Visualization */}
                  <div
                    style={{
                      width: "100%",
                      height: "200px",
                      position: "relative",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      overflow: "hidden"
                    }}
                  >
                    <svg
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                      viewBox="0 0 800 200"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="chartGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--primary)"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--primary)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        d={leadsAnalytics.volumeTrend.length > 1 
                          ? `M${leadsAnalytics.volumeTrend.map((d, i) => 
                              `${(i / (leadsAnalytics.volumeTrend.length - 1)) * 800},${200 - (d.count / Math.max(...leadsAnalytics.volumeTrend.map(v => v.count), 1)) * 180}`
                            ).join(' ')} V200 H0 Z`
                          : "M0,150 Q100,50 200,120 T400,80 T600,160 T800,20 V200 H0 Z"
                        }
                        fill="url(#chartGradient)"
                      />
                      <path
                        d={leadsAnalytics.volumeTrend.length > 1 
                          ? `M${leadsAnalytics.volumeTrend.map((d, i) => 
                              `${(i / (leadsAnalytics.volumeTrend.length - 1)) * 800},${200 - (d.count / Math.max(...leadsAnalytics.volumeTrend.map(v => v.count), 1)) * 180}`
                            ).join(' ')}`
                          : "M0,150 Q100,50 200,120 T400,80 T600,160 T800,20"
                        }
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="4"
                      />
                    </svg>
                    {leadsAnalytics.volumeTrend.length > 0 ? (
                      leadsAnalytics.volumeTrend.filter((_, i, arr) => i % Math.ceil(arr.length / 4) === 0).map((d, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "800",
                            color: "var(--text-muted)",
                            marginBottom: "5px",
                            zIndex: 1
                          }}
                        >
                          {d._id.slice(5)}
                        </div>
                      ))
                    ) : (
                      ["WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4"].map((week, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: "800",
                            color: "var(--text-muted)",
                            marginBottom: "5px",
                            zIndex: 1
                          }}
                        >
                          {week}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Source Performance */}
                <div
                  className="glass-card"
                  style={{
                    padding: "2rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "800",
                      marginBottom: "2.5rem",
                      color: "var(--text)",
                    }}
                  >
                    Source Performance
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.8rem",
                    }}
                  >
                    {leadsAnalytics.sourcePerformance.length > 0 ? (
                      leadsAnalytics.sourcePerformance.map((source, i) => (
                        <div key={i}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: "700",
                                color: "var(--text)",
                              }}
                            >
                              {source._id || "Direct"}
                            </span>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "800",
                                color: "var(--text-muted)",
                              }}
                            >
                              {source.count} Leads
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "8px",
                              background: "var(--surface-light)",
                              borderRadius: "10px",
                              overflow: "hidden",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div
                              style={{
                                width: `${(source.count / Math.max(...leadsAnalytics.sourcePerformance.map(s => s.count), 1)) * 100}%`,
                                height: "100%",
                                background: "var(--primary)",
                                borderRadius: "10px",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      [
                        {
                          name: "Zillow Premium",
                          value: "4,250 Leads",
                          progress: 85,
                        },
                        {
                          name: "Realtor.com",
                          value: "2,180 Leads",
                          progress: 45,
                        },
                        {
                          name: "Facebook Ads",
                          progress: 92,
                          value: "5,410 Leads",
                        },
                        {
                          name: "Organic Search",
                          progress: 25,
                          value: "1,000 Leads",
                        },
                      ].map((source, i) => (
                        <div key={i}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: "700",
                                color: "var(--text)",
                              }}
                            >
                              {source.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: "800",
                                color: "var(--text-muted)",
                              }}
                            >
                              {source.value}
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "8px",
                              background: "var(--surface-light)",
                              borderRadius: "10px",
                              overflow: "hidden",
                              border: "1px solid var(--border)",
                            }}
                          >
                            <div
                              style={{
                                width: `${source.progress}%`,
                                height: "100%",
                                background: "var(--primary)",
                                borderRadius: "10px",
                              }}
                            ></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Leads Distribution Table */}
              <div
                className="glass-card"
                style={{
                  padding: "0",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    padding: "2rem",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "800",
                      color: "var(--text)",
                    }}
                  >
                    Recent Leads Distribution
                  </h3>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      style={{
                        padding: "10px",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      <Filter size={18} />
                    </button>
                    <button
                      style={{
                        padding: "10px",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "var(--surface-light)" }}>
                      <tr
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <th
                          style={{
                            padding: "1.5rem 2rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                          }}
                        >
                          LEAD DETAILS
                        </th>
                        <th
                          style={{
                            padding: "1.5rem 2rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                          }}
                        >
                          STATUS
                        </th>
                        <th
                          style={{
                            padding: "1.5rem 2rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                          }}
                        >
                          SOURCE
                        </th>
                        <th
                          style={{
                            padding: "1.5rem 2rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                          }}
                        >
                          ASSIGNED AGENT
                        </th>
                        <th
                          style={{
                            padding: "1.5rem 2rem",
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                            textAlign: "right",
                          }}
                        >
                          LAST ACTIVITY
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, i) => (
                        <tr
                          key={lead._id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td style={{ padding: "1.2rem 2rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "10px",
                                  background: "var(--surface-light)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "900",
                                  color: "var(--primary)",
                                  border: "1px solid var(--border)",
                                }}
                              >
                                {lead.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: "800",
                                    fontSize: "1rem",
                                    color: "var(--text)",
                                  }}
                                >
                                  {lead.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {i === 0
                                    ? "Luxury Villa Inquiry"
                                    : i === 1
                                      ? "Commercial Lease"
                                      : "Residential Buying"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "1.2rem 2rem" }}>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                background:
                                  lead.status === "Closed"
                                    ? "#14532d"
                                    : lead.status === "Contacted"
                                      ? "#1e3a8a"
                                      : "#4a2512",
                                color:
                                  lead.status === "Closed"
                                    ? "#4ade80"
                                    : lead.status === "Contacted"
                                      ? "#93c5fd"
                                      : "#fdba74",
                                padding: "5px 12px",
                                borderRadius: "6px",
                                fontWeight: "900",
                                textTransform: "uppercase",
                              }}
                            >
                              {lead.status || "NEW"}
                            </span>
                          </td>
                          <td style={{ padding: "1.2rem 2rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "0.95rem",
                                fontWeight: "700",
                                color: "var(--text)",
                              }}
                            >
                              <Globe size={16} color="var(--primary)" />{" "}
                              {i === 0
                                ? "Zillow"
                                : i === 1
                                  ? "Facebook"
                                  : "Direct Mail"}
                            </div>
                          </td>
                          <td style={{ padding: "1.2rem 2rem" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: "var(--surface-light)",
                                  border: "1px solid var(--border)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "var(--text)",
                                }}
                              >
                                <Users size={14} />
                              </div>
                              <span
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: "700",
                                  color: "var(--text)",
                                }}
                              >
                                {lead.agency?.name?.split(" ")[0] ||
                                  "Unassigned"}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "1.2rem 2rem",
                              textAlign: "right",
                              fontSize: "0.85rem",
                              color: "var(--text-muted)",
                              fontWeight: "700",
                            }}
                          >
                            {i * 12 + 2} mins ago
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div
                  style={{
                    padding: "1.5rem 2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface-light)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      fontWeight: "700",
                    }}
                  >
                    Showing 1-10 of 1,240 new leads
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn btn-outline"
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        opacity: 0.5,
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      Prev
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{
                        width: "36px",
                        height: "36px",
                        padding: "0",
                        fontSize: "0.85rem",
                      }}
                    >
                      1
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{
                        width: "36px",
                        height: "36px",
                        padding: "0",
                        fontSize: "0.85rem",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      2
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-fade">
              <button
                className="btn btn-outline"
                onClick={() => setSelectedLead(null)}
                style={{
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "none",
                  color: "var(--text)",
                }}
              >
                <ChevronRight
                  size={18}
                  style={{ transform: "rotate(180deg)" }}
                />{" "}
                Back to Enquiry Ledger
              </button>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "1.5rem",
                }}
              >
                <div
                  className="glass-card"
                  style={{
                    padding: "2rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--primary)",
                        padding: "10px",
                        borderRadius: "12px",
                      }}
                    >
                      <Users size={24} color="white" />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "1px",
                        }}
                      >
                        BUYER PROFILE
                      </h4>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "900",
                          color: "var(--text)",
                        }}
                      >
                        {selectedLead.name}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginBottom: "4px",
                        }}
                      >
                        VERIFIED EMAIL
                      </div>
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "700",
                          color: "var(--text)",
                        }}
                      >
                        {selectedLead.email}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginBottom: "4px",
                        }}
                      >
                        PHONE ACCESS
                      </div>
                      <div
                        style={{
                          fontSize: "1rem",
                          fontWeight: "700",
                          color: "var(--text)",
                        }}
                      >
                        {selectedLead.phoneNumber || "+1 (555) 000-0000"}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: "1rem", width: "100%" }}
                    >
                      Direct Message
                    </button>
                  </div>
                </div>

                <div
                  className="glass-card"
                  style={{
                    padding: "2rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        background: "var(--surface-light)",
                        border: "1px solid var(--border)",
                        padding: "10px",
                        borderRadius: "12px",
                      }}
                    >
                      <Building2 size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "1px",
                        }}
                      >
                        INTERESTED ASSET
                      </h4>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "900",
                          color: "var(--text)",
                        }}
                      >
                        {selectedLead.property?.title}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "var(--text-muted)",
                      }}
                    >
                      <MapPin size={16} /> {selectedLead.property?.location}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "900",
                        color: "var(--text)",
                      }}
                    >
                      <span
                        style={{
                          color: "var(--primary)",
                          fontSize: "1.2rem",
                          verticalAlign: "top",
                          marginRight: "4px",
                        }}
                      >
                        $
                      </span>
                      {selectedLead.property?.price?.toLocaleString()}
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        borderColor: "var(--border)",
                        color: "var(--text)",
                      }}
                    >
                      View Full Listing
                    </button>
                  </div>
                </div>

                <div
                  className="glass-card"
                  style={{
                    padding: "2rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "10px",
                        borderRadius: "12px",
                      }}
                    >
                      <ShieldCheck size={24} color="#10b981" />
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          fontWeight: "800",
                          letterSpacing: "1px",
                        }}
                      >
                        AUDIT STATUS
                      </h4>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "900",
                          color: "#10b981",
                        }}
                      >
                        VERIFIED
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginBottom: "4px",
                        }}
                      >
                        RESPONSIBLE FIRM
                      </div>
                      <div
                        style={{
                          fontWeight: "800",
                          fontSize: "1.1rem",
                          color: "var(--text)",
                        }}
                      >
                        {selectedLead.agency?.name}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginBottom: "4px",
                        }}
                      >
                        WORKFLOW STAGE
                      </div>
                      <div
                        style={{
                          background: "var(--primary)",
                          color: "white",
                          display: "inline-block",
                          padding: "6px 14px",
                          borderRadius: "4px",
                          fontWeight: "900",
                          fontSize: "0.8rem",
                        }}
                      >
                        {selectedLead.status?.toUpperCase() || "NEW ENQUIRY"}
                      </div>
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{
                        width: "100%",
                        borderColor: "#ef4444",
                        color: "#ef4444",
                      }}
                    >
                      Flag for Review
                    </button>
                  </div>
                </div>

                <div
                  className="glass-card"
                  style={{
                    gridColumn: "span 3",
                    padding: "2rem",
                    background: "var(--surface-light)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <MessageCircle size={18} color="var(--primary)" />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "800",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        color: "var(--text)",
                      }}
                    >
                      Buyer Inquiry Message
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--surface)",
                      padding: "2rem",
                      borderRadius: "1.5rem",
                      color: "var(--text)",
                      fontStyle: "italic",
                      fontSize: "1.1rem",
                      lineHeight: "1.8",
                      borderLeft: "4px solid var(--primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    "{selectedLead.message}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redesigned Settings Tab */}
      {activeTab === "settings" && (
        <div className="animate-fade">
          <div style={{ marginBottom: "2.5rem" }}>
            <h3
              style={{
                fontSize: "1.8rem",
                fontWeight: "800",
                marginBottom: "0.5rem",
                color: "var(--text)",
              }}
            >
              Platform Governance
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Configure core engine parameters and administrative security
              protocols.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "2.5rem",
            }}
          >
            <div
              className="glass-card"
              style={{
                padding: "2.5rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "2.5rem",
                }}
              >
                <div
                  style={{
                    background: "var(--primary)",
                    padding: "12px",
                    borderRadius: "14px",
                  }}
                >
                  <ShieldCheck size={24} color="white" />
                </div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "900",
                    color: "var(--text)",
                  }}
                >
                  Identity & Access
                </h4>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                <div className="input-group">
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    ADMINISTRATIVE ALIAS
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    defaultValue="Registry Master Node"
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      padding: "12px 1rem",
                    }}
                  />
                </div>
                <div className="input-group">
                  <label
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    RECOVERY CHANNEL
                  </label>
                  <input
                    type="email"
                    className="input-control"
                    defaultValue="ops@estate-hq.pro"
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                      padding: "12px 1rem",
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: "1.5rem",
                    background: "var(--surface-light)",
                    borderRadius: "1rem",
                    border: "1px dashed var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      marginBottom: "8px",
                      color: "var(--text)",
                    }}
                  >
                    Security Protocol
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.5",
                    }}
                  >
                    Multi-factor authentication is currently enforced for all
                    administrative level access points.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  style={{
                    padding: "1rem",
                    fontWeight: "800",
                    boxShadow: "0 10px 20px -5px rgba(194, 65, 12, 0.4)",
                  }}
                >
                  Encrypt & Save Changes
                </button>
              </div>
            </div>
            <div
              className="glass-card"
              style={{
                padding: "2.5rem",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "2.5rem",
                }}
              >
                <div
                  style={{
                    background: "var(--surface-light)",
                    border: "1px solid var(--border)",
                    padding: "12px",
                    borderRadius: "14px",
                  }}
                >
                  <Database size={24} color="var(--primary)" />
                </div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "900",
                    color: "var(--text)",
                  }}
                >
                  Engine Parameters
                </h4>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                }}
              >
                {[
                  {
                    label: "Neural Search Indexing",
                    desc: "Enable semantic search for property matching",
                    active: true,
                  },
                  {
                    label: "Blockchain Verification",
                    desc: "Immutable records for investor identities",
                    active: true,
                  },
                  {
                    label: "Agency Auto-Approval",
                    desc: "Bypass manual audit for registered firms",
                    active: false,
                  },
                  {
                    label: "Marketplace Stealth",
                    desc: "Hide listings from non-registered visitors",
                    active: false,
                  },
                  {
                    label: "Data Leak Protection",
                    desc: "Mask sensitive PII in public exports",
                    active: true,
                  },
                ].map((opt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.2rem",
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      borderRadius: "1.2rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.95rem",
                          fontWeight: "800",
                          marginBottom: "4px",
                          color: "var(--text)",
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {opt.desc}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "24px",
                        background: opt.active
                          ? "var(--primary)"
                          : "var(--surface)",
                        padding: "3px",
                        cursor: "pointer",
                        border: "1px solid var(--border)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: "white",
                          marginLeft: opt.active ? "20px" : "0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {showLeadForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="glass-card animate-fade"
            style={{
              width: "100%",
              maxWidth: "800px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "2rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "2rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--surface-light)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "900" }}>
                  Add New Lead Manually
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Create a lead entry for external inquiries or walk-ins.
                </p>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setShowLeadForm(false)}
                style={{ padding: "8px", border: "none" }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddLead} style={{ padding: "2.5rem" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                }}
              >
                <div className="input-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input-control"
                    required
                    value={newLeadData.name}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>

                <div className="input-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="input-control"
                    required
                    value={newLeadData.phone}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input-control"
                    required
                    value={newLeadData.email}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  />
                </div>

                <div className="input-group">
                  <label>Property</label>
                  <select
                    name="propertyId"
                    className="input-control"
                    required
                    value={newLeadData.propertyId}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <option value="">Select a property...</option>
                    {properties.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Assigned Agency</label>
                  <input
                    type="text"
                    className="input-control"
                    readOnly
                    value={
                      properties.find((p) => p._id === newLeadData.propertyId)
                        ?.agency?.name || "Select property first"
                    }
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <div className="input-group">
                  <label>Lead Source</label>
                  <select
                    name="source"
                    className="input-control"
                    value={newLeadData.source}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {[
                      "Direct",
                      "Zillow Premium",
                      "Realtor.com",
                      "Facebook Ads",
                      "Organic Search",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Initial Status</label>
                  <select
                    name="status"
                    className="input-control"
                    value={newLeadData.status}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {[
                      "New Lead",
                      "Contacted",
                      "Site Visit",
                      "Negotiation",
                      "Booked",
                      "Sold",
                      "Closed",
                      "Lost",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="input-group" style={{ gridColumn: "span 2" }}>
                  <label>Notes</label>
                  <textarea
                    name="message"
                    className="input-control"
                    rows="3"
                    value={newLeadData.message}
                    onChange={handleLeadChange}
                    style={{
                      background: "var(--surface-light)",
                      border: "1px solid var(--border)",
                      resize: "none",
                    }}
                  ></textarea>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginTop: "2.5rem",
                }}
              >
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: "1rem", fontWeight: "800" }}
                >
                  Confirm Lead Entry
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowLeadForm(false)}
                  style={{ padding: "1rem 2rem", fontWeight: "700" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
