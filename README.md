# Arknights-ADB-Script
基於Node.js 與 adb 的明日方舟自動刷圖腳本, 使用屏幕座標

## Dependency
- node.js (開發於node v18.11.0版)
- adb命令行工具
- 開啟usb debug 的 android 手機


## 使用
0. 確認node.js, adb都已安裝: 運行 `node --version`返回版本號, 運行`adb devices` 返回已連結的設備
1. 下載源代碼並解壓縮
2. 在源代碼的資料夾內運行 `node index.js`
3. 根據指示操作

## 問題
如果運行 `node index.js` 時報錯, 顯示'node module' 之類的錯誤怎麼辦?
- 把源代碼資料夾中的node_module 資料夾刪除, 並運行 `npm install`, 


