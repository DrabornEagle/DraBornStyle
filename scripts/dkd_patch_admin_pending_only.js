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

// Admin panel should show only pending applications in the action list.
replace(
  "{props.adminApplications.length === 0 ? <DkdMiniRow title=\"Başvuru yok\" subtitle=\"Yeni başvurular burada listelenecek.\" /> : null}{props.adminApplications.map((app: DkdRoleApplication) =>",
  "{props.adminApplications.filter((item: DkdRoleApplication) => item.dkd_status === 'pending').length === 0 ? <DkdMiniRow title=\"Bekleyen başvuru yok\" subtitle=\"Onaylanan veya reddedilen başvurular işlem listesinden çıkarılır.\" /> : null}{props.adminApplications.filter((item: DkdRoleApplication) => item.dkd_status === 'pending').map((app: DkdRoleApplication) =>"
);

if (changed) {
  fs.writeFileSync(appPath, src);
  console.log('Admin panel artık sadece pending başvuruları gösterir.');
} else {
  console.log('Pending-only patch zaten uygulanmış olabilir.');
}
