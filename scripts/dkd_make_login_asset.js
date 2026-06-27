const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..', 'src', 'dkd_assets');
const file = path.join(dir, 'login_barber_miami.png');
fs.mkdirSync(dir, { recursive: true });

const w = 480;
const h = 853;
const raw = Buffer.alloc((w * 3 + 1) * h);

function pix(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  const i = y * (w * 3 + 1) + 1 + x * 3;
  raw[i] = Math.max(0, Math.min(255, r));
  raw[i + 1] = Math.max(0, Math.min(255, g));
  raw[i + 2] = Math.max(0, Math.min(255, b));
}
function rect(x, y, ww, hh, r, g, b) {
  for (let yy = y; yy < y + hh; yy++) for (let xx = x; xx < x + ww; xx++) pix(xx, yy, r, g, b);
}
function frame(x, y, ww, hh, r, g, b, t = 3) {
  rect(x, y, ww, t, r, g, b); rect(x, y + hh - t, ww, t, r, g, b); rect(x, y, t, hh, r, g, b); rect(x + ww - t, y, t, hh, r, g, b);
}
function roundRect(x, y, ww, hh, rad, fill, border) {
  for (let yy = y; yy < y + hh; yy++) {
    for (let xx = x; xx < x + ww; xx++) {
      const rx = Math.min(xx - x, x + ww - 1 - xx);
      const ry = Math.min(yy - y, y + hh - 1 - yy);
      if (rx < rad && ry < rad) {
        const dx = rad - rx, dy = rad - ry;
        if (dx * dx + dy * dy > rad * rad) continue;
      }
      const edge = rx < 3 || ry < 3;
      const c = edge && border ? border : fill;
      pix(xx, yy, c[0], c[1], c[2]);
    }
  }
}
function line(x0, y0, x1, y1, r, g, b) {
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    rect(x0, y0, 2, 2, r, g, b);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function circle(cx, cy, rr, r, g, b) {
  for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) pix(cx + x, cy + y, r, g, b);
}

const font = {
  A:'0111010001111111000110001', B:'1111010001111101000111110', C:'0111110000100001000001111', D:'1111010001100011000111110', E:'1111110000111101000011111', F:'1111110000111101000010000', G:'0111110000101111000101110', H:'1000110001111111000110001', I:'1111100100001000010011111', K:'1000110010111001001010001', L:'1000010000100001000011111', M:'1000111011101011000110001', N:'1000111001101011001110001', O:'0111010001100011000101110', P:'1111010001111101000010000', R:'1111010001111101010010010', S:'0111110000011100000111110', T:'1111100100001000010000100', U:'1000110001100011000101110', V:'1000110001010100101000100', Y:'1000101010001000010000100', Z:'1111100010001000100011111', '0':'0111010001100011000101110', '1':'0010001100001000010001110', '2':'0111010001000100010011111', '.':'0000000000000000000000100', '-':'0000000000111110000000000', '+':'0000000100111110010000000', '&':'0110010010101000101011010', ' ':'0000000000000000000000000'
};
function txt(s, x, y, sc, col) {
  let cx = x;
  const clean = s.toUpperCase().replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ş/g, 'S').replace(/[İI]/g, 'I').replace(/Ö/g, 'O').replace(/Ç/g, 'C');
  for (const ch of clean) {
    const p = font[ch] || font[' '];
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 5; xx++) if (p[yy * 5 + xx] === '1') rect(cx + xx * sc, y + yy * sc, sc, sc, col[0], col[1], col[2]);
    cx += 6 * sc;
  }
}

for (let y = 0; y < h; y++) {
  raw[y * (w * 3 + 1)] = 0;
  const t = y / h;
  for (let x = 0; x < w; x++) {
    const sunset = Math.max(0, 1 - Math.abs(y - 175) / 260);
    pix(x, y, 10 + 34 * t + 70 * sunset, 18 + 38 * t + 12 * sunset, 32 + 42 * t + 55 * sunset);
  }
}

// Miami salon background: window, sunset, skyline, chair silhouettes
rect(0, 0, w, h, 8, 13, 25);
for (let y = 0; y < h; y++) {
  const t = y / h;
  for (let x = 0; x < w; x++) pix(x, y, 7 + t * 20, 13 + t * 43, 25 + t * 46);
}
rect(275, 35, 190, 280, 55, 20, 44);
for (let yy = 35; yy < 315; yy++) {
  const k = (yy - 35) / 280;
  for (let xx = 275; xx < 465; xx++) pix(xx, yy, 104 + 92 * k, 35 + 15 * k, 72 + 70 * (1 - k));
}
for (let x = 282; x < 460; x += 28) rect(x, 205 - (x % 60), 18, 110 + (x % 50), 13, 16, 29);
line(405, 300, 412, 155, 10, 16, 25); line(412, 155, 386, 118, 10, 16, 25); line(412, 155, 445, 120, 10, 16, 25); line(412, 155, 425, 105, 10, 16, 25);
rect(28, 310, 120, 200, 9, 12, 20); frame(28, 310, 120, 200, 34, 207, 213, 2); circle(72, 410, 42, 12, 18, 28); rect(35, 465, 90, 30, 12, 18, 28);

// logo area
circle(240, 60, 19, 37, 224, 229);
txt('D', 230, 40, 5, [37,224,229]);
line(228, 84, 253, 64, 255, 112, 101); line(252, 64, 274, 88, 37, 224, 229);
txt('DRABORNSTYLE', 68, 94, 5, [37,224,229]);
txt('BARBER STUDIO OS', 144, 148, 2, [37,224,229]);
line(94, 160, 132, 160, 37,224,229); line(348,160,386,160,255,112,101);

// glass login card. Coordinates match App.tsx transparent input overlays.
roundRect(66, 280, 348, 470, 28, [32, 25, 28], [255,112,101]);
txt('TEKRAR HOS GELDIN', 158, 314, 2, [37,224,229]);
txt('HESABINIZA GIRIS YAPARAK', 106, 352, 2, [255,242,221]);
txt('DEVAM EDIN', 170, 382, 2, [255,242,221]);

txt('E-POSTA', 96, 425, 2, [255,242,221]);
roundRect(82, 456, 316, 63, 14, [20, 29, 33], [52, 220, 224]);
txt('@', 104, 478, 3, [52,220,224]);

txt('SIFRE', 96, 530, 2, [255,242,221]);
roundRect(82, 561, 316, 63, 14, [20, 29, 33], [52, 220, 224]);
frame(105, 584, 18, 18, 52, 220, 224, 2); line(108, 584, 108, 575, 52,220,224); line(120, 584, 120, 575, 52,220,224); line(108,575,120,575,52,220,224);
txt('SIFREMI UNUTTUM', 262, 642, 2, [255,112,101]);

roundRect(82, 685, 316, 61, 18, [50, 206, 212], [37,224,229]);
txt('GIRIS YAP', 180, 705, 3, [255,255,255]);
roundRect(82, 764, 316, 61, 18, [20, 29, 33], [255,112,101]);
txt('KAYIT OL', 188, 784, 3, [255,255,255]);

txt('GUVENLI HIZLI PROFESYONEL', 118, 832, 2, [255,242,221]);

function crc32(buf) { let c = -1; for (const v of buf) { c ^= v; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return (c ^ -1) >>> 0; }
function chunk(type, payload) { const name = Buffer.from(type); const len = Buffer.alloc(4); len.writeUInt32BE(payload.length, 0); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, payload])), 0); return Buffer.concat([len, name, payload, crc]); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
fs.writeFileSync(file, png);
console.log('DraBornStyle v0.1 login asset ready:', file);
