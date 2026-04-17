import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';

/**
 * PhoneInput Component
 * 
 * Indian phone number input with validation
 * Accepts only 10 digits
 */
const PhoneInput = ({
  id = 'phone',
  value = '',
  onChange = () => {},
  error = null,
  disabled = false,
  placeholder = '10-digit mobile number'
}) => {
  const handleChange = (e) => {
    const input = e.target.value;
    // Allow only digits, max 10
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      onChange(cleaned);
    }
  };

  const formatDisplay = (val) => {
    if (!val) return val;
    if (val.length <= 5) return val;
    if (val.length <= 9) return `${val.slice(0, 5)}-${val.slice(5)}`;
    return `${val.slice(0, 5)}-${val.slice(5)}`;
  };

  return (
    <div className="phone-input-wrapper">
      <div className="phone-input-container">
        <input
          id={id}
          type="tel"
          value={formatDisplay(value)}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength="11" // 10 digits + 1 hyphen
          disabled={disabled}
          className={`phone-input ${error ? 'input-error' : ''}`}
          required
        />
        <Phone className="phone-input-icon" size={18} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="phone-error-text">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text - Show validation status */}
      {!error && (
        <small className={`phone-helper-text ${value.length === 10 ? 'valid' : ''}`}>
          {value.length === 10 ? '✓ Valid phone number' : `${value.length}/10 digits`}
        </small>
      )}
    </div>
  );
};

export default PhoneInput;
