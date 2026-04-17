import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

/**
 * DatePickerInput Component
 * 
 * HTML5 date picker with validation
 * Ensures selected date is in the future
 */
const DatePickerInput = ({
  id = 'moveDate',
  value = '',
  onChange = () => {},
  error = null,
  disabled = false,
  minDate = null
}) => {
  const today = new Date().toISOString().split('T')[0];
  const min = minDate || today;

  return (
    <div className="date-picker-wrapper">
      <div className="date-input-container">
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          disabled={disabled}
          className={`date-input ${error ? 'input-error' : ''}`}
          required
        />
        <Calendar className="date-input-icon" size={18} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="date-error-text">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {!error && (
        <small className="date-helper-text">
          Select a date when you plan to move
        </small>
      )}
    </div>
  );
};

export default DatePickerInput;
