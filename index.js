const prompt = require('prompt-sync')();
const shell = require('shelljs');

// coordinate of each point
// each device needs: {screenCenter, enterFight, startAction}
const notes = `
--- Note ---

小號 時長
 *  1-7: 73秒
 *  IW-8: 118秒
 *  龍門市區: 14分45秒, 885秒
 * 
主號
 *  1-7: 78秒

--- Note End ---
`;

const mi11u = {
    screenCenter: [1670, 774],
    enterFight: [2809, 1311],
    startAction: [2537, 1028],
    One_7: 72 //s
}

const huawei = {
    screenCenter: [1140, 565],
    enterFight: [2064, 988],
    startAction: [1857, 755],
    One_7: 78 //s
}

// sleep for specific amount of time, param in ms
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// sleep for specific amount of time with progress bar
async function sleepProgressBar(ms)
{

    const partitionCount = 40; // the progress bar will update 20 times during ms
    const desiredTimeUpdateSpan = 0.25/4; // 想要的 time 刷新間隔(s)
    
    // 實現了LTPO lol... 動態刷新率... 因為刷新率是跟著總時長走的, 就是那個 ms/partition,
    // 所以不管總時長多長, 這玩意兒只會刷新 partition 次, 也就是40 次, 如果跑了個1000s 的戰鬥, 前50s 這玩意兒都不會刷新...
    // 故 新增了一個剩餘時間, 進度條可以不動, 但計時器要走, 讓用戶安心
    // 但計時器原本是跟刷新一起走的, 所以前50 秒他還是不會刷新, 因此設置了 timeLeftUpdateSpeed, 讓秒數刷新比進度條刷新要快
    // 原本設的是4x, 即 時間刷新4次, 進度條刷新1次, 但這個刷新倍數不能永遠都是4x, 這個速度對10s 很合適, 但對於1000s 戰鬥就很慢
    // 如果設置的很大, 那10s 下的行為就會很奇怪, 因此要動態計算倍率
    // 總的來說, 如果一開始不把刷新率跟更新次數綁定, 而是設置每0.25秒刷新, 就沒這個問題了...

    // 實現恆定0.25/4 秒刷新的推導:
    // bar 刷新次數 = 40(partition)
    // bar 刷新時間間隔 = ms/40(partition), 對於10s 的是10,000ms/40 = 250ms = 0.25s, 對於1000s 是 25000ms = 25s
    // time 刷新倍率 = bar刷新之間更新的次數
    // time 刷新時間間隔 = bar刷新時間間隔 * (1/time刷新倍率), 對於10s, 4x, time刷新間隔=0.25/(4)s
    //                                                 對於1000s, 4x, time刷新間隔=25000ms/(4) = 6250ms = 6.25s
    //
    // 故, time刷新倍率 = ms / 40(partition) / time刷新時間間隔(我想要0.25/4)

    // time left updates 4x faster than the progress bar
    // 1x means timeLeft updates when progress bar updates
    
    //驗證
    //刷新倍率                 =    取整    ( bar刷新時間間隔)   / (想要實現的 time刷新間隔s, 即timeLeft刷新之間的等待時長, s * 1000ms) 
    const timeLeftUpdateSpeed = (Math.round( ms / partitionCount / (desiredTimeUpdateSpan * 1000)) >= 2)?
                                (Math.round( ms / partitionCount / (desiredTimeUpdateSpan * 1000))) : 2;

    // console.log("Time left speed == " + timeLeftUpdateSpeed + `, Calucated is ${(Math.round( ms / partitionCount / (desiredTimeUpdateSpan * 1000)))}`)
    
    const bar_background = '_'
    const bar_head = '_'
    const bar_fill = '◼︎'
    const bar_leftBound = '['
    const bar_rightBound = ']'

    // break down the total sleep time into partitionCount amount of pieces
    let waitPerUpdate = ms/(partitionCount * timeLeftUpdateSpeed); 
    let timeLeft = ms;
    let progressUpdateCounter = 1; // only update progress bar when updateCounter == timeLeftSpeed, 
    
    // set up initial state of progress bar
    let progressBar = bar_leftBound;
    for(let index = 0; index < partitionCount; index ++)
    {
        progressBar = progressBar + bar_background
    }
    printOnExistingLine(`${progressBar}| time left: ${(timeLeft/1000).toFixed(2)}s/ ${ms/1000}s`)
    

    for(let progress = 0; progress < partitionCount * timeLeftUpdateSpeed; progress ++)
    {
        
        // ---- redraw progress line ----
        if(progressUpdateCounter == timeLeftUpdateSpeed)
        {
            progressBar = bar_leftBound
            filledCounter = 0;
            for(filledCounter = 0; filledCounter < (progress/timeLeftUpdateSpeed); filledCounter ++)
            {
                progressBar = progressBar + bar_fill
            }
            for(let index = 0; index < (partitionCount - filledCounter); index ++)
            {
                if(index == 0)
                    progressBar = progressBar + bar_head
                else 
                    progressBar = progressBar + bar_background
            }
            progressUpdateCounter = 0;
            
        }
        else {
            progressUpdateCounter ++
        }
        // ---- redraw progress line ends ----

        
        await sleep(waitPerUpdate); // sleep
        timeLeft -= waitPerUpdate; // update time left
        
        printOnExistingLine(`${progressBar}${bar_rightBound} 剩餘時間: ${(timeLeft/1000).toFixed(2)}s / ${ms/1000}s`)

    }

}

function printOnExistingLine(text){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}



async function main()
{
    console.log(notes)

    console.log("歡迎使用自動戰鬥腳本");
    console.log("本次連結的設備是? (1)小米11 Ultra[e6] (2)華為[9JB] (3) 小米12S Ultra");
    let device = prompt(">> ");

    console.log("是否有多個設備連接？這次要用哪個設備呢? 預設單設備")
    shell.exec("adb devices")
    let adbDeviceFlag = prompt(">> ")
    if(adbDeviceFlag.trim().length == 0 || adbDeviceFlag.trim == "\n")
    {
        console.log("無多設備? 那就不加上 -s flag 了")
        adbDeviceFlag = "";
    } else{
        adbDeviceFlag = " -s " + adbDeviceFlag.trim()
        console.log("已加上flag:" + adbDeviceFlag)
    }
    

    console.log("請輸入單次戰鬥的時長(秒): ");
    let duration = prompt(">> ") * 1000; // now in ms
    console.log("請輸入連續戰鬥次數: ");
    let times = prompt(">> ");
    console.log(`所以你想要連續戰鬥 ${times} 次, 每次 ${(duration/1000)}+4.5(冷卻) 秒, 共 ${times * (duration+4500+3000) / 1000} 秒`);
    prompt("按下 Enter 鍵開始\n");

    for(let index = 0; index < times; index++)
    {   
        console.log(`\n---->> 第 ${index+1}/${times} 次戰鬥開始 <<----`)      
                                                    //(剩餘次數) * (單次時長ms) / 1000ms
        console.log(`還有約 ${(times-index)*(duration+4500+3000)/1000} 秒`);
        await oneSession(device, duration, adbDeviceFlag);
        console.log(`---- 第 ${index+1}/${times} 次戰鬥結束 ----`);
        await sleep(1000);
    }

    console.log("\n\n------->>>> Mission Complete <<<<-------")
}


// A fight
// total time = duration + 4500ms + 3000ms, 4500ms 是按鍵冷卻總時長, 3000是迴圈末尾冷卻
async function oneSession(deviceOption, duration, adbDeviceFlag)
{
    let device = mi11u;
    if(deviceOption == 1) device = mi11u;
    else if(deviceOption == 2) device = huawei;
    else console.log("未知設備, 設置為 mi11 u")

    //進入戰鬥 -> 開始行動 -> 等待 (關卡時長) => 再等3秒 (掉落物冒出來, 保險)=> 點擊進入戰鬥 (1s) => loop

    //進入戰鬥

    console.log("點擊 進入關卡");
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
    
    console.log("wait 1500 ms")
    await sleep(1500);
    console.log("點擊 開始行動");
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.startAction[0] + " " + device.startAction[1]);

    //等待 (關卡時長) + 3秒緩衝 掉落物
    console.log(`\n戰鬥: ${duration}ms + 3000ms = ${(duration+3000)/1000}s`)
    console.log("戰鬥中...")
    await sleepProgressBar(duration + 3000)

    console.log("收尾")
    //點擊屏幕中央
    console.log("點擊中央")
    shell.exec(`adb${adbDeviceFlag} shell input tap ${device.screenCenter[0]} ${device.screenCenter[1]}`)
    
    //點擊開始行動 收尾
    console.log("點擊 開始行動 收尾");
    await sleep(1000)
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
    //點擊開始行動 收尾
    console.log("點擊 開始行動 收尾");
    await sleep(1000)
    shell.exec("adb" + adbDeviceFlag + " shell input tap " + device.enterFight[0] + " " + device.enterFight[1]);
}

main()
// console.log("等待秒數 (s)")
// sleepProgressBar(1000 * prompt(">> "))