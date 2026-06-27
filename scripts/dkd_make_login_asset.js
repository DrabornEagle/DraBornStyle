const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'dkd_assets');
const file = path.join(dir, 'login_barber_miami.png');
fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(file)) {
  console.log('Existing login_barber_miami.png preserved.');
  process.exit(0);
}

console.log('login_barber_miami.png missing. Please copy the exact mockup image into src/dkd_assets/login_barber_miami.png');
