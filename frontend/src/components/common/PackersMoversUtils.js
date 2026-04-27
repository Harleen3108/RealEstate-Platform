/**
 * Packers & Movers Integration Utilities
 * Handles URL building, validation, analytics, and NoBroker redirects
 */

/**
 * Get the proper API endpoint with full backend URL
 * Supports both localhost and production
 */
import API_BASE_URL from '../../apiConfig';

const getApiEndpoint = () => {
  // Prefer configured API base URL from frontend config to avoid hostname edge cases
  try {
    if (API_BASE_URL) return `${API_BASE_URL}/packers-movers/leads`;
  } catch (e) {
    // Fallback to localhost
  }
  return 'http://localhost:5001/api/packers-movers/leads';
};

/**
 * Build NoBroker redirect URL with pre-filled parameters
 * @param {Object} formData - Form data object
 * @param {string} formData.moveFrom - Source city/locality
 * @param {string} formData.moveTo - Destination city/locality
 * @param {string} formData.moveDate - Moving date (YYYY-MM-DD)
 * @param {string} formData.propertySize - Property size (e.g., "2 BHK")
 * @param {string} formData.phone - Contact phone number
 * @param {Object} options - Additional options
 * @param {string} options.platformName - Platform name for UTM tracking (default: "RealEstatePlatform")
 * @param {string} options.affiliateId - Affiliate/referral ID (optional)
 * @returns {string} - Complete URL with query parameters
 */
export const buildNoBrokerURL = (formData, options = {}) => {
  const {
    platformName = 'RealEstatePlatform',
    affiliateId = ''
  } = options;

  const baseUrl = 'https://www.nobroker.in/packers-and-movers';
  
  // Extract property size number from "2 BHK" format
  let bhkCount = '2';
  if (formData.propertySize) {
    const match = formData.propertySize.match(/\d+/);
    if (match) bhkCount = match[0];
  }

  // Format date for NoBroker (they might expect DD-MM-YYYY)
  let formattedDate = '';
  if (formData.moveDate) {
    const dateObj = new Date(formData.moveDate);
    formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
  }

  const params = new URLSearchParams({
    // NoBroker parameters (correct names based on their API)
    src_city: formData.moveFrom || '',
    dest_city: formData.moveTo || '',
    move_date: formattedDate,
    bhk: bhkCount,
    mobile: formData.phone || '',
    
    // Additional tracking parameters
    nbFr: 'referral',
    source: platformName,
    utm_source: platformName,
    utm_medium: 'referral',
    utm_campaign: 'packers_movers_integration'
  });

  // Add affiliate ID if provided
  if (affiliateId) {
    params.append('ref_id', affiliateId);
  }

  const fullUrl = `${baseUrl}?${params.toString()}`;
  
  // Log URL for debugging
  console.log('🚚 NoBroker Redirect URL:', fullUrl);
  console.log('📦 Form Data:', {
    moveFrom: formData.moveFrom,
    moveTo: formData.moveTo,
    moveDate: formData.moveDate,
    bhk: bhkCount,
    phone: formData.phone
  });

  return fullUrl;
};

/**
 * Validate Indian phone number (10 digits)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const validateIndianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

/**
 * Validate date is in the future
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {boolean} - True if date is in future
 */
export const validateFutureDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
};

/**
 * Property size options for dropdown
 */
export const PROPERTY_SIZE_OPTIONS = [
  { value: '1bhk', label: '1 BHK' },
  { value: '2bhk', label: '2 BHK' },
  { value: '3bhk', label: '3 BHK' },
  { value: '4bhk', label: '4+ BHK' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Office' }
];

/**
 * Service type options
 */
export const SERVICE_TYPE_OPTIONS = [
  { value: 'full_service', label: 'Full Service (Pack + Move)', description: 'Complete packing and moving' },
  { value: 'transport_only', label: 'Transport Only', description: 'Transport without packing' },
  { value: 'storage', label: 'Storage', description: 'Temporary storage services' }
];

/**
 * Default analytics event tracker
 * Override this by passing custom analytics function to components
 */
export const defaultAnalyticsTracker = (eventName, eventData = {}) => {
  // Check for GA4
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
  // Check for Mixpanel
  if (window.mixpanel) {
    window.mixpanel.track(eventName, eventData);
  }
  // Fallback: Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}:`, eventData);
  }
};

/**
 * Track Packers & Movers specific events
 * @param {string} eventType - Event type (banner_viewed, form_opened, form_submitted, redirect_clicked)
 * @param {Object} data - Additional event data
 * @param {Function} customTracker - Custom analytics function (optional)
 */
export const trackPackersMoversEvent = (eventType, data = {}, customTracker = null) => {
  const tracker = customTracker || defaultAnalyticsTracker;
  const eventName = `packers_movers_${eventType}`;
  
  tracker(eventName, {
    timestamp: new Date().toISOString(),
    ...data
  });
};

/**
 * Prepare form data for NoBroker redirect
 * Validates and sanitizes all fields
 * @param {Object} formData - Raw form data
 * @returns {Object} - Validated form data or error object
 */
export const validatePackersMoversForm = (formData) => {
  const errors = {};

  if (!formData.moveFrom || formData.moveFrom.trim() === '') {
    errors.moveFrom = 'Moving from location is required';
  }

  if (!formData.moveTo || formData.moveTo.trim() === '') {
    errors.moveTo = 'Moving to location is required';
  }

  if (!formData.moveDate) {
    errors.moveDate = 'Moving date is required';
  } else if (!validateFutureDate(formData.moveDate)) {
    errors.moveDate = 'Moving date must be in the future';
  }

  if (!formData.propertySize) {
    errors.propertySize = 'Property size is required';
  }

  if (!formData.phone || !validateIndianPhone(formData.phone)) {
    errors.phone = 'Valid 10-digit mobile number is required';
  }

  if (!formData.serviceType) {
    errors.serviceType = 'Service type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: Object.keys(errors).length === 0 ? formData : null
  };
};

/**
 * Store moving lead in backend before redirect
 * Useful for lead tracking and analytics
 * @param {Object} leadData - Lead information
 * @param {string} leadData.moveFrom - Source location
 * @param {string} leadData.moveTo - Destination location
 * @param {string} leadData.moveDate - Moving date
 * @param {string} leadData.propertySize - Property size
 * @param {string} leadData.phone - Contact number
 * @param {string} leadData.serviceType - Service type
 * @param {string} leadData.listingId - Associated property listing ID (optional)
 * @param {string} leadData.userId - User ID (optional)
 * @param {string} apiEndpoint - Backend API endpoint (default: /api/packers-movers/leads)
 * @returns {Promise<Object>} - Stored lead data or error
 */
export const storePackersMoversLead = async (
  leadData,
  apiEndpoint = null
) => {
  try {
    // Use proper API endpoint with full URL support
    const endpoint = apiEndpoint || getApiEndpoint();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7 second timeout
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...leadData,
        timestamp: new Date().toISOString(),
        source: 'packers_movers_integration'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to store lead: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error storing Packers & Movers lead:', error.message);
    // Don't throw - we don't want form submission to fail if lead storage fails
    // Return error object but don't break the redirect flow
    return { error: error.message, success: false };
  }
};

/**
 * Generate disclaimer text for modal
 * @returns {string} - Disclaimer text
 */
export const getDisclaimerText = () => {
  return 'You will be redirected to NoBroker\'s website to complete your moving service booking. Please ensure all information is correct before proceeding.';
};

/**
 * Get trust badges content
 * @returns {Array<Object>} - Array of trust badge objects
 */
export const getTrustBadges = () => {
  return [
    { icon: 'check-circle', label: 'Verified Movers' },
    { icon: 'shield', label: 'Insured Goods' },
    { icon: 'clock', label: 'On-Time Guarantee' }
  ];
};
