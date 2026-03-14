const fs = require('fs');
const content = fs.readFileSync('e:/Real Estate Platform/frontend/src/pages/dashboards/AdminDashboard.jsx', 'utf8');

const matches = (regex) => (content.match(regex) || []).length;

console.log('Div Open:', matches(/<div/g));
console.log('Div Close:', matches(/<\/div>/g));
console.log('Brace Open:', matches(/{/g));
console.log('Brace Close:', matches(/}/g));
console.log('Paren Open:', matches(/\(/g));
console.log('Paren Close:', matches(/\)/g));
console.log('Fragment Open:', matches(/<>/g));
console.log('Fragment Close:', matches(/<\/>/g));
