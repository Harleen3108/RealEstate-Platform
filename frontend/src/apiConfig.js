const BACKEND_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5001'
    : 'https://realestate-platform-r94s.onrender.com';

const API_BASE_URL = `${BACKEND_URL}/api`;

export { BACKEND_URL, API_BASE_URL };
export default API_BASE_URL;
