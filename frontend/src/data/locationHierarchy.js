export const LOCATION_HIERARCHY = [
  { state: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Thane', 'Navi Mumbai', 'Nashik', 'Nagpur'] },
  { state: 'Karnataka', cities: ['Bangalore', 'Mysore', 'Mangaluru'] },
  { state: 'Delhi NCR', cities: ['Delhi', 'Gurgaon', 'Noida', 'Ghaziabad', 'Faridabad'] },
  { state: 'Tamil Nadu', cities: ['Chennai', 'Coimbatore', 'Madurai'] },
  { state: 'Telangana', cities: ['Hyderabad', 'Secunderabad'] },
  { state: 'West Bengal', cities: ['Kolkata', 'Howrah', 'Siliguri'] },
  { state: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'] },
  { state: 'Rajasthan', cities: ['Jaipur', 'Udaipur', 'Jodhpur'] },
];

export const STATE_OPTIONS = LOCATION_HIERARCHY.map((entry) => entry.state);

const CITY_TO_STATE = new Map(
  LOCATION_HIERARCHY.flatMap(({ state, cities }) =>
    cities.map((city) => [normalizeText(city), state])
  )
);

export function normalizeText(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getCitiesForState(state) {
  return LOCATION_HIERARCHY.find((entry) => entry.state === state)?.cities || [];
}

export function inferCityFromProperty(property = {}) {
  if (property.city) return property.city;

  const location = String(property.location || '').trim();
  if (!location) return '';

  const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
  const candidateParts = parts.length > 1 ? [parts[parts.length - 1], parts[0]] : parts;

  for (const candidate of candidateParts) {
    const matchedCity = [...CITY_TO_STATE.keys()].find((cityName) => cityName === normalizeText(candidate));
    if (matchedCity) {
      return matchedCity
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }

  return candidateParts[0] || '';
}

export function inferStateFromProperty(property = {}) {
  if (property.state) return property.state;
  const city = inferCityFromProperty(property);
  return CITY_TO_STATE.get(normalizeText(city)) || '';
}

export function filterPropertiesByLocation(properties = [], selectedState = '', selectedCity = '') {
  return properties.filter((property) => {
    const propertyState = inferStateFromProperty(property);
    const propertyCity = inferCityFromProperty(property);

    const stateMatches = !selectedState || normalizeText(propertyState) === normalizeText(selectedState);
    const cityMatches = !selectedCity || normalizeText(propertyCity) === normalizeText(selectedCity);

    return stateMatches && cityMatches;
  });
}
