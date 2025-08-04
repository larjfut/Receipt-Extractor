require('dotenv').config();

console.log('Testing environment variables...');
console.log('Tenant ID:', process.env.TENANT_ID);
console.log('Client ID:', process.env.CLIENT_ID);
console.log('Site ID:', process.env.SITE_ID);
console.log('List ID:', process.env.LIST_ID);
console.log('Client Secret loaded:', process.env.CLIENT_SECRET ? 'Yes ✅' : 'No ❌');