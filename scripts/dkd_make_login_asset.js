const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..', 'src', 'dkd_assets');
const file = path.join(dir, 'login_barber_miami.png');
fs.mkdirSync(dir, { recursive: true });

if (fs.existsSync(file) && fs.statSync(file).size > 2048) {
  console.log('Existing high quality login_barber_miami.png preserved.');
  process.exit(0);
}

const W = 1080;
const H = 1920;
const data = Buffer.alloc(W * H * 4, 255);
const C = {
  bg: [33, 52, 50, 255],
  card: [48, 73, 68, 255],
  dark: [10, 23, 22, 255],
  cream: [255, 242, 221, 255],
  gold: [240, 199, 102, 255],
  cyan: [156, 242, 227, 255],
  red: [198, 91, 77, 255],
  blue: [67, 160, 168, 255],
  white: [255, 255, 255, 255]
};
function px(x, y, c) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = c[3];
}
function rect(x, y, w, h, c) {
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) px(xx, yy, c);
}
function rounded(x, y, w, h, r, c, border) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
    const dx = xx < x + r ? x + r - xx : xx > x + w - r ? xx - (x + w - r) : 0;
    const dy = yy < y + r ? y + r - yy : yy > y + h - r ? yy - (y + h - r) : 0;
    if (dx * dx + dy * dy <= r * r) px(xx, yy, c);
  }
  if (border) { rect(x, y, w, 4, border); rect(x, y + h - 4, w, 4, border); rect(x, y, 4, h, border); rect(x + w - 4, y, 4, h, border); }
}
const F = {
A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10011','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],0:['01110','10001','10011','10101','11001','10001','01110'],1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00010','00100','01000','11111'],3:['11110','00001','00001','01110','00001','00001','11110'],4:['00010','00110','01010','10010','11111','00010','00010'],5:['11111','10000','10000','11110','00001','00001','11110'],6:['01111','10000','10000','11110','10001','10001','01110'],7:['11111','00001','00010','00100','01000','01000','01000'],8:['01110','10001','10001','01110','10001','10001','01110'],9:['01110','10001','10001','01111','00001','00001','11110'],' ':['00000','00000','00000','00000','00000','00000','00000'],'.':['00000','00000','00000','00000','00000','01100','01100'],'-':['00000','00000','00000','11111','00000','00000','00000']};
function text(t, x, y, s, c) {
  let cx = x;
  for (const ch of t.toUpperCase()) {
    const p = F[ch] || F[' '];
    for (let row = 0; row < p.length; row++) for (let col = 0; col < 5; col++) if (p[row][col] === '1') rect(cx + col * s, y + row * s, s, s, c);
    cx += 6 * s;
  }
}
function center(t, y, s, c) { text(t, Math.floor((W - t.length * 6 * s) / 2), y, s, c); }
rect(0, 0, W, H, C.bg);
for (let x = -900; x < W + 900; x += 150) for (let y = 0; y < H; y++) { const xx = x + Math.floor(y * 0.45); rect(xx, y, 55, 1, [255,255,255,28]); }
rounded(120, 110, 840, 280, 42, C.card, [130,151,142,255]);
rect(180, 155, 720, 22, C.cream); rect(180, 155, 240, 22, C.red); rect(660, 155, 240, 22, C.blue);
center('DRABORNSTYLE', 220, 15, C.cream); center('BARBER STUDIO OS', 315, 8, C.cyan);
rounded(95, 430, 890, 1250, 55, C.card, [130,151,142,255]);
text('GIRIS PANELI', 155, 515, 7, C.gold); text('HESABINA GIRIS YAP', 155, 585, 10, C.cream);
text('TEK HESAP', 155, 670, 6, [221,235,228,255]); text('MUSTERI ISLETME USTA ADMIN', 155, 720, 5, [221,235,228,255]);
rounded(205, 937, 670, 136, 26, C.dark, C.cyan); text('E-POSTA', 240, 955, 6, C.gold); text('ORNEK.MAIL', 240, 1015, 6, C.white);
rounded(205, 1125, 670, 136, 26, C.dark, C.cyan); text('SIFRE', 240, 1143, 6, C.gold); text('........', 240, 1202, 7, C.white);
rounded(205, 1315, 670, 136, 30, C.gold, C.cream); center('GIRIS YAP', 1363, 9, C.dark);
rounded(205, 1486, 670, 136, 30, C.dark, C.gold); center('YENI HESAP OLUSTUR', 1536, 7, C.gold);
rounded(155, 1595, 770, 65, 24, C.dark, [130,151,142,255]); center('DRABORNEAGLE', 1617, 6, [221,235,228,255]);
for (let x = 0; x < W; x += 110) { const h = 80 + ((x / 110) % 5) * 30; rect(x, H - h, 70, h, C.dark); for (let yy = H - h + 18; yy < H - 10; yy += 28) { rect(x + 15, yy, 14, 10, C.gold); rect(x + 42, yy, 14, 10, C.cyan); } }
function crc32(buf) { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; } return ~c >>> 0; }
function chunk(type, payload) { const tb = Buffer.from(type); const out = Buffer.alloc(12 + payload.length); out.writeUInt32BE(payload.length, 0); tb.copy(out, 4); payload.copy(out, 8); out.writeUInt32BE(crc32(Buffer.concat([tb, payload])), 8 + payload.length); return out; }
const raw = Buffer.alloc((W * 4 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; data.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(file, png);
console.log('High resolution login_barber_miami.png created at 1080x1920.');
