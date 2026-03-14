const axios = require('axios');

async function reg() {
    try {
        const pass = 'Admin@123';
        const { data } = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Platform Admin',
            email: 'admin@elitereal.com',
            password: pass,
            role: 'Admin'
        });
        console.log('SUCCESS');
        console.log('Email: admin@elitereal.com');
        console.log('Password:', pass);
    } catch (err) {
        console.error('FAIL:', err.response?.data?.message || err.message);
    }
}
reg();
