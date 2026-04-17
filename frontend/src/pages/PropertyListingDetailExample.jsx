import React, { useState, useEffect } from 'react';
import PackersMoversSection from '@/components/common/PackersMoversSection';
import {
  trackPackersMoversEvent,
  storePackersMoversLead
} from '@/components/common/PackersMoversUtils';

/**
 * EXAMPLE IMPLEMENTATION: Property Listing Detail Page
 * 
 * This file demonstrates how to integrate Packers & Movers
 * into your property listing detail page.
 * 
 * Copy and adapt the relevant code to your actual listing page.
 */

/**
 * Property Listing Detail Component with Packers & Movers Integration
 */
export default function PropertyListingDetail() {
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property listing data
  useEffect(() => {
    fetchListingData();
    fetchUserData();
  }, []);

  const fetchListingData = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/properties/123');
      const data = await response.json();
      
      setListing(data.property);

      // Track page view
      trackPackersMoversEvent('listing_page_viewed', {
        listingId: data.property.id,
        city: data.property.city,
        propertySize: data.property.bhkType
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      // Replace with your actual user context or API call
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const handlePackersMoversFormSubmit = async (formData) => {
    console.log('Form submitted:', formData);

    // You can perform additional processing here
    // For example, validate the data, show success message, etc.

    try {
      // Optional: Store the lead in your backend before redirecting
      const leadResponse = await storePackersMoversLead({
        ...formData,
        listingId: listing.id,
        userId: user.id,
        sourcePage: 'property_detail'
      });

      console.log('Lead stored:', leadResponse);
    } catch (error) {
      console.error('Error storing lead:', error);
      // Lead storage failure shouldn't block the redirect
    }
  };

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (error) {
    return <div className="error">Error loading property: {error}</div>;
  }

  return (
    <div className="property-listing-detail">
      {/* Header */}
      <header className="page-header">
        <h1>Property Details</h1>
      </header>

      {/* Main Content */}
      <div className="content-container">
        {/* Property Images */}
        <section className="property-images">
          {listing?.images && listing.images.length > 0 && (
            <div className="image-gallery">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="main-image"
              />
            </div>
          )}
        </section>

        {/* Property Details */}
        <section className="property-details">
          <div className="details-header">
            <h2>{listing?.title}</h2>
            <span className="price">
              ₹{listing?.price?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="details-info">
            <div className="info-item">
              <span className="label">Type:</span>
              <span className="value">{listing?.bhkType}</span>
            </div>
            <div className="info-item">
              <span className="label">Location:</span>
              <span className="value">
                {listing?.locality}, {listing?.city}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Area:</span>
              <span className="value">{listing?.area} sq.ft</span>
            </div>
          </div>

          {/* Description */}
          <div className="property-description">
            <h3>About this property</h3>
            <p>{listing?.description}</p>
          </div>

          {/* Amenities */}
          {listing?.amenities && (
            <div className="amenities">
              <h3>Amenities</h3>
              <ul>
                {listing.amenities.map((amenity, idx) => (
                  <li key={idx}>{amenity}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Contact CTA */}
        <section className="contact-section">
          <button className="contact-btn">Contact Owner</button>
        </section>

        {/* ========================================
            PACKERS & MOVERS INTEGRATION POINT 1
            Show "Need Help Moving?" CTA below property details
            ======================================== */}
        <section className="packers-movers-integration">
          <PackersMoversSection
            listing={{
              id: listing?.id,
              city: listing?.city,
              locality: listing?.locality,
              bhkType: listing?.bhkType,
              address: listing?.address
            }}
            user={user}
            platformName="RealEstatePlatform"
            onFormSubmit={handlePackersMoversFormSubmit}
            analyticsTracker={customAnalyticsTracker}
          />
        </section>

        {/* Similar Properties */}
        <section className="similar-properties">
          <h3>Similar Properties in {listing?.city}</h3>
          {/* Similar properties component goes here */}
        </section>
      </div>

      {/* Sidebar - Right Column */}
      <aside className="sidebar">
        {/* Owner/Agent Information */}
        <div className="agent-info">
          <h4>Agent Information</h4>
          {/* Agent details */}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn">Schedule Visit</button>
          <button className="action-btn">Save Property</button>
          <button className="action-btn">Share</button>
        </div>

        {/* ========================================
            PACKERS & MOVERS INTEGRATION POINT 2 (ALTERNATIVE)
            Can also be placed in sidebar as compact widget
            ======================================== */}
        {/* Optional: Compact version in sidebar
        <div className="sidebar-packers-movers">
          <PackersMoversSection
            listing={listing}
            user={user}
            platformName="RealEstatePlatform"
            onFormSubmit={handlePackersMoversFormSubmit}
          />
        </div>
        */}
      </aside>
    </div>
  );
}

/**
 * Custom Analytics Tracker
 * Implement this based on your analytics setup (GA4, Mixpanel, etc.)
 */
function customAnalyticsTracker(eventName, eventData) {
  // Example: Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...eventData,
      page_title: document.title,
      page_location: window.location.href
    });
  }

  // Example: Send to your custom backend analytics
  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventData,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  }).catch(err => console.error('Analytics error:', err));

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[PM Analytics] ${eventName}:`, eventData);
  }
}

/**
 * ========================================
 * ADDITIONAL INTEGRATION POINTS
 * ======================================== */

/**
 * Example: Post-Booking Confirmation Page
 * Add Packers & Movers CTA after user books a property
 */
export function BookingConfirmationPage() {
  const { booking, user } = React.useContext(BookingContext);

  return (
    <div className="booking-confirmation">
      <h1>Booking Confirmed!</h1>

      <div className="confirmation-details">
        <p>Your booking has been confirmed for:</p>
        <h2>{booking.property.title}</h2>
        <p>{booking.property.locality}, {booking.property.city}</p>
      </div>

      {/* Packers & Movers CTA */}
      <PackersMoversSection
        listing={{
          id: booking.property.id,
          city: booking.property.city,
          locality: booking.property.locality,
          bhkType: booking.property.bhkType
        }}
        user={user}
        platformName="RealEstatePlatform"
        showOnlyIfLoggedIn={false}
      />

      <div className="next-steps">
        <h3>Next Steps</h3>
        {/* Other next steps */}
      </div>
    </div>
  );
}

/**
 * Example: User Dashboard
 * Show Packers & Movers for each property in user's dashboard
 */
export function UserDashboard() {
  const [properties, setProperties] = React.useState([]);
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>My Properties</h1>

      <div className="properties-grid">
        {properties.map(property => (
          <div key={property.id} className="property-card">
            <img src={property.image} alt={property.title} />
            <h3>{property.title}</h3>
            <p>{property.locality}, {property.city}</p>

            {/* Packers & Movers for each property */}
            <PackersMoversSection
              listing={property}
              user={user}
              platformName="RealEstatePlatform"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * ========================================
 * STYLING (Add to your CSS)
 * ======================================== */

const exampleStyles = `
.property-listing-detail {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.property-images {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: auto;
  display: block;
}

.property-details {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 20px;
}

.details-header h2 {
  font-size: 28px;
  margin: 0;
}

.price {
  font-size: 24px;
  font-weight: 600;
  color: #FF6B35;
}

.details-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E0E0E0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item .label {
  font-size: 12px;
  color: #757575;
  font-weight: 600;
  text-transform: uppercase;
}

.info-item .value {
  font-size: 16px;
  color: #212121;
}

.property-description {
  margin-bottom: 24px;
}

.property-description h3 {
  font-size: 18px;
  margin: 0 0 12px 0;
}

.property-description p {
  color: #424242;
  line-height: 1.6;
}

.packers-movers-integration {
  background: #FAFAFA;
  padding: 32px;
  border-radius: 8px;
  margin: 32px 0;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-btn,
.action-btn {
  background: #FF6B35;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.contact-btn:hover,
.action-btn:hover {
  background: #E55A26;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .property-listing-detail {
    grid-template-columns: 1fr;
  }

  .details-info {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }
}
`;

// Export example component
export default PropertyListingDetail;
