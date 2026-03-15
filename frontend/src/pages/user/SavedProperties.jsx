import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import BuyerWatchlist from '../../components/buyer/BuyerWatchlist';
import { BACKEND_URL } from '../../apiConfig';

const SavedProperties = () => {
    const [savedProperties, setSavedProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/auth/me`);
            setSavedProperties(data.savedProperties || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleRemoveSaved = async (id) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/save-property/${id}`);
            setSavedProperties(savedProperties.filter(p => p._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/400x180';
        if (url.startsWith('http')) {
            if (window.location.hostname !== 'localhost' && url.includes('localhost:5000')) {
                return url.replace('http://localhost:5000', BACKEND_URL);
            }
            return url;
        }
        return `${BACKEND_URL}${url}`;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade">
            <BuyerWatchlist 
                savedProperties={savedProperties} 
                handleRemoveSaved={handleRemoveSaved} 
                getImageUrl={getImageUrl} 
            />
        </div>
    );
};

export default SavedProperties;
