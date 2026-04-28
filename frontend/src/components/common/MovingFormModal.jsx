import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  MapPin,
  Calendar,
  Home,
  Phone,
  CheckCircle
} from 'lucide-react';
import {
  validatePackersMoversForm,
  storePackersMoversLead,
  getDisclaimerText,
  PROPERTY_SIZE_OPTIONS,
  SERVICE_TYPE_OPTIONS
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
 * Collects moving lead details, stores them for admin follow-up, and shows a
 * confirmation message instead of redirecting the user elsewhere.
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
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      handleInputChange('phone', cleaned);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const validation = validatePackersMoversForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return;
    }

    try {
      if (storeLeadBeforeRedirect) {
        console.log('Storing Packers & Movers lead...');
        try {
          const leadResponse = await Promise.race([
            storePackersMoversLead({
              ...formData,
              userId: user?.id,
              userName: user?.name,
              userEmail: user?.email,
              listingId: null,
              platformName
            }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Lead storage timeout')), 3000)
            )
          ]);

          if (leadResponse.success) {
            console.log('Lead stored successfully:', leadResponse.data);
          } else if (leadResponse.error) {
            console.warn('Lead storage warning:', leadResponse.error);
          }
        } catch (leadError) {
          console.warn('Could not store lead:', leadError.message);
        }
      }

      if (onSubmit) {
        onSubmit(formData);
      }

      setSubmitSuccess(true);
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
        {submitSuccess ? (
          <div className="moving-form-success">
            <div className="success-icon">
              <CheckCircle size={42} />
            </div>
            <h2>Thank you for choosing us</h2>
            <p>
              Your request has been received successfully. Our team will contact you soon with the next steps.
            </p>
            <button
              type="button"
              className="form-submit-btn"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
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

            {errors.submit && (
              <div className="form-error-banner">
                <AlertCircle size={20} />
                <span>{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="moving-form">
              <div className="form-grid">
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

              <div className="form-disclaimer">
                <AlertCircle size={16} />
                <p>{getDisclaimerText()}</p>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="agree"
                  required
                  onChange={(e) => setShowDisclaimer(e.target.checked)}
                />
                <label htmlFor="agree">
                  I understand my details will be shared with our support team for follow-up
                </label>
              </div>

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
                    <span>Submit Request</span>
                    <span>→</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="form-cancel-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>

            <div className="modal-mobile-note">
              <p>Tip: Fill in details accurately so our team can contact you quickly</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovingFormModal;
