# Arknights-ADB-Script
基於Node.js 與 adb 的明日方舟自動刷圖腳本, 使用屏幕座標

> If you're curious, this is a simple automatic fighting script for Arknight based on Node.js and adb (android debug bridge)<br/>

> :warning: You **need** to understand Chinese to use this script. English or other language is not an option. <br/>
> I don't think there are many non-Chinese-speaking Arknights players out there anyway... <br/>
> Well, if there are any *actual* non-Chinese Arknight players out there, I can do it...

<img width="500vw" alt="截圖 2022-11-20 上午10 42 06" src="https://user-images.githubusercontent.com/36402030/202917462-d3050e01-5a14-4de6-a1eb-f9e1700d912b.png">

## Dependency
- node.js (開發於node v18.11.0版)
- adb命令行工具
- 開啟usb debug 的 android 手機或能用adb工具連結的模擬器


## 使用
準備工作
1. 確認node.js, npm, adb都已安裝: 運行 `node --version`, `npm --version`, `adb --version` 都能返回版本號
2. 確認android設備或模擬器已開啟usb debug並連結電腦, 運行`adb devices`可以看到已連接設備
3. 下載源代碼並解壓縮
4. 編輯`template_config.hjson`, 添加設備數據, 並將檔案名改成`config.hjson`
5. 在源代碼的資料夾內打開命令行, 運行 `npm install`

運行
1. 在源代碼的資料夾內打開命令行, 運行 `node index.js`

### 問題

如果沒有安裝或不知道 Node, npm 或adb 中的任意一項怎麼辦?
> 那這代表你不適合使用這個腳本, 洗洗睡吧


## Todo:
- [ ] 提供在命令行裡添加設備數據的方法
- [ ] 完成上一項後, 嘗試打包docker鏡像?
- [ ] 在設備數據裡添加adb 的serial number, 然後做出一些改變使 -s flag的使用更無腦
- [ ] 要不一不做二不休, 寫個前端?:thinking:

如果要把repository 轉為 public 所需要做的微小工作:
- [x] 刪除寫死的設備數據
- [x] 提供persistent storage 來儲存各個設備的按鈕座標信息, 比如創建config.json 或是使用數據庫
