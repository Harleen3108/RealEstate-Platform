import React, { useState } from 'react';
import { Truck, Package, MapPin, Calendar, Phone, AlertCircle, CheckCircle, Shield, Clock } from 'lucide-react';
import { usePackersMoversAutoFill } from '../../hooks/usePackersMoversAutoFill';
import MovingFormModal from './MovingFormModal';
import {
  trackPackersMoversEvent,
  PROPERTY_SIZE_OPTIONS,
  SERVICE_TYPE_OPTIONS
} from './PackersMoversUtils';
import './PackersMovers.css';

/**
 * PackersMoversSection Component
 * 
 * Main section component that displays the "Need Help Moving?" CTA banner
 * and manages the moving form modal state.
 * 
 * Usage:
 * <PackersMoversSection
 *   listing={propertyData}
 *   user={userData}
 *   onFormSubmit={handleFormSubmit}
 *   platformName="YourPlatform"
 *   analyticsTracker={customTracker}
 * />
 */
const PackersMoversSection = ({
  listing = null,
  user = null,
  onFormSubmit = null,
  platformName = 'RealEstatePlatform',
  analyticsTracker = null,
  showOnlyIfLoggedIn = true,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const autoFillData = usePackersMoversAutoFill({ listing, user });

  // Prevent showing if user not logged in and showOnlyIfLoggedIn is true
  if (showOnlyIfLoggedIn && !user) {
    return null;
  }

  const handleBannerClick = () => {
    // Track banner click
    trackPackersMoversEvent(
      'banner_viewed',
      {
        listingId: listing?.id,
        city: listing?.city,
        hasAutoFill: !!(listing || user)
      },
      analyticsTracker
    );

    // Require login before opening form
    if (!user) {
      // You can add your login prompt logic here
      console.log('User needs to log in before using this feature');
      return;
    }

    setIsModalOpen(true);
    trackPackersMoversEvent(
      'form_opened',
      {
        listingId: listing?.id,
        hasAutoFill: !!(listing || user)
      },
      analyticsTracker
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = (formData) => {
    trackPackersMoversEvent(
      'form_submitted',
      {
        moveFrom: formData.moveFrom,
        moveTo: formData.moveTo,
        propertySize: formData.propertySize,
        serviceType: formData.serviceType,
        listingId: listing?.id
      },
      analyticsTracker
    );

    if (onFormSubmit) {
      onFormSubmit(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className={`packers-movers-section ${className}`}>
      {/* CTA Banner */}
      <div className="moving-cta-banner" onClick={handleBannerClick}>
        <div className="banner-content">
          <div className="banner-icon">
            <Truck size={40} />
          </div>
          <div className="banner-text">
            <h3 className="banner-title">Need Help Moving?</h3>
            <p className="banner-subtitle">
              Get verified movers and easy relocation services with NoBroker
            </p>
          </div>
          <button className="banner-cta-btn">
            Book Moving Services →
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="badge">
          <CheckCircle size={20} />
          <span>Verified Movers</span>
        </div>
        <div className="badge">
          <Shield size={20} />
          <span>Insured Goods</span>
        </div>
        <div className="badge">
          <Clock size={20} />
          <span>On-Time Guarantee</span>
        </div>
      </div>

      {/* Moving Form Modal */}
      {isModalOpen && (
        <MovingFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit}
          initialData={autoFillData}
          platformName={platformName}
          analyticsTracker={analyticsTracker}
          user={user}
        />
      )}
    </div>
  );
};

export default PackersMoversSection;
