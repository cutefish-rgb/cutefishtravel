# Firebase + Netlify 設定筆記

這個網站是靜態網站，可以直接放到 Netlify。資料同步使用 Firebase Authentication + Firestore。

## 1. Firebase Console 要開啟的功能

1. 到 Firebase Console 打開專案。
2. 左側 Build > Authentication > Sign-in method。
3. 啟用 Email/Password。
4. 左側 Build > Authentication > Settings > Authorized domains，加入你的 Netlify 網址，例如 `你的網站.netlify.app`。
5. 左側 Build > Firestore Database。
6. 建立資料庫。
7. 到 Rules，把 `firestore-rules.txt` 的內容貼上並發布。

## 2. 管理員信箱

管理員信箱設定在兩個地方，兩邊都要一樣：

- `firebase-config.js` 的 `window.firebaseAdminEmails`
- `firestore-rules.txt` 的 email 清單

目前管理員信箱是：

```txt
cutefish@cyivs.cy.edu.tw
```

## 3. 第一次建立管理員帳號

1. 部署前或部署後打開網站。
2. 點「管理員登入」。
3. 點「設定 / 變更管理員帳號」。
4. 輸入管理員 email 和密碼。
5. 建立完成後，網站會登入管理員。
6. 如果 Firestore 還沒有資料，登入後會把目前網站資料同步上去。

建議第一次帳號建立完成後，再把正式網站網址分享給其他人。

## 4. Netlify 部署

1. 把這個資料夾放到 GitHub repository。
2. Netlify 選 Add new site > Import an existing project。
3. 選 GitHub repo。
4. Build command 留空。
5. Publish directory 填 `.` 或留空，依 Netlify UI 顯示為準。
6. 部署完成後打開 Netlify 網址測試。

## 5. 重要提醒

- `firebase-config.js` 裡的 Firebase Web API key 不是資料庫密碼，前端網站通常會公開它。
- 真正保護資料的是 Firestore Rules。
- 如果要新增管理員，記得同時更新 `firebase-config.js` 和 `firestore-rules.txt`。
