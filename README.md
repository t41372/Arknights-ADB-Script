# Arknights-ADB-Script
基於Node.js 與 adb 的明日方舟自動刷圖腳本, 使用屏幕座標

> :warning: You **need** to understand Chinese to use this script. English or other language is not an option. <br/>
> I don't think there are many non-Chinese-speaking Arknights players out there anyway... <br/>
> Well, if there are any sensible human being actually need it, I can do it...

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

## 如果要把repository 轉為 public 所需要做的微小工作:
- [ ] 刪除寫死的設備數據
- [ ] 提供persistent storage 來儲存各個設備的按鈕座標信息, 比如創建json 或是使用數據庫
- [ ] 提供在命令行裡添加設備數據的方法

## Todo:
- [ ] 在設備數據裡添加adb 的serial number, 然後做出一些改變使 -s flag的使用更無腦
- [ ] 要不一不做二不休, 寫個html前端?:thinking:


