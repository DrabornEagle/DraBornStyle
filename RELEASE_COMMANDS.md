# DraBornStyle Sürüm Yedekleme, Kurulum ve Geri Alma

Bu komutlar Termux üzerinde `$HOME/projects/DraBornStyle` klasörünü kullanır.

## Her yeni sürümde kullanılacak tek komut

Aşağıdaki komut önce mevcut lokal sürümü tarihli bir GitHub yedek dalına yükler, sonra lokal `main` dalını GitHub `main` ile birebir eşitler, bağımlılıkları kurar ve TypeScript + Expo Doctor kontrollerini çalıştırır:

```bash
curl -fsSL https://raw.githubusercontent.com/DrabornEagle/DraBornStyle/main/scripts/dkd_backup_sync_install.sh | bash
```

Ardından Expo testi:

```bash
cd "$HOME/projects/DraBornStyle" && npx expo start -c
```

## v0.3 sürümüne lokal geri dönüş

Bu komut yalnızca telefondaki lokal repoyu, v0.4 öncesinde oluşturulan güvenli GitHub yedeğine döndürür. GitHub `main` değişmez.

```bash
cd "$HOME/projects/DraBornStyle" && \
git fetch origin --prune && \
git checkout -B rollback/v0.3 origin/backup/v0.3-before-v0.4 && \
npm install --no-audit --no-fund && \
npm run typecheck && \
npx expo start -c
```

## v0.3 sürümünü yeniden GitHub main yapmak

Yalnızca v0.4 sürümünden tamamen vazgeçileceği zaman kullanılır. Önce mevcut v0.4 `main` ayrıca yedeklenir, sonra GitHub `main` v0.3 yedeğine döndürülür:

```bash
cd "$HOME/projects/DraBornStyle" && \
git fetch origin --prune && \
git checkout main && \
DKD_ROLLBACK_BACKUP="backup/v0.4-before-rollback-$(date +%Y%m%d-%H%M%S)" && \
git branch -f "$DKD_ROLLBACK_BACKUP" HEAD && \
git push origin "$DKD_ROLLBACK_BACKUP" && \
git reset --hard origin/backup/v0.3-before-v0.4 && \
git push --force-with-lease origin main && \
npm install --no-audit --no-fund && \
npm run typecheck && \
npx expo start -c
```

## Lokal ve GitHub eşitlik kontrolü

```bash
cd "$HOME/projects/DraBornStyle" && \
git fetch origin && \
printf 'LOCAL : ' && git rev-parse HEAD && \
printf 'GITHUB: ' && git rev-parse origin/main && \
git status --short
```

İki commit değeri aynı ve `git status --short` çıktısı boşsa lokal repo ile GitHub `main` birebir eşittir.

## Sürüm kuralı

- Görünen sürüm: `expo.version` ve `package.json.version` birlikte yükseltilir.
- Google Play derleme numarası: `expo.android.versionCode` her AAB yüklemesinde artırılır.
- Sürüm yükseltmeden önce her zaman tarihli GitHub yedeği oluşturulur.
- Release APK ve Release AAB workflowları yalnızca GitHub Actions ekranından elle çalıştırılır.
