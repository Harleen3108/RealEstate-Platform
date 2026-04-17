/**
 * Custom hook for Packers & Movers auto-fill logic
 * Handles extracting and formatting auto-fill data from listing and user context
 */

import { useMemo } from 'react';

/**
 * Hook to generate auto-fill data from listing and user info
 * @param {Object} options - Hook options
 * @param {Object} options.listing - Current property listing object
 * @param {Object} options.user - Current user object
 * @param {boolean} options.enabled - Whether to enable auto-fill (default: true)
 * @returns {Object} - Auto-fill data object
 * 
 * Expected listing structure:
 * {
 *   city: string,
 *   locality: string,
 *   bhkType: string (e.g., "2 BHK"),
 *   address: string (optional)
 * }
 * 
 * Expected user structure:
 * {
 *   phone: string,
 *   currentCity: string,
 *   savedLocations: Array<{city, locality}> (optional)
 * }
 */
export const usePackersMoversAutoFill = ({ listing, user, enabled = true } = {}) => {
  return useMemo(() => {
    if (!enabled) {
      return {
        moveFrom: '',
        moveTo: '',
        phone: '',
        propertySize: ''
      };
    }

    const autoFillData = {
      moveFrom: '',
      moveTo: '',
      phone: '',
      propertySize: ''
    };

    // Auto-fill destination (moveTo) from property listing
    if (listing) {
      if (listing.city && listing.locality) {
        autoFillData.moveTo = `${listing.locality}, ${listing.city}`;
      } else if (listing.city) {
        autoFillData.moveTo = listing.city;
      } else if (listing.address) {
        autoFillData.moveTo = listing.address;
      }

      // Auto-fill property size from listing
      if (listing.bhkType) {
        autoFillData.propertySize = listing.bhkType.toLowerCase().replace(/\s+/g, '');
      }
    }

    // Auto-fill source (moveFrom) and phone from user
    if (user) {
      if (user.currentCity) {
        autoFillData.moveFrom = user.currentCity;
      }

      if (user.phone) {
        autoFillData.phone = user.phone;
      }
    }

    return autoFillData;
  }, [listing, user, enabled]);
};

/**
 * Hook to build URL from form data
 * Useful for testing and external integrations
 * @param {Object} formData - Form data object
 * @param {Object} options - URL building options
 * @returns {string} - Built URL
 */
export const useBuildPackersMoversURL = (formData, options = {}) => {
  return useMemo(() => {
    if (!formData) return '';
    const { buildNoBrokerURL } = require('../components/common/PackersMoversUtils');
    return buildNoBrokerURL(formData, options);
  }, [formData, options]);
};

/**
 * Hook for managing form state with validation
 * @param {Object} initialData - Initial form data
 * @returns {Object} - Form state and handlers
 */
export const usePackersMoversForm = (initialData = {}) => {
  const [formData, setFormData] = React.useState({
    moveFrom: initialData.moveFrom || '',
    moveTo: initialData.moveTo || '',
    moveDate: initialData.moveDate || '',
    propertySize: initialData.propertySize || '',
    serviceType: initialData.serviceType || 'full_service',
    phone: initialData.phone || ''
  });

  const [errors, setErrors] = React.useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const resetForm = () => {
    setFormData(initialData || {
      moveFrom: '',
      moveTo: '',
      moveDate: '',
      propertySize: '',
      serviceType: 'full_service',
      phone: ''
    });
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    resetForm
  };
};
