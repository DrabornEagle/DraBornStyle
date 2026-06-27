const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'dkd_assets');
const file = path.join(dir, 'login_barber_miami.png');

fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(file) && fs.statSync(file).size > 32) {
  console.log('Existing login_barber_miami.png preserved.');
  process.exit(0);
}

// Valid fallback PNG so Metro can always resolve the login asset after ZIP install.
// The real high quality mockup can replace this file later without changing code.
const fallbackPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYGD4DwABBAEAghh8JwAAAABJRU5ErkJggg==';

fs.writeFileSync(file, Buffer.from(fallbackPngBase64, 'base64'));
console.log('Fallback login_barber_miami.png created.');
