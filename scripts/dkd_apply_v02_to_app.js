const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '..', 'App.tsx');
let src = fs.readFileSync(appPath, 'utf8');
let changed = false;

function apply(search, replace) {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    changed = true;
  }
}

if (!src.includes("./src/dkd_v0_2")) {
  apply(
    "import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';",
    "import { dkd_is_supabase_env_ready, dkd_supabase_client } from './src/dkd_config/dkd_supabase_client';\nimport { DkdTransactionPanel, useDkdTransactions } from './src/dkd_v0_2';"
  );
}

apply(
  "type DkdSection = 'business' | 'team' | 'services' | 'master_request';",
  "type DkdSection = 'business' | 'team' | 'services' | 'transactions' | 'master_request';"
);

apply(
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '04' }",
  "  { key: 'services', title: 'Hizmetler / Fiyatlar', caption: 'Fiyat ve süre yönetimi', code: '03' },\n  { key: 'transactions', title: 'İşlem & Ödeme', caption: 'İşleme başla, son fiyat gir, platform borcunu takip et', code: '04' },\n  { key: 'master_request', title: 'Usta Yetki Başvurusu', caption: 'Kayıtlı kullanıcıyı usta yapmak için admin onayı iste', code: '05' }"
);

if (!src.includes('const dkd_v02_tx = useDkdTransactions')) {
  apply(
    "  const [serviceDuration, setServiceDuration] = React.useState('30');",
    "  const [serviceDuration, setServiceDuration] = React.useState('30');\n\n  const dkd_v02_tx = useDkdTransactions(businessId, services, setStatus);"
  );
}

apply(
  "if (nextUserId) { await loadTeam(nextBusinessId); await loadServices(nextBusinessId); }",
  "if (nextBusinessId) { await loadTeam(nextBusinessId); await loadServices(nextBusinessId); }"
);

if (!src.includes('v02Tx={dkd_v02_tx}')) {
  apply(
    "sendMasterApplication={sendMasterApplication} /> : null}",
    "sendMasterApplication={sendMasterApplication} v02Tx={dkd_v02_tx} /> : null}"
  );
}

apply(
  "subtitle=\"Salon, ekip, hizmet ve fiyat yönetimi\"",
  "subtitle=\"Salon, ekip, hizmet, işlem ve ödeme yönetimi\""
);

apply(
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}",
  "count={section.key === 'team' ? props.masters.length : section.key === 'services' ? props.services.length : section.key === 'transactions' ? props.v02Tx.records.length : section.key === 'business' ? props.businessId ? 1 : 0 : 0}"
);

if (!src.includes("section.key === 'transactions' ? <DkdTransactionPanel")) {
  apply(
    "{section.key === 'master_request' ? <>",
    "{section.key === 'transactions' ? <DkdTransactionPanel services={props.services} masters={props.masters} transactions={props.v02Tx.records} debtTotal={props.v02Tx.debtTotal} revenueTotal={props.v02Tx.revenueTotal} onStart={props.v02Tx.startTransaction} onFinish={props.v02Tx.finishTransaction} /> : null}{section.key === 'master_request' ? <>"
  );
}

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('DraBornStyle v0.2 patched into App.tsx');
} else {
  console.log('DraBornStyle v0.2 patch already applied');
}
