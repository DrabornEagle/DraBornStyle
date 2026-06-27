const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..', 'src', 'dkd_assets');
const file = path.join(dir, 'login_barber_miami.png');
fs.mkdirSync(dir, { recursive: true });

const w = 360;
const h = 780;
const raw = Buffer.alloc((w * 3 + 1) * h);

function pix(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = y * (w * 3 + 1) + 1 + x * 3;
  raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
}
function rect(x, y, ww, hh, r, g, b) {
  for (let yy = y; yy < y + hh; yy++) for (let xx = x; xx < x + ww; xx++) pix(xx, yy, r, g, b);
}
function frame(x, y, ww, hh, r, g, b) {
  rect(x, y, ww, 2, r, g, b); rect(x, y + hh - 2, ww, 2, r, g, b); rect(x, y, 2, hh, r, g, b); rect(x + ww - 2, y, 2, hh, r, g, b);
}
function blockText(text, x, y, s, r, g, b) {
  const map = {
    A:'0111010001111111000110001', B:'1111010001111101000111110', C:'0111110000100001000001111', D:'1111010001100011000111110', E:'1111110000111101000011111', F:'1111110000111101000010000', G:'0111110000101111000101110', H:'1000110001111111000110001', I:'1111100100001000010011111', L:'1000010000100001000011111', M:'1000111011101011000110001', N:'1000111001101011001110001', O:'0111010001100011000101110', P:'1111010001111101000010000', R:'1111010001111101010010010', S:'0111110000011100000111110', T:'1111100100001000010000100', U:'1000110001100011000101110', V:'1000110001010100101000100', Y:'1000101010001000010000100', '0':'0111010001100011000101110', '1':'0010001100001000010001110', '2':'0111010001000100010011111', '.':'0000000000000000000000100', ' ':'0000000000000000000000000'
  };
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const p = map[ch] || map[' '];
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 5; xx++) if (p[yy * 5 + xx] === '1') rect(cx + xx * s, y + yy * s, s, s, r, g, b);
    cx += 6 * s;
  }
}
for (let y = 0; y < h; y++) {
  raw[y * (w * 3 + 1)] = 0;
  for (let x = 0; x < w; x++) {
    const t = y / h;
    pix(x, y, 7 + Math.floor(t * 24), 14 + Math.floor(t * 42), 24 + Math.floor(t * 38));
  }
}
rect(20, 60, 320, 150, 28, 48, 48); frame(20, 60, 320, 150, 128, 150, 142);
blockText('DRABORNSTYLE', 36, 95, 6, 255, 242, 221);
blockText('BARBER STUDIO V0.1', 44, 155, 3, 240, 199, 102);
frame(55, 380, 250, 52, 128, 150, 142); blockText('E POSTA', 65, 398, 3, 240, 199, 102);
frame(55, 457, 250, 52, 128, 150, 142); blockText('SIFRE', 65, 475, 3, 240, 199, 102);
rect(67, 535, 226, 54, 240, 199, 102); blockText('GIRIS YAP', 112, 553, 3, 35, 56, 53);
frame(67, 605, 226, 54, 128, 150, 142); blockText('KAYIT OL', 122, 623, 3, 255, 242, 221);
blockText('FINAL LOGIN', 95, 720, 3, 255, 242, 221);

function crc32(buf) {
  let c = -1;
  for (const v of buf) {
    c ^= v;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ -1) >>> 0;
}
function chunk(type, payload) {
  const name = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(payload.length, 0);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, payload])), 0);
  return Buffer.concat([len, name, payload, crc]);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(file, png);
console.log('login asset ready:', file);
