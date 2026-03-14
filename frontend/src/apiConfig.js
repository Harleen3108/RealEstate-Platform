const BACKEND_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://realestate-platform-r94s.onrender.com';

const API_BASE_URL = `${BACKEND_URL}/api`;

export { BACKEND_URL, API_BASE_URL };
export default API_BASE_URL;
