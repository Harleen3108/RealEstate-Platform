import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * ServiceTypeRadio Component
 * 
 * Radio button group for selecting moving service type
 */
const ServiceTypeRadio = ({
  value = 'full_service',
  onChange = () => {},
  options = [],
  error = null,
  disabled = false
}) => {
  return (
    <div className="service-type-wrapper">
      <div className="service-type-group">
        {options.map((option) => (
          <label
            key={option.value}
            className={`service-type-option ${value === option.value ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="serviceType"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
            />
            <div className="option-content">
              <div className="option-label">{option.label}</div>
              <div className="option-description">{option.description}</div>
            </div>
            {value === option.value && <CheckCircle size={20} />}
          </label>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="service-type-error-text">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ServiceTypeRadio;
