import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * PropertySizeSelect Component
 * 
 * Dropdown select for choosing property size
 */
const PropertySizeSelect = ({
  id = 'propertySize',
  value = '',
  onChange = () => {},
  options = [],
  error = null,
  disabled = false,
  placeholder = 'Select property size'
}) => {
  return (
    <div className="property-size-wrapper">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`property-size-select ${error ? 'input-error' : ''}`}
        required
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Error Message */}
      {error && (
        <div className="property-size-error-text">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PropertySizeSelect;
