const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.tsx');
let src = fs.readFileSync(appPath, 'utf8');

const pairs = [
  ['resizeMode="stretch" style={dkd_styles.mockupImage}', 'resizeMode="cover" style={dkd_styles.mockupImage}'],
  ["mockupInput: { position: 'absolute', left: '27%', width: '55%', height: '6.4%', backgroundColor: 'rgba(0,0,0,0.01)', color: '#FFFFFF', fontSize: 18, lineHeight: 22, fontWeight: '800', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 0, textAlignVertical: 'center' },", "mockupInput: { position: 'absolute', left: '30%', width: '56%', height: '6.6%', backgroundColor: 'rgba(0,0,0,0.01)', color: '#FFFFFF', fontSize: 18, lineHeight: 22, fontWeight: '800', paddingHorizontal: 8, paddingTop: 8, paddingBottom: 0, textAlignVertical: 'center' },"],
  ["mockupEmailInput: { top: '48.8%' },", "mockupEmailInput: { top: '45.4%' },"],
  ["mockupPasswordInput: { top: '58.6%' },", "mockupPasswordInput: { top: '58.1%' },"],
  ["mockupLoginButton: { top: '68.5%' },", "mockupLoginButton: { top: '69.9%' },"],
  ["mockupSignupButton: { top: '77.4%' },", "mockupSignupButton: { top: '79.1%' },"]
];

let changed = false;
for (const [from, to] of pairs) {
  if (src.includes(from)) {
    src = src.replace(from, to);
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('Login layout fixed: cover mode + aligned overlays');
} else {
  console.log('Login layout already fixed');
}
