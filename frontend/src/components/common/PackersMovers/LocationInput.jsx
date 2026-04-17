import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

/**
 * LocationInput Component
 * 
 * Reusable location input field with autocomplete suggestions
 * Can be used for both "Moving From" and "Moving To" fields
 */
const LocationInput = ({
  id = 'location',
  value = '',
  onChange = () => {},
  placeholder = 'Enter city or locality',
  error = null,
  disabled = false,
  suggestions = [],
  onSuggestionsChange = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState(suggestions || []);
  const inputRef = useRef(null);

  // Common Indian cities for basic suggestions
  const COMMON_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Chandigarh', 'Indore', 'Kochi', 'Coimbatore', 'Visakhapatnam',
    'Nagpur', 'Bhopal', 'Varanasi', 'Surat', 'Vadodara'
  ];

  useEffect(() => {
    if (!value.trim()) {
      setLocalSuggestions([]);
      return;
    }

    // Filter suggestions based on input
    const filtered = COMMON_CITIES.filter(city =>
      city.toLowerCase().includes(value.toLowerCase())
    );

    setLocalSuggestions(filtered);

    if (onSuggestionsChange) {
      onSuggestionsChange(filtered);
    }
  }, [value]);

  const handleSelect = (suggestion) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (value.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div className="location-input-wrapper">
      <div className="location-input-container">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={`location-input ${error ? 'input-error' : ''}`}
          autoComplete="off"
        />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && localSuggestions.length > 0 && (
        <div className="location-suggestions">
          {localSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-item"
              onClick={() => handleSelect(suggestion)}
            >
              <MapPin size={16} />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span className="input-error-text">{error}</span>
      )}
    </div>
  );
};

export default LocationInput;
