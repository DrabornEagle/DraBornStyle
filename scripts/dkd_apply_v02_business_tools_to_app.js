const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.tsx');
let src = fs.readFileSync(appPath, 'utf8');
let changed = false;

function replace(from, to) {
  if (src.includes(from)) {
    src = src.replace(from, to);
    changed = true;
  }
}

replace(
  "import { DkdTransactionPanel, useDkdTransactions } from './src/dkd_v0_2';",
  "import { DkdBusinessV02ToolsPanel, DkdTransactionPanel, useDkdTransactions } from './src/dkd_v0_2';"
);

replace(
  "type DkdSection = 'business' | 'team' | 'services' | 'transactions' | 'master_request';",
  "type DkdSection = 'business' | 'team' | 'services' | 'transactions' | 'v02_tools' | 'master_request';"
);

replace(
  "  { key: 'transactions', title: 'İşlem & Ödeme', caption: 'İşleme başla, son fiyat gir, platform borcunu takip et', code: '04' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '05' }",
  "  { key: 'transactions', title: 'İşlem & Ödeme', caption: 'İşleme başla, son fiyat gir, platform borcunu takip et', code: '04' },\n  { key: 'v02_tools', title: 'QR & İndirim', caption: 'QR kaynak ve usta özel indirim kodları', code: '05' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '06' }"
);

replace(
  "section.key === 'transactions' ? props.v02Tx.records.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0",
  "section.key === 'transactions' ? props.v02Tx.records.length : section.key === 'v02_tools' ? 2 : section.key === 'business' ? props.businessId ? 1 : 0 : 0"
);

replace(
  "{section.key === 'master_request' ? <>",
  "{section.key === 'v02_tools' ? <DkdBusinessV02ToolsPanel businessId={props.businessId} onStatus={props.setStatus || (() => {})} /> : null}{section.key === 'master_request' ? <>"
);

replace(
  "sendMasterApplication={sendMasterApplication} v02Tx={dkd_v02_tx} /> : null}",
  "sendMasterApplication={sendMasterApplication} v02Tx={dkd_v02_tx} setStatus={setStatus} /> : null}"
);

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('QR and discount tools patched into Business Panel.');
} else {
  console.log('QR and discount tools already patched or base v0.2 patch not applied yet.');
}
