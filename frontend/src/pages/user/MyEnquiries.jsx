import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../apiConfig';
import BuyerEnquiries from '../../components/buyer/BuyerEnquiries';

const MyEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/leads/my-enquiries`);
            setEnquiries(data || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="animate-fade">
            <BuyerEnquiries enquiries={enquiries} />
        </div>
    );
};

export default MyEnquiries;
