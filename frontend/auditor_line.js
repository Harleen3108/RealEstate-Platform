const fs = require('fs');
const content = fs.readFileSync('e:/Real Estate Platform/frontend/src/pages/dashboards/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/<div/g) || []).length;
    const closes = (line.match(/<\/div>/g) || []).length;
    balance += opens - closes;
    if (line.includes('activeTab ===') || line.includes('!selectedUser') || line.includes('selectedUser')) {
        console.log(`Line ${i+1}: Balance=${balance} | ${line.trim()}`);
    }
}
console.log('Final Balance:', balance);
