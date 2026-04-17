import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  MapPin,
  Calendar,
  Home,
  Phone,
  Check
} from 'lucide-react';
import {
  buildNoBrokerURL,
  validatePackersMoversForm,
  validateIndianPhone,
  validateFutureDate,
  storePackersMoversLead,
  getDisclaimerText,
  PROPERTY_SIZE_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  trackPackersMoversEvent
} from './PackersMoversUtils';
import LocationInput from './PackersMovers/LocationInput';
import DatePickerInput from './PackersMovers/DatePickerInput';
import PropertySizeSelect from './PackersMovers/PropertySizeSelect';
import ServiceTypeRadio from './PackersMovers/ServiceTypeRadio';
import PhoneInput from './PackersMovers/PhoneInput';
import './PackersMovers.css';

/**
 * MovingFormModal Component
 * 
 * Full-featured moving form modal with validation and NoBroker integration
 */
const MovingFormModal = ({
  isOpen = true,
  onClose = () => {},
  onSubmit = () => {},
  initialData = {},
  platformName = 'RealEstatePlatform',
  analyticsTracker = null,
  user = null,
  storeLeadBeforeRedirect = true
}) => {
  const [formData, setFormData] = useState({
    moveFrom: initialData.moveFrom || '',
    moveTo: initialData.moveTo || '',
    moveDate: initialData.moveDate || '',
    propertySize: initialData.propertySize || '',
    serviceType: initialData.serviceType || 'full_service',
    phone: initialData.phone || ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value) => {
    // Remove non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      handleInputChange('phone', cleaned);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    const validation = validatePackersMoversForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      // Store lead in database if enabled
      if (storeLeadBeforeRedirect) {
        console.log('💾 Storing Packers & Movers lead...');
        const leadResponse = await storePackersMoversLead({
          ...formData,
          userId: user?.id,
          userName: user?.name,
          userEmail: user?.email,
          listingId: null // Can be passed from parent component
        });
        
        if (leadResponse.success) {
          console.log('✅ Lead stored successfully:', leadResponse.data);
        } else if (leadResponse.error) {
          console.warn('⚠️ Lead storage warning:', leadResponse.error);
        }
      }

      // Call onSubmit callback
      if (onSubmit) {
        onSubmit(formData);
      }

      // Build NoBroker URL and redirect
      const nobrokerUrl = buildNoBrokerURL(formData, {
        platformName,
        affiliateId: null // Can be passed from parent component
      });

      // Track redirect event
      trackPackersMoversEvent(
        'redirect_clicked',
        { url: nobrokerUrl },
        analyticsTracker
      );

      // Redirect to NoBroker in new tab
      window.open(nobrokerUrl, '_blank');

      // Close modal after successful redirect
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to process request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="moving-form-modal-overlay" onClick={onClose}>
      <div className="moving-form-modal-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Book Your Moving Services</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="form-error-banner">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="moving-form">
          <div className="form-grid">
            {/* Move From */}
            <div className="form-group">
              <label htmlFor="moveFrom">
                <MapPin size={18} />
                <span>Moving From *</span>
              </label>
              <LocationInput
                id="moveFrom"
                placeholder="Enter city or locality"
                value={formData.moveFrom}
                onChange={(value) => handleInputChange('moveFrom', value)}
                error={errors.moveFrom}
              />
            </div>

            {/* Move To */}
            <div className="form-group">
              <label htmlFor="moveTo">
                <MapPin size={18} />
                <span>Moving To *</span>
              </label>
              <LocationInput
                id="moveTo"
                placeholder="Enter city or locality"
                value={formData.moveTo}
                onChange={(value) => handleInputChange('moveTo', value)}
                error={errors.moveTo}
              />
            </div>

            {/* Moving Date */}
            <div className="form-group">
              <label htmlFor="moveDate">
                <Calendar size={18} />
                <span>Moving Date *</span>
              </label>
              <DatePickerInput
                id="moveDate"
                value={formData.moveDate}
                onChange={(value) => handleInputChange('moveDate', value)}
                error={errors.moveDate}
              />
            </div>

            {/* Property Size */}
            <div className="form-group">
              <label htmlFor="propertySize">
                <Home size={18} />
                <span>Property Size *</span>
              </label>
              <PropertySizeSelect
                id="propertySize"
                value={formData.propertySize}
                onChange={(value) => handleInputChange('propertySize', value)}
                options={PROPERTY_SIZE_OPTIONS}
                error={errors.propertySize}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={18} />
                <span>Contact Number *</span>
              </label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={errors.phone}
              />
            </div>

            {/* Service Type - spans 2 columns */}
            <div className="form-group form-group-full">
              <label>Service Type *</label>
              <ServiceTypeRadio
                value={formData.serviceType}
                onChange={(value) => handleInputChange('serviceType', value)}
                options={SERVICE_TYPE_OPTIONS}
                error={errors.serviceType}
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="form-disclaimer">
            <AlertCircle size={16} />
            <p>{getDisclaimerText()}</p>
          </div>

          {/* Agree Checkbox */}
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="agree"
              required
              onChange={(e) => setShowDisclaimer(e.target.checked)}
            />
            <label htmlFor="agree">
              I understand and agree to proceed to NoBroker's website
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="form-submit-btn"
            disabled={isLoading || !showDisclaimer}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span>Continue to NoBroker</span>
                <span>→</span>
              </>
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            className="form-cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>

        {/* Mobile Note */}
        <div className="modal-mobile-note">
          <p>💡 Tip: Fill in details accurately to get better matches on NoBroker</p>
        </div>
      </div>
    </div>
  );
};

export default MovingFormModal;
