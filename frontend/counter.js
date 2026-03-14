const fs = require('fs');
const path = require('path');
const filePath = 'e:/Real Estate Platform/frontend/src/pages/dashboards/AdminDashboard.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const counts = {
    '{': 0, '}': 0,
    '(': 0, ')': 0,
    '[': 0, ']': 0,
    'frag_open': 0, 'frag_close': 0
};

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (counts.hasOwnProperty(char)) {
        counts[char]++;
    }
    if (content.substring(i, i+2) === '<>') counts['frag_open']++;
    if (content.substring(i, i+3) === '</>') counts['frag_close']++;
}

console.log(JSON.stringify(counts, null, 2));
