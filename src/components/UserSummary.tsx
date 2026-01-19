import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserSummary = ({ userId }) => {
    const [summary, setSummary] = useState({ total_orders: 0, total_spent: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            const response = await axios.get(`/user/${userId}/summary`);
            setSummary(response.data);
        };
        fetchSummary();
    }, [userId]);

    return (
        <div>
            <h2>User Summary</h2>
            <p>Total Orders: {summary.total_orders}</p>
            <p>Total Spent: ${summary.total_spent}</p>
        </div>
    );
};

export default UserSummary;
