#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

DKD_REPOSITORY_URL="https://github.com/DrabornEagle/DraBornStyle.git"
DKD_REPOSITORY_DIR="$HOME/projects/DraBornStyle"
DKD_TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

pkg update -y
pkg install -y git nodejs-lts
mkdir -p "$HOME/projects"

if [ ! -d "$DKD_REPOSITORY_DIR/.git" ]; then
  git clone "$DKD_REPOSITORY_URL" "$DKD_REPOSITORY_DIR"
fi

cd "$DKD_REPOSITORY_DIR"

if find . -maxdepth 4 -type f \( -name '*.jks' -o -name '*.keystore' -o -name '.env' -o -name '.env.*' -o -name 'service-account*.json' -o -name 'credentials.json' \) ! -path './.git/*' | grep -q .; then
  echo "Güvenlik nedeniyle gizli anahtar veya ortam dosyası bulundu. GitHub yedeği durduruldu."
  find . -maxdepth 4 -type f \( -name '*.jks' -o -name '*.keystore' -o -name '.env' -o -name '.env.*' -o -name 'service-account*.json' -o -name 'credentials.json' \) ! -path './.git/*'
  exit 1
fi

DKD_LOCAL_VERSION="$(node -p "try { require('./package.json').version } catch (_) { 'unknown' }")"
DKD_BACKUP_BRANCH="backup/local-v${DKD_LOCAL_VERSION}-${DKD_TIMESTAMP}"

git config user.name "DrabornEagle"
git config user.email "DrabornEagle@users.noreply.github.com"

git add -A
git commit -m "backup: local DraBornStyle v${DKD_LOCAL_VERSION} before sync" || true
git branch -f "$DKD_BACKUP_BRANCH" HEAD
git push origin "$DKD_BACKUP_BRANCH"

git fetch origin --prune
git checkout -B main origin/main
git reset --hard origin/main
git clean -fd

npm install --no-audit --no-fund
npm run typecheck
npx expo-doctor@latest

echo ""
echo "DraBornStyle lokal repo GitHub main ile eşitlendi."
echo "Oluşturulan yedek dal: $DKD_BACKUP_BRANCH"
echo "Expo testi için:"
echo "cd $DKD_REPOSITORY_DIR && npx expo start -c"
